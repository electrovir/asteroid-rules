import {lucideIcons} from 'vira';
import {type GameRule} from './game-rule.js';

export const playerCardinalMovementRule: GameRule = {
    id: 'cardinal-move',
    unlockLevel: 1,
    ruleTitle: 'Cardinal Movement',
    description: 'The player can move in cardinal directions.',
    effects: {
        allowPlayerCardinalMovement: true,
    },
    icon: lucideIcons.Compass,
};

export const timedXpRule: GameRule = {
    id: 'timed-xp',
    unlockLevel: 0,
    ruleTitle: 'Earn XP Over Time',
    description: 'The player earns experience over time.',
    effects: {
        timedXp: true,
    },
    icon: lucideIcons.Clock,
};

export const allGameRules: GameRule[] = [
    playerCardinalMovementRule,
    timedXpRule,
];

export function getGameRulesUnlockedAtLevel(level: number) {
    return allGameRules.filter((rule) => {
        return rule.unlockLevel <= level;
    });
}

/**
 * - Player level determines rule pool
 *
 * Ideas:
 *
 * 1. Guns
 * 2. More asteroids
 * 3. Xp from asteroid kills (xp per health)
 * 4. Combos (the longer you last, the more xp you get, per time, per kill, etc.)
 * 5. Stronger asteroids
 * 6. Another gun (both firing forwards)
 * 7. Dramatically increase points per kill, lose points per shot (discourages missing)
 */
