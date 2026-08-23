import {assert, assertWrap} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {
    afterburnerMovementSpeedMultiplier,
    asteroidDragMovementSpeedMultiplier,
    asteroidMagnetAccelerationPixelsPerMillisecondSquared,
    asteroidSpawnIntervalMilliseconds,
    baseAsteroidFragmentCount,
    calculateAsteroidKillExperience,
    calculateExperienceMultiplier,
    controlledDemolitionAsteroidFragmentCount,
    cryoRoundsAsteroidMovementSpeedMultiplier,
    cryoRoundsSlowDurationMilliseconds,
    fasterAsteroidSpawnIntervalMilliseconds,
    getAsteroidFragmentCount,
    getAsteroidFragmentRadius,
    getAsteroidHealth,
    getAsteroidMagnetAcceleration,
    getAsteroidMovementSpeedMultiplier,
    getAsteroidSlowMovementSpeedMultiplier,
    getAsteroidSpawnInterval,
    getPlayerBulletBounceCount,
    getPlayerBulletDamageMultiplier,
    getPlayerBulletHomingTurnRate,
    getPlayerBulletPierceCount,
    getPlayerBulletRadiusMultiplier,
    getPlayerBulletSlowDuration,
    getPlayerBulletSpeedMultiplier,
    getPlayerBulletSplashDamage,
    getPlayerBulletSplashRadius,
    getPlayerCollisionProtectionCount,
    getPlayerGunCount,
    getPlayerMovementSpeedMultiplier,
    getPlayerShotIntervalMultiplier,
    getShotExperienceCost,
    getTimedExperienceMultiplier,
    heavyRoundsDamageMultiplier,
    homingRoundsTurnRateRadiansPerMillisecond,
    isPlayerGhostModeEnabled,
    novaRoundsSplashDamage,
    novaRoundsSplashRadiusPixels,
    piercingRoundsPierceCount,
    rapidFireShotIntervalMultiplier,
    ricochetRoundsBounceCount,
    salvageRightsExperiencePerHealth,
    stardustDividendTimedExperienceMultiplier,
    strongerAsteroidHealth,
    velocityVolleySpeedMultiplier,
    wideShotsRadiusMultiplier,
} from './gameplay-modifiers.js';

