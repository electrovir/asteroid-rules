import {nav} from '@antha/input';
import {css, defineElement, html, nothing} from 'element-vir';
import {noNativeSpacing} from 'vira';
import {updateMenuState, type AsteroidsGameEngineState} from '../../data/game-state.js';
import {VirGameButton} from './vir-game-button.element.js';
import {VirGameRuleList} from './vir-game-rule-list.element.js';

export const VirRuleUnlockMenu = defineElement<{
    gameState: Partial<AsteroidsGameEngineState>;
}>()({
    tagName: 'vir-rule-unlock-menu',
    styles: css`
        :host {
            align-items: center;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            gap: 24px;
            height: 100%;
            justify-content: center;
            padding: 32px;
            width: 100%;
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
    `,
    render({inputs}) {
        const navController = inputs.gameState.navController;

        if (!navController) {
            return nothing;
        }

        return html`
            <h1>
                Rule${(inputs.gameState.saveState?.newGameRules.length || 0) === 1 ? '' : 's'}
                Unlocked
            </h1>
            <div class="menu-options">
                <${VirGameRuleList.assign({
                    gameState: inputs.gameState,
                })}></${VirGameRuleList}>
                <${VirGameButton}
                    ${nav(navController, {
                        autoFocus: true,
                        height: Infinity,
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
                    Resume
                </${VirGameButton}>
            </div>
        `;
    },
});
