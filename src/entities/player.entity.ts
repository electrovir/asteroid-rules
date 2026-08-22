import {
    position2dParamsMap,
    position2dParamsShape,
    type EntityUpdateParams,
} from '@antha/entity-2d';
import {Graphics} from '@antha/graphics-2d';
import {type ActiveBinding, type ActiveBindings} from '@antha/input';
import {clamp} from '@augment-vir/common';
import {defineShape, enumShape} from 'object-shape-tester';
import {PlayerPosition} from '../data/game-state.js';
import {PlayerAction, type GameInputAction} from '../data/player-action.js';
import {defineEntity} from '../mods/asteroids-entity.mod.js';

const playerSize = 24;
const playerHalfWidth = playerSize * 0.8;
const playerHalfHeight = playerSize;
const playerSpeedPixelsPerMillisecond = 0.4;

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
        if (
            this.state.isInMenu ||
            !this.state.missionState?.modifiers.allowPlayerCardinalMovement
        ) {
            return;
        }

        const movement = calculateCardinalMovement({
            activeBindings: this.state.activeBindings[this.params.inputPlayerPosition],
            msSinceLastUpdate,
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

function calculateCardinalMovement({
    activeBindings,
    msSinceLastUpdate,
}: Readonly<{
    activeBindings: ActiveBindings<GameInputAction> | undefined;
    msSinceLastUpdate: number;
}>) {
    const upMovement = createMovementInput(activeBindings?.[PlayerAction.MoveUp]);
    const downMovement = createMovementInput(activeBindings?.[PlayerAction.MoveDown]);
    const leftMovement = createMovementInput(activeBindings?.[PlayerAction.MoveLeft]);
    const rightMovement = createMovementInput(activeBindings?.[PlayerAction.MoveRight]);

    const movementY =
        upMovement.value && upMovement.durationMs < downMovement.durationMs
            ? -upMovement.value
            : downMovement.value && downMovement.durationMs < upMovement.durationMs
              ? downMovement.value
              : 0;
    const movementX =
        leftMovement.value && leftMovement.durationMs < rightMovement.durationMs
            ? -leftMovement.value
            : rightMovement.value && rightMovement.durationMs < leftMovement.durationMs
              ? rightMovement.value
              : 0;
    const movementMagnitude = Math.hypot(movementX, movementY);

    if (!movementMagnitude) {
        return undefined;
    }

    return {
        x: (movementX / movementMagnitude) * msSinceLastUpdate * playerSpeedPixelsPerMillisecond,
        y: (movementY / movementMagnitude) * msSinceLastUpdate * playerSpeedPixelsPerMillisecond,
    };
}

function createMovementInput(activeBinding: ActiveBinding | undefined) {
    return {
        durationMs: activeBinding?.holdDuration.milliseconds ?? Infinity,
        value: clamp(activeBinding?.value || 0, {
            min: 0,
            max: 1,
        }),
    };
}
