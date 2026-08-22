import {AnthaEngine} from '@antha/engine';
import {MenuNavBinding} from '@antha/input';
import {assert} from '@augment-vir/assert';
import {SeededRandom} from '@augment-vir/common';
import {describe, it} from '@augment-vir/test';
import {type AsteroidsGameEngineState} from '../data/game-state.js';
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
                    lastAsteroidSpawnedAt: 0,
                    lastTimedExperienceEarnedAt: 0,
                    levelUpAnimation: undefined,
                    pendingRuleUnlocks: [],
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
            isPaused: true,
        });

        engine.state.activeBindings = createOpenPauseMenuBindings();

        await engine.runSingleTick();

        assert.isUndefined(engine.state.menuState);
        assert.isFalse(engine.state.isInMenu ?? true);
    });
});
