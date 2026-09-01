import {createEngineTime, defineAnthaMod} from '@antha/engine';
import {isPlayerMenuNavigationAllowed, MenuNavBinding} from '@antha/input';
import {getObjectTypedEntries} from '@augment-vir/common';
import {html, nothing} from 'element-vir';
import {routeHasPaths} from 'spa-router-vir';
import {
    PlayerPosition,
    updateMenuState,
    type AsteroidsGameEngineState,
} from '../data/game-state.js';
import {InputConsumer} from '../data/input-consumer.js';
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

export const menuMod = defineAnthaMod<AsteroidsGameEngineState>({
    modName: 'menu',
    execute({engine, state}) {
        const wasInMenu = !!state.isInMenu;

        state.allowedPlayerMenuNavigation = state.saveState?.modifiers.onlyPlayerOneMenuNavigation
            ? {
                  [PlayerPosition['1']]: true,
              }
            : undefined;

        if (isOnDebugPage(state.router)) {
            updateMenuState(state, {
                ruleDebug: true,
            });
        }

        if (
            state.saveState?.newGameRules.length &&
            !state.menuState &&
            (!state.missionState?.levelUpAnimation ||
                state.missionState.levelUpAnimation.endsAt <= engine.engineTime)
        ) {
            state.inputDisableEndsAt = createEngineTime({
                milliseconds: engine.engineTime + 1000,
            });
            updateMenuState(state, {
                ruleUnlock: true,
            });
        }

        const pauseWasTriggered: boolean =
            (!state.menuState || !!state.menuState.pause) &&
            !!state.missionState &&
            getObjectTypedEntries(state.activeBindings || {}).reduce(
                (
                    hasPauseRequest,
                    [
                        playerPosition,
                        bindings,
                    ],
                ) => {
                    if (
                        !isPlayerMenuNavigationAllowed({
                            allowedPlayerMenuNavigation: state.allowedPlayerMenuNavigation,
                            playerPosition,
                        })
                    ) {
                        return hasPauseRequest;
                    }

                    const openPauseMenuBinding = bindings[MenuNavBinding.OpenPauseMenu];

                    if (openPauseMenuBinding && !openPauseMenuBinding.actCount) {
                        openPauseMenuBinding.actCount = 1;
                        return true;
                    }

                    return hasPauseRequest;
                },
                false,
            );

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
        /**
         * Prevent updates until we are cleanly out of a menu, to prevent entity updates from
         * starting before menu inputs are finished being consumed.
         */
        state.disableEntityUpdates = wasInMenu || state.isInMenu;
        state.rawInputConsumer = state.isInMenu ? InputConsumer.Menu : InputConsumer.Game;

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
