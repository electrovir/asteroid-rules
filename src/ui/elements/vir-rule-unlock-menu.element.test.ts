import {AudioPlayer, type AudioSetupParams} from '@antha/audio';
import {assert, assertWrap} from '@augment-vir/assert';
import {describe, it, testWeb} from '@augment-vir/test';
import {NavController, extractNavEntry} from 'device-navigation';
import {html, testIdSelector} from 'element-vir';
import {GameAudio, gameAudioFiles} from '../../data/game-audio.js';
import {type AsteroidsGameEngineState} from '../../data/game-state.js';
import {createDefaultAsteroidsSaveState} from '../../mods/autosave.mod.js';
import {VirGameButton} from './vir-game-button.element.js';
import {VirRuleUnlockMenu} from './vir-rule-unlock-menu.element.js';

class TestAudioPlayer extends AudioPlayer {
    public stoppedFile: Readonly<AudioSetupParams> | undefined;

    public override stopFile(file: Readonly<AudioSetupParams>) {
        this.stoppedFile = file;
    }
}

describe(VirRuleUnlockMenu.tagName, () => {
    it('stops the rule-unlock audio when resumed', async () => {
        const audioPlayer = new TestAudioPlayer();
        const navController = new NavController(document.body, {
            alwaysRequireFocused: true,
        });
        const gameState: Partial<AsteroidsGameEngineState> = {
            audioPlayer,
            navController,
            saveState: createDefaultAsteroidsSaveState(),
        };

        try {
            const renderedElement = await testWeb.render(html`
                <${VirRuleUnlockMenu.assign({
                    gameState,
                })}></${VirRuleUnlockMenu}>
            `);
            const ruleUnlockMenuElement = assertWrap.instanceOf(renderedElement, VirRuleUnlockMenu);
            const resumeButton = assertWrap.instanceOf(
                assertWrap
                    .isDefined(ruleUnlockMenuElement.shadowRoot)
                    .querySelector(testIdSelector(VirRuleUnlockMenu.testIds.resumeButton)),
                VirGameButton,
            );

            assertWrap.isDefined(extractNavEntry(resumeButton)).activate(true);

            assert.deepEquals(audioPlayer.stoppedFile, gameAudioFiles[GameAudio.RuleUnlocked]);
            assert.deepEquals(gameState.saveState?.newGameRules, []);
            assert.isUndefined(gameState.menuState);
        } finally {
            await audioPlayer.destroy();
            testWeb.cleanupRender();
        }
    });
});
