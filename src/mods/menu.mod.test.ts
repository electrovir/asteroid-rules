import {AnthaEngine} from '@antha/engine';
import {MenuNavBinding} from '@antha/input';
import {assert, assertWrap} from '@augment-vir/assert';
import {SeededRandom} from '@augment-vir/common';
import {describe, it} from '@augment-vir/test';
import {type AsteroidsGameEngineState} from '../data/game-state.js';
import {PlayerAction} from '../data/player-action.js';
import {createDefaultAsteroidsSaveState} from '../mods/autosave.mod.js';
import {menuMod} from './menu.mod.js';

function createOpenPauseMenuBindings() {
    return {
        1: {
            [MenuNavBinding.OpenPauseMenu]: {
                actCount: 0,
                holdDuration: {
                    milliseconds: 0,
                },
                lastActDuration: {
                    milliseconds: 0,
                },
                value: 1,
            },
        },
        2: {},
        3: {},
        4: {},
    } satisfies AsteroidsGameEngineState['activeBindings'];
}

describe(menuMod.modName, () => {
    it('toggles the pause menu when the pause action is triggered again', async () => {
        const engine = new AnthaEngine<AsteroidsGameEngineState>({
            initState: {
                activeBindings: createOpenPauseMenuBindings(),
                missionState: {
                    experienceEarned: 0,
                    lastAsteroidSpawnedAt: 0,
                    lastTimedExperienceEarnedAt: 0,
                    levelUpAnimation: undefined,
                    missionStartedAt: 0,
                    pendingExperienceGained: 0,
                    pendingExperienceSpent: 0,
                    players: {},
                    seededRandom: SeededRandom.fromSeed('menu-mod-test'),
                },
            },
            mods: [
                menuMod,
            ],
        });

        await engine.runSingleTick();

        assert.deepEquals(engine.state.menuState, {
            pause: true,
        });

        engine.state.activeBindings = createOpenPauseMenuBindings();

        await engine.runSingleTick();

        assert.isUndefined(engine.state.menuState);
        assert.isFalse(engine.state.isInMenu ?? true);
    });

    it('prevents player two from navigating menus while preserving player two actions', async () => {
        const engine = new AnthaEngine<AsteroidsGameEngineState>({
            initState: {
                activeBindings: {
                    1: {},
                    2: {
                        [MenuNavBinding.OpenPauseMenu]: {
                            actCount: 0,
                            holdDuration: {
                                milliseconds: 0,
                            },
                            lastActDuration: {
                                milliseconds: 0,
                            },
                            value: 1,
                        },
                        [PlayerAction.Fire]: {
                            actCount: 0,
                            holdDuration: {
                                milliseconds: 0,
                            },
                            lastActDuration: {
                                milliseconds: 0,
                            },
                            value: 1,
                        },
                        [PlayerAction.MoveUp]: {
                            actCount: 0,
                            holdDuration: {
                                milliseconds: 0,
                            },
                            lastActDuration: {
                                milliseconds: 0,
                            },
                            value: 1,
                        },
                    },
                    3: {},
                    4: {},
                },
                saveState: {
                    ...createDefaultAsteroidsSaveState(),
                    modifiers: {
                        onlyPlayerOneMenuNavigation: true,
                    },
                },
            },
            mods: [
                menuMod,
            ],
        });

        await engine.runSingleTick();

        assert.isUndefined(engine.state.menuState);
        assert.isUndefined(
            assertWrap.isDefined(assertWrap.isDefined(engine.state.activeBindings)['2'])[
                MenuNavBinding.OpenPauseMenu
            ],
        );
        assert.isDefined(
            assertWrap.isDefined(assertWrap.isDefined(engine.state.activeBindings)['2'])[
                PlayerAction.Fire
            ],
        );
        assert.isDefined(
            assertWrap.isDefined(assertWrap.isDefined(engine.state.activeBindings)['2'])[
                PlayerAction.MoveUp
            ],
        );
    });
});
