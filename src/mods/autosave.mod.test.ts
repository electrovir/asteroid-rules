import {AnthaEngine} from '@antha/engine';
import {assert, assertWrap} from '@augment-vir/assert';
import {randomString, selectFrom, wait} from '@augment-vir/common';
import {describe, it} from '@augment-vir/test';
import {LocalDbClient} from 'local-db-client';
import {checkValidShape, checkWrapValidShape} from 'object-shape-tester';
import {defaultGameAudioVolume} from '../data/game-audio.js';
import {checkIfMainMenuAllowed, type AsteroidsGameEngineState} from '../data/game-state.js';
import {
    autosaveMod,
    createGameSaveState,
    SavedGameStateVersion,
    saveStateDbShapes,
    type AutosaveModState,
    type SaveStateDbClient,
} from './autosave.mod.js';

function createSavedGameState() {
    return {
        activeRuleIds: [],
        newGameRuleIds: [],
        playerLevel: 1,
        playerLevelExperience: 0,
        unlockedGameRuleIds: [],
        version: SavedGameStateVersion.Initial,
    } satisfies NonNullable<Parameters<typeof createGameSaveState>[0]>;
}

describe('saved joystick dead zone', () => {
    it('loads the saved value', () => {
        const savedGameState = {
            ...createSavedGameState(),
            joystickDeadZone: 0.3,
        };

        assert.isTrue(checkValidShape(savedGameState, saveStateDbShapes.saveState.shape));
        assert.strictEquals(createGameSaveState(savedGameState).joystickDeadZone, 0.3);
    });

    it('defaults missing values from legacy saves to 25 percent', () => {
        assert.strictEquals(createGameSaveState(createSavedGameState()).joystickDeadZone, 0.25);
    });

    it('preserves a save in a fresh database client', async () => {
        const storeName = `asteroid-rules-test-${randomString(32)}`;
        const localDbClient = await LocalDbClient.createClient(saveStateDbShapes, {
            storeName,
        });

        await localDbClient.set.saveState({
            ...createSavedGameState(),
            playerLevel: 10,
            playerLevelExperience: 42,
        });

        const reloadedLocalDbClient = await LocalDbClient.createClient(saveStateDbShapes, {
            storeName,
        });

        assert.deepEquals(
            selectFrom(createGameSaveState(reloadedLocalDbClient.value.saveState), {
                playerLevel: true,
                playerLevelExperience: true,
            }),
            {
                playerLevel: 10,
                playerLevelExperience: 42,
            },
        );
    });
});

describe('saved audio volume', () => {
    it('loads the saved value', () => {
        const savedGameState = {
            ...createSavedGameState(),
            audioVolume: 0.6,
        };

        assert.isTrue(checkValidShape(savedGameState, saveStateDbShapes.saveState.shape));
        assert.strictEquals(createGameSaveState(savedGameState).audioVolume, 0.6);
    });

    it('defaults missing values from legacy saves to 80 percent', () => {
        assert.strictEquals(
            createGameSaveState(createSavedGameState()).audioVolume,
            defaultGameAudioVolume,
        );
    });
});

describe('default save state', () => {
    it('keeps the main menu hidden until a second rule unlocks', () => {
        assert.isFalse(
            checkIfMainMenuAllowed({
                saveState: createGameSaveState(undefined),
            }),
        );
    });
});

describe(createGameSaveState.name, () => {
    it('loads a partial legacy modifier record without losing level progress', () => {
        const savedGameState = {
            modifiers: {
                allowPlayerCardinalMovement: true,
                removedModifier: true,
            },
            playerLevel: 10,
            playerLevelExperience: 42,
        };
        const validatedSaveState = assertWrap.isDefined(
            checkWrapValidShape(savedGameState, saveStateDbShapes.saveState.shape, {
                allowExtraKeys: true,
            }),
        );

        assert.deepEquals(
            selectFrom(createGameSaveState(validatedSaveState), {
                playerLevel: true,
                playerLevelExperience: true,
                modifiers: true,
            }),
            {
                modifiers: {
                    allowPlayerCardinalMovement: true,
                },
                playerLevel: 10,
                playerLevelExperience: 42,
            },
        );
    });
});

describe(autosaveMod.modName, () => {
    it('persists each changed save state without waiting for the periodic autosave interval', async () => {
        const savedGameStates: Parameters<SaveStateDbClient['set']['saveState']>[0][] = [];
        const localDbClient = {
            set: {
                saveState(savedGameState) {
                    savedGameStates.push(savedGameState);
                    return Promise.resolve(savedGameState);
                },
            },
        } satisfies SaveStateDbClient;
        const engine = new AnthaEngine<AsteroidsGameEngineState & AutosaveModState>({
            mods: [
                autosaveMod,
            ],
        });
        await engine.runSingleTick();
        engine.state.hasFinishedLoadingSaveState = true;
        engine.state.localDbClient = localDbClient;
        engine.state.saveState = {
            ...createGameSaveState(undefined),
            playerLevel: 10,
            playerLevelExperience: 42,
        };

        await engine.runSingleTick();
        await wait({
            milliseconds: 1,
        });

        engine.state.saveState = {
            ...assertWrap.isDefined(engine.state.saveState),
            playerLevelExperience: 43,
        };

        await engine.runSingleTick();
        await wait({
            milliseconds: 1,
        });

        assert.deepEquals(
            savedGameStates.map((savedGameState) => {
                return selectFrom(savedGameState, {
                    playerLevel: true,
                    playerLevelExperience: true,
                });
            }),
            [
                {
                    playerLevel: 10,
                    playerLevelExperience: 42,
                },
                {
                    playerLevel: 10,
                    playerLevelExperience: 43,
                },
            ],
        );
    });
});
