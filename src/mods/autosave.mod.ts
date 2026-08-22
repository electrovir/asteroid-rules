import {defineAnthaMod, type AnthaEngine} from '@antha/engine';
import {ensureErrorAndPrependMessage} from '@augment-vir/common';
import {type LocalDbClient} from 'local-db-client';
import {defineShape, enumShape} from 'object-shape-tester';
import {createGameModifiers} from '../data/game-rule.js';
import {type AsteroidsEngineState, type AsteroidsSaveState} from '../data/game-state.js';
import {allGameRules, initialGameRules} from '../data/rules.js';

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

export const saveStateDbShapes = {
    saveState: {
        shape: savedGameStateShape,
    },
};

export type SaveStateDbClient = Pick<LocalDbClient<typeof saveStateDbShapes>, 'set'>;

export type AutosaveModState = {
    hasFinishedLoadingSaveState: boolean;
    lastSavedAt: number | undefined;
    localDbClient: SaveStateDbClient | undefined;
};

export const autosaveModName = 'autosave';

export function createDefaultAsteroidsSaveState(): AsteroidsSaveState {
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

export const autosaveMod = defineAnthaMod<AsteroidsEngineState & AutosaveModState>({
    executeImmediately: true,
    initState: {
        hasFinishedLoadingSaveState: false,
        lastSavedAt: undefined,
        localDbClient: undefined,
    },
    modName: autosaveModName,
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
