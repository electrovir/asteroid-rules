import {createSaveGameSuite} from '@antha/asset';
import {filterToAllowedActions, playersBindingAssignmentsShape} from '@antha/input';
import {getEnumValues, getObjectTypedEntries} from '@augment-vir/common';
import {enumShape, nullableShape, partialShape} from 'object-shape-tester';
import {createDefaultPlayerInputBindings} from './default-bindings.js';
import {defaultGameAudioVolume} from './game-audio.js';
import {createGameModifiers, limitGameRulesToPool} from './game-rule.js';
import {type AsteroidsSaveState} from './game-state.js';
import {defaultJoystickDeadZone} from './joystick-dead-zone.js';
import {GameInputAction} from './player-action.js';
import {allGameRules, getGameRulesUnlockedAtLevel} from './rules.js';

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
    asteroidArmada: true,
    asteroidOnslaught: true,
    autoTurret: true,
    controlledDemolition: true,
    cryoRounds: true,
    debrisShower: true,
    escalatingAsteroidSpawning: true,
    experienceCombos: true,
    fasterAsteroidSpawning: true,
    fortifiedAsteroids: true,
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
    titanAsteroids: true,
    triadCannons: true,
    twoPlayers: true,
    velocityVolley: true,
    wideShots: true,
});

const savedGameStateShape = partialShape({
    activeRuleIds: [''],
    audioVolume: nullableShape(0),
    bindingAssignments: playersBindingAssignmentsShape,
    joystickDeadZone: nullableShape(0),
    modifiers: savedGameModifiersShape,
    newGameRuleIds: nullableShape(['']),
    playerLevel: 0,
    playerLevelExperience: 0,
    unlockedGameRuleIds: [''],
    version: enumShape(SavedGameStateVersion),
});

type SavedGameState = typeof savedGameStateShape.runtimeType;

export function createDefaultAsteroidsSaveState(): AsteroidsSaveState {
    const activeRules = getGameRulesUnlockedAtLevel(0);
    const unlockedGameRules = getGameRulesUnlockedAtLevel(startingPlayerLevel);

    return {
        activeRules,
        audioVolume: defaultGameAudioVolume,
        bindingAssignments: createDefaultPlayerInputBindings(),
        joystickDeadZone: defaultJoystickDeadZone,
        modifiers: createGameModifiers(activeRules),
        newGameRules: [],
        playerLevel: startingPlayerLevel,
        playerLevelExperience: 0,
        unlockedGameRules,
    };
}

function createSavedBindingAssignments(
    savedBindingAssignments: typeof playersBindingAssignmentsShape.runtimeType | undefined,
) {
    if (!savedBindingAssignments) {
        return createDefaultPlayerInputBindings();
    }

    return filterToAllowedActions({
        allowedBindingNames: getEnumValues(GameInputAction),
        bindingAssignments: savedBindingAssignments,
    });
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
        audioVolume: savedGameState.audioVolume ?? defaultGameAudioVolume,
        bindingAssignments: createSavedBindingAssignments(savedGameState.bindingAssignments),
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
    audioVolume,
    bindingAssignments,
    joystickDeadZone,
    newGameRules,
    playerLevel,
    playerLevelExperience,
    unlockedGameRules,
}: AsteroidsSaveState): SavedGameState {
    return {
        activeRuleIds: activeRules.map((rule) => rule.id),
        audioVolume,
        bindingAssignments,
        joystickDeadZone,
        newGameRuleIds: newGameRules.map((rule) => rule.id),
        playerLevel,
        playerLevelExperience,
        unlockedGameRuleIds: unlockedGameRules.map((rule) => rule.id),
        version: SavedGameStateVersion.Initial,
    };
}

export const saveDataSuite = createSaveGameSuite({
    fallbackState: createDefaultAsteroidsSaveState,
    deserialize: createGameSaveState,
    serialize: createSavedGameState,
    storedSaveStateShape: savedGameStateShape,
});
