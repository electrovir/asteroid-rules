import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {GameAudio} from '../data/game-audio.js';
import {selectBackgroundGameAudio} from './game-audio.mod.js';

describe('game audio', () => {
    it('selects music that matches the game state', () => {
        assert.deepEquals(
            [
                selectBackgroundGameAudio({
                    hasNewRules: false,
                    hasMission: false,
                    isMainMenu: true,
                    isPlayerDead: false,
                }),
                selectBackgroundGameAudio({
                    hasNewRules: false,
                    hasMission: true,
                    isMainMenu: false,
                    isPlayerDead: false,
                }),
                selectBackgroundGameAudio({
                    hasNewRules: false,
                    hasMission: true,
                    isMainMenu: false,
                    isPlayerDead: true,
                }),
                selectBackgroundGameAudio({
                    hasNewRules: true,
                    hasMission: true,
                    isMainMenu: false,
                    isPlayerDead: false,
                }),
            ],
            [
                GameAudio.MenuMusic,
                GameAudio.GameMusic,
                undefined,
                undefined,
            ],
        );
    });
});
