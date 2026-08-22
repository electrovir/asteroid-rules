import {lucideIcons} from 'vira';
import {type GameRule} from './game-rule.js';

export const playerCardinalMovementRule: GameRule = {
    id: 'cardinal-move',
    ruleTitle: 'Cardinal Movement',
    description: 'The player can move in cardinal directions.',
    effects: {
        allowPlayerCardinalMovement: true,
    },
    icon: lucideIcons.Compass,
};

export const timedXpRule: GameRule = {
    id: 'timed-xp',
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

/**
 * Ideas:
 *
 * - Guns
 * - Points per kill
 * - Dramatically increase points per kill, lose points per shot (discourages missing)
 * - You become the asteroids
 * - More asteroids
 * - Change asteroids to something cute or whatever
 * - Stronger asteroids (make sure xp is earned per health killed)
 * - More weapons at once
 * - Weapon leveling
 * - Dash
 * - Level counts for 100x
 * - Player level determines rule pool
 * - Decrease rule cost
 * - Different ships
 * - Explore beyond the static map
 * - Rules manager (better UI)
 */
