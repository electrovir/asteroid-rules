import {type GameModifiers} from './modifiers.js';

export const asteroidSpawnIntervalMilliseconds = 1500;
export const fasterAsteroidSpawnIntervalMilliseconds = 400;
export const baseAsteroidHealth = 1;
export const strongerAsteroidHealth = 5;
export const minimumAsteroidRadius = 18;
export const comboDurationMilliseconds = 10_000;
export const comboExperienceMultiplierIncrease = 0.25;
export const precisionShotExperienceCost = 1;

export function calculateAsteroidKillExperience({
    health,
    modifiers,
}: Readonly<{
    health: number;
    modifiers: Readonly<GameModifiers>;
}>) {
    const experiencePerHealth = modifiers.precisionScoring ? 10 : modifiers.asteroidKillXp ? 1 : 0;

    return health * experiencePerHealth;
}

export function calculateExperienceMultiplier({
    currentTime,
    missionStartedAt,
    modifiers,
}: Readonly<{
    currentTime: number;
    missionStartedAt: number;
    modifiers: Readonly<GameModifiers>;
}>) {
    return modifiers.experienceCombos
        ? 1 +
              Math.floor(Math.max(0, currentTime - missionStartedAt) / comboDurationMilliseconds) *
                  comboExperienceMultiplierIncrease
        : 1;
}

export function getAsteroidHealth(modifiers: Readonly<GameModifiers>) {
    return modifiers.strongerAsteroids ? strongerAsteroidHealth : baseAsteroidHealth;
}

export function getAsteroidFragmentRadius(asteroidRadius: number) {
    return Math.max(minimumAsteroidRadius, Math.floor(asteroidRadius / 2));
}

export function getAsteroidSpawnInterval(modifiers: Readonly<GameModifiers>) {
    return modifiers.fasterAsteroidSpawning
        ? fasterAsteroidSpawnIntervalMilliseconds
        : asteroidSpawnIntervalMilliseconds;
}

export function getPlayerGunCount(modifiers: Readonly<GameModifiers>) {
    return modifiers.allowPlayerForwardGun ? (modifiers.allowSecondForwardGun ? 2 : 1) : 0;
}

export function getShotExperienceCost(modifiers: Readonly<GameModifiers>) {
    return modifiers.precisionScoring ? precisionShotExperienceCost : 0;
}
