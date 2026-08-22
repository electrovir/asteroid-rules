import {defineAsset} from '@antha/asset';
import {defineAnthaMod, SkipExecution, type AnthaEngine} from '@antha/engine';
import {ensureErrorAndPrependMessage} from '@augment-vir/common';
import {LocalDbClient} from 'local-db-client';
import {defineShape, enumShape} from 'object-shape-tester';
import {createGameModifiers} from '../data/game-rule.js';
import {type AsteroidsEngineState, type AsteroidsSaveState} from '../data/game-state.js';
import {allGameRules, initialGameRules} from '../data/rules.js';
import {PlayerEntity} from '../entities/player.entity.js';

export enum SavedGameStateVersion {
    Initial = 1,
}

const savedGameStateShape = defineShape({
    activeRuleIds: [''],
    playerLevel: 0,
    playerLevelExperience: 0,
    unlockedGameRuleIds: [''],
    version: enumShape(SavedGameStateVersion),
});

type SavedGameState = typeof savedGameStateShape.runtimeType;

const saveStateDbShapes = {
    saveState: {
        shape: savedGameStateShape,
    },
};

type SaveStateDbClient = Pick<LocalDbClient<typeof saveStateDbShapes>, 'set'>;

type LoadedGameSaveState = {
    loadError: Error | undefined;
    localDbClient: SaveStateDbClient | undefined;
    saveState: AsteroidsSaveState;
};

export type SaveStateModState = {
    hasFinishedLoadingSaveState: boolean;
    hasStartedLoadingSaveState: boolean;
    lastSavedAt: number | undefined;
    localDbClient: SaveStateDbClient | undefined;
};

export const saveStateModName = 'save-state';

function createDefaultAsteroidsSaveState(): AsteroidsSaveState {
    return {
        activeRules: [],
        modifiers: createGameModifiers([]),
        playerLevel: 0,
        playerLevelExperience: 0,
        unlockedGameRules: initialGameRules,
    };
}

export function createAsteroidsSaveState(
    savedGameState: SavedGameState | undefined,
): AsteroidsSaveState {
    if (!savedGameState) {
        return createDefaultAsteroidsSaveState();
    }

    const unlockedGameRules = allGameRules.filter((rule) => {
        return savedGameState.unlockedGameRuleIds.includes(rule.id);
    });

    const activeRules = unlockedGameRules.filter((rule) => {
        return savedGameState.activeRuleIds.includes(rule.id);
    });

    return {
        activeRules,
        modifiers: createGameModifiers(activeRules),
        playerLevel: savedGameState.playerLevel,
        playerLevelExperience: savedGameState.playerLevelExperience,
        unlockedGameRules,
    };
}

function createSavedGameState({
    activeRules,
    playerLevel,
    playerLevelExperience,
    unlockedGameRules,
}: AsteroidsSaveState): SavedGameState {
    return {
        activeRuleIds: activeRules.map((rule) => rule.id),
        playerLevel,
        playerLevelExperience,
        unlockedGameRuleIds: unlockedGameRules.map((rule) => rule.id),
        version: SavedGameStateVersion.Initial,
    };
}

const gameSaveStateAsset = defineAsset<LoadedGameSaveState>({
    name: 'Game save state',
    maxProgress: 1,
    async load({incrementProgressCallback}) {
        try {
            const localDbClient = await LocalDbClient.createClient(saveStateDbShapes, {
                storeName: 'asteroid-rules',
            });

            incrementProgressCallback();

            return {
                value: {
                    loadError: undefined,
                    localDbClient,
                    saveState: createAsteroidsSaveState(localDbClient.value.saveState),
                },
            };
        } catch (error) {
            incrementProgressCallback();

            return {
                value: {
                    loadError: ensureErrorAndPrependMessage(
                        error,
                        'Failed to load game save state.',
                    ),
                    localDbClient: undefined,
                    saveState: createDefaultAsteroidsSaveState(),
                },
            };
        }
    },
});

function persistSaveState({
    engine,
    localDbClient,
    saveState,
}: Readonly<{
    engine: AnthaEngine;
    localDbClient: SaveStateDbClient;
    saveState: AsteroidsSaveState;
}>) {
    return localDbClient.set.saveState(createSavedGameState(saveState)).catch((error: unknown) => {
        engine.log.error(ensureErrorAndPrependMessage(error, 'Failed to save game state.'));
    });
}

export const saveStateMod = defineAnthaMod<AsteroidsEngineState & SaveStateModState>({
    executeImmediately: true,
    initState: {
        hasFinishedLoadingSaveState: false,
        hasStartedLoadingSaveState: false,
        lastSavedAt: undefined,
        localDbClient: undefined,
    },
    modName: saveStateModName,
    async cleanup({engine, state}) {
        if (state.localDbClient && state.saveState) {
            await persistSaveState({
                engine,
                localDbClient: state.localDbClient,
                saveState: state.saveState,
            });
        }
    },
    execute({engine, state}) {
        const assetLoader = state.assetLoader;

        if (!state.hasStartedLoadingSaveState && assetLoader) {
            if (!state.entityStore) {
                return SkipExecution;
            }

            state.hasStartedLoadingSaveState = true;
            void state.entityStore
                .loadEntityAssets({
                    entities: [
                        PlayerEntity,
                    ],
                    otherAssets: [
                        gameSaveStateAsset,
                    ],
                })
                .then(async () => {
                    const loadedSaveState = await assetLoader.loadIndividualAsset({
                        asset: gameSaveStateAsset,
                    });

                    if (loadedSaveState.loadError) {
                        engine.log.error(loadedSaveState.loadError);
                    }

                    state.localDbClient = loadedSaveState.localDbClient;
                    state.saveState = loadedSaveState.saveState;
                    state.hasFinishedLoadingSaveState = true;
                })
                .catch((error: unknown) => {
                    state.hasFinishedLoadingSaveState = true;
                    state.saveState = createDefaultAsteroidsSaveState();
                    engine.log.error(
                        ensureErrorAndPrependMessage(error, 'Failed to load game save state.'),
                    );
                });
        }

        if (state.hasFinishedLoadingSaveState && !state.saveState) {
            state.saveState = createDefaultAsteroidsSaveState();
        }

        const currentTime = Date.now();

        if (
            state.localDbClient &&
            state.saveState &&
            (state.lastSavedAt == undefined || currentTime - state.lastSavedAt >= 5000)
        ) {
            state.lastSavedAt = currentTime;
            void persistSaveState({
                engine,
                localDbClient: state.localDbClient,
                saveState: state.saveState,
            });
        }

        return undefined;
    },
});
