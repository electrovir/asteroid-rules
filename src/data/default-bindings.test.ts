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

    it('reserves Space for player-one firing', () => {
        const playerOneBindings = assertWrap.isDefined(defaultPlayerInputBindings['1']);

        assert.isTrue(
            assertWrap.isDefined(playerOneBindings[PlayerAction.Fire]).some((binding) => {
                return binding.inputName === 'button-Space';
            }),
        );
        assert.isFalse(
            [
                MenuNavBinding.MenuDown,
                MenuNavBinding.MenuEnter,
                MenuNavBinding.MenuExit,
                MenuNavBinding.MenuLeft,
                MenuNavBinding.MenuRight,
                MenuNavBinding.MenuSectionNext,
                MenuNavBinding.MenuSectionPrevious,
                MenuNavBinding.MenuUp,
                MenuNavBinding.OpenPauseMenu,
            ].some((menuAction) => {
                return assertWrap.isDefined(playerOneBindings[menuAction]).some((binding) => {
                    return binding.inputName === 'button-Space';
                });
            }),
        );
    });
});
