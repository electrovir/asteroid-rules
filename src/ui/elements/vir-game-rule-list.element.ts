import {nav, type NavController} from '@antha/input';
import {css, defineElement, defineElementEvent, html, listen} from 'element-vir';
import {type GameRule} from '../../data/game-rule.js';
import {VirGameRule} from './vir-game-rule.element.js';

export const VirGameRuleList = defineElement<{
    activeRules: ReadonlyArray<Readonly<GameRule>>;
    availableRules: ReadonlyArray<Readonly<GameRule>>;
    navController?: NavController | undefined;
}>()({
    tagName: 'vir-game-rule-list',
    events: {
        ruleActivated: defineElementEvent<Readonly<GameRule>>(),
    },
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
    render({dispatch, events, inputs}) {
        function activateRule(this: void, rule: Readonly<GameRule>) {
            dispatch(new events.ruleActivated(rule));
        }

        return inputs.availableRules
            .toSorted((firstRule, secondRule) => {
                return firstRule.ruleTitle.localeCompare(secondRule.ruleTitle);
            })
            .map((rule, ruleIndex) => {
                return html`
                    <${VirGameRule.assign({
                        isActive: inputs.activeRules.includes(rule),
                        rule,
                    })}
                        ${inputs.navController
                            ? nav(inputs.navController, {
                                  x: 0,
                                  y: ruleIndex,
                                  listeners: {
                                      activate: ({enabled}) => {
                                          if (enabled) {
                                              activateRule(rule);
                                          }
                                      },
                                  },
                              })
                            : listen('click', () => {
                                  activateRule(rule);
                              })}
                    ></${VirGameRule}>
                `;
            });
    },
});
