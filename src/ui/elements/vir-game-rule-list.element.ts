import {nav} from '@antha/input';
import {listenToObject} from '@antha/util';
import {type EmptyFunction} from '@augment-vir/common';
import {css, defineElement, html, nothing} from 'element-vir';
import {toggleGameRule, type GameRule} from '../../data/game-rule.js';
import {
    updateAsteroidsSaveStateRules,
    type AsteroidsGameEngineState,
} from '../../data/game-state.js';
import {allGameRules} from '../../data/rules.js';
import {VirGameRule} from './vir-game-rule.element.js';

export const VirGameRuleList = defineElement<{
    gameState: Partial<AsteroidsGameEngineState>;
    navX?: number | undefined;
    showAllRules?: boolean | undefined;
}>()({
    tagName: 'vir-game-rule-list',
    styles: css`
        :host {
            display: flex;
            flex-grow: 1;
            flex-direction: column;
            gap: 8px;
            max-height: calc(100dvh - 128px);
            max-width: 640px;
            overflow-y: auto;
            width: 100%;
        }
    `,
    state() {
        return {
            cleanup: undefined as EmptyFunction | undefined,
        };
    },
    init({host, inputs, updateState}) {
        updateState({
            cleanup: listenToObject(inputs.gameState, 'saveState', () => {
                host.requestUpdate();
            }),
        });
    },
    cleanup({state}) {
        state.cleanup?.();
    },
    render({host, inputs}) {
        function activateRule(this: void, rule: Readonly<GameRule>) {
            const saveState = inputs.gameState.saveState;

            if (!saveState) {
                return;
            }

            inputs.gameState.saveState = updateAsteroidsSaveStateRules({
                activeRules: toggleGameRule({
                    activeRules: saveState.activeRules,
                    rule,
                }),
                saveState,
            });
            host.requestUpdate();
        }

        const saveState = inputs.gameState.saveState;
        const activeRules = saveState?.activeRules || [];
        const availableRules = inputs.showAllRules
            ? allGameRules
            : saveState?.unlockedGameRules || [];
        const navController = inputs.gameState.navController;

        if (!navController) {
            return nothing;
        }

        return availableRules
            .toSorted((firstRule, secondRule) => {
                return firstRule.ruleTitle.localeCompare(secondRule.ruleTitle);
            })
            .map((rule, ruleIndex) => {
                return html`
                    <${VirGameRule.assign({
                        isActive: activeRules.includes(rule),
                        rule,
                    })}
                        ${nav(navController, {
                            x: inputs.navX ?? 0,
                            y: ruleIndex,
                            listeners: {
                                activate: ({enabled}) => {
                                    if (enabled) {
                                        activateRule(rule);
                                    }
                                },
                            },
                        })}
                    ></${VirGameRule}>
                `;
            });
    },
});
