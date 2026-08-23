import {defineAnthaMod, type AnthaEngine} from '@antha/engine';
import {ensureErrorAndPrependMessage, getObjectTypedEntries} from '@augment-vir/common';
import {type LocalDbClient} from 'local-db-client';
import {enumShape, nullableShape, partialShape} from 'object-shape-tester';
import {createGameModifiers, limitGameRulesToPool} from '../data/game-rule.js';
import {type AsteroidsGameEngineState, type AsteroidsSaveState} from '../data/game-state.js';
import {defaultJoystickDeadZone} from '../data/joystick-dead-zone.js';
import {allGameRules, getGameRulesUnlockedAtLevel} from '../data/rules.js';

export enum SavedGameStateVersion {
    Initial = 1,
}

const startingPlayerLevel = 1;

const savedGameModifiersShape = partialShape({
    allowPlayerCardinalMovement: true,
    allowPlayerForwardGun: true,
    allowSecondForwardGun: true,
    afterburners: true,
    asteroidCascade: true,
    asteroidDrag: true,
    asteroidKillXp: true,
    asteroidMagnetism: true,
    autoTurret: true,
    controlledDemolition: true,
    cryoRounds: true,
    debrisShower: true,
    experienceCombos: true,
    fasterAsteroidSpawning: true,
    fractalFrenzy: true,
    heavyRounds: true,
    homingRounds: true,
    meteorStorm: true,
    novaRounds: true,
    onlyPlayerOneMenuNavigation: true,
    phaseDrive: true,
    piercingRounds: true,
    precisionScoring: true,
    playerTwoGhostMode: true,
    rapidFire: true,
    reinforcedHull: true,
    ricochetRounds: true,
    salvageRights: true,
    stardustDividend: true,
    strongerAsteroids: true,
    timedXp: true,
    triadCannons: true,
    twoPlayers: true,
    velocityVolley: true,
    wideShots: true,
});

const savedGameStateShape = partialShape({
    activeRuleIds: [''],
    joystickDeadZone: nullableShape(0),
    modifiers: savedGameModifiersShape,
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
    isSavingSaveState: boolean;
    lastSaveFailureAt: number | undefined;
    lastSavedSaveState: AsteroidsSaveState | undefined;
    localDbClient: SaveStateDbClient | undefined;
};

export const autosaveModName = 'autosave';

export function createDefaultAsteroidsSaveState(): AsteroidsSaveState {
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

function getActiveRuleIdsFromModifiers(savedGameState: SavedGameState) {
    return allGameRules
        .filter((rule) => {
            return getObjectTypedEntries(rule.effects).every(
                ([
                    modifierName,
                    modifierValue,
                ]) => {
                    return savedGameState.modifiers?.[modifierName] === modifierValue;
                },
            );
        })
        .map((rule) => {
            return rule.id;
        });
}

export function createGameSaveState(
    savedGameState: SavedGameState | undefined,
): AsteroidsSaveState {
    if (!savedGameState) {
        return createDefaultAsteroidsSaveState();
    }

    const playerLevel = savedGameState.playerLevel ?? startingPlayerLevel;
    const activeRuleIds =
        savedGameState.activeRuleIds || getActiveRuleIdsFromModifiers(savedGameState);

    const unlockedGameRules = allGameRules.filter((rule) => {
        return (
            savedGameState.unlockedGameRuleIds?.includes(rule.id) || rule.unlockLevel <= playerLevel
        );
    });

    const activeRules = limitGameRulesToPool({
        gameRules: unlockedGameRules.filter((rule) => {
            return activeRuleIds.includes(rule.id);
        }),
        maximumRulePool: playerLevel,
    });
    const newGameRules = unlockedGameRules.filter((rule) => {
        return (savedGameState.newGameRuleIds || []).includes(rule.id);
    });

    return {
        activeRules,
        joystickDeadZone: savedGameState.joystickDeadZone ?? defaultJoystickDeadZone,
        modifiers: createGameModifiers(activeRules),
        newGameRules,
        playerLevel,
        playerLevelExperience: savedGameState.playerLevelExperience ?? 0,
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
        return true;
    } catch (error) {
        engine.log.error(ensureErrorAndPrependMessage(error, 'Failed to save game state.'));
        return false;
    }
}

function saveCurrentGameState({
    engine,
    state,
}: Readonly<{
    engine: AnthaEngine;
    state: Partial<
        Pick<
            AutosaveModState & AsteroidsGameEngineState,
            | 'isSavingSaveState'
            | 'lastSaveFailureAt'
            | 'lastSavedSaveState'
            | 'localDbClient'
            | 'saveState'
        >
    >;
}>) {
    const saveState = state.saveState;

    if (
        !state.localDbClient ||
        !saveState ||
        state.isSavingSaveState ||
        state.lastSavedSaveState === saveState ||
        (state.lastSaveFailureAt != undefined && Date.now() - state.lastSaveFailureAt < 2000)
    ) {
        return;
    }

    state.isSavingSaveState = true;
    void persistSaveState({
        engine,
        localDbClient: state.localDbClient,
        saveState,
    }).then((didSave) => {
        state.isSavingSaveState = false;
        state.lastSaveFailureAt = didSave ? undefined : Date.now();
        state.lastSavedSaveState = didSave ? saveState : state.lastSavedSaveState;
    });
}

export const autosaveMod = defineAnthaMod<AsteroidsGameEngineState & AutosaveModState>({
    executeImmediately: true,
    initState: {
        hasFinishedLoadingSaveState: false,
        isSavingSaveState: false,
        lastSaveFailureAt: undefined,
        lastSavedSaveState: undefined,
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

        saveCurrentGameState({
            engine,
            state,
        });

        return undefined;
    },
});
