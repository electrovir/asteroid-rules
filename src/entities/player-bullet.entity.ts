import {
    position2dParamsMap,
    position2dParamsShape,
    type BaseEntity2d,
    type EntityUpdateParams,
} from '@antha/entity-2d';
import {Graphics} from '@antha/graphics-2d';
import {StableMath} from '@antha/util';
import {clamp} from '@augment-vir/common';
import {Circle} from 'detect-collisions';
import {defineShape, nonEmptyStringShape} from 'object-shape-tester';
import {defineEntity} from '../mods/game-entity.mod.js';
import {AsteroidEntity} from './asteroid.entity.js';

export class PlayerBulletEntity extends defineEntity({
    collidesWith: {
        collidesWithOtherEntities: [AsteroidEntity],
    },
    key: 'asteroids-player-bullet',
    paramsMap: position2dParamsMap,
    paramsShape: defineShape({
        ...position2dParamsShape.default,
        color: nonEmptyStringShape(),
        damage: 0,
        homingTurnRate: 0,
        radius: 0,
        remainingBounces: 0,
        remainingPierces: 0,
        slowDurationMilliseconds: 0,
        splashDamage: 0,
        splashRadius: 0,
        velocityX: 0,
        velocityY: 0,
    }),
}) {
    protected hasDetonated = false;
    protected readonly hitAsteroids = new Set<AsteroidEntity>();

    public override createView() {
        const graphics = new Graphics().circle(0, 0, this.params.radius).fill(this.params.color);

        return {
            hitbox: new Circle(
                {
                    x: this.params.x,
                    y: this.params.y,
                },
                this.params.radius,
            ),
            view: graphics,
        };
    }

    public async damageAsteroid({asteroid}: Readonly<{asteroid: AsteroidEntity}>) {
        if (this.isDestroyed || this.hitAsteroids.has(asteroid)) {
            return;
        }

        this.hitAsteroids.add(asteroid);
        asteroid.applySlow({
            durationMilliseconds: this.params.slowDurationMilliseconds,
        });
        await asteroid.takeDamage({
            damage: this.params.damage,
        });
        await this.detonate({
            asteroid,
        });

        if (this.params.remainingPierces) {
            this.params.remainingPierces -= 1;
        } else {
            this.destroy();
        }
    }

    protected async detonate({asteroid}: Readonly<{asteroid: AsteroidEntity}>) {
        if (this.hasDetonated || !this.params.splashDamage || !this.params.splashRadius) {
            return;
        }

        this.hasDetonated = true;
        await Promise.all(
            Array.from(this.entityStore.getEntities(AsteroidEntity))
                .filter((otherAsteroid) => {
                    return (
                        otherAsteroid !== asteroid &&
                        !otherAsteroid.isDestroyed &&
                        Math.hypot(
                            otherAsteroid.params.x - asteroid.params.x,
                            otherAsteroid.params.y - asteroid.params.y,
                        ) <= this.params.splashRadius
                    );
                })
                .map(async (otherAsteroid) => {
                    await otherAsteroid.takeDamage({
                        damage: this.params.splashDamage,
                    });
                }),
        );
    }

    protected applyHoming({msSinceLastUpdate}: Readonly<{msSinceLastUpdate: number}>) {
        if (!this.params.homingTurnRate) {
            return;
        }

        const closestAsteroid = Array.from(this.entityStore.getEntities(AsteroidEntity))
            .filter((asteroid) => {
                return !asteroid.isDestroyed;
            })
            .reduce<AsteroidEntity | undefined>((closest, asteroid) => {
                const distance = Math.hypot(
                    asteroid.params.x - this.params.x,
                    asteroid.params.y - this.params.y,
                );
                const closestDistance = closest
                    ? Math.hypot(closest.params.x - this.params.x, closest.params.y - this.params.y)
                    : Infinity;

                return distance < closestDistance ? asteroid : closest;
            }, undefined);

        if (!closestAsteroid) {
            return;
        }

        const speed = Math.hypot(this.params.velocityX, this.params.velocityY);

        if (!speed) {
            return;
        }

        const currentAngle = Math.atan2(this.params.velocityY, this.params.velocityX);
        const targetAngle = Math.atan2(
            closestAsteroid.params.y - this.params.y,
            closestAsteroid.params.x - this.params.x,
        );
        const angleDifference = Math.atan2(
            Math.sin(targetAngle - currentAngle),
            Math.cos(targetAngle - currentAngle),
        );
        const turnAmount = clamp(angleDifference, {
            min: -this.params.homingTurnRate * msSinceLastUpdate,
            max: this.params.homingTurnRate * msSinceLastUpdate,
        });
        const nextAngle = currentAngle + turnAmount;

        this.params.velocityX = StableMath.round(Math.cos(nextAngle) * speed);
        this.params.velocityY = StableMath.round(Math.sin(nextAngle) * speed);
    }

    protected bounceFromArenaEdge() {
        const virtualViewport = this.state.virtualViewport || this.pixi.screen;
        const bouncedHorizontally = this.params.x < 0 || this.params.x > virtualViewport.width;
        const bouncedVertically = this.params.y < 0 || this.params.y > virtualViewport.height;

        if (!this.params.remainingBounces || (!bouncedHorizontally && !bouncedVertically)) {
            return false;
        }

        this.params.x = clamp(this.params.x, {
            min: 0,
            max: virtualViewport.width,
        });
        this.params.y = clamp(this.params.y, {
            min: 0,
            max: virtualViewport.height,
        });
        this.params.velocityX = bouncedHorizontally
            ? -this.params.velocityX
            : this.params.velocityX;
        this.params.velocityY = bouncedVertically ? -this.params.velocityY : this.params.velocityY;
        this.params.remainingBounces -= 1;

        return true;
    }

    public override async collide(otherEntity: BaseEntity2d) {
        if (otherEntity instanceof AsteroidEntity) {
            await this.damageAsteroid({
                asteroid: otherEntity,
            });
        }
    }

    public override update({msSinceLastUpdate}: Readonly<EntityUpdateParams>) {
        this.applyHoming({
            msSinceLastUpdate,
        });
        this.params.x = StableMath.round(this.params.x + this.params.velocityX * msSinceLastUpdate);
        this.params.y = StableMath.round(this.params.y + this.params.velocityY * msSinceLastUpdate);

        if (this.isInBounds()) {
            return;
        } else if (this.bounceFromArenaEdge()) {
            return;
        } else {
            this.destroy();
        }
    }
}
