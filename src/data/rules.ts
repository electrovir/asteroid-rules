import {lucideIcons} from 'vira';
import {type GameRule} from './game-rule.js';

export const playerCardinalMovementRule: GameRule = {
    cost: 1,
    id: 'cardinal-move',
    unlockLevel: 2,
    ruleTitle: 'Cardinal Movement',
    description: 'The player can move in cardinal directions.',
    effects: {
        allowPlayerCardinalMovement: true,
    },
    icon: lucideIcons.Compass,
};

export const timedXpRule: GameRule = {
    cost: 1,
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
 * Ideas:
 *
 * 1. A gun on the front of the ship (shoots bullet entities)
 * 2. 2 player
 * 3. More asteroids (faster spawning)
 * 4. Xp from asteroid kills (xp per health)
 * 5. Combos (the longer you last, the more xp you get, per time, per kill, etc.)
 * 6. Stronger asteroids
 * 7. Another gun (both firing forwards)
 * 8. Dramatically increase points per kill, lose points per shot (discourages missing)
 */
