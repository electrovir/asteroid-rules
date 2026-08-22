import {nav} from '@antha/input';
import {listenToObject} from '@antha/util';
import {type EmptyFunction} from '@augment-vir/common';
import {css, defineElement, html, nothing, testId} from 'element-vir';
import {
    checkIfMainMenuAllowed,
    updateMenuState,
    type AsteroidsGameEngineState,
    type FullGameState,
} from '../../data/game-state.js';
import {isDeployed} from '../../data/is-deployed.js';
import {frontendPathTree} from '../../data/routing/frontend-path-tree.js';
import {resetMission} from '../../mods/mission/reset-mission.js';
import {VirGameButton} from './vir-game-button.element.js';

export const VirPauseMenu = defineElement<{
    gameState: Partial<AsteroidsGameEngineState>;
}>()({
    tagName: 'vir-pause-menu',
    testIds: [
        'restartMissionButton',
        'endMissionButton',
    ],
    state(): {
        cleanup: EmptyFunction | undefined;
        showPauseMenu: boolean;
    } {
        return {
            cleanup: undefined,
            showPauseMenu: false,
        };
    },
    hostClasses: {
        'vir-pause-menu-visible': ({state}) => state.showPauseMenu,
    },
    styles({hostClasses}) {
        return css`
            :host {
                align-items: center;
                box-sizing: border-box;
                display: none;
                flex-direction: column;
                flex-grow: 1;
                gap: 24px;
                height: 100%;
                justify-content: center;
                padding: 16px;
                width: 100%;
            }

            ${hostClasses['vir-pause-menu-visible'].selector} {
                display: flex;
            }

            h1 {
                font-size: 48px;
                font-weight: 700;
                margin: 0;
            }

            .menu-options {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
        `;
    },
    init({host, inputs, updateState}) {
        function updatePauseMenuVisibility(
            this: void,
            menuState: FullGameState['menuState'] | undefined,
        ) {
            updateState({
                showPauseMenu: !!menuState?.pause,
            });
            host.requestUpdate();
        }

        updatePauseMenuVisibility(inputs.gameState.menuState);
        updateState({
            cleanup: listenToObject(inputs.gameState, 'menuState', updatePauseMenuVisibility),
        });
    },
    cleanup({state}) {
        state.cleanup?.();
    },
    render({inputs, state, testIds}) {
        const navController = inputs.gameState.navController;
        const router = inputs.gameState.router;
        const mainMenuAllowed = checkIfMainMenuAllowed({
            saveState: inputs.gameState.saveState,
        });
        const debugRoute = {
            paths: frontendPathTree.paths.children.debug.children.rules.fullPaths,
        };

        if (!state.showPauseMenu || !navController || !router) {
            return nothing;
        }

        return html`
            <h1>Paused</h1>
            <div class="menu-options">
                <${VirGameButton}
                    ${nav(navController, {
                        y: 0,
                        listeners: {
                            activate: ({enabled}) => {
                                if (enabled) {
                                    updateMenuState(inputs.gameState, undefined);
                                }
                            },
                        },
                    })}
                >
                    Resume
                </${VirGameButton}>
                ${isDeployed
                    ? nothing
                    : html`
                          <${VirGameButton}
                              ${nav(navController, {
                                  y: 1,
                                  listeners: {
                                      activate: ({enabled}) => {
                                          if (enabled) {
                                              updateMenuState(inputs.gameState, {
                                                  ruleDebug: true,
                                              });
                                              router.setRoute(debugRoute);
                                          }
                                      },
                                  },
                              })}
                          >
                              Debug
                          </${VirGameButton}>
                      `}
                <${VirGameButton}
                    ${testId(testIds.restartMissionButton)}
                    ${nav(navController, {
                        y: isDeployed ? 1 : 2,
                        listeners: {
                            activate({enabled}) {
                                if (enabled) {
                                    resetMission({
                                        gameState: inputs.gameState,
                                    });
                                    updateMenuState(inputs.gameState, undefined);
                                }
                            },
                        },
                    })}
                >
                    Restart Mission
                </${VirGameButton}>
                ${mainMenuAllowed
                    ? html`
                          <${VirGameButton}
                              ${testId(testIds.endMissionButton)}
                              ${nav(navController, {
                                  y: isDeployed ? 2 : 3,
                                  listeners: {
                                      activate({enabled}) {
                                          if (enabled) {
                                              resetMission({
                                                  gameState: inputs.gameState,
                                              });
                                              updateMenuState(inputs.gameState, {
                                                  mainMenu: true,
                                              });
                                          }
                                      },
                                  },
                              })}
                          >
                              End Mission
                          </${VirGameButton}>
                      `
                    : nothing}
            </div>
        `;
    },
});
