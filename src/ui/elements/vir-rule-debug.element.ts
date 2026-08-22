import {nav} from '@antha/input';
import {css, defineElement, html, nothing, testId} from 'element-vir';
import {type AsteroidsGameEngineState, updateMenuState} from '../../data/game-state.js';
import {allGameRules} from '../../data/rules.js';
import {VirGameButton} from './vir-game-button.element.js';
import {VirGameRuleList} from './vir-game-rule-list.element.js';

export const VirRuleDebug = defineElement<{
    gameState: Partial<AsteroidsGameEngineState>;
}>()({
    tagName: 'vir-rule-debug',
    testIds: [
        'clearSaveStateButton',
        'resumeButton',
        'unlockAllRulesButton',
    ],
    styles: css`
        :host {
            box-sizing: border-box;
            display: flex;
            flex-grow: 1;
            height: 100%;
            padding: 32px;
            width: 100%;
        }

        .menu-options {
            align-items: flex-start;
            display: flex;
            gap: 16px;
            max-width: 100%;
        }

        .debug-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
    `,
    cleanup({inputs}) {
        inputs.gameState.navController?.queueDefaultFocus(true);
    },
    render({inputs, testIds}) {
        const navController = inputs.gameState.navController;
        const router = inputs.gameState.router;

        if (!navController || !router) {
            return nothing;
        }

        return html`
            <div class="menu-options">
                <div class="debug-actions">
                    <${VirGameButton}
                        ${testId(testIds.clearSaveStateButton)}
                        ${nav(navController, {
                            height: Infinity,
                            x: 0,
                            y: 0,
                            listeners: {
                                activate: ({enabled}) => {
                                    if (enabled) {
                                        inputs.gameState.saveState = undefined;
                                    }
                                },
                            },
                        })}
                    >
                        Clear Save State
                    </${VirGameButton}>
                    <${VirGameButton}
                        ${testId(testIds.unlockAllRulesButton)}
                        ${nav(navController, {
                            height: Infinity,
                            x: 0,
                            y: 1,
                            listeners: {
                                activate: ({enabled}) => {
                                    if (enabled && inputs.gameState.saveState) {
                                        inputs.gameState.saveState = {
                                            ...inputs.gameState.saveState,
                                            unlockedGameRules: allGameRules,
                                        };
                                    }
                                },
                            },
                        })}
                    >
                        Unlock All Rules
                    </${VirGameButton}>
                </div>
                <${VirGameRuleList.assign({
                    gameState: inputs.gameState,
                    navX: 1,
                    showAllRules: true,
                })}></${VirGameRuleList}>
                <${VirGameButton}
                    ${testId(testIds.resumeButton)}
                    ${nav(navController, {
                        height: Infinity,
                        x: 2,
                        y: 0,
                        listeners: {
                            activate: ({enabled}) => {
                                if (enabled) {
                                    updateMenuState(inputs.gameState, undefined);
                                    router.setRoute({
                                        paths: [],
                                    });
                                }
                            },
                        },
                    })}
                >
                    Resume
                </${VirGameButton}>
            </div>
        `;
    },
});
