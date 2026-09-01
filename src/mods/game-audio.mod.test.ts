import {AudioPlayer} from '@antha/audio';
import {AnthaEngine} from '@antha/engine';
import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {GameAudio} from '../data/game-audio.js';
import {type AsteroidsGameEngineState} from '../data/game-state.js';
import {createDefaultAsteroidsSaveState} from '../data/save-data.js';
import {
    gameAudioMod,
    selectBackgroundGameAudio,
    shouldPauseBackgroundGameAudio,
} from './game-audio.mod.js';

describe('game audio', () => {
    it('selects music that matches the game state', () => {
        assert.deepEquals(
            [
                selectBackgroundGameAudio({
                    hasMission: false,
                    isMainMenu: true,
                    isPlayerDead: false,
                }),
                selectBackgroundGameAudio({
                    hasMission: true,
                    isMainMenu: false,
                    isPlayerDead: false,
                }),
                selectBackgroundGameAudio({
                    hasMission: true,
                    isMainMenu: false,
                    isPlayerDead: true,
                }),
                selectBackgroundGameAudio({
                    hasMission: true,
                    isMainMenu: false,
                    isPlayerDead: false,
                }),
            ],
            [
                GameAudio.MenuMusic,
                GameAudio.GameMusic,
                undefined,
                GameAudio.GameMusic,
            ],
        );
    });

    it('pauses only mission music for blocking menus', () => {
        assert.deepEquals(
            [
                shouldPauseBackgroundGameAudio({
                    backgroundAudio: GameAudio.GameMusic,
                    isPauseMenuOpen: true,
                    isRuleUnlockMenuOpen: false,
                }),
                shouldPauseBackgroundGameAudio({
                    backgroundAudio: GameAudio.GameMusic,
                    isPauseMenuOpen: false,
                    isRuleUnlockMenuOpen: true,
                }),
                shouldPauseBackgroundGameAudio({
                    backgroundAudio: GameAudio.MenuMusic,
                    isPauseMenuOpen: true,
                    isRuleUnlockMenuOpen: true,
                }),
            ],
            [
                true,
                true,
                false,
            ],
        );
    });

    it('syncs audio volume with the saved setting', async () => {
        const audioPlayer = new AudioPlayer();
        const engine = new AnthaEngine<AsteroidsGameEngineState>({
            initState: {
                audioPlayer,
                saveState: {
                    ...createDefaultAsteroidsSaveState(),
                    audioVolume: 0.6,
                },
            },
            mods: [
                gameAudioMod,
            ],
        });

        try {
            await engine.runSingleTick();

            assert.isApproximately(audioPlayer.gainNode.gain.value, 0.6, 0.00001);

            audioPlayer.gainNode.gain.value = 0.3;

            await engine.runSingleTick();

            assert.isApproximately(audioPlayer.gainNode.gain.value, 0.6, 0.00001);

            audioPlayer.gainNode.gain.value = 0.600005;

            await engine.runSingleTick();

            assert.isApproximately(audioPlayer.gainNode.gain.value, 0.600005, 0.000001);

            engine.state.saveState = {
                ...createDefaultAsteroidsSaveState(),
                audioVolume: 0.7,
            };

            await engine.runSingleTick();

            assert.isApproximately(audioPlayer.gainNode.gain.value, 0.7, 0.00001);
        } finally {
            await audioPlayer.destroy();
        }
    });
});
