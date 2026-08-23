import {
    position2dParamsMap,
    position2dParamsShape,
    type BaseEntity2d,
    type Collision,
    type EntityUpdateParams,
} from '@antha/entity-2d';
import {Graphics} from '@antha/graphics-2d';
import {StableMath, stableRandom, stableRandomInteger} from '@antha/util';
import {clamp, createArray, type SeededRandom} from '@augment-vir/common';
import {Polygon} from 'detect-collisions';
import {defineShape} from 'object-shape-tester';
import {GameAudio, playGameAudio} from '../data/game-audio.js';
import {queueMissionExperience, type FullGameState} from '../data/game-state.js';
import {
    asteroidSpawnIntervalMilliseconds,
    calculateAsteroidKillExperience,
    getAsteroidFragmentCount,
    getAsteroidFragmentRadius,
    getAsteroidMagnetAcceleration,
    getAsteroidMovementSpeedMultiplier,
    getAsteroidSlowMovementSpeedMultiplier,
    minimumAsteroidRadius,
} from '../data/gameplay-modifiers.js';
import {defineEntity} from '../mods/game-entity.mod.js';
import {PlayerBulletEntity} from './player-bullet.entity.js';
import {PlayerEntity} from './player.entity.js';

const asteroidOutlineColor = '#a3a3a3';
const asteroidFillColor = '#3d3d3d';
const asteroidSpawnPadding = 2;
const asteroidSpeedMaxPixelsPerMillisecond = 0.07;
const asteroidSpeedMinPixelsPerMillisecond = 0.04;
const asteroidSpinSpeedMaxRadiansPerMillisecond = 0.0003;
const asteroidSpinSpeedMinRadiansPerMillisecond = 0.0001;
const maximumMeteorMagnetSpeedPixelsPerMillisecond = 0.12;

const asteroidCollisionAudio: ReadonlyArray<GameAudio> = [
    GameAudio.AsteroidCollisionCrash,
    GameAudio.AsteroidCollisionMetalOne,
    GameAudio.AsteroidCollisionMetalTwo,
    GameAudio.AsteroidCollisionMetalThree,
];

const asteroidDeathAudio: ReadonlyArray<GameAudio> = [
    GameAudio.AsteroidDeath,
    GameAudio.AsteroidDeathExplosionOne,
    GameAudio.AsteroidDeathExplosionTwo,
    GameAudio.AsteroidDeathExplosionThree,
];

function steerAsteroidTowardNearestPlayer({
    acceleration,
    asteroid,
    msSinceLastUpdate,
    players,
}: Readonly<{
    acceleration: number;
    asteroid: AsteroidEntity;
    msSinceLastUpdate: number;
    players: ReadonlySet<PlayerEntity>;
}>) {
    if (!acceleration) {
        return;
    }

    const closestPlayer = Array.from(players)
        .filter((player) => {
            return !player.isDestroyed;
        })
        .reduce<PlayerEntity | undefined>((closest, player) => {
            const distance = Math.hypot(
                player.params.x - asteroid.params.x,
                player.params.y - asteroid.params.y,
            );
            const closestDistance = closest
                ? Math.hypot(
                      closest.params.x - asteroid.params.x,
                      closest.params.y - asteroid.params.y,
                  )
                : Infinity;

            return distance < closestDistance ? player : closest;
        }, undefined);

    if (!closestPlayer) {
        return;
    }

    const xDistance = closestPlayer.params.x - asteroid.params.x;
    const yDistance = closestPlayer.params.y - asteroid.params.y;
    const distance = Math.hypot(xDistance, yDistance);

    if (!distance) {
        return;
    }

    asteroid.params.velocityX = StableMath.round(
        clamp(
            asteroid.params.velocityX + (xDistance / distance) * acceleration * msSinceLastUpdate,
            {
                min: -maximumMeteorMagnetSpeedPixelsPerMillisecond,
                max: maximumMeteorMagnetSpeedPixelsPerMillisecond,
            },
        ),
    );
    asteroid.params.velocityY = StableMath.round(
        clamp(
            asteroid.params.velocityY + (yDistance / distance) * acceleration * msSinceLastUpdate,
            {
                min: -maximumMeteorMagnetSpeedPixelsPerMillisecond,
                max: maximumMeteorMagnetSpeedPixelsPerMillisecond,
            },
        ),
    );
}

