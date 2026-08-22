import {nav} from '@antha/input';
import {css, defineElement, html, nothing, testId} from 'element-vir';
import {ViraButton, ViraColorVariant, ViraSize} from 'vira';
import {type AsteroidsEngineState} from '../../data/game-state.js';
import {GameZIndex} from '../../data/z-index.js';
import {VirGameRuleList} from './vir-game-rule-list.element.js';

export const VirRuleDebug = defineElement<{
    gameState: Partial<AsteroidsEngineState>;
}>()({
    tagName: 'vir-rule-debug',
    testIds: [
        'clearSaveStateButton',
        'resumeButton',
    ],
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
                <${ViraButton.assign({
                    buttonSize: ViraSize.Large,
                    color: ViraColorVariant.Neutral,
                    text: 'Clear Save State',
                })}
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
                ></${ViraButton}>
                <${VirGameRuleList.assign({
                    gameState: inputs.gameState,
                    navX: 1,
                    showAllRules: true,
                })}></${VirGameRuleList}>
                <${ViraButton.assign({
                    buttonSize: ViraSize.Large,
                    color: ViraColorVariant.Neutral,
                    text: 'Resume',
                })}
                    ${testId(testIds.resumeButton)}
                    ${nav(navController, {
                        height: Infinity,
                        x: 2,
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
