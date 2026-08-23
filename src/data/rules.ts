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

export const afterburnersRule: GameRule = {
    cost: 6,
    id: 'afterburners',
    unlockLevel: 11,
    ruleTitle: 'Afterburners',
    description: 'The player moves 50% faster.',
    effects: {
        afterburners: true,
    },
    icon: lucideIcons.Rocket,
};

export const heavyRoundsRule: GameRule = {
    cost: 6,
    id: 'heavy-rounds',
    unlockLevel: 12,
    ruleTitle: 'Heavy Rounds',
    description: 'Player bullets deal double damage.',
    effects: {
        heavyRounds: true,
    },
    icon: lucideIcons.Target,
};

export const rapidFireRule: GameRule = {
    cost: 6,
    id: 'rapid-fire',
    unlockLevel: 13,
    ruleTitle: 'Rapid Fire',
    description: 'Player guns have a 40% shorter firing cooldown.',
    effects: {
        rapidFire: true,
    },
    icon: lucideIcons.Clock,
};

export const piercingRoundsRule: GameRule = {
    cost: 7,
    id: 'piercing-rounds',
    unlockLevel: 14,
    ruleTitle: 'Piercing Rounds',
    description: 'Player bullets can pierce through two additional asteroids.',
    effects: {
        piercingRounds: true,
    },
    icon: lucideIcons.Swords,
};

export const reinforcedHullRule: GameRule = {
    cost: 7,
    id: 'reinforced-hull',
    unlockLevel: 15,
    ruleTitle: 'Reinforced Hull',
    description: 'Each player survives one asteroid collision per life.',
    effects: {
        reinforcedHull: true,
    },
    icon: lucideIcons.Shield,
};

export const wideShotsRule: GameRule = {
    cost: 7,
    id: 'wide-shots',
    unlockLevel: 16,
    ruleTitle: 'Wide Shots',
    description: 'Player bullets are 50% wider.',
    effects: {
        wideShots: true,
    },
    icon: lucideIcons.Crosshair,
};

export const asteroidDragRule: GameRule = {
    cost: 8,
    id: 'asteroid-drag',
    unlockLevel: 17,
    ruleTitle: 'Asteroid Drag',
    description: 'Asteroids move 35% slower.',
    effects: {
        asteroidDrag: true,
    },
    icon: lucideIcons.Compass,
};

export const controlledDemolitionRule: GameRule = {
    cost: 8,
    id: 'controlled-demolition',
    unlockLevel: 18,
    ruleTitle: 'Controlled Demolition',
    description: 'Destroyed large asteroids split into one fragment instead of two.',
    effects: {
        controlledDemolition: true,
    },
    icon: lucideIcons.Swords,
};

export const salvageRightsRule: GameRule = {
    cost: 8,
    id: 'salvage-rights',
    unlockLevel: 19,
    ruleTitle: 'Salvage Rights',
    description: 'Destroying asteroids grants 2 experience per health.',
    effects: {
        salvageRights: true,
    },
    icon: lucideIcons.Star,
};

export const autoTurretRule: GameRule = {
    cost: 10,
    id: 'auto-turret',
    unlockLevel: 20,
    ruleTitle: 'Auto Turret',
    description: 'Player guns automatically aim and fire cyan rounds at asteroids.',
    effects: {
        autoTurret: true,
    },
    icon: lucideIcons.Crosshair,
};

export const phaseDriveRule: GameRule = {
    cost: 10,
    id: 'phase-drive',
    unlockLevel: 21,
    ruleTitle: 'Phase Drive',
    description: 'Players wrap around the arena instead of stopping at its edges.',
    effects: {
        phaseDrive: true,
    },
    icon: lucideIcons.Compass,
};

export const triadCannonsRule: GameRule = {
    cost: 10,
    id: 'triad-cannons',
    unlockLevel: 22,
    ruleTitle: 'Triad Cannons',
    description: 'Player ships fire three parallel rounds.',
    effects: {
        triadCannons: true,
    },
    icon: lucideIcons.Swords,
};

export const ricochetRoundsRule: GameRule = {
    cost: 11,
    id: 'ricochet-rounds',
    unlockLevel: 23,
    ruleTitle: 'Ricochet Rounds',
    description: 'Player bullets bounce twice from the arena edges.',
    effects: {
        ricochetRounds: true,
    },
    icon: lucideIcons.Target,
};

export const homingRoundsRule: GameRule = {
    cost: 11,
    id: 'homing-rounds',
    unlockLevel: 24,
    ruleTitle: 'Homing Rounds',
    description: 'Player bullets curve toward the nearest asteroid.',
    effects: {
        homingRounds: true,
    },
    icon: lucideIcons.Crosshair,
};

export const novaRoundsRule: GameRule = {
    cost: 12,
    id: 'nova-rounds',
    unlockLevel: 25,
    ruleTitle: 'Nova Rounds',
    description: 'Player bullets damage asteroids near their first impact.',
    effects: {
        novaRounds: true,
    },
    icon: lucideIcons.Star,
};

export const cryoRoundsRule: GameRule = {
    cost: 12,
    id: 'cryo-rounds',
    unlockLevel: 26,
    ruleTitle: 'Cryo Rounds',
    description: 'Player bullets freeze hit asteroids for a short time.',
    effects: {
        cryoRounds: true,
    },
    icon: lucideIcons.Clock,
};

export const velocityVolleyRule: GameRule = {
    cost: 12,
    id: 'velocity-volley',
    unlockLevel: 27,
    ruleTitle: 'Velocity Volley',
    description: 'Player bullets travel 75% faster.',
    effects: {
        velocityVolley: true,
    },
    icon: lucideIcons.Rocket,
};

export const fractalFrenzyRule: GameRule = {
    cost: 13,
    id: 'fractal-frenzy',
    unlockLevel: 28,
    ruleTitle: 'Fractal Frenzy',
    description: 'Destroyed large asteroids split into three fragments.',
    effects: {
        fractalFrenzy: true,
    },
    icon: lucideIcons.Swords,
};

export const asteroidMagnetismRule: GameRule = {
    cost: 13,
    id: 'asteroid-magnetism',
    unlockLevel: 29,
    ruleTitle: 'Meteor Magnet',
    description: 'Asteroids steadily curve toward the nearest player.',
    effects: {
        asteroidMagnetism: true,
    },
    icon: lucideIcons.Compass,
};

export const stardustDividendRule: GameRule = {
    cost: 15,
    id: 'stardust-dividend',
    unlockLevel: 30,
    ruleTitle: 'Stardust Dividend',
    description: 'Timed experience gains are tripled.',
    effects: {
        stardustDividend: true,
    },
    icon: lucideIcons.Star,
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
    afterburnersRule,
    heavyRoundsRule,
    rapidFireRule,
    piercingRoundsRule,
    reinforcedHullRule,
    wideShotsRule,
    asteroidDragRule,
    controlledDemolitionRule,
    salvageRightsRule,
    autoTurretRule,
    phaseDriveRule,
    triadCannonsRule,
    ricochetRoundsRule,
    homingRoundsRule,
    novaRoundsRule,
    cryoRoundsRule,
    velocityVolleyRule,
    fractalFrenzyRule,
    asteroidMagnetismRule,
    stardustDividendRule,
];

export function getGameRulesUnlockedAtLevel(level: number) {
    return allGameRules.filter((rule) => {
        return rule.unlockLevel <= level;
    });
}
