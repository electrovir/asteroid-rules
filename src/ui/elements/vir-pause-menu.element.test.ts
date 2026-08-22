import {NavController} from '@antha/input';
import {assert} from '@augment-vir/assert';
import {describe, it, testWeb} from '@augment-vir/test';
import {html} from 'element-vir';
import {ViraButton} from 'vira';
import {frontendPathTree} from '../../data/routing/frontend-path-tree.js';
import {createFrontendRouter} from '../../data/routing/frontend-router.js';
import {VirPauseMenu} from './vir-pause-menu.element.js';

describe(VirPauseMenu.tagName, () => {
    it('navigates to the debug path', async () => {
        const originalUrl = globalThis.location.href;
        const router = createFrontendRouter();

        try {
            const fixture = await testWeb.render(html`
                <${VirPauseMenu.assign({
                    gameState: {
                        isPaused: true,
                        navController: new NavController(document.body),
                        router,
                    },
                })}></${VirPauseMenu}>
            `);

            assert.instanceOf(fixture, VirPauseMenu);

            const debugButton = fixture.shadowRoot.querySelector('[data-test-id="debug-button"]');
            assert.instanceOf(debugButton, ViraButton);

            debugButton.dispatchEvent(
                new MouseEvent('mousedown', {
                    bubbles: true,
                    composed: true,
                }),
            );

            assert.deepEquals(
                router.readCurrentRoute().paths,
                frontendPathTree.paths.children.debug.children.rules.fullPaths,
            );
        } finally {
            router.destroy();
            globalThis.history.replaceState(undefined, '', originalUrl);
        }
    });
});