describe('gameplay modifiers', () => {
    it('changes combat and spawning values when their rules are active', () => {
        const modifiers = {
            allowPlayerForwardGun: true,
            allowSecondForwardGun: true,
            asteroidKillXp: true,
            fasterAsteroidSpawning: true,
            precisionScoring: true,
            strongerAsteroids: true,
        };

        assert.deepEquals(
            {
                asteroidHealth: getAsteroidHealth(modifiers),
                asteroidKillExperience: calculateAsteroidKillExperience({
                    health: 3,
                    modifiers,
                }),
                asteroidSpawnInterval: getAsteroidSpawnInterval({
                    modifiers,
                }),
                gunCount: getPlayerGunCount(modifiers),
                shotExperienceCost: getShotExperienceCost(modifiers),
            },
            {
                asteroidHealth: strongerAsteroidHealth,
                asteroidKillExperience: 33,
                asteroidSpawnInterval: fasterAsteroidSpawnIntervalMilliseconds,
                gunCount: 2,
                shotExperienceCost: 1,
            },
        );
    });

    it('leaves gameplay at its baseline without combat modifiers', () => {
        assert.deepEquals(
            {
                asteroidKillExperience: calculateAsteroidKillExperience({
                    health: 3,
                    modifiers: {},
                }),
                asteroidSpawnInterval: getAsteroidSpawnInterval({
                    modifiers: {},
                }),
                gunCount: getPlayerGunCount({}),
                shotExperienceCost: getShotExperienceCost({}),
            },
            {
                asteroidKillExperience: 0,
                asteroidSpawnInterval: asteroidSpawnIntervalMilliseconds,
                gunCount: 0,
                shotExperienceCost: 0,
            },
        );
    });

    it('requires Asteroid Kill XP for stronger asteroids to grant health-scaled experience', () => {
        const strongerAsteroidModifiers = {
            strongerAsteroids: true,
        };
        const asteroidHealth = getAsteroidHealth(strongerAsteroidModifiers);

        assert.deepEquals(
            {
                asteroidHealth,
                asteroidKillExperience: calculateAsteroidKillExperience({
                    health: asteroidHealth,
                    modifiers: strongerAsteroidModifiers,
                }),
                asteroidKillExperienceWithXpRule: calculateAsteroidKillExperience({
                    health: asteroidHealth,
                    modifiers: {
                        ...strongerAsteroidModifiers,
                        asteroidKillXp: true,
                    },
                }),
            },
            {
                asteroidHealth: strongerAsteroidHealth,
                asteroidKillExperience: 0,
                asteroidKillExperienceWithXpRule: strongerAsteroidHealth,
            },
        );
    });

    it('keeps rapid asteroid spawning proportionate to the base interval', () => {
        assert.strictEquals(
            asteroidSpawnIntervalMilliseconds / fasterAsteroidSpawnIntervalMilliseconds,
            3.75,
        );
    });

    it('stacks asteroid spawn-rate rules for dense late-game waves', () => {
        const spawnIntervals = [
            getAsteroidSpawnInterval({
                modifiers: {
                    fasterAsteroidSpawning: true,
                },
            }),
            getAsteroidSpawnInterval({
                modifiers: {
                    asteroidCascade: true,
                    fasterAsteroidSpawning: true,
                },
            }),
            getAsteroidSpawnInterval({
                modifiers: {
                    asteroidCascade: true,
                    debrisShower: true,
                    fasterAsteroidSpawning: true,
                },
            }),
            getAsteroidSpawnInterval({
                modifiers: {
                    asteroidCascade: true,
                    debrisShower: true,
                    fasterAsteroidSpawning: true,
                    meteorStorm: true,
                },
            }),
        ];

        assert.isTrue(
            spawnIntervals.slice(1).every((spawnInterval, index) => {
                return spawnInterval < assertWrap.isDefined(spawnIntervals[index]);
            }),
        );
    });

    it('stacks the final asteroid challenge rules', () => {
        const modifiers = {
            asteroidArmada: true,
            asteroidKillXp: true,
            asteroidOnslaught: true,
            fortifiedAsteroids: true,
            strongerAsteroids: true,
            titanAsteroids: true,
        };

        assert.deepEquals(
            {
                asteroidHealth: getAsteroidHealth(modifiers),
                asteroidKillExperience: calculateAsteroidKillExperience({
                    health: getAsteroidHealth(modifiers),
                    modifiers,
                }),
                asteroidSpawnInterval: getAsteroidSpawnInterval({
                    modifiers,
                }),
            },
            {
                asteroidHealth: 20,
                asteroidKillExperience: 20,
                asteroidSpawnInterval: 125,
            },
        );
    });

    it('gradually accelerates asteroid spawns over a mission', () => {
        assert.deepEquals(
            [
                0,
                5 * 60_000,
                10 * 60_000,
                90 * 60_000,
                120 * 60_000,
            ].map((missionDurationMilliseconds) => {
                return getAsteroidSpawnInterval({
                    missionDurationMilliseconds,
                    modifiers: {
                        escalatingAsteroidSpawning: true,
                    },
                });
            }),
            [
                750,
                500,
                375,
                75,
                75,
            ],
        );
    });

    it('increases earned experience as a combo lasts longer', () => {
        assert.deepEquals(
            [
                calculateExperienceMultiplier({
                    currentTime: 30_000,
                    missionStartedAt: 0,
                    modifiers: {},
                }),
                calculateExperienceMultiplier({
                    currentTime: 30_000,
                    missionStartedAt: 0,
                    modifiers: {
                        experienceCombos: true,
                    },
                }),
            ],
            [
                1,
                1.75,
            ],
        );
    });

    it('reduces asteroid fragments to the minimum radius', () => {
        assert.deepEquals(
            [
                getAsteroidFragmentRadius(48),
                getAsteroidFragmentRadius(24),
                getAsteroidFragmentRadius(18),
            ],
            [
                24,
                18,
                18,
            ],
        );
    });

    it('applies the additional combat and survival modifiers', () => {
        const modifiers = {
            afterburners: true,
            asteroidDrag: true,
            controlledDemolition: true,
            heavyRounds: true,
            piercingRounds: true,
            rapidFire: true,
            reinforcedHull: true,
            salvageRights: true,
            wideShots: true,
        };

        assert.deepEquals(
            {
                asteroidFragmentCount: getAsteroidFragmentCount(modifiers),
                asteroidKillExperience: calculateAsteroidKillExperience({
                    health: 3,
                    modifiers,
                }),
                asteroidMovementSpeed: getAsteroidMovementSpeedMultiplier(modifiers),
                bulletDamage: getPlayerBulletDamageMultiplier(modifiers),
                bulletPierces: getPlayerBulletPierceCount(modifiers),
                bulletRadius: getPlayerBulletRadiusMultiplier(modifiers),
                collisionProtection: getPlayerCollisionProtectionCount(modifiers),
                playerMovementSpeed: getPlayerMovementSpeedMultiplier(modifiers),
                shotInterval: getPlayerShotIntervalMultiplier(modifiers),
            },
            {
                asteroidFragmentCount: controlledDemolitionAsteroidFragmentCount,
                asteroidKillExperience: 3 * salvageRightsExperiencePerHealth,
                asteroidMovementSpeed: asteroidDragMovementSpeedMultiplier,
                bulletDamage: heavyRoundsDamageMultiplier,
                bulletPierces: piercingRoundsPierceCount,
                bulletRadius: wideShotsRadiusMultiplier,
                collisionProtection: 1,
                playerMovementSpeed: afterburnerMovementSpeedMultiplier,
                shotInterval: rapidFireShotIntervalMultiplier,
            },
        );
    });

    it('leaves the additional modifiers at their baseline values', () => {
        assert.deepEquals(
            {
                asteroidFragmentCount: getAsteroidFragmentCount({}),
                asteroidMovementSpeed: getAsteroidMovementSpeedMultiplier({}),
                bulletDamage: getPlayerBulletDamageMultiplier({}),
                bulletPierces: getPlayerBulletPierceCount({}),
                bulletRadius: getPlayerBulletRadiusMultiplier({}),
                collisionProtection: getPlayerCollisionProtectionCount({}),
                playerMovementSpeed: getPlayerMovementSpeedMultiplier({}),
                shotInterval: getPlayerShotIntervalMultiplier({}),
            },
            {
                asteroidFragmentCount: baseAsteroidFragmentCount,
                asteroidMovementSpeed: 1,
                bulletDamage: 1,
                bulletPierces: 0,
                bulletRadius: 1,
                collisionProtection: 0,
                playerMovementSpeed: 1,
                shotInterval: 1,
            },
        );
    });

    it('enables player ghost mode with the Baby Rule', () => {
        assert.deepEquals(
            [
                isPlayerGhostModeEnabled({}),
                isPlayerGhostModeEnabled({
                    playerTwoGhostMode: true,
                }),
            ],
            [
                false,
                true,
            ],
        );
    });

    it('applies the experimental projectile and asteroid modifiers', () => {
        const modifiers = {
            allowPlayerForwardGun: true,
            asteroidMagnetism: true,
            cryoRounds: true,
            fractalFrenzy: true,
            homingRounds: true,
            novaRounds: true,
            ricochetRounds: true,
            stardustDividend: true,
            triadCannons: true,
            velocityVolley: true,
        };

        assert.deepEquals(
            {
                asteroidFragmentCount: getAsteroidFragmentCount(modifiers),
                asteroidMagnetAcceleration: getAsteroidMagnetAcceleration(modifiers),
                asteroidSlowMovementSpeed: [
                    getAsteroidSlowMovementSpeedMultiplier(0),
                    getAsteroidSlowMovementSpeedMultiplier(500),
                ],
                bulletBounces: getPlayerBulletBounceCount(modifiers),
                bulletHomingTurnRate: getPlayerBulletHomingTurnRate(modifiers),
                bulletSlowDuration: getPlayerBulletSlowDuration(modifiers),
                bulletSpeed: getPlayerBulletSpeedMultiplier(modifiers),
                bulletSplashDamage: getPlayerBulletSplashDamage(modifiers),
                bulletSplashRadius: getPlayerBulletSplashRadius(modifiers),
                gunCount: getPlayerGunCount(modifiers),
                timedExperience: getTimedExperienceMultiplier(modifiers),
            },
            {
                asteroidFragmentCount: 3,
                asteroidMagnetAcceleration: asteroidMagnetAccelerationPixelsPerMillisecondSquared,
                asteroidSlowMovementSpeed: [
                    1,
                    cryoRoundsAsteroidMovementSpeedMultiplier,
                ],
                bulletBounces: ricochetRoundsBounceCount,
                bulletHomingTurnRate: homingRoundsTurnRateRadiansPerMillisecond,
                bulletSlowDuration: cryoRoundsSlowDurationMilliseconds,
                bulletSpeed: velocityVolleySpeedMultiplier,
                bulletSplashDamage: novaRoundsSplashDamage,
                bulletSplashRadius: novaRoundsSplashRadiusPixels,
                gunCount: 3,
                timedExperience: stardustDividendTimedExperienceMultiplier,
            },
        );
    });
});
