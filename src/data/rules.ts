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

export const playerTwoMenuNavigationRule: GameRule = {
    cost: 0,
    id: 'player-two-menu-navigation',
    unlockLevel: 5,
    ruleTitle: 'Baby Rule',
    description:
        'Only player one can navigate menus. After dying, player two becomes a ghost that can fly but not fire.',
    effects: {
        onlyPlayerOneMenuNavigation: true,
        playerTwoGhostMode: true,
    },
    icon: lucideIcons.Users,
};

export const fasterAsteroidSpawningRule: GameRule = {
    cost: 2,
    id: 'faster-asteroid-spawning',
    unlockLevel: 6,
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
    unlockLevel: 8,
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
    unlockLevel: 11,
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
    unlockLevel: 14,
    ruleTitle: 'Stronger Asteroids',
    description:
        'Asteroids have more health and grant more experience when Asteroid Kill XP is active.',
    effects: {
        strongerAsteroids: true,
    },
    icon: lucideIcons.Shield,
};

export const secondForwardGunRule: GameRule = {
    cost: 5,
    id: 'second-forward-gun',
    unlockLevel: 17,
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
    unlockLevel: 20,
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
    unlockLevel: 24,
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
    unlockLevel: 28,
    ruleTitle: 'Heavy Rounds',
    description: 'Player bullets deal double damage.',
    effects: {
        heavyRounds: true,
    },
    icon: lucideIcons.Target,
};

export const asteroidCascadeRule: GameRule = {
    cost: 2,
    id: 'asteroid-cascade',
    unlockLevel: 30,
    ruleTitle: 'Asteroid Cascade',
    description: 'Asteroids spawn 50% faster.',
    effects: {
        asteroidCascade: true,
    },
    icon: lucideIcons.Rocket,
};

export const rapidFireRule: GameRule = {
    cost: 6,
    id: 'rapid-fire',
    unlockLevel: 32,
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
    unlockLevel: 36,
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
    unlockLevel: 40,
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
    unlockLevel: 44,
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
    unlockLevel: 48,
    ruleTitle: 'Asteroid Drag',
    description: 'Asteroids move 35% slower.',
    effects: {
        asteroidDrag: true,
    },
    icon: lucideIcons.Compass,
};

export const debrisShowerRule: GameRule = {
    cost: 3,
    id: 'debris-shower',
    unlockLevel: 50,
    ruleTitle: 'Debris Shower',
    description: 'Asteroids spawn 100% faster.',
    effects: {
        debrisShower: true,
    },
    icon: lucideIcons.Rocket,
};

export const controlledDemolitionRule: GameRule = {
    cost: 8,
    id: 'controlled-demolition',
    unlockLevel: 52,
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
    unlockLevel: 56,
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
    unlockLevel: 60,
    ruleTitle: 'Auto Turret',
    description: 'Player guns automatically aim and fire cyan rounds at asteroids.',
    effects: {
        autoTurret: true,
    },
    icon: lucideIcons.Crosshair,
};

export const phaseDriveRule: GameRule = {
    cost: 5,
    id: 'phase-drive',
    unlockLevel: 64,
    ruleTitle: 'Phase Drive',
    description: 'Players wrap around the arena instead of stopping at its edges.',
    effects: {
        phaseDrive: true,
    },
    icon: lucideIcons.Compass,
};

export const triadCannonsRule: GameRule = {
    cost: 5,
    id: 'triad-cannons',
    unlockLevel: 68,
    ruleTitle: 'Triad Cannons',
    description: 'Player ships fire three parallel rounds.',
    effects: {
        triadCannons: true,
    },
    icon: lucideIcons.Swords,
};

export const ricochetRoundsRule: GameRule = {
    cost: 6,
    id: 'ricochet-rounds',
    unlockLevel: 72,
    ruleTitle: 'Ricochet Rounds',
    description: 'Player bullets bounce twice from the arena edges.',
    effects: {
        ricochetRounds: true,
    },
    icon: lucideIcons.Target,
};

export const homingRoundsRule: GameRule = {
    cost: 6,
    id: 'homing-rounds',
    unlockLevel: 76,
    ruleTitle: 'Homing Rounds',
    description: 'Player bullets curve toward the nearest asteroid.',
    effects: {
        homingRounds: true,
    },
    icon: lucideIcons.Crosshair,
};

export const meteorStormRule: GameRule = {
    cost: 4,
    id: 'meteor-storm',
    unlockLevel: 78,
    ruleTitle: 'Meteor Storm',
    description: 'Asteroids spawn 150% faster.',
    effects: {
        meteorStorm: true,
    },
    icon: lucideIcons.Rocket,
};

export const novaRoundsRule: GameRule = {
    cost: 7,
    id: 'nova-rounds',
    unlockLevel: 80,
    ruleTitle: 'Nova Rounds',
    description: 'Player bullets damage asteroids near their first impact.',
    effects: {
        novaRounds: true,
    },
    icon: lucideIcons.Star,
};

export const cryoRoundsRule: GameRule = {
    cost: 7,
    id: 'cryo-rounds',
    unlockLevel: 84,
    ruleTitle: 'Cryo Rounds',
    description: 'Player bullets freeze hit asteroids for a short time.',
    effects: {
        cryoRounds: true,
    },
    icon: lucideIcons.Clock,
};

export const velocityVolleyRule: GameRule = {
    cost: 7,
    id: 'velocity-volley',
    unlockLevel: 88,
    ruleTitle: 'Velocity Volley',
    description: 'Player bullets travel 75% faster.',
    effects: {
        velocityVolley: true,
    },
    icon: lucideIcons.Rocket,
};

export const fractalFrenzyRule: GameRule = {
    cost: 8,
    id: 'fractal-frenzy',
    unlockLevel: 92,
    ruleTitle: 'Fractal Frenzy',
    description: 'Destroyed large asteroids split into three fragments.',
    effects: {
        fractalFrenzy: true,
    },
    icon: lucideIcons.Swords,
};

export const asteroidMagnetismRule: GameRule = {
    cost: 8,
    id: 'asteroid-magnetism',
    unlockLevel: 96,
    ruleTitle: 'Meteor Magnet',
    description: 'Asteroids steadily curve toward the nearest player.',
    effects: {
        asteroidMagnetism: true,
    },
    icon: lucideIcons.Compass,
};

export const stardustDividendRule: GameRule = {
    cost: 10,
    id: 'stardust-dividend',
    unlockLevel: 100,
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
    playerTwoMenuNavigationRule,
    fasterAsteroidSpawningRule,
    asteroidKillXpRule,
    experienceCombosRule,
    strongerAsteroidsRule,
    secondForwardGunRule,
    precisionScoringRule,
    afterburnersRule,
    heavyRoundsRule,
    asteroidCascadeRule,
    rapidFireRule,
    piercingRoundsRule,
    reinforcedHullRule,
    wideShotsRule,
    asteroidDragRule,
    debrisShowerRule,
    controlledDemolitionRule,
    salvageRightsRule,
    autoTurretRule,
    phaseDriveRule,
    triadCannonsRule,
    ricochetRoundsRule,
    homingRoundsRule,
    meteorStormRule,
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
