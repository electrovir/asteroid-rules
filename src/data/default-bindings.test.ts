import {AnthaEngine} from '@antha/engine';
import {
    createAnthaInputBindingsMod,
    GamepadInputDeviceKey,
    InputDeviceType,
    InputDirection,
    KnownInput,
    MenuNavBinding,
    type AnthaInputBindingsModState,
    type RawInput,
} from '@antha/input';
import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {defaultPlayerInputBindings} from './default-bindings.js';
import {type GameInputAction} from './player-action.js';

function createGamepadRawInput({
    deviceKey,
    direction,
    inputName,
    inputValue,
}: Readonly<{
    deviceKey: GamepadInputDeviceKey;
    direction: InputDirection;
    inputName: KnownInput;
    inputValue: number;
}>): RawInput {
    return {
        deviceKey,
        deviceName: 'Gamepad',
        deviceType: InputDeviceType.Gamepad,
        direction,
        duration: {
            milliseconds: 0,
        },
        inputName,
        inputValue,
        mapped: {
            deviceName: 'Gamepad',
            gamepadBrand: undefined,
            inputName,
        },
    };
}

describe('defaultPlayerInputBindings', () => {
    it('activates menu navigation for either player joystick', async () => {
        const engine = new AnthaEngine<AnthaInputBindingsModState<GameInputAction>>({
            initState: {
                bindingAssignments: defaultPlayerInputBindings,
                rawInputs: {
                    [GamepadInputDeviceKey.Gamepad1]: {
                        [KnownInput.LeftStickY]: createGamepadRawInput({
                            deviceKey: GamepadInputDeviceKey.Gamepad1,
                            direction: InputDirection.Positive,
                            inputName: KnownInput.LeftStickY,
                            inputValue: 1,
                        }),
                    },
                    [GamepadInputDeviceKey.Gamepad2]: {
                        [KnownInput.RightStickY]: createGamepadRawInput({
                            deviceKey: GamepadInputDeviceKey.Gamepad2,
                            direction: InputDirection.Negative,
                            inputName: KnownInput.RightStickY,
                            inputValue: -1,
                        }),
                    },
                },
            },
            mods: [
                createAnthaInputBindingsMod<GameInputAction>(),
            ],
        });

        await engine.runSingleTick();

        assert.deepEquals(
            {
                playerOneMenuDown:
                    engine.state.activeBindings?.['1']?.[MenuNavBinding.MenuDown]?.value,
                playerTwoMenuUp: engine.state.activeBindings?.['2']?.[MenuNavBinding.MenuUp]?.value,
            },
            {
                playerOneMenuDown: 1,
                playerTwoMenuUp: 1,
            },
        );
    });
});
