import {css, defineElement, html, listen} from 'element-vir';
import {noNativeSpacing} from 'vira';
import {type GameRule} from '../../data/game-rule.js';
import {allGameRules} from '../../data/rules.js';
import {VirGameRule} from './vir-game-rule.element.js';

export const VirRuleDebug = defineElement()({
    tagName: 'vir-rule-debug',
    styles: css`
        :host {
            display: inline-flex;
            padding: 32px;
        }
        ol {
            display: flex;
            flex-direction: column;
        }

        ol,
        li {
            list-style: none;
            ${noNativeSpacing}
        }
    `,
    state() {
        return {
            activeRules: [] as GameRule[],
        };
    },
    render({state, updateState}) {
        return html`
            <ol>
                ${allGameRules
                    .toSorted((firstRule, secondRule) => {
                        return firstRule.ruleTitle.localeCompare(secondRule.ruleTitle);
                    })
                    .map((rule) => {
                        const isActive = state.activeRules.includes(rule);

                        return html`
                            <li>
                                <${VirGameRule.assign({
                                    rule,
                                    isActive,
                                })}
                                    ${listen('click', () => {
                                        if (isActive) {
                                            updateState({
                                                activeRules: state.activeRules.filter(
                                                    (innerRule) => innerRule === rule,
                                                ),
                                            });
                                        } else {
                                            updateState({
                                                activeRules: state.activeRules.concat(rule),
                                            });
                                        }
                                    })}
                                ></${VirGameRule}>
                            </li>
                        `;
                    })}
            </ol>
        `;
    },
});