export function playAsteroidCollisionAudio(gameState: FullGameState) {
    const random = gameState.missionState?.seededRandom;

    playGameAudio(
        gameState,
        random
            ? (asteroidCollisionAudio[
                  stableRandomInteger({
                      random,
                      min: 0,
                      max: asteroidCollisionAudio.length - 1,
                  })
              ] ?? GameAudio.AsteroidCollisionCrash)
            : GameAudio.AsteroidCollisionCrash,
    );
}

export function playAsteroidDeathAudio(gameState: FullGameState) {
    const random = gameState.missionState?.seededRandom;

    playGameAudio(
        gameState,
        random
            ? (asteroidDeathAudio[
                  stableRandomInteger({
                      random,
                      min: 0,
                      max: asteroidDeathAudio.length - 1,
                  })
              ] ?? GameAudio.AsteroidDeath)
            : GameAudio.AsteroidDeath,
    );
}

export function calculateAsteroidSpawnCount({
    currentTime,
    lastAsteroidSpawnedAt,
    spawnIntervalMilliseconds = asteroidSpawnIntervalMilliseconds,
}: Readonly<{
    currentTime: number;
    lastAsteroidSpawnedAt: number;
    spawnIntervalMilliseconds?: number | undefined;
}>) {
    return Math.max(
        0,
        Math.floor((currentTime - lastAsteroidSpawnedAt) / spawnIntervalMilliseconds),
    );
}

function createAsteroidOutlinePoints({
    radius,
    random,
}: Readonly<{
    radius: number;
    random: SeededRandom;
}>) {
    const pointCount = stableRandomInteger({
        random,
        min: 9,
        max: 13,
    });

    return createArray(pointCount, (index) => {
        const pointAngle = StableMath.degreesToRadians(
            (index / pointCount) * 360 + (stableRandom(random) - 0.5) * (360 / pointCount) * 0.4,
        );
        const pointRadius = StableMath.round(radius * (0.72 + stableRandom(random) * 0.28));

        return {
            x: StableMath.round(StableMath.cos(pointAngle) * pointRadius),
            y: StableMath.round(StableMath.sin(pointAngle) * pointRadius),
        };
    });
}

function createAsteroidParamsFromValues({
    hasEnteredScreen,
    health,
    radius,
    random,
    rotation,
    rotationSpeed,
    velocityX,
    velocityY,
    x,
    y,
}: Readonly<{
    hasEnteredScreen: boolean;
    health: number;
    radius: number;
    random: SeededRandom;
    rotation: number;
    rotationSpeed: number;
    velocityX: number;
    velocityY: number;
    x: number;
    y: number;
}>) {
    return {
        hasEnteredScreen,
        health,
        maximumHealth: health,
        outlinePoints: createAsteroidOutlinePoints({
            radius,
            random,
        }),
        radius,
        rotation,
        rotationSpeed,
        slowRemainingMilliseconds: 0,
        velocityX,
        velocityY,
        x,
        y,
    };
}

export function createAsteroidParams({
    health,
    random,
    screen,
}: Readonly<{
    health: number;
    random: SeededRandom;
    screen: Readonly<{
        height: number;
        width: number;
    }>;
}>) {
    const radius = stableRandomInteger({
        random,
        min: 24,
        max: 48,
    });
    const spawnAngle = StableMath.degreesToRadians(stableRandom(random) * 360);
    const spawnDirectionX = StableMath.cos(spawnAngle);
    const spawnDirectionY = StableMath.sin(spawnAngle);
    const spawnDistance = StableMath.round(
        Math.min(
            (screen.width / 2 + radius + asteroidSpawnPadding) / Math.abs(spawnDirectionX),
            (screen.height / 2 + radius + asteroidSpawnPadding) / Math.abs(spawnDirectionY),
        ),
    );
    const x = StableMath.round(screen.width / 2 + spawnDirectionX * spawnDistance);
    const y = StableMath.round(screen.height / 2 + spawnDirectionY * spawnDistance);
    const targetX = StableMath.round(stableRandom(random) * screen.width);
    const targetY = StableMath.round(stableRandom(random) * screen.height);
    const xDistance = targetX - x;
    const yDistance = targetY - y;
    const targetDistance = StableMath.hypot([
        xDistance,
        yDistance,
    ]);
    const speed = StableMath.round(
        asteroidSpeedMinPixelsPerMillisecond +
            stableRandom(random) *
                (asteroidSpeedMaxPixelsPerMillisecond - asteroidSpeedMinPixelsPerMillisecond),
    );
    const rotationSpeed = StableMath.round(
        (stableRandom(random) < 0.5 ? -1 : 1) *
            (asteroidSpinSpeedMinRadiansPerMillisecond +
                stableRandom(random) *
                    (asteroidSpinSpeedMaxRadiansPerMillisecond -
                        asteroidSpinSpeedMinRadiansPerMillisecond)),
    );
    return createAsteroidParamsFromValues({
        hasEnteredScreen: false,
        health,
        radius,
        random,
        rotation: StableMath.degreesToRadians(stableRandom(random) * 360),
        rotationSpeed,
        velocityX: StableMath.round((xDistance / targetDistance) * speed),
        velocityY: StableMath.round((yDistance / targetDistance) * speed),
        x,
        y,
    });
}

