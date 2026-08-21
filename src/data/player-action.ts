import {
    GamepadInputDeviceKey,
    InputDirection,
    KnownInput,
    MenuNavBinding,
    type BindingAssignment,
    type BindingAssignments,
    type PlayersBindingAssignments,
} from '@antha/input';
import {type Values} from '@augment-vir/common';

export enum PlayerAction {
    MoveDown = 'move-down',
    MoveLeft = 'move-left',
    MoveRight = 'move-right',
    MoveUp = 'move-up',
}

export const GameInputAction = {
    ...MenuNavBinding,
    ...PlayerAction,
};
export type GameInputAction = Values<typeof GameInputAction>;

type KeyboardInputNames = Readonly<Record<PlayerAction, ReadonlyArray<string>>>;
type MenuKeyboardInputNames = Readonly<Record<MenuNavBinding, ReadonlyArray<string>>>;

export const defaultPlayerInputBindings: Readonly<PlayersBindingAssignments<GameInputAction>> = {
    1: {
        ...createCardinalBindings({
            gamepadInputDeviceKey: GamepadInputDeviceKey.Gamepad1,
            keyboardInputNames: {
                [PlayerAction.MoveDown]: [
                    'button-KeyS',
                    'button-ArrowDown',
                ],
                [PlayerAction.MoveLeft]: [
                    'button-KeyA',
                    'button-ArrowLeft',
                ],
                [PlayerAction.MoveRight]: [
                    'button-KeyD',
                    'button-ArrowRight',
                ],
                [PlayerAction.MoveUp]: [
                    'button-KeyW',
                    'button-ArrowUp',
                ],
            },
        }),
        ...createMenuNavBindings({
            gamepadInputDeviceKey: GamepadInputDeviceKey.Gamepad1,
            keyboardInputNames: {
                [MenuNavBinding.MenuDown]: [
                    'button-KeyS',
                    'button-ArrowDown',
                ],
                [MenuNavBinding.MenuEnter]: [
                    'button-Space',
                    'button-Enter',
                    'button-NumpadEnter',
                ],
                [MenuNavBinding.MenuExit]: [
                    'button-Escape',
                ],
                [MenuNavBinding.MenuLeft]: [
                    'button-KeyA',
                    'button-ArrowLeft',
                ],
                [MenuNavBinding.MenuRight]: [
                    'button-KeyD',
                    'button-ArrowRight',
                ],
                [MenuNavBinding.MenuSectionNext]: [
                    'button-KeyE',
                ],
                [MenuNavBinding.MenuSectionPrevious]: [
                    'button-KeyQ',
                ],
                [MenuNavBinding.MenuUp]: [
                    'button-KeyW',
                    'button-ArrowUp',
                ],
                [MenuNavBinding.OpenPauseMenu]: [
                    'button-Escape',
                ],
            },
        }),
    },
    2: {
        ...createCardinalBindings({
            gamepadInputDeviceKey: GamepadInputDeviceKey.Gamepad2,
            keyboardInputNames: {
                [PlayerAction.MoveDown]: [
                    'button-KeyK',
                ],
                [PlayerAction.MoveLeft]: [
                    'button-KeyJ',
                ],
                [PlayerAction.MoveRight]: [
                    'button-KeyL',
                ],
                [PlayerAction.MoveUp]: [
                    'button-KeyI',
                ],
            },
        }),
        ...createMenuNavBindings({
            gamepadInputDeviceKey: GamepadInputDeviceKey.Gamepad2,
            keyboardInputNames: {
                [MenuNavBinding.MenuDown]: [
                    'button-KeyK',
                ],
                [MenuNavBinding.MenuEnter]: [
                    'button-Space',
                    'button-Enter',
                    'button-NumpadEnter',
                ],
                [MenuNavBinding.MenuExit]: [
                    'button-Escape',
                ],
                [MenuNavBinding.MenuLeft]: [
                    'button-KeyJ',
                ],
                [MenuNavBinding.MenuRight]: [
                    'button-KeyL',
                ],
                [MenuNavBinding.MenuSectionNext]: [
                    'button-KeyO',
                ],
                [MenuNavBinding.MenuSectionPrevious]: [
                    'button-KeyU',
                ],
                [MenuNavBinding.MenuUp]: [
                    'button-KeyI',
                ],
                [MenuNavBinding.OpenPauseMenu]: [
                    'button-Escape',
                ],
            },
        }),
    },
};

