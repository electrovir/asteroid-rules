import {
    position2dParamsMap,
    position2dParamsShape,
    type BaseEntity2d,
    type EntityUpdateParams,
} from '@antha/entity-2d';
import {Graphics} from '@antha/graphics-2d';
import {clamp} from '@augment-vir/common';
import {Polygon} from 'detect-collisions';
import {defineShape, enumShape} from 'object-shape-tester';
import {PlayerPosition} from '../data/game-state.js';
import {calculatePlayerMovement, getMouseMovementTarget} from '../data/player-movement.js';
import {defineEntity} from '../mods/game-entity.mod.js';
import {AsteroidEntity} from './asteroid.entity.js';

const playerSize = 24;
const playerHalfWidth = playerSize * 0.8;
const playerHalfHeight = playerSize;
const playerOutlinePoints = [
    {
        x: 0,
        y: -playerSize,
    },
    {
        x: playerSize * 0.8,
        y: playerSize,
    },
    {
        x: 0,
        y: playerSize * 0.55,
    },
    {
        x: -playerSize * 0.8,
        y: playerSize,
    },
];

export class PlayerEntity extends defineEntity({
    assets: {
        player: {
            maxProgress: 1,
            load({incrementProgressCallback}) {
                const graphics = new Graphics();

                playerOutlinePoints.forEach((point, index) => {
                    if (index) {
                        graphics.lineTo(point.x, point.y);
                    } else {
                        graphics.moveTo(point.x, point.y);
                    }
                });

                graphics.closePath().fill('#39ff14');

                incrementProgressCallback();

                return {
                    value: graphics,
                };
            },
        },
    },
    key: 'asteroids-player',
    paramsMap: position2dParamsMap,
    paramsShape: defineShape({
        ...position2dParamsShape.default,
        inputPlayerPosition: enumShape(PlayerPosition),
    }),
}) {
    public override async createView() {
        return {
            view: (await this.getAsset.player()).clone(),
            hitbox: new Polygon(
                {
                    x: this.params.x,
                    y: this.params.y,
                },
                playerOutlinePoints,
            ),
        };
    }

    public override collide(otherEntity: BaseEntity2d) {
        if (otherEntity instanceof AsteroidEntity) {
            this.destroy();
        }
    }

    public override update({msSinceLastUpdate}: Readonly<EntityUpdateParams>) {
        if (this.state.menuState || !this.state.saveState?.modifiers.allowPlayerCardinalMovement) {
            return;
        }

        const movement = calculatePlayerMovement({
            activeBindings: this.state.activeBindings[this.params.inputPlayerPosition],
            msSinceLastUpdate,
            mouseMovementTarget: this.state.isMouseMovementAllowed
                ? getMouseMovementTarget({
                      canvas: this.state.pixi.canvas,
                      rawInputs: this.state.rawInputs,
                      screen: this.pixi.screen,
                  })
                : undefined,
            playerPosition: this.params,
        });

        if (!movement) {
            return;
        }

        const rotation = Math.atan2(movement.y, movement.x) + Math.PI / 2;
        this.view.rotation = rotation;
        this.hitbox?.setAngle(rotation);
        this.params.x = clamp(this.params.x + movement.x, {
            min: playerHalfWidth,
            max: this.pixi.screen.width - playerHalfWidth,
        });
        this.params.y = clamp(this.params.y + movement.y, {
            min: playerHalfHeight,
            max: this.pixi.screen.height - playerHalfHeight,
        });
    }
}
