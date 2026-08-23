import {
    position2dParamsMap,
    position2dParamsShape,
    type EntityUpdateParams,
} from '@antha/entity-2d';
import {Graphics} from '@antha/graphics-2d';
import {StableMath} from '@antha/util';
import {defineShape, nonEmptyStringShape} from 'object-shape-tester';
import {defineEntity} from '../mods/game-entity.mod.js';

const explosionPiecePoints = [
    {
        x: 0,
        y: -6,
    },
    {
        x: 4,
        y: 3,
    },
    {
        x: -3,
        y: 4,
    },
];

export class PlayerExplosionParticleEntity extends defineEntity({
    key: 'asteroids-player-explosion-particle',
    paramsMap: {
        ...position2dParamsMap,
        view: {
            ...position2dParamsMap.view,
            rotation: true,
        },
    },
    paramsShape: defineShape({
        ...position2dParamsShape.default,
        color: nonEmptyStringShape(),
        lifetimeMilliseconds: 0,
        remainingLifetimeMilliseconds: 0,
        rotation: 0,
        rotationSpeed: 0,
        velocityX: 0,
        velocityY: 0,
    }),
}) {
    public override createView() {
        const graphics = new Graphics();

        explosionPiecePoints.forEach((point, index) => {
            if (index) {
                graphics.lineTo(point.x, point.y);
            } else {
                graphics.moveTo(point.x, point.y);
            }
        });

        return {
            view: graphics.closePath().fill(this.params.color),
        };
    }

    public override update({msSinceLastUpdate}: Readonly<EntityUpdateParams>) {
        if (this.state.menuState) {
            return;
        }

        this.params.remainingLifetimeMilliseconds = Math.max(
            0,
            this.params.remainingLifetimeMilliseconds - msSinceLastUpdate,
        );
        this.params.x = StableMath.round(this.params.x + this.params.velocityX * msSinceLastUpdate);
        this.params.y = StableMath.round(this.params.y + this.params.velocityY * msSinceLastUpdate);
        this.params.rotation = StableMath.round(
            this.params.rotation + this.params.rotationSpeed * msSinceLastUpdate,
        );
        this.view.alpha =
            this.params.remainingLifetimeMilliseconds / this.params.lifetimeMilliseconds;

        if (!this.params.remainingLifetimeMilliseconds) {
            this.destroy();
        }
    }
}
