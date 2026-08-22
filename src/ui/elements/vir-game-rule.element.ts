import {css, defineElement, html} from 'element-vir';
import {themeDefaultKey} from 'theme-vir/dist/color-theme/color-theme.js';
import {noNativeSpacing, ViraIcon, viraTheme} from 'vira';
import {type GameRule} from '../../data/game-rule.js';

export const VirGameRule = defineElement<{
    rule: Readonly<GameRule>;
    isActive: boolean;
}>()({
    tagName: 'vir-game-rule',
    hostClasses: {
        'vir-game-rule-active': ({inputs}) => inputs.isActive,
    },
    styles({hostClasses}) {
        return css`
            :host {
                display: flex;
                border: 1px solid currentColor;
                border-radius: 8px;
                padding: 4px 8px;
                gap: 8px;
                background-color: ${viraTheme.colors[themeDefaultKey].background.value};
            }

            ${hostClasses['vir-game-rule-active'].selector} {
                opacity: 1;
                background-color: ${viraTheme.colors['vira-green-behind-fg-non-body'].background
                    .value};
            }

            .text {
                display: flex;
                gap: 8px;
                flex-direction: column;
            }

            h2,
            p {
                ${noNativeSpacing}
            }
        `;
    },
    render({inputs}) {
        return html`
            <${ViraIcon.assign({
                icon: inputs.rule.icon,
                fitContainer: true,
            })}></${ViraIcon}>
            <div class="text">
                <h2>${inputs.rule.ruleTitle}</h2>
                <p>${inputs.rule.description}</p>
            </div>
        `;
    },
});
