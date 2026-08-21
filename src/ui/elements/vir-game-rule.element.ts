import {css, defineElement, html} from 'element-vir';
import {ViraIcon} from 'vira';
import {type GameRule} from '../../data/game-rule.js';

export const VirGameRule = defineElement<{
    rule: Readonly<GameRule>;
}>()({
    tagName: 'vir-game-rule',
    styles: css`
        :host {
            color: white;
            display: block;
        }

        .rule-header {
            align-items: center;
            display: flex;
            gap: 8px;
        }

        ${ViraIcon} {
            height: 24px;
            width: 24px;
        }

        & h2,
        & p {
            margin: 0;
        }

        & p {
            margin-top: 4px;
        }
    `,
    render({inputs}) {
        return html`
            <div>
                <div class="rule-header">
                    <${ViraIcon.assign({
                        icon: inputs.rule.icon,
                        fitContainer: true,
                    })}></${ViraIcon}>
                    <h2>${inputs.rule.ruleTitle}</h2>
                </div>
                <p>${inputs.rule.description}</p>
            </div>
        `;
    },
});
