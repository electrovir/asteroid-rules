import {AnthaEngine} from '@antha/engine';
import {MenuNavBinding, type ActiveBinding} from '@antha/input';
import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {type AsteroidsEngineState} from '../data/game-state.js';
import {pauseMenuMod} from './pause-menu.mod.js';

function createActiveBinding(): ActiveBinding {
    return {
        actCount: 0,
        holdDuration: {
            milliseconds: 0,
        },
        lastActDuration: {
            milliseconds: 0,
        },
        value: 1,
    };
}

describe(pauseMenuMod.modName, () => {
    it('opens the pause menu from the open pause menu action', async () => {
        const openPauseMenuBinding = createActiveBinding();
        const engine = new AnthaEngine<AsteroidsEngineState>({
            initState: {
                activeBindings: {
                    '1': {
                        [MenuNavBinding.OpenPauseMenu]: openPauseMenuBinding,
                    },
                },
                missionState: {
                    modifiers: {},
                    players: {},
                },
            },
            mods: [
                pauseMenuMod,
            ],
        });

        await engine.runSingleTick();

        assert.deepEquals(
            {
                actCount: openPauseMenuBinding.actCount,
                isInMenu: engine.state.isInMenu,
                menuState: engine.state.menuState,
            },
            {
                actCount: 1,
                isInMenu: true,
                menuState: {
                    isPaused: true,
                    onMainMenu: false,
                },
            },
        );
    });

    it('does not open the pause menu from menu exit', async () => {
        const exitBinding = createActiveBinding();
        const engine = new AnthaEngine<AsteroidsEngineState>({
            initState: {
                activeBindings: {
                    '1': {
                        [MenuNavBinding.MenuExit]: exitBinding,
                    },
                },
            },
            mods: [
                pauseMenuMod,
            ],
        });

        await engine.runSingleTick();

        assert.deepEquals(
            {
                actCount: exitBinding.actCount,
                isInMenu: engine.state.isInMenu,
                menuState: engine.state.menuState,
            },
            {
                actCount: 0,
                isInMenu: false,
                menuState: undefined,
            },
        );
    });
});
