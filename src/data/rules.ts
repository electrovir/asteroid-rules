import {lucideIcons} from 'vira';
import {type GameRule} from './game-rule.js';

export const playerCardinalMovementRule: GameRule = {
    ruleTitle: 'Cardinal Movement',
    description: 'The player can move in cardinal directions.',
    effects: {
        allowPlayerCardinalMovement: true,
    },
    icon: lucideIcons.Compass,
};

export const allGameRules: GameRule[] = [
    playerCardinalMovementRule,
];
