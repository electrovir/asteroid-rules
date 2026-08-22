import {
    createAxeName,
    createButtonName,
    InputDeviceKey,
    InputDeviceType,
    InputDirection,
    type ActiveBindings,
    type RawInput,
    type RawInputs,
} from '@antha/input';
import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {PlayerAction, type GameInputAction} from './player-action.js';
import {calculatePlayerMovement, getMouseMovementTarget} from './player-movement.js';

function createMouseInput({
    inputName,
    inputValue,
}: Readonly<{
    inputName: string;
    inputValue: number;
}>): RawInput {
    return {
        deviceKey: InputDeviceKey.Mouse,
        deviceName: 'Mouse',
        deviceType: InputDeviceType.Mouse,
        direction: InputDirection.Positive,
        duration: {
            milliseconds: 0,
        },
        inputName,
        inputValue,
        mapped: {
            deviceName: 'Mouse',
            gamepadBrand: undefined,
            inputName,
        },
    };
}

function createRawInputs({
    isPrimaryButtonPressed,
}: Readonly<{isPrimaryButtonPressed: boolean}>): RawInputs {
    return {
        [InputDeviceKey.Mouse]: {
            [createAxeName('x')]: createMouseInput({
                inputName: createAxeName('x'),
                inputValue: 100,
            }),
            [createAxeName('y')]: createMouseInput({
                inputName: createAxeName('y'),
                inputValue: 150,
            }),
            ...(isPrimaryButtonPressed
                ? {
                      [createButtonName(0)]: createMouseInput({
                          inputName: createButtonName(0),
                          inputValue: 1,
                      }),
                  }
                : {}),
        },
    };
}

function createActiveBindings(): ActiveBindings<GameInputAction> {
    return {
        [PlayerAction.MoveRight]: {
            actCount: 0,
            holdDuration: {
                milliseconds: 0,
            },
            lastActDuration: {
                milliseconds: 0,
            },
            value: 1,
        },
    };
}

describe('player movement', () => {
    it('combines input directions without exceeding max movement speed', () => {
        const canvas = document.createElement('canvas');

        canvas.getBoundingClientRect = () => {
            return new DOMRect(100, 50, 200, 200);
        };

        const movement = calculatePlayerMovement({
            activeBindings: createActiveBindings(),
            mouseMovementTarget: getMouseMovementTarget({
                canvas,
                rawInputs: createRawInputs({
                    isPrimaryButtonPressed: true,
                }),
                screen: {
                    height: 400,
                    width: 400,
                },
            }),
            msSinceLastUpdate: 10,
            playerPosition: {
                x: 0,
                y: 0,
            },
        });

        assert.isDefined(movement);
        assert.isApproximately(Math.hypot(movement.x, movement.y), 4, 0.000001);
    });

    it('stops when the primary mouse button is released', () => {
        const canvas = document.createElement('canvas');

        assert.isUndefined(
            getMouseMovementTarget({
                canvas,
                rawInputs: createRawInputs({
                    isPrimaryButtonPressed: false,
                }),
                screen: {
                    height: 400,
                    width: 400,
                },
            }),
        );
    });
});
