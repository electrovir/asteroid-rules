import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {calculateAsteroidSpawnCount} from './asteroid-spawning.js';

describe(calculateAsteroidSpawnCount.name, () => {
    it('catches up for every fully elapsed spawn interval', () => {
        assert.strictEquals(
            calculateAsteroidSpawnCount({
                currentTime: 6000,
                lastAsteroidSpawnedAt: 0,
            }),
            4,
        );
    });

    it('does not spawn for a partial interval', () => {
        assert.strictEquals(
            calculateAsteroidSpawnCount({
                currentTime: 1499,
                lastAsteroidSpawnedAt: 0,
            }),
            0,
        );
    });
});
