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

export const playerForwardGunRule: GameRule = {
    cost: 3,
    id: 'player-forward-gun',
    unlockLevel: 3,
    ruleTitle: 'Forward Gun',
    description: 'The player fires bullets from the front of their ship.',
    effects: {
        allowPlayerForwardGun: true,
    },
    icon: lucideIcons.Crosshair,
};

export const twoPlayersRule: GameRule = {
    cost: 2,
    id: 'two-players',
    unlockLevel: 4,
    ruleTitle: 'Two Players',
    description: 'Two players can fight asteroids together.',
    effects: {
        twoPlayers: true,
    },
    icon: lucideIcons.Users,
};

export const fasterAsteroidSpawningRule: GameRule = {
    cost: 2,
    id: 'faster-asteroid-spawning',
    unlockLevel: 5,
    ruleTitle: 'Rapid Asteroids',
    description: 'Asteroids spawn faster.',
    effects: {
        fasterAsteroidSpawning: true,
    },
    icon: lucideIcons.Rocket,
};

export const asteroidKillXpRule: GameRule = {
    cost: 2,
    id: 'asteroid-kill-xp',
    unlockLevel: 6,
    ruleTitle: 'Asteroid Kill XP',
    description: 'Destroying an asteroid grants experience based on its health.',
    effects: {
        asteroidKillXp: true,
    },
    icon: lucideIcons.Star,
};

export const experienceCombosRule: GameRule = {
    cost: 5,
    id: 'experience-combos',
    unlockLevel: 7,
    ruleTitle: 'Experience Combos',
    description: 'Experience gains grow the longer the players survive.',
    effects: {
        experienceCombos: true,
    },
    icon: lucideIcons.ChartNoAxesCombined,
};

export const strongerAsteroidsRule: GameRule = {
    cost: 5,
    id: 'stronger-asteroids',
    unlockLevel: 8,
    ruleTitle: 'Stronger Asteroids',
    description: 'Asteroids have more health.',
    effects: {
        strongerAsteroids: true,
    },
    icon: lucideIcons.Shield,
};

export const secondForwardGunRule: GameRule = {
    cost: 5,
    id: 'second-forward-gun',
    unlockLevel: 9,
    ruleTitle: 'Twin Guns',
    description: 'The player fires a second gun forward.',
    effects: {
        allowSecondForwardGun: true,
    },
    icon: lucideIcons.Swords,
};

export const precisionScoringRule: GameRule = {
    cost: 5,
    id: 'precision-scoring',
    unlockLevel: 10,
    ruleTitle: 'Precision Scoring',
    description: 'Asteroid kills are worth far more, but each shot costs experience.',
    effects: {
        precisionScoring: true,
    },
    icon: lucideIcons.Target,
};

export const allGameRules: GameRule[] = [
    playerCardinalMovementRule,
    timedXpRule,
    playerForwardGunRule,
    twoPlayersRule,
    fasterAsteroidSpawningRule,
    asteroidKillXpRule,
    experienceCombosRule,
    strongerAsteroidsRule,
    secondForwardGunRule,
    precisionScoringRule,
];

export function getGameRulesUnlockedAtLevel(level: number) {
    return allGameRules.filter((rule) => {
        return rule.unlockLevel <= level;
    });
}

/**
 * More rule ideas
 *
 * 1. Auto aiming auto firing gun (cyan bullets)
 */
