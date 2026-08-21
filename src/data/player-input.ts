import {
    GamepadInputDeviceKey,
    InputDirection,
    KnownInput,
    type BindingAssignment,
    type BindingAssignments,
    type PlayersBindingAssignments,
} from '@antha/input';

export enum PlayerInputAction {
    MoveDown = 'move-down',
    MoveLeft = 'move-left',
    MoveRight = 'move-right',
    MoveUp = 'move-up',
}

type KeyboardInputNames = Readonly<Record<PlayerInputAction, ReadonlyArray<string>>>;

export const defaultPlayerInputBindings: Readonly<PlayersBindingAssignments<PlayerInputAction>> = {
    1: createCardinalBindings({
        gamepadInputDeviceKey: GamepadInputDeviceKey.Gamepad1,
        keyboardInputNames: {
            [PlayerInputAction.MoveDown]: [
                'button-KeyS',
                'button-ArrowDown',
            ],
            [PlayerInputAction.MoveLeft]: [
                'button-KeyA',
                'button-ArrowLeft',
            ],
            [PlayerInputAction.MoveRight]: [
                'button-KeyD',
                'button-ArrowRight',
            ],
            [PlayerInputAction.MoveUp]: [
                'button-KeyW',
                'button-ArrowUp',
            ],
        },
    }),
    2: createCardinalBindings({
        gamepadInputDeviceKey: GamepadInputDeviceKey.Gamepad2,
        keyboardInputNames: {
            [PlayerInputAction.MoveDown]: [
                'button-KeyK',
            ],
            [PlayerInputAction.MoveLeft]: [
                'button-KeyJ',
            ],
            [PlayerInputAction.MoveRight]: [
                'button-KeyL',
            ],
            [PlayerInputAction.MoveUp]: [
                'button-KeyI',
            ],
        },
    }),
};

function createCardinalBindings({
    gamepadInputDeviceKey,
    keyboardInputNames,
}: Readonly<{
    gamepadInputDeviceKey: GamepadInputDeviceKey;
    keyboardInputNames: KeyboardInputNames;
}>): BindingAssignments<PlayerInputAction> {
    return {
        [PlayerInputAction.MoveDown]: createDirectionalBindings({
            dPadInputName: KnownInput.DPadDown,
            gamepadInputDeviceKey,
            joystickDirection: InputDirection.Positive,
            leftJoystickInputName: KnownInput.LeftStickY,
            keyboardInputNames: keyboardInputNames[PlayerInputAction.MoveDown],
            rightJoystickInputName: KnownInput.RightStickY,
        }),
        [PlayerInputAction.MoveLeft]: createDirectionalBindings({
            dPadInputName: KnownInput.DPadLeft,
            gamepadInputDeviceKey,
            joystickDirection: InputDirection.Negative,
            leftJoystickInputName: KnownInput.LeftStickX,
            keyboardInputNames: keyboardInputNames[PlayerInputAction.MoveLeft],
            rightJoystickInputName: KnownInput.RightStickX,
        }),
        [PlayerInputAction.MoveRight]: createDirectionalBindings({
            dPadInputName: KnownInput.DPadRight,
            gamepadInputDeviceKey,
            joystickDirection: InputDirection.Positive,
            leftJoystickInputName: KnownInput.LeftStickX,
            keyboardInputNames: keyboardInputNames[PlayerInputAction.MoveRight],
            rightJoystickInputName: KnownInput.RightStickX,
        }),
        [PlayerInputAction.MoveUp]: createDirectionalBindings({
            dPadInputName: KnownInput.DPadUp,
            gamepadInputDeviceKey,
            joystickDirection: InputDirection.Negative,
            leftJoystickInputName: KnownInput.LeftStickY,
            keyboardInputNames: keyboardInputNames[PlayerInputAction.MoveUp],
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
        ...keyboardInputNames.map((inputName): BindingAssignment => {
            return {
                deviceKey: 'keyboard',
                direction: InputDirection.Positive,
                inputName,
            };
        }),
    ];
}
