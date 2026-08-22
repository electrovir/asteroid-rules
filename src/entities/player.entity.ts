import {
    position2dParamsMap,
    position2dParamsShape,
    type EntityUpdateParams,
} from '@antha/entity-2d';
import {Graphics} from '@antha/graphics-2d';
import {clamp} from '@augment-vir/common';
import {defineShape, enumShape} from 'object-shape-tester';
import {PlayerPosition} from '../data/game-state.js';
import {calculatePlayerMovement, getMouseMovementTarget} from '../data/player-movement.js';
import {defineEntity} from '../mods/asteroids-entity.mod.js';

const playerSize = 24;
const playerHalfWidth = playerSize * 0.8;
const playerHalfHeight = playerSize;

export class PlayerEntity extends defineEntity({
    assets: {
        player: {
            maxProgress: 1,
            load({incrementProgressCallback}) {
                const graphics = new Graphics()
                    .moveTo(0, -playerSize)
                    .lineTo(playerSize * 0.8, playerSize)
                    .lineTo(0, playerSize * 0.55)
                    .lineTo(-playerSize * 0.8, playerSize)
                    .closePath()
                    .fill('#39ff14');

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
        };
    }

    public override update({msSinceLastUpdate}: Readonly<EntityUpdateParams>) {
        if (this.state.isInMenu || !this.state.saveState?.modifiers.allowPlayerCardinalMovement) {
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

        this.view.rotation = Math.atan2(movement.y, movement.x) + Math.PI / 2;
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
