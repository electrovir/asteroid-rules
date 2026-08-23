import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {
    asteroidSpawnIntervalMilliseconds,
    calculateAsteroidKillExperience,
    calculateExperienceMultiplier,
    fasterAsteroidSpawnIntervalMilliseconds,
    getAsteroidFragmentRadius,
    getAsteroidHealth,
    getAsteroidSpawnInterval,
    getPlayerGunCount,
    getShotExperienceCost,
    strongerAsteroidHealth,
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
                asteroidSpawnInterval: getAsteroidSpawnInterval(modifiers),
                gunCount: getPlayerGunCount(modifiers),
                shotExperienceCost: getShotExperienceCost(modifiers),
            },
            {
                asteroidHealth: strongerAsteroidHealth,
                asteroidKillExperience: 30,
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
                asteroidSpawnInterval: getAsteroidSpawnInterval({}),
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
});
