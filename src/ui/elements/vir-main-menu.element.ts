import {nav} from '@antha/input';
import {listenToObject} from '@antha/util';
import {type EmptyFunction} from '@augment-vir/common';
import {css, defineElement, html, listen, nothing} from 'element-vir';
import {themeDefaultKey} from 'theme-vir';
import {noNativeSpacing, ViraButton, ViraColorVariant, ViraSize, viraTheme} from 'vira';
import {toggleGameRule, type GameRule} from '../../data/game-rule.js';
import {type AsteroidsEngineState, type AsteroidsGameState} from '../../data/game-state.js';
import {GameZIndex} from '../../data/z-index.js';
import {VirGameRuleList} from './vir-game-rule-list.element.js';

export const VirMainMenu = defineElement<{
    gameState: Partial<AsteroidsEngineState>;
}>()({
    tagName: 'vir-main-menu',
    state(): {
        activeRules: GameRule[];
        cleanup: EmptyFunction | undefined;
        showMainMenu: boolean;
    } {
        return {
            activeRules: [],
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
                background: ${viraTheme.colors[themeDefaultKey].background.value};
                box-sizing: border-box;
                display: none;
                flex-direction: column;
                inset: 0;
                justify-content: center;
                padding: 32px;
                position: fixed;
                z-index: ${GameZIndex.Menu};
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
        `;
    },
    init({host, inputs, updateState}) {
        function updateSaveState(
            this: void,
            saveState: AsteroidsGameState['saveState'] | undefined,
        ) {
            updateState({
                activeRules: saveState?.activeRules || [],
            });
            host.requestUpdate();
        }

        function updateMainMenuVisibility(this: void) {
            updateState({
                showMainMenu:
                    !!inputs.gameState.menuState?.onMainMenu &&
                    !inputs.gameState.menuState.isPaused,
            });
            host.requestUpdate();
        }

        updateSaveState(inputs.gameState.saveState);
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
    render({inputs, state, updateState}) {
        const saveState = inputs.gameState.saveState;
        if (!saveState) {
            return nothing;
        }

        const navController = inputs.gameState.navController;

        if (!state.showMainMenu || !navController) {
            return nothing;
        }

        return html`
            <h1>Rules</h1>
            <div class="menu-options">
                <${VirGameRuleList.assign({
                    activeRules: state.activeRules,
                    availableRules: saveState.unlockedGameRules,
                    navController,
                })}
                    ${listen(VirGameRuleList.events.ruleActivated, ({detail: rule}) => {
                        const activeRules = toggleGameRule({
                            activeRules: state.activeRules,
                            rule,
                        });

                        inputs.gameState.saveState = {
                            ...saveState,
                            activeRules,
                        };
                        updateState({
                            activeRules,
                        });
                    })}
                ></${VirGameRuleList}>
                <${ViraButton.assign({
                    buttonSize: ViraSize.Large,
                    color: ViraColorVariant.Neutral,
                    text: 'Play',
                })}
                    ${nav(navController, {
                        height: Infinity,
                        x: 1,
                        y: 0,
                        listeners: {
                            activate: ({enabled}) => {
                                if (enabled) {
                                    inputs.gameState.menuState = {
                                        isPaused: false,
                                        onMainMenu: false,
                                    };
                                }
                            },
                        },
                    })}
                ></${ViraButton}>
            </div>
        `;
    },
});
