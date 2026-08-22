import {nav} from '@antha/input';
import {listenToObject} from '@antha/util';
import {type EmptyFunction} from '@augment-vir/common';
import {css, defineElement, html, nothing} from 'element-vir';
import {themeDefaultKey} from 'theme-vir';
import {noNativeSpacing, ViraButton, ViraColorVariant, ViraSize, viraTheme} from 'vira';
import {
    PlayerPosition,
    type AsteroidsEngineState,
    type AsteroidsGameState,
} from '../../data/asteroids-game-state.js';
import {createGameModifiers, toggleGameRule, type GameRule} from '../../data/game-rule.js';
import {PlayerEntity} from '../../entities/player.entity.js';
import {VirGameRule} from './vir-game-rule.element.js';

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
                z-index: 1;
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

            .rules {
                display: flex;
                flex-grow: 1;
                flex-direction: column;
                gap: 8px;
                max-height: calc(100dvh - 128px);
                max-width: 640px;
                overflow-y: auto;
                width: 100%;
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
        const navController = inputs.gameState.navController;
        const unlockedGameRules = inputs.gameState.saveState?.unlockedGameRules || [];

        if (!state.showMainMenu || !navController) {
            return nothing;
        }

        return html`
            <h1>Rules</h1>
            <div class="menu-options">
                <div class="rules">
                    ${unlockedGameRules.map((rule, ruleIndex) => {
                        const isActive = state.activeRules.includes(rule);

                        return html`
                            <${VirGameRule.assign({
                                isActive,
                                rule,
                            })}
                                ${nav(navController, {
                                    x: 0,
                                    y: ruleIndex,
                                    listeners: {
                                        activate: ({enabled}) => {
                                            if (enabled) {
                                                const activeRules = toggleGameRule({
                                                    activeRules: state.activeRules,
                                                    rule,
                                                });

                                                inputs.gameState.saveState = {
                                                    activeRules,
                                                    unlockedGameRules:
                                                        inputs.gameState.saveState
                                                            ?.unlockedGameRules || [],
                                                };
                                                updateState({
                                                    activeRules,
                                                });
                                            }
                                        },
                                    },
                                })}
                            ></${VirGameRule}>
                        `;
                    })}
                </div>
                <${ViraButton.assign({
                    buttonSize: ViraSize.Large,
                    color: ViraColorVariant.Neutral,
                    text: 'Play',
                })}
                    ${nav(navController, {
                        x: 1,
                        y: 0,
                        listeners: {
                            activate: async ({enabled}) => {
                                const pixiApplication = inputs.gameState.pixi?.pixiApplication;

                                if (enabled && inputs.gameState.entityStore && pixiApplication) {
                                    inputs.gameState.missionState = {
                                        modifiers: createGameModifiers(
                                            inputs.gameState.saveState?.activeRules || [],
                                        ),
                                        players: {
                                            [PlayerPosition['1']]:
                                                await inputs.gameState.entityStore.addEntity(
                                                    PlayerEntity,
                                                    {
                                                        inputPlayerPosition: PlayerPosition['1'],
                                                        x: pixiApplication.screen.width / 2,
                                                        y: pixiApplication.screen.height / 2,
                                                    },
                                                ),
                                        },
                                    };
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
