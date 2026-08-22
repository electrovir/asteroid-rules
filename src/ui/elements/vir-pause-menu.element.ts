import {nav} from '@antha/input';
import {listenToObject} from '@antha/util';
import {type EmptyFunction} from '@augment-vir/common';
import {css, defineElement, html, nothing} from 'element-vir';
import {ViraButton, ViraColorVariant, ViraSize} from 'vira';
import {type AsteroidsGameState} from '../../data/asteroids-game-state.js';
import {frontendPathTree} from '../../data/routing/frontend-path-tree.js';

export const VirPauseMenu = defineElement<{
    gameState: Partial<AsteroidsGameState>;
}>()({
    tagName: 'vir-pause-menu',
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
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(3px);
                box-sizing: border-box;
                display: none;
                flex-direction: column;
                gap: 24px;
                inset: 0;
                justify-content: center;
                padding: 16px;
                position: fixed;
                z-index: 1;
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
        function updatePauseMenuVisibility(this: void, isPaused: boolean | undefined) {
            updateState({
                showPauseMenu: !!isPaused,
            });
            host.requestUpdate();
        }

        updatePauseMenuVisibility(inputs.gameState.isPaused);
        updateState({
            cleanup: listenToObject(inputs.gameState, 'isPaused', updatePauseMenuVisibility),
        });
    },
    cleanup({state}) {
        state.cleanup?.();
    },
    render({inputs, state}) {
        const navController = inputs.gameState.navController;
        const router = inputs.gameState.router;
        const debugRoute = {
            paths: frontendPathTree.paths.children.debug.children.rules.fullPaths,
        };

        if (!state.showPauseMenu || !navController || !router) {
            return nothing;
        }

        return html`
            <h1>Paused</h1>
            <div class="menu-options">
                <${ViraButton.assign({
                    buttonSize: ViraSize.Large,
                    color: ViraColorVariant.Neutral,
                    text: 'Resume',
                })}
                    ${nav(navController, {
                        y: 0,
                        listeners: {
                            activate: ({enabled}) => {
                                if (enabled) {
                                    inputs.gameState.isPaused = false;
                                }
                            },
                        },
                    })}
                ></${ViraButton}>
                <${ViraButton.assign({
                    buttonSize: ViraSize.Large,
                    color: ViraColorVariant.Neutral,
                    text: 'Debug',
                })}
                    data-test-id="debug-button"
                    ${nav(navController, {
                        y: 1,
                        listeners: {
                            activate: ({enabled}) => {
                                if (enabled) {
                                    router.setRoute(debugRoute);
                                }
                            },
                        },
                    })}
                ></${ViraButton}>
                <${ViraButton.assign({
                    buttonSize: ViraSize.Large,
                    color: ViraColorVariant.Neutral,
                    text: 'End Mission',
                })}
                    ${nav(navController, {
                        y: 2,
                    })}
                ></${ViraButton}>
            </div>
        `;
    },
});
