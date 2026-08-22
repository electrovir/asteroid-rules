import {nav} from '@antha/input';
import {listenToObject} from '@antha/util';
import {type EmptyFunction} from '@augment-vir/common';
import {css, defineElement, html, listen, nothing} from 'element-vir';
import {ViraButton, ViraColorVariant, ViraSize} from 'vira';
import {createGameModifiers, type GameRule, toggleGameRule} from '../../data/game-rule.js';
import {type AsteroidsEngineState, type AsteroidsGameState} from '../../data/game-state.js';
import {allGameRules} from '../../data/rules.js';
import {GameZIndex} from '../../data/z-index.js';
import {VirGameRuleList} from './vir-game-rule-list.element.js';

export const VirRuleDebug = defineElement<{
    gameState: Partial<AsteroidsEngineState>;
}>()({
    tagName: 'vir-rule-debug',
    styles: css`
        :host {
            backdrop-filter: blur(3px);
            background: rgba(0, 0, 0, 0.6);
            box-sizing: border-box;
            display: flex;
            inset: 0;
            padding: 32px;
            position: fixed;
            z-index: ${GameZIndex.Menu};
        }

        .menu-options {
            align-items: flex-start;
            display: flex;
            gap: 16px;
            max-width: 100%;
        }
    `,
    state(): {
        activeRules: GameRule[];
        cleanup: EmptyFunction | undefined;
    } {
        return {
            activeRules: [] as GameRule[],
            cleanup: undefined,
        };
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

        updateSaveState(inputs.gameState.saveState);
        updateState({
            cleanup: listenToObject(inputs.gameState, 'saveState', updateSaveState),
        });
    },
    cleanup({inputs, state}) {
        state.cleanup?.();
        inputs.gameState.navController?.queueDefaultFocus(true);
    },
    render({inputs, state, updateState}) {
        const saveState = inputs.gameState.saveState;
        const navController = inputs.gameState.navController;
        const router = inputs.gameState.router;

        if (!saveState || !navController || !router) {
            return nothing;
        }

        return html`
            <div class="menu-options">
                <${VirGameRuleList.assign({
                    activeRules: state.activeRules,
                    availableRules: allGameRules,
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
                        inputs.gameState.missionState = inputs.gameState.missionState
                            ? {
                                  ...inputs.gameState.missionState,
                                  modifiers: createGameModifiers(activeRules),
                              }
                            : undefined;
                        updateState({
                            activeRules,
                        });
                    })}
                ></${VirGameRuleList}>
                <${ViraButton.assign({
                    buttonSize: ViraSize.Large,
                    color: ViraColorVariant.Neutral,
                    text: 'Resume',
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
                                        onMainMenu: !!inputs.gameState.menuState?.onMainMenu,
                                    };
                                    router.setRoute({
                                        paths: [],
                                    });
                                }
                            },
                        },
                    })}
                ></${ViraButton}>
            </div>
        `;
    },
});
