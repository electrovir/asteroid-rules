import {defineAnthaMod} from '@antha/engine';
import {MenuNavBinding} from '@antha/input';
import {html, nothing} from 'element-vir';
import {routeHasPaths} from 'spa-router-vir';
import {type AsteroidsGameEngineState, updateMenuState} from '../data/game-state.js';
import {frontendPathTree} from '../data/routing/frontend-path-tree.js';
import {type FrontendRouter} from '../data/routing/frontend-router.js';
import {VirMainMenu} from '../ui/elements/vir-main-menu.element.js';
import {VirMenuBackground} from '../ui/elements/vir-menu-background.element.js';
import {VirPauseMenu} from '../ui/elements/vir-pause-menu.element.js';
import {VirRuleDebug} from '../ui/elements/vir-rule-debug.element.js';

export function isOnDebugPage(router: FrontendRouter | undefined): boolean {
    return (
        !!router &&
        routeHasPaths(
            router.readCurrentRoute(),
            frontendPathTree.paths.children.debug.children.rules,
            {
                exactMatch: true,
            },
        )
    );
}

export const menuMod = defineAnthaMod<AsteroidsGameEngineState>({
    modName: 'menu',
    execute({state}) {
        if (isOnDebugPage(state.router)) {
            updateMenuState(state, {
                isOnRuleDebug: true,
            });
        }

        const pauseWasTriggered: boolean =
            (!state.menuState || !!state.menuState.isPaused) &&
            !!state.missionState &&
            Object.values(state.activeBindings || {}).reduce((hasPauseRequest, bindings) => {
                const openPauseMenuBinding = bindings[MenuNavBinding.OpenPauseMenu];

                if (openPauseMenuBinding && !openPauseMenuBinding.actCount) {
                    openPauseMenuBinding.actCount = 1;
                    return true;
                }

                return hasPauseRequest;
            }, false);

        if (pauseWasTriggered) {
            updateMenuState(
                state,
                state.menuState?.isPaused
                    ? undefined
                    : {
                          isPaused: true,
                      },
            );
        }

        state.isInMenu = !!state.menuState;

        if (!state.menuState) {
            return nothing;
        }

        return html`
            <${VirMenuBackground}>
                <${VirPauseMenu.assign({
                    gameState: state,
                })}></${VirPauseMenu}>
                <${VirMainMenu.assign({
                    gameState: state,
                })}></${VirMainMenu}>
                ${state.menuState.isOnRuleDebug
                    ? html`
                          <${VirRuleDebug.assign({
                              gameState: state,
                          })}></${VirRuleDebug}>
                      `
                    : nothing}
            </${VirMenuBackground}>
        `;
    },
});
