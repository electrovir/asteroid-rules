import {type AnthaEntity2dModState} from '@antha/entity-2d';
import {type AnthaInputBindingsModState, type MenuNavModState} from '@antha/input';
import {type Values} from '@augment-vir/common';
import {type PlayerEntity} from '../entities/player.entity.js';
import {type GameRule} from './game-rule.js';
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

export type AsteroidsGameState = {
    menuState: {
        onMainMenu: boolean;
        isPaused: boolean;
    };
    router: FrontendRouter;
    saveState: {
        activeRules: GameRule[];
        unlockedGameRules: GameRule[];
    };
    missionState:
        | {
              players: Partial<Record<PlayerPosition, PlayerEntity>>;
              modifiers: GameModifiers;
          }
        | undefined;
} & AnthaInputBindingsModState<GameInputAction> &
    MenuNavModState;

export type AsteroidsEngineState = AnthaEntity2dModState<AsteroidsGameState>;
