import {
    position2dParamsMap,
    position2dParamsShape,
    type BaseEntity2d,
    type EntityUpdateParams,
} from '@antha/entity-2d';
import {Graphics} from '@antha/graphics-2d';
import {StableMath} from '@antha/util';
import {Circle} from 'detect-collisions';
import {defineShape} from 'object-shape-tester';
import {defineEntity} from '../mods/game-entity.mod.js';
import {AsteroidEntity} from './asteroid.entity.js';
import {playerBulletDamage} from './player.entity.js';

const playerBulletRadius = 6;

export class PlayerBulletEntity extends defineEntity({
    key: 'asteroids-player-bullet',
    paramsMap: position2dParamsMap,
    paramsShape: defineShape({
        ...position2dParamsShape.default,
        velocityX: 0,
        velocityY: 0,
    }),
}) {
    public override createView() {
        const graphics = new Graphics().circle(0, 0, playerBulletRadius).fill('#ffff66');

        return {
            hitbox: new Circle(
                {
                    x: this.params.x,
                    y: this.params.y,
                },
                playerBulletRadius,
            ),
            view: graphics,
        };
    }

    public override async collide(otherEntity: BaseEntity2d) {
        if (otherEntity instanceof AsteroidEntity) {
            await otherEntity.takeDamage({
                damage: playerBulletDamage,
            });
            this.destroy();
        }
    }

    public override update({msSinceLastUpdate}: Readonly<EntityUpdateParams>) {
        if (this.state.menuState) {
            return;
        }

        this.params.x = StableMath.round(this.params.x + this.params.velocityX * msSinceLastUpdate);
        this.params.y = StableMath.round(this.params.y + this.params.velocityY * msSinceLastUpdate);

        if (!this.isInBounds()) {
            this.destroy();
        }
    }
}
