import {navAttribute, NavValue} from 'device-navigation';
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
                margin: 3px;
                color: ${viraTheme.colors['vira-grey-foreground-non-body'].foreground.value};
                display: flex;
                border: 1px solid currentColor;
                border-radius: 8px;
                padding: 4px 8px;
                gap: 8px;
                background-color: ${viraTheme.colors[themeDefaultKey].background.value};
            }

            ${hostClasses['vir-game-rule-active'].selector} {
                color: inherit;
                background-color: ${viraTheme.colors['vira-green-behind-fg-non-body'].background
                    .value};
            }

            :host(
                    ${navAttribute.css({
                            navValue: NavValue.Focused,
                        })}
                ),
            :host(
                    ${navAttribute.css({
                            navValue: NavValue.Active,
                        })}
                ) {
                margin: 0;
                border: 4px solid
                    ${viraTheme.colors['vira-blue-foreground-non-body'].foreground.value};
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
