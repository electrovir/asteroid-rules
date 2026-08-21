import {type Values} from '@augment-vir/common';
import {type PlayerEntity} from '../entities/player.entity.js';

export const PlayerPosition = {
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
} as const;
export type PlayerPosition = Values<typeof PlayerPosition>;

export type AsteroidsGameState = {
    players: Partial<Record<PlayerPosition, PlayerEntity>>;
};