export function createAsteroidFragmentParams({
    fragmentCount,
    fragmentIndex,
    health,
    parent,
    random,
}: Readonly<{
    fragmentCount: number;
    fragmentIndex: number;
    health: number;
    parent: Readonly<{
        radius: number;
        rotationSpeed: number;
        velocityX: number;
        velocityY: number;
        x: number;
        y: number;
    }>;
    random: SeededRandom;
}>) {
    const radius = getAsteroidFragmentRadius(parent.radius);
    const fragmentAngle = StableMath.degreesToRadians(
        fragmentIndex * (360 / fragmentCount) + stableRandom(random) * 60,
    );
    const fragmentSpeed = 0.08 + stableRandom(random) * 0.04;

    return createAsteroidParamsFromValues({
        hasEnteredScreen: true,
        health,
        radius,
        random,
        rotation: StableMath.degreesToRadians(stableRandom(random) * 360),
        rotationSpeed: StableMath.round(parent.rotationSpeed * (1 + stableRandom(random))),
        velocityX: StableMath.round(
            parent.velocityX + StableMath.cos(fragmentAngle) * fragmentSpeed,
        ),
        velocityY: StableMath.round(
            parent.velocityY + StableMath.sin(fragmentAngle) * fragmentSpeed,
        ),
        x: StableMath.round(parent.x + StableMath.cos(fragmentAngle) * radius),
        y: StableMath.round(parent.y + StableMath.sin(fragmentAngle) * radius),
    });
}

