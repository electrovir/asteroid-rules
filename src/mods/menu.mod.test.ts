import {AnthaEngine} from '@antha/engine';
import {
    InputDeviceKey,
    InputDeviceType,
    InputDirection,
    MenuNavBinding,
    type RawInput,
} from '@antha/input';
import {assert, assertWrap} from '@augment-vir/assert';
import {SeededRandom} from '@augment-vir/common';
import {describe, it} from '@augment-vir/test';
import {type AsteroidsGameEngineState} from '../data/game-state.js';
import {InputConsumer} from '../data/input-consumer.js';
import {PlayerAction} from '../data/player-action.js';
import {createDefaultAsteroidsSaveState} from '../data/save-data.js';
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
                rawInputs: [
                    createRawInput(),
                ],
                value: 1,
            },
        },
        2: {},
        3: {},
        4: {},
    } satisfies AsteroidsGameEngineState['activeBindings'];
}

function createRawInput(inputName = 'button-Escape'): RawInput {
    return {
        consumedBy: undefined,
        deviceKey: InputDeviceKey.Keyboard,
        deviceName: 'keyboard',
        deviceType: InputDeviceType.Keyboard,
        direction: InputDirection.Positive,
        duration: {
            milliseconds: 0,
        },
        inputName,
        inputValue: 1,
        isIgnoredByConsumer: false,
        mapped: {
            deviceName: 'keyboard',
            gamepadBrand: undefined,
            inputName,
        },
    } satisfies RawInput;
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
                    screenSize: {
                        height: 600,
                        width: 800,
                    },
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
        assert.isTrue(engine.state.disableEntityUpdates);
        assert.deepEquals(
            {
                rawInputConsumer: engine.state.rawInputConsumer,
            },
            {
                rawInputConsumer: InputConsumer.Menu,
            },
        );

        engine.state.activeBindings = createOpenPauseMenuBindings();

        await engine.runSingleTick();

        assert.isUndefined(engine.state.menuState);
        assert.isTrue(engine.state.disableEntityUpdates);
        assert.isFalse(engine.state.isInMenu ?? true);
        assert.strictEquals(engine.state.rawInputConsumer, InputConsumer.Game);

        await engine.runSingleTick();

        assert.isFalse(engine.state.disableEntityUpdates ?? true);
    });

    it('prevents player two from navigating menus without modifying player two bindings', async () => {
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
                            rawInputs: [
                                createRawInput(),
                            ],
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
                            rawInputs: [
                                createRawInput(),
                            ],
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
                            rawInputs: [
                                createRawInput(),
                            ],
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
        assert.deepEquals(engine.state.allowedPlayerMenuNavigation, {
            1: true,
        });
        assert.strictEquals(
            assertWrap.isDefined(assertWrap.isDefined(engine.state.activeBindings)['2'])[
                MenuNavBinding.OpenPauseMenu
            ]?.actCount,
            0,
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
