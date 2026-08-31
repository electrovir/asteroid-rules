import {type AnthaAssetModState} from '@antha/asset';
import {type AnthaAudioState} from '@antha/audio';
import {type AnthaEntity2dModState} from '@antha/entity-2d';
import {type AnthaVirtualViewportModState, type VirtualViewportSize} from '@antha/graphics-2d';
import {
    type AnthaInputBindingsModState,
    type AnthaReadRawInputModState,
    type InputDeviceHandler,
    type MenuNavModState,
    type PlayersBindingAssignments,
} from '@antha/input';
import {check} from '@augment-vir/assert';
import {
    mapObject,
    type PartialWithUndefined,
    type RequireOneOrNone,
    type SeededRandom,
    type Values,
} from '@augment-vir/common';
import {type PlayerEntity} from '../entities/player.entity.js';
import {createGameModifiers, type GameRule} from './game-rule.js';
import {type GameModifiers} from './modifiers.js';
import {type GameInputAction} from './player-action.js';
import {type FrontendRouter} from './routing/frontend-router.js';

export const PlayerPosition = {
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
} as const;
export type PlayerPosition = Values<typeof PlayerPosition>;

export type AsteroidsSaveState = {
    activeRules: GameRule[];
    audioVolume: number;
    bindingAssignments: PlayersBindingAssignments<GameInputAction>;
    joystickDeadZone: number;
    modifiers: GameModifiers;
    newGameRules: GameRule[];
    unlockedGameRules: GameRule[];
    playerLevel: number;
    playerLevelExperience: number;
};

export function checkIfMainMenuAllowed({
    saveState,
}: Readonly<{
    saveState: AsteroidsSaveState | undefined;
}>) {
    return saveState?.unlockedGameRules.length !== 1;
}

export type GameMenuState = PartialWithUndefined<{
    youDied: true;
    ruleDebug: true;
    ruleUnlock: true;
    pause: true;
    mainMenu: true;
}>;

export function updateMenuState(
    gameState: Partial<FullGameState>,
    newMenuState: RequireOneOrNone<GameMenuState> | undefined,
) {
    const nextMenuState = mapObject<GameMenuState, keyof GameMenuState, true>(
        newMenuState || {},
        (menuName, isMenuOpen) => {
            if (isMenuOpen) {
                return {
                    key: menuName,
                    value: true as const,
                };
            } else {
                return undefined;
            }
        },
    );

    gameState.menuState = check.isEmpty(nextMenuState) ? undefined : nextMenuState;
}

export function updateAsteroidsSaveStateRules({
    activeRules,
    saveState,
}: Readonly<{
    activeRules: GameRule[];
    saveState: AsteroidsSaveState;
}>) {
    return {
        ...saveState,
        activeRules,
        modifiers: createGameModifiers(activeRules),
    };
}

export type FullGameState = {
    menuState: GameMenuState | undefined;
    router: FrontendRouter;
    saveState: AsteroidsSaveState | undefined;
    missionState:
        | {
              experienceEarned: number;
              lastAsteroidSpawnedAt: number;
              lastTimedExperienceEarnedAt: number;
              missionStartedAt: number;
              levelUpAnimation:
                  | {
                        endsAt: number;
                        playerLevel: number;
                    }
                  | undefined;
              seededRandom: SeededRandom;
              pendingExperienceGained: number;
              pendingExperienceSpent: number;
              players: PartialWithUndefined<Record<PlayerPosition, PlayerEntity>>;
              screenSize: VirtualViewportSize;
          }
        | undefined;
} & AnthaVirtualViewportModState &
    AnthaInputBindingsModState<GameInputAction> &
    AnthaReadRawInputModState &
    AnthaAudioState &
    AnthaAssetModState &
    MenuNavModState & {
        deviceHandler: Pick<InputDeviceHandler, 'globalDeadZone'>;
    };

export function queueMissionExperience({
    experienceGained = 0,
    experienceSpent = 0,
    gameState,
}: Readonly<{
    experienceGained?: number | undefined;
    experienceSpent?: number | undefined;
    gameState: Partial<FullGameState>;
}>) {
    const missionState = gameState.missionState;

    if (!missionState) {
        return;
    }

    gameState.missionState = {
        ...missionState,
        pendingExperienceGained: missionState.pendingExperienceGained + experienceGained,
        pendingExperienceSpent: missionState.pendingExperienceSpent + experienceSpent,
    };
}

export type AsteroidsGameEngineState = AnthaEntity2dModState<FullGameState>;
