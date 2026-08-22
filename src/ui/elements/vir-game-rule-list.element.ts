import {nav} from '@antha/input';
import {listenToObject} from '@antha/util';
import {type EmptyFunction} from '@augment-vir/common';
import {css, defineElement, html, nothing} from 'element-vir';
import {calculateGameRulePoolCost, toggleGameRule, type GameRule} from '../../data/game-rule.js';
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
            padding: 16px;
            width: 100%;
        }

        .rule-pool {
            font-size: 18px;
            font-weight: 700;
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
        function activateRule(this: void, rule: GameRule) {
            const saveState = inputs.gameState.saveState;

            if (!saveState) {
                return;
            }

            const updatedSaveState = updateAsteroidsSaveStateRules({
                activeRules: toggleGameRule({
                    activeRules: saveState.activeRules,
                    maximumRulePool: saveState.playerLevel,
                    rule,
                }),
                saveState,
            });
            inputs.gameState.saveState = updatedSaveState;
            host.requestUpdate();
        }

        const saveState = inputs.gameState.saveState;
        const activeRules = saveState?.activeRules || [];
        const activeRulePoolCost = calculateGameRulePoolCost(activeRules);
        const availableRules = inputs.showAllRules
            ? allGameRules
            : saveState?.unlockedGameRules || [];
        const navController = inputs.gameState.navController;

        if (!navController || !saveState) {
            return nothing;
        }

        return html`
            <div class="rule-pool">${activeRulePoolCost} / ${saveState.playerLevel}</div>
            ${availableRules
                .toSorted((a, b) => {
                    return saveState.newGameRules.includes(a) === saveState.newGameRules.includes(b)
                        ? a.ruleTitle.localeCompare(b.ruleTitle)
                        : saveState.newGameRules.includes(a)
                          ? -1
                          : 1;
                })
                .map((rule, ruleIndex) => {
                    return html`
                        <${VirGameRule.assign({
                            isActive: activeRules.includes(rule),
                            isNew: saveState.newGameRules.includes(rule),
                            isUnaffordable:
                                !activeRules.includes(rule) &&
                                activeRulePoolCost + rule.cost > saveState.playerLevel,
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
                })}
        `;
    },
});
