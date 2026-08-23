import {MenuNavBinding} from '@antha/input';
import {assert, assertWrap} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {defaultPlayerInputBindings} from './default-bindings.js';
import {PlayerAction} from './player-action.js';

describe('default player input bindings', () => {
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
