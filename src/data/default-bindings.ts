import {
    GamepadInputDeviceKey,
    InputDirection,
    KnownInput,
    MenuNavBinding,
    type BindingAssignments,
    type PlayersBindingAssignments,
} from '@antha/input';
import {deepCopy, mapObjectValuesSync} from '@augment-vir/common';
import {PlayerAction, type GameInputAction} from './player-action.js';

const playerTwoGamepadKeys = [
    GamepadInputDeviceKey.Gamepad2,
    GamepadInputDeviceKey.Gamepad3,
    GamepadInputDeviceKey.Gamepad4,
];

function createPlayerTwoInputBindings({
    inputBindings,
}: Readonly<{
    inputBindings: Readonly<BindingAssignments<GameInputAction>>;
}>) {
    return mapObjectValuesSync(inputBindings, (bindingName, bindingAssignments) => {
        return bindingAssignments.flatMap((binding) => {
            if (binding.deviceKey !== GamepadInputDeviceKey.Gamepad2) {
                return [binding];
            }

            return playerTwoGamepadKeys.map((deviceKey) => {
                return {
                    ...binding,
                    deviceKey,
                };
            });
        });
    });
}

export const defaultPlayerInputBindings: Readonly<PlayersBindingAssignments<GameInputAction>> = {
    1: {
        [PlayerAction.MoveDown]: [
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.DPadDown,
            },
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.LeftStickY,
            },
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.RightStickY,
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-KeyS',
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-ArrowDown',
            },
        ],
        [PlayerAction.MoveLeft]: [
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.DPadLeft,
            },
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Negative,
                inputName: KnownInput.LeftStickX,
            },
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Negative,
                inputName: KnownInput.RightStickX,
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-KeyA',
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-ArrowLeft',
            },
        ],
        [PlayerAction.MoveRight]: [
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.DPadRight,
            },
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.LeftStickX,
            },
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.RightStickX,
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-KeyD',
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-ArrowRight',
            },
        ],
        [PlayerAction.MoveUp]: [
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.DPadUp,
            },
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Negative,
                inputName: KnownInput.LeftStickY,
            },
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Negative,
                inputName: KnownInput.RightStickY,
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-KeyW',
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-ArrowUp',
            },
        ],
        [PlayerAction.Fire]: [
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.FaceAccept,
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-Space',
            },
        ],
        [MenuNavBinding.MenuDown]: [
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.DPadDown,
            },
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.LeftStickY,
            },
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.RightStickY,
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-KeyS',
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-ArrowDown',
            },
        ],
        [MenuNavBinding.MenuEnter]: [
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.FaceAccept,
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-Enter',
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-NumpadEnter',
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-Space',
            },
        ],
        [MenuNavBinding.MenuExit]: [
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.FaceCancel,
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-Escape',
            },
        ],
        [MenuNavBinding.MenuLeft]: [
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.DPadLeft,
            },
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Negative,
                inputName: KnownInput.LeftStickX,
            },
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Negative,
                inputName: KnownInput.RightStickX,
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-KeyA',
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-ArrowLeft',
            },
        ],
        [MenuNavBinding.MenuRight]: [
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.DPadRight,
            },
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.LeftStickX,
            },
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.RightStickX,
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-KeyD',
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-ArrowRight',
            },
        ],
        [MenuNavBinding.MenuSectionNext]: [
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.R1,
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-KeyE',
            },
        ],
        [MenuNavBinding.MenuSectionPrevious]: [
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.L1,
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-KeyQ',
            },
        ],
        [MenuNavBinding.MenuUp]: [
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.DPadUp,
            },
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Negative,
                inputName: KnownInput.LeftStickY,
            },
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Negative,
                inputName: KnownInput.RightStickY,
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-KeyW',
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-ArrowUp',
            },
        ],
        [MenuNavBinding.OpenPauseMenu]: [
            {
                deviceKey: GamepadInputDeviceKey.Gamepad1,
                direction: InputDirection.Positive,
                inputName: KnownInput.Start,
            },
            {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName: 'button-Escape',
            },
        ],
    },
    2: createPlayerTwoInputBindings({
        inputBindings: {
            [PlayerAction.MoveDown]: [
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.DPadDown,
                },
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.LeftStickY,
                },
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.RightStickY,
                },
                {
                    deviceKey: 'keyboard',
                    direction: InputDirection.Positive,
                    inputName: 'button-KeyK',
                },
            ],
            [PlayerAction.MoveLeft]: [
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.DPadLeft,
                },
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Negative,
                    inputName: KnownInput.LeftStickX,
                },
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Negative,
                    inputName: KnownInput.RightStickX,
                },
                {
                    deviceKey: 'keyboard',
                    direction: InputDirection.Positive,
                    inputName: 'button-KeyJ',
                },
            ],
            [PlayerAction.MoveRight]: [
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.DPadRight,
                },
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.LeftStickX,
                },
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.RightStickX,
                },
                {
                    deviceKey: 'keyboard',
                    direction: InputDirection.Positive,
                    inputName: 'button-KeyL',
                },
            ],
            [PlayerAction.MoveUp]: [
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.DPadUp,
                },
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Negative,
                    inputName: KnownInput.LeftStickY,
                },
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Negative,
                    inputName: KnownInput.RightStickY,
                },
                {
                    deviceKey: 'keyboard',
                    direction: InputDirection.Positive,
                    inputName: 'button-KeyI',
                },
            ],
            [PlayerAction.Fire]: [
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.FaceAccept,
                },
                {
                    deviceKey: 'keyboard',
                    direction: InputDirection.Positive,
                    inputName: 'button-KeyP',
                },
            ],
            [MenuNavBinding.MenuDown]: [
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.DPadDown,
                },
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.LeftStickY,
                },
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.RightStickY,
                },
                {
                    deviceKey: 'keyboard',
                    direction: InputDirection.Positive,
                    inputName: 'button-KeyK',
                },
            ],
            [MenuNavBinding.MenuEnter]: [
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.FaceAccept,
                },
                {
                    deviceKey: 'keyboard',
                    direction: InputDirection.Positive,
                    inputName: 'button-Enter',
                },
                {
                    deviceKey: 'keyboard',
                    direction: InputDirection.Positive,
                    inputName: 'button-NumpadEnter',
                },
            ],
            [MenuNavBinding.MenuExit]: [
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.FaceCancel,
                },
                {
                    deviceKey: 'keyboard',
                    direction: InputDirection.Positive,
                    inputName: 'button-Escape',
                },
            ],
            [MenuNavBinding.MenuLeft]: [
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.DPadLeft,
                },
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Negative,
                    inputName: KnownInput.LeftStickX,
                },
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Negative,
                    inputName: KnownInput.RightStickX,
                },
                {
                    deviceKey: 'keyboard',
                    direction: InputDirection.Positive,
                    inputName: 'button-KeyJ',
                },
            ],
            [MenuNavBinding.MenuRight]: [
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.DPadRight,
                },
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.LeftStickX,
                },
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.RightStickX,
                },
                {
                    deviceKey: 'keyboard',
                    direction: InputDirection.Positive,
                    inputName: 'button-KeyL',
                },
            ],
            [MenuNavBinding.MenuSectionNext]: [
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.R1,
                },
                {
                    deviceKey: 'keyboard',
                    direction: InputDirection.Positive,
                    inputName: 'button-KeyO',
                },
            ],
            [MenuNavBinding.MenuSectionPrevious]: [
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.L1,
                },
                {
                    deviceKey: 'keyboard',
                    direction: InputDirection.Positive,
                    inputName: 'button-KeyU',
                },
            ],
            [MenuNavBinding.MenuUp]: [
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.DPadUp,
                },
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Negative,
                    inputName: KnownInput.LeftStickY,
                },
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Negative,
                    inputName: KnownInput.RightStickY,
                },
                {
                    deviceKey: 'keyboard',
                    direction: InputDirection.Positive,
                    inputName: 'button-KeyI',
                },
            ],
            [MenuNavBinding.OpenPauseMenu]: [
                {
                    deviceKey: GamepadInputDeviceKey.Gamepad2,
                    direction: InputDirection.Positive,
                    inputName: KnownInput.Start,
                },
                {
                    deviceKey: 'keyboard',
                    direction: InputDirection.Positive,
                    inputName: 'button-Escape',
                },
            ],
        },
    }),
};

export function createDefaultPlayerInputBindings() {
    return deepCopy(defaultPlayerInputBindings);
}