function createMenuNavBindings({
    gamepadInputDeviceKey,
    keyboardInputNames,
}: Readonly<{
    gamepadInputDeviceKey: GamepadInputDeviceKey;
    keyboardInputNames: MenuKeyboardInputNames;
}>): BindingAssignments<MenuNavBinding> {
    return {
        [MenuNavBinding.MenuDown]: createMenuInputBindings({
            gamepadInputDeviceKey,
            gamepadInputName: KnownInput.DPadDown,
            keyboardInputNames: keyboardInputNames[MenuNavBinding.MenuDown],
        }),
        [MenuNavBinding.MenuEnter]: createMenuInputBindings({
            gamepadInputDeviceKey,
            gamepadInputName: KnownInput.FaceAccept,
            keyboardInputNames: keyboardInputNames[MenuNavBinding.MenuEnter],
        }),
        [MenuNavBinding.MenuExit]: createMenuInputBindings({
            gamepadInputDeviceKey,
            gamepadInputName: KnownInput.FaceCancel,
            keyboardInputNames: keyboardInputNames[MenuNavBinding.MenuExit],
        }),
        [MenuNavBinding.MenuLeft]: createMenuInputBindings({
            gamepadInputDeviceKey,
            gamepadInputName: KnownInput.DPadLeft,
            keyboardInputNames: keyboardInputNames[MenuNavBinding.MenuLeft],
        }),
        [MenuNavBinding.MenuRight]: createMenuInputBindings({
            gamepadInputDeviceKey,
            gamepadInputName: KnownInput.DPadRight,
            keyboardInputNames: keyboardInputNames[MenuNavBinding.MenuRight],
        }),
        [MenuNavBinding.MenuSectionNext]: createMenuInputBindings({
            gamepadInputDeviceKey,
            gamepadInputName: KnownInput.R1,
            keyboardInputNames: keyboardInputNames[MenuNavBinding.MenuSectionNext],
        }),
        [MenuNavBinding.MenuSectionPrevious]: createMenuInputBindings({
            gamepadInputDeviceKey,
            gamepadInputName: KnownInput.L1,
            keyboardInputNames: keyboardInputNames[MenuNavBinding.MenuSectionPrevious],
        }),
        [MenuNavBinding.MenuUp]: createMenuInputBindings({
            gamepadInputDeviceKey,
            gamepadInputName: KnownInput.DPadUp,
            keyboardInputNames: keyboardInputNames[MenuNavBinding.MenuUp],
        }),
        [MenuNavBinding.OpenPauseMenu]: createMenuInputBindings({
            gamepadInputDeviceKey,
            gamepadInputName: KnownInput.Start,
            keyboardInputNames: keyboardInputNames[MenuNavBinding.OpenPauseMenu],
        }),
    };
}

function createCardinalBindings({
    gamepadInputDeviceKey,
    keyboardInputNames,
}: Readonly<{
    gamepadInputDeviceKey: GamepadInputDeviceKey;
    keyboardInputNames: KeyboardInputNames;
}>): BindingAssignments<PlayerAction> {
    return {
        [PlayerAction.MoveDown]: createDirectionalBindings({
            dPadInputName: KnownInput.DPadDown,
            gamepadInputDeviceKey,
            joystickDirection: InputDirection.Positive,
            leftJoystickInputName: KnownInput.LeftStickY,
            keyboardInputNames: keyboardInputNames[PlayerAction.MoveDown],
            rightJoystickInputName: KnownInput.RightStickY,
        }),
        [PlayerAction.MoveLeft]: createDirectionalBindings({
            dPadInputName: KnownInput.DPadLeft,
            gamepadInputDeviceKey,
            joystickDirection: InputDirection.Negative,
            leftJoystickInputName: KnownInput.LeftStickX,
            keyboardInputNames: keyboardInputNames[PlayerAction.MoveLeft],
            rightJoystickInputName: KnownInput.RightStickX,
        }),
        [PlayerAction.MoveRight]: createDirectionalBindings({
            dPadInputName: KnownInput.DPadRight,
            gamepadInputDeviceKey,
            joystickDirection: InputDirection.Positive,
            leftJoystickInputName: KnownInput.LeftStickX,
            keyboardInputNames: keyboardInputNames[PlayerAction.MoveRight],
            rightJoystickInputName: KnownInput.RightStickX,
        }),
        [PlayerAction.MoveUp]: createDirectionalBindings({
            dPadInputName: KnownInput.DPadUp,
            gamepadInputDeviceKey,
            joystickDirection: InputDirection.Negative,
            leftJoystickInputName: KnownInput.LeftStickY,
            keyboardInputNames: keyboardInputNames[PlayerAction.MoveUp],
            rightJoystickInputName: KnownInput.RightStickY,
        }),
    };
}

function createDirectionalBindings({
    dPadInputName,
    gamepadInputDeviceKey,
    joystickDirection,
    keyboardInputNames,
    leftJoystickInputName,
    rightJoystickInputName,
}: Readonly<{
    dPadInputName: KnownInput;
    gamepadInputDeviceKey: GamepadInputDeviceKey;
    joystickDirection: InputDirection;
    keyboardInputNames: ReadonlyArray<string>;
    leftJoystickInputName: KnownInput;
    rightJoystickInputName: KnownInput;
}>): BindingAssignment[] {
    return [
        {
            deviceKey: gamepadInputDeviceKey,
            direction: InputDirection.Positive,
            inputName: dPadInputName,
        },
        {
            deviceKey: gamepadInputDeviceKey,
            direction: joystickDirection,
            inputName: leftJoystickInputName,
        },
        {
            deviceKey: gamepadInputDeviceKey,
            direction: joystickDirection,
            inputName: rightJoystickInputName,
        },
        ...createKeyboardInputBindings({
            keyboardInputNames,
        }),
    ];
}

function createMenuInputBindings({
    gamepadInputDeviceKey,
    gamepadInputName,
    keyboardInputNames,
}: Readonly<{
    gamepadInputDeviceKey: GamepadInputDeviceKey;
    gamepadInputName: KnownInput;
    keyboardInputNames: ReadonlyArray<string>;
}>): BindingAssignment[] {
    return [
        {
            deviceKey: gamepadInputDeviceKey,
            direction: InputDirection.Positive,
            inputName: gamepadInputName,
        },
        ...createKeyboardInputBindings({
            keyboardInputNames,
        }),
    ];
}

function createKeyboardInputBindings({
    keyboardInputNames,
}: Readonly<{
    keyboardInputNames: ReadonlyArray<string>;
}>): BindingAssignment[] {
    return keyboardInputNames.map((inputName): BindingAssignment => {
        return {
            deviceKey: 'keyboard',
            direction: InputDirection.Positive,
            inputName,
        };
    });
}
