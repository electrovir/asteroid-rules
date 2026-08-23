import {type GameModifiers} from './modifiers.js';

export const asteroidSpawnIntervalMilliseconds = 750;
export const fasterAsteroidSpawnIntervalMilliseconds = 200;
const fasterAsteroidSpawnRateMultiplier =
    asteroidSpawnIntervalMilliseconds / fasterAsteroidSpawnIntervalMilliseconds;
const asteroidCascadeSpawnRateIncrease = 0.5;
const debrisShowerSpawnRateIncrease = 1;
const meteorStormSpawnRateIncrease = 1.5;
export const baseAsteroidHealth = 1;
export const strongerAsteroidHealth = 5;
export const baseAsteroidFragmentCount = 2;
export const controlledDemolitionAsteroidFragmentCount = 1;
export const fractalFrenzyAsteroidFragmentCount = 3;
export const minimumAsteroidRadius = 18;
export const comboDurationMilliseconds = 10_000;
export const comboExperienceMultiplierIncrease = 0.25;
export const precisionShotExperienceCost = 1;
export const afterburnerMovementSpeedMultiplier = 1.5;
export const asteroidDragMovementSpeedMultiplier = 0.65;
export const heavyRoundsDamageMultiplier = 2;
export const piercingRoundsPierceCount = 2;
export const rapidFireShotIntervalMultiplier = 0.6;
export const salvageRightsExperiencePerHealth = 2;
export const wideShotsRadiusMultiplier = 1.5;
export const asteroidMagnetAccelerationPixelsPerMillisecondSquared = 0.00002;
export const cryoRoundsSlowDurationMilliseconds = 1500;
export const cryoRoundsAsteroidMovementSpeedMultiplier = 0.25;
export const homingRoundsTurnRateRadiansPerMillisecond = 0.004;
export const novaRoundsSplashDamage = 1;
export const novaRoundsSplashRadiusPixels = 80;
export const ricochetRoundsBounceCount = 2;
export const stardustDividendTimedExperienceMultiplier = 3;
export const velocityVolleySpeedMultiplier = 1.75;

export function calculateAsteroidKillExperience({
    health,
    modifiers,
}: Readonly<{
    health: number;
    modifiers: Readonly<GameModifiers>;
}>) {
    const experiencePerHealth =
        (modifiers.asteroidKillXp ? 1 : 0) +
        (modifiers.precisionScoring ? 10 : 0) +
        (modifiers.salvageRights ? salvageRightsExperiencePerHealth : 0);

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

export function getAsteroidFragmentCount(modifiers: Readonly<GameModifiers>) {
    return modifiers.fractalFrenzy
        ? modifiers.controlledDemolition
            ? baseAsteroidFragmentCount
            : fractalFrenzyAsteroidFragmentCount
        : modifiers.controlledDemolition
          ? controlledDemolitionAsteroidFragmentCount
          : baseAsteroidFragmentCount;
}

export function getAsteroidMagnetAcceleration(modifiers: Readonly<GameModifiers>) {
    return modifiers.asteroidMagnetism ? asteroidMagnetAccelerationPixelsPerMillisecondSquared : 0;
}

export function getAsteroidSlowMovementSpeedMultiplier(slowRemainingMilliseconds: number) {
    return slowRemainingMilliseconds ? cryoRoundsAsteroidMovementSpeedMultiplier : 1;
}

export function getAsteroidSpawnInterval(modifiers: Readonly<GameModifiers>) {
    const spawnRateMultiplier =
        (modifiers.fasterAsteroidSpawning ? fasterAsteroidSpawnRateMultiplier : 1) +
        (modifiers.asteroidCascade ? asteroidCascadeSpawnRateIncrease : 0) +
        (modifiers.debrisShower ? debrisShowerSpawnRateIncrease : 0) +
        (modifiers.meteorStorm ? meteorStormSpawnRateIncrease : 0);

    return asteroidSpawnIntervalMilliseconds / spawnRateMultiplier;
}

export function getAsteroidMovementSpeedMultiplier(modifiers: Readonly<GameModifiers>) {
    return modifiers.asteroidDrag ? asteroidDragMovementSpeedMultiplier : 1;
}

export function getPlayerBulletDamageMultiplier(modifiers: Readonly<GameModifiers>) {
    return modifiers.heavyRounds ? heavyRoundsDamageMultiplier : 1;
}

export function getPlayerBulletBounceCount(modifiers: Readonly<GameModifiers>) {
    return modifiers.ricochetRounds ? ricochetRoundsBounceCount : 0;
}

export function getPlayerBulletHomingTurnRate(modifiers: Readonly<GameModifiers>) {
    return modifiers.homingRounds ? homingRoundsTurnRateRadiansPerMillisecond : 0;
}

export function getPlayerBulletPierceCount(modifiers: Readonly<GameModifiers>) {
    return modifiers.piercingRounds ? piercingRoundsPierceCount : 0;
}

export function getPlayerBulletRadiusMultiplier(modifiers: Readonly<GameModifiers>) {
    return modifiers.wideShots ? wideShotsRadiusMultiplier : 1;
}

export function getPlayerBulletSlowDuration(modifiers: Readonly<GameModifiers>) {
    return modifiers.cryoRounds ? cryoRoundsSlowDurationMilliseconds : 0;
}

export function getPlayerBulletSpeedMultiplier(modifiers: Readonly<GameModifiers>) {
    return modifiers.velocityVolley ? velocityVolleySpeedMultiplier : 1;
}

export function getPlayerBulletSplashDamage(modifiers: Readonly<GameModifiers>) {
    return modifiers.novaRounds ? novaRoundsSplashDamage : 0;
}

export function getPlayerBulletSplashRadius(modifiers: Readonly<GameModifiers>) {
    return modifiers.novaRounds ? novaRoundsSplashRadiusPixels : 0;
}

export function getPlayerCollisionProtectionCount(modifiers: Readonly<GameModifiers>) {
    return modifiers.reinforcedHull ? 1 : 0;
}

export function isPlayerTwoGhostModeEnabled(modifiers: Readonly<GameModifiers>) {
    return !!modifiers.playerTwoGhostMode;
}

export function getPlayerGunCount(modifiers: Readonly<GameModifiers>) {
    return modifiers.allowPlayerForwardGun
        ? modifiers.triadCannons
            ? 3
            : modifiers.allowSecondForwardGun
              ? 2
              : 1
        : 0;
}

export function getPlayerMovementSpeedMultiplier(modifiers: Readonly<GameModifiers>) {
    return modifiers.afterburners ? afterburnerMovementSpeedMultiplier : 1;
}

export function getPlayerShotIntervalMultiplier(modifiers: Readonly<GameModifiers>) {
    return modifiers.rapidFire ? rapidFireShotIntervalMultiplier : 1;
}

export function getShotExperienceCost(modifiers: Readonly<GameModifiers>) {
    return modifiers.precisionScoring ? precisionShotExperienceCost : 0;
}

export function getTimedExperienceMultiplier(modifiers: Readonly<GameModifiers>) {
    return modifiers.stardustDividend ? stardustDividendTimedExperienceMultiplier : 1;
}
