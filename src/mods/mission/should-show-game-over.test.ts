import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {shouldShowGameOver} from './should-show-game-over.js';

describe(shouldShowGameOver.name, () => {
    it('keeps a mission active while a living player remains', () => {
        assert.isFalse(
            shouldShowGameOver([
                {
                    isDestroyed: true,
                    isGhostMode: false,
                },
                {
                    isDestroyed: false,
                    isGhostMode: false,
                },
            ]),
        );
    });

    it('shows game over when the only remaining player is a ghost', () => {
        assert.isTrue(
            shouldShowGameOver([
                {
                    isDestroyed: true,
                    isGhostMode: false,
                },
                {
                    isDestroyed: false,
                    isGhostMode: true,
                },
            ]),
        );
    });
});
