import {createEngineTime, defineAnthaMod} from '@antha/engine';
import {MenuNavBinding} from '@antha/input';
import {getEnumValues, omitObjectKeys} from '@augment-vir/common';
import {html, nothing} from 'element-vir';
import {routeHasPaths} from 'spa-router-vir';
import {type AsteroidsGameEngineState, updateMenuState} from '../data/game-state.js';
import {frontendPathTree} from '../data/routing/frontend-path-tree.js';
import {type FrontendRouter} from '../data/routing/frontend-router.js';
import {VirGameOverMenu} from '../ui/elements/vir-game-over-menu.element.js';
import {VirMainMenu} from '../ui/elements/vir-main-menu.element.js';
import {VirMenuBackground} from '../ui/elements/vir-menu-background.element.js';
import {VirPauseMenu} from '../ui/elements/vir-pause-menu.element.js';
import {VirRuleDebug} from '../ui/elements/vir-rule-debug.element.js';
import {VirRuleUnlockMenu} from '../ui/elements/vir-rule-unlock-menu.element.js';

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

function preventPlayerTwoMenuNavigation({
    state,
}: Readonly<{
    state: Partial<AsteroidsGameEngineState>;
}>) {
    const playerTwoActiveBindings = state.activeBindings?.['2'];

    if (!state.saveState?.modifiers.onlyPlayerOneMenuNavigation || !playerTwoActiveBindings) {
        return;
    }

    state.activeBindings = {
        ...state.activeBindings,
        2: omitObjectKeys(playerTwoActiveBindings, getEnumValues(MenuNavBinding)),
    };
}

export const menuMod = defineAnthaMod<AsteroidsGameEngineState>({
    modName: 'menu',
    execute({engine, state}) {
        preventPlayerTwoMenuNavigation({
            state,
        });

        if (isOnDebugPage(state.router)) {
            updateMenuState(state, {
                ruleDebug: true,
            });
        }

        if (
            state.saveState?.newGameRules.length &&
            !state.menuState &&
            (!state.missionState?.levelUpAnimation ||
                state.missionState.levelUpAnimation.endsAt <= engine.totalMs)
        ) {
            state.inputDisableEndsAt = createEngineTime(engine.totalMs + 1000);
            updateMenuState(state, {
                ruleUnlock: true,
            });
        }

        const pauseWasTriggered: boolean =
            (!state.menuState || !!state.menuState.pause) &&
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
                state.menuState?.pause
                    ? undefined
                    : {
                          pause: true,
                      },
            );
        }

        state.isInMenu = !!state.menuState;
        state.disableEntityUpdates = !!state.menuState;

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
                ${state.menuState.youDied
                    ? html`
                          <${VirGameOverMenu.assign({
                              experienceEarned: state.missionState?.experienceEarned || 0,
                              gameState: state,
                          })}></${VirGameOverMenu}>
                      `
                    : nothing}
                ${state.menuState.ruleDebug
                    ? html`
                          <${VirRuleDebug.assign({
                              gameState: state,
                          })}></${VirRuleDebug}>
                      `
                    : nothing}
                ${state.menuState.ruleUnlock
                    ? html`
                          <${VirRuleUnlockMenu.assign({
                              gameState: state,
                          })}></${VirRuleUnlockMenu}>
                      `
                    : nothing}
            </${VirMenuBackground}>
        `;
    },
});
