import {type AnthaAssetModState} from '@antha/asset';
import {type AnthaEntity2dModState} from '@antha/entity-2d';
import {type AnthaInputBindingsModState, type MenuNavModState} from '@antha/input';
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
    isMouseMovementAllowed: boolean;
    menuState: GameMenuState | undefined;
    router: FrontendRouter;
    saveState: AsteroidsSaveState | undefined;
    missionState:
        | {
              experienceEarned: number;
              lastAsteroidSpawnedAt: number;
              lastTimedExperienceEarnedAt: number;
              levelUpAnimation:
                  | {
                        endsAt: number;
                        playerLevel: number;
                    }
                  | undefined;
              seededRandom: SeededRandom;
              players: Partial<Record<PlayerPosition, PlayerEntity>>;
          }
        | undefined;
} & AnthaInputBindingsModState<GameInputAction> &
    AnthaAssetModState &
    MenuNavModState;

export type AsteroidsGameEngineState = AnthaEntity2dModState<FullGameState>;
