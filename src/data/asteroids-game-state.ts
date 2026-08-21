import {type AnthaEntity2dModState} from '@antha/entity-2d';
import {type AnthaInputBindingsModState} from '@antha/input';
import {type Values} from '@augment-vir/common';
import {type PlayerEntity} from '../entities/player.entity.js';
import {type GameRule} from './game-rule.js';
import {type GameModifiers} from './modifiers.js';
import {type PlayerInputAction} from './player-input.js';

export const PlayerPosition = {
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
} as const;
export type PlayerPosition = Values<typeof PlayerPosition>;

export type AsteroidsGameState = {
    players: Partial<Record<PlayerPosition, PlayerEntity>>;
    activeRules: GameRule[];
    unlockedGameRules: GameRule[];
    modifiers: GameModifiers;
} & AnthaInputBindingsModState<PlayerInputAction>;

export type AsteroidsEngineState = AnthaEntity2dModState<AsteroidsGameState>;
