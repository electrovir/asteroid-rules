import {GamepadInputDeviceKey, MenuNavBinding} from '@antha/input';
import {assert, assertWrap} from '@augment-vir/assert';
import {getObjectTypedValues} from '@augment-vir/common';
import {describe, it} from '@augment-vir/test';
import {defaultPlayerInputBindings} from './default-bindings.js';
import {PlayerAction} from './player-action.js';

describe('default player input bindings', () => {
    it('maps player two to all non-primary gamepads', () => {
        const playerTwoBindings = assertWrap.isDefined(defaultPlayerInputBindings['2']);
        const playerTwoGamepadBindings = getObjectTypedValues(playerTwoBindings)
            .flat()
            .filter((binding) => {
                return binding.deviceKey !== 'keyboard';
            });

        assert.isTrue(
            playerTwoGamepadBindings.every((binding) => {
                return binding.deviceKey !== GamepadInputDeviceKey.Gamepad1;
            }),
        );
        assert.isTrue(
            getObjectTypedValues(playerTwoBindings).every((bindingAssignments) => {
                return [
                    GamepadInputDeviceKey.Gamepad2,
                    GamepadInputDeviceKey.Gamepad3,
                    GamepadInputDeviceKey.Gamepad4,
                ].every((gamepadKey) => {
                    return bindingAssignments.some((binding) => {
                        return binding.deviceKey === gamepadKey;
                    });
                });
            }),
        );
    });

    it('maps Space to player-one firing and menu activation', () => {
        const playerOneBindings = assertWrap.isDefined(defaultPlayerInputBindings['1']);

        assert.deepEquals(
            [
                PlayerAction.Fire,
                MenuNavBinding.MenuEnter,
            ].map((bindingName) => {
                return assertWrap.isDefined(playerOneBindings[bindingName]).some((binding) => {
                    return binding.inputName === 'button-Space';
                });
            }),
            [
                true,
                true,
            ],
        );
    });
});
