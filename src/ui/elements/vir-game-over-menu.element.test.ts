import {AudioPlayer, type AudioSetupParams} from '@antha/audio';
import {assert, assertWrap} from '@augment-vir/assert';
import {describe, it, testWeb} from '@augment-vir/test';
import {NavController, extractNavEntry} from 'device-navigation';
import {html, testIdSelector} from 'element-vir';
import {GameAudio, gameAudioFiles} from '../../data/game-audio.js';
import {type AsteroidsGameEngineState} from '../../data/game-state.js';
import {VirGameButton} from './vir-game-button.element.js';
import {VirGameOverMenu} from './vir-game-over-menu.element.js';

class TestAudioPlayer extends AudioPlayer {
    public stoppedFile: Readonly<AudioSetupParams> | undefined;

    public override stopFile(file: Readonly<AudioSetupParams>) {
        this.stoppedFile = file;
    }
}

describe(VirGameOverMenu.tagName, () => {
    it('stops the death music when the player exits the death screen', async () => {
        const audioPlayer = new TestAudioPlayer();
        const navController = new NavController(document.body, {
            alwaysRequireFocused: true,
        });
        const gameState = {
            audioPlayer,
            navController,
        } satisfies Partial<AsteroidsGameEngineState>;

        try {
            const renderedElement = await testWeb.render(html`
                <${VirGameOverMenu.assign({
                    experienceEarned: 0,
                    gameState,
                })}></${VirGameOverMenu}>
            `);
            const gameOverMenuElement = assertWrap.instanceOf(renderedElement, VirGameOverMenu);
            const terminateMissionButton = assertWrap.instanceOf(
                assertWrap
                    .isDefined(gameOverMenuElement.shadowRoot)
                    .querySelector(testIdSelector(VirGameOverMenu.testIds.terminateMissionButton)),
                VirGameButton,
            );

            assertWrap.isDefined(extractNavEntry(terminateMissionButton)).activate(true);

            assert.deepEquals(audioPlayer.stoppedFile, gameAudioFiles[GameAudio.PlayerDeathMusic]);
        } finally {
            await audioPlayer.destroy();
            testWeb.cleanupRender();
        }
    });
});
