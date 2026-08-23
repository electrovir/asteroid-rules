import {nav} from '@antha/input';
import {listenToObject} from '@antha/util';
import {type EmptyFunction} from '@augment-vir/common';
import {css, defineElement, html, nothing} from 'element-vir';
import {noNativeSpacing} from 'vira';
import {updateMenuState, type AsteroidsGameEngineState} from '../../data/game-state.js';
import {VirGameButton} from './vir-game-button.element.js';
import {VirGameRuleList} from './vir-game-rule-list.element.js';

export const VirMainMenu = defineElement<{
    gameState: Partial<AsteroidsGameEngineState>;
}>()({
    tagName: 'vir-main-menu',
    state(): {
        cleanup: EmptyFunction | undefined;
        showMainMenu: boolean;
    } {
        return {
            cleanup: undefined,
            showMainMenu: false,
        };
    },
    hostClasses: {
        'vir-main-menu-visible': ({state}) => state.showMainMenu,
    },
    styles({hostClasses}) {
        return css`
            :host {
                align-items: center;
                box-sizing: border-box;
                display: none;
                flex-direction: column;
                flex-grow: 1;
                height: 100%;
                justify-content: center;
                padding: 32px;
                width: 100%;
            }

            ${hostClasses['vir-main-menu-visible'].selector} {
                display: flex;
            }

            h1 {
                ${noNativeSpacing}
                font-size: 48px;
            }

            .menu-options {
                align-items: flex-start;
                display: flex;
                gap: 16px;
                max-width: 100%;
            }

            .play-button-wrapper {
                margin-top: 46px;
            }
        `;
    },
    init({host, inputs, updateState}) {
        function updateSaveState(this: void) {
            host.requestUpdate();
        }

        function updateMainMenuVisibility(this: void) {
            updateState({
                showMainMenu: !!inputs.gameState.menuState?.mainMenu,
            });
            host.requestUpdate();
        }

        updateSaveState();
        updateMainMenuVisibility();

        const saveStateCleanup = listenToObject(inputs.gameState, 'saveState', updateSaveState);
        const menuStateCleanup = listenToObject(
            inputs.gameState,
            'menuState',
            updateMainMenuVisibility,
        );

        updateState({
            cleanup: () => {
                saveStateCleanup();
                menuStateCleanup();
            },
        });
    },
    cleanup({state}) {
        state.cleanup?.();
    },
    render({inputs, state}) {
        const saveState = inputs.gameState.saveState;
        if (!saveState) {
            return nothing;
        }

        const navController = inputs.gameState.navController;

        if (!state.showMainMenu || !navController) {
            return nothing;
        }

        return html`
            <div class="menu-options">
                <${VirGameRuleList.assign({
                    gameState: inputs.gameState,
                })}></${VirGameRuleList}>
                <div class="play-button-wrapper">
                    <${VirGameButton}
                        ${nav(navController, {
                            height: Infinity,
                            autoFocus: true,
                            x: 1,
                            y: 0,
                            listeners: {
                                activate: ({enabled}) => {
                                    if (enabled) {
                                        if (inputs.gameState.saveState) {
                                            inputs.gameState.saveState.newGameRules = [];
                                        }
                                        updateMenuState(inputs.gameState, undefined);
                                    }
                                },
                            },
                        })}
                    >
                        Play
                    </${VirGameButton}>
                </div>
            </div>
        `;
    },
});