export class AsteroidEntity extends defineEntity({
    key: 'asteroids-asteroid',
    paramsMap: {
        ...position2dParamsMap,
        view: {
            ...position2dParamsMap.view,
            rotation: true,
        },
    },
    paramsShape: defineShape({
        ...position2dParamsShape.default,
        hasEnteredScreen: false,
        health: 0,
        maximumHealth: 0,
        outlinePoints: [
            {
                x: 0,
                y: 0,
            },
        ],
        radius: 0,
        rotation: 0,
        rotationSpeed: 0,
        slowRemainingMilliseconds: 0,
        velocityX: 0,
        velocityY: 0,
    }),
}) {
    public override createView() {
        const graphics = new Graphics();

        this.params.outlinePoints.forEach((point, index) => {
            if (index) {
                graphics.lineTo(point.x, point.y);
            } else {
                graphics.moveTo(point.x, point.y);
            }
        });

        return {
            view: graphics
                .closePath()
                .fill({
                    color: this.params.maximumHealth > 1 ? '#5d3d6d' : asteroidFillColor,
                })
                .stroke({
                    color: asteroidOutlineColor,
                    width: 2,
                }),
            hitbox: new Polygon(
                {
                    x: this.params.x,
                    y: this.params.y,
                },
                this.params.outlinePoints,
                {
                    angle: this.params.rotation,
                },
            ),
        };
    }

    public async takeDamage({damage}: Readonly<{damage: number}>) {
        if (this.isDestroyed) {
            return;
        }

        const remainingHealth = this.params.health - damage;

        if (remainingHealth > 0) {
            this.params.health = remainingHealth;
            return;
        }

        this.destroy();
        const random = this.state.missionState?.seededRandom;
        const modifiers = this.state.saveState?.modifiers || {};
        playAsteroidDeathAudio(this.state);

        if (random && this.params.radius > minimumAsteroidRadius) {
            const fragmentCount = getAsteroidFragmentCount(modifiers);

            await createArray(fragmentCount, async (fragmentIndex) => {
                await this.entityStore.addEntity(
                    AsteroidEntity,
                    createAsteroidFragmentParams({
                        fragmentCount,
                        fragmentIndex,
                        health: this.params.maximumHealth,
                        parent: this.params,
                        random,
                    }),
                );
            });
        }
        queueMissionExperience({
            experienceGained: calculateAsteroidKillExperience({
                health: this.params.maximumHealth,
                modifiers,
            }),
            gameState: this.state,
        });
    }

    public applySlow({durationMilliseconds}: Readonly<{durationMilliseconds: number}>) {
        this.params.slowRemainingMilliseconds = Math.max(
            this.params.slowRemainingMilliseconds,
            durationMilliseconds,
        );
    }

    public override async collide(otherEntity: BaseEntity2d, collision: Readonly<Collision>) {
        if (otherEntity instanceof PlayerBulletEntity) {
            await otherEntity.damageAsteroid({
                asteroid: this,
            });
            return;
        } else if (otherEntity instanceof PlayerEntity) {
            await otherEntity.handleAsteroidCollision({
                asteroid: this,
            });
            return;
        } else if (!(otherEntity instanceof AsteroidEntity)) {
            return;
        }

        const normalX = StableMath.round(collision.overlapN.x);
        const normalY = StableMath.round(collision.overlapN.y);
        const normalVelocity = StableMath.round(
            (this.params.velocityX - otherEntity.params.velocityX) * normalX +
                (this.params.velocityY - otherEntity.params.velocityY) * normalY,
        );

        if (normalVelocity <= 0) {
            return;
        }

        this.params.velocityX = StableMath.round(this.params.velocityX - normalVelocity * normalX);
        this.params.velocityY = StableMath.round(this.params.velocityY - normalVelocity * normalY);
        otherEntity.params.velocityX = StableMath.round(
            otherEntity.params.velocityX + normalVelocity * normalX,
        );
        otherEntity.params.velocityY = StableMath.round(
            otherEntity.params.velocityY + normalVelocity * normalY,
        );

        const separationX = StableMath.round(collision.overlapV.x / 2);
        const separationY = StableMath.round(collision.overlapV.y / 2);

        this.params.x = StableMath.round(this.params.x - separationX);
        this.params.y = StableMath.round(this.params.y - separationY);
        otherEntity.params.x = StableMath.round(otherEntity.params.x + separationX);
        otherEntity.params.y = StableMath.round(otherEntity.params.y + separationY);
        playAsteroidCollisionAudio(this.state);
    }

    public override update({msSinceLastUpdate}: Readonly<EntityUpdateParams>) {
        if (this.state.menuState) {
            return;
        }

        const modifiers = this.state.saveState?.modifiers || {};
        const slowMovementSpeedMultiplier = getAsteroidSlowMovementSpeedMultiplier(
            this.params.slowRemainingMilliseconds,
        );

        this.params.slowRemainingMilliseconds = Math.max(
            0,
            this.params.slowRemainingMilliseconds - msSinceLastUpdate,
        );
        steerAsteroidTowardNearestPlayer({
            acceleration: getAsteroidMagnetAcceleration(modifiers),
            asteroid: this,
            msSinceLastUpdate,
            players: this.entityStore.getEntities(PlayerEntity),
        });
        const movementSpeedMultiplier =
            getAsteroidMovementSpeedMultiplier(modifiers) * slowMovementSpeedMultiplier;

        this.params.x = StableMath.round(
            this.params.x + this.params.velocityX * msSinceLastUpdate * movementSpeedMultiplier,
        );
        this.params.y = StableMath.round(
            this.params.y + this.params.velocityY * msSinceLastUpdate * movementSpeedMultiplier,
        );
        this.params.rotation = StableMath.round(
            this.params.rotation + this.params.rotationSpeed * msSinceLastUpdate,
        );
        this.hitbox?.setAngle(this.params.rotation);

        if (this.isInBounds()) {
            this.params.hasEnteredScreen = true;
        } else if (this.params.hasEnteredScreen) {
            this.destroy();
        }
    }
}
