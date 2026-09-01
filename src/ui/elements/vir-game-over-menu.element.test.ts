import {assert, assertWrap} from '@augment-vir/assert';
import {describe, it, testWeb} from '@augment-vir/test';
import {NavController, extractNavEntry} from 'device-navigation';
import {html, testIdSelector} from 'element-vir';
import {type AsteroidsGameEngineState} from '../../data/game-state.js';
import {createDefaultAsteroidsSaveState} from '../../data/save-data.js';
import {VirGameButton} from './vir-game-button.element.js';
import {VirGameOverMenu} from './vir-game-over-menu.element.js';

describe(VirGameOverMenu.tagName, () => {
    it('terminates the mission when the player exits the death screen', async () => {
        const navController = new NavController(document.body, {
            alwaysRequireFocused: true,
        });
        const gameState: Partial<AsteroidsGameEngineState> = {
            navController,
            saveState: createDefaultAsteroidsSaveState(),
        };

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

            assert.strictEquals(terminateMissionButton.textContent.trim(), 'Start New Mission');

            assertWrap.isDefined(extractNavEntry(terminateMissionButton)).activate(true);

            assert.isUndefined(gameState.menuState);
        } finally {
            testWeb.cleanupRender();
        }
    });
});
