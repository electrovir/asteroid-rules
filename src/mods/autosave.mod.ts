import {defineAnthaMod, type AnthaEngine} from '@antha/engine';
import {ensureErrorAndPrependMessage} from '@augment-vir/common';
import {type LocalDbClient} from 'local-db-client';
import {defineShape, enumShape, nullableShape} from 'object-shape-tester';
import {createGameModifiers, limitGameRulesToPool} from '../data/game-rule.js';
import {type AsteroidsGameEngineState, type AsteroidsSaveState} from '../data/game-state.js';
import {defaultJoystickDeadZone} from '../data/joystick-dead-zone.js';
import {allGameRules, getGameRulesUnlockedAtLevel} from '../data/rules.js';

export enum SavedGameStateVersion {
    Initial = 1,
}

const savedGameStateShape = defineShape({
    activeRuleIds: [''],
    joystickDeadZone: nullableShape(0),
    newGameRuleIds: nullableShape(['']),
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
    const startingPlayerLevel = 1;
    const activeRules = getGameRulesUnlockedAtLevel(0);
    const unlockedGameRules = getGameRulesUnlockedAtLevel(startingPlayerLevel);

    return {
        activeRules,
        joystickDeadZone: defaultJoystickDeadZone,
        modifiers: createGameModifiers(activeRules),
        newGameRules: [],
        playerLevel: startingPlayerLevel,
        playerLevelExperience: 0,
        unlockedGameRules,
    };
}

export function createGameSaveState(
    savedGameState: SavedGameState | undefined,
): AsteroidsSaveState {
    if (!savedGameState) {
        return createDefaultAsteroidsSaveState();
    }

    const unlockedGameRules = allGameRules.filter((rule) => {
        return (
            savedGameState.unlockedGameRuleIds.includes(rule.id) ||
            rule.unlockLevel <= savedGameState.playerLevel
        );
    });

    const activeRules = limitGameRulesToPool({
        gameRules: unlockedGameRules.filter((rule) => {
            return savedGameState.activeRuleIds.includes(rule.id);
        }),
        maximumRulePool: savedGameState.playerLevel,
    });
    const newGameRules = unlockedGameRules.filter((rule) => {
        return (savedGameState.newGameRuleIds || []).includes(rule.id);
    });

    return {
        activeRules,
        joystickDeadZone: savedGameState.joystickDeadZone ?? defaultJoystickDeadZone,
        modifiers: createGameModifiers(activeRules),
        newGameRules,
        playerLevel: savedGameState.playerLevel,
        playerLevelExperience: savedGameState.playerLevelExperience,
        unlockedGameRules,
    };
}

function createSavedGameState({
    activeRules,
    joystickDeadZone,
    newGameRules,
    playerLevel,
    playerLevelExperience,
    unlockedGameRules,
}: AsteroidsSaveState): SavedGameState {
    return {
        activeRuleIds: activeRules.map((rule) => rule.id),
        joystickDeadZone,
        newGameRuleIds: newGameRules.map((rule) => rule.id),
        playerLevel,
        playerLevelExperience,
        unlockedGameRuleIds: unlockedGameRules.map((rule) => rule.id),
        version: SavedGameStateVersion.Initial,
    };
}

async function persistSaveState({
    engine,
    localDbClient,
    saveState,
}: Readonly<{
    engine: AnthaEngine;
    localDbClient: SaveStateDbClient;
    saveState: AsteroidsSaveState;
}>) {
    try {
        await localDbClient.set.saveState(createSavedGameState(saveState));
    } catch (error) {
        engine.log.error(ensureErrorAndPrependMessage(error, 'Failed to save game state.'));
    }
}

export const autosaveMod = defineAnthaMod<AsteroidsGameEngineState & AutosaveModState>({
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
            (state.lastSavedAt == undefined || currentTime - state.lastSavedAt >= 2000)
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
