import {defineElement, html} from 'element-vir';
import {allGameRules} from '../../data/rules.js';
import {VirGameRule} from './vir-game-rule.element.js';

export const VirRuleDebug = defineElement()({
    tagName: 'vir-rule-debug',
    render() {
        return html`
            <ol>
                ${allGameRules
                    .toSorted((firstRule, secondRule) => {
                        return firstRule.ruleTitle.localeCompare(secondRule.ruleTitle);
                    })
                    .map((rule) => {
                        return html`
                            <li>
                                <${VirGameRule.assign({
                                    rule,
                                })}></${VirGameRule}>
                            </li>
                        `;
                    })}
            </ol>
        `;
    },
});
