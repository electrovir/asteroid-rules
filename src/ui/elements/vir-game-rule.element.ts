import {colorCss} from '@electrovir/color';
import {css, defineElement, html} from 'element-vir';
import {noNativeSpacing, ViraIcon, viraTheme} from 'vira';
import {type GameRule} from '../../data/game-rule.js';
import {virGameButtonStyles} from './vir-game-button.element.js';

export const VirGameRule = defineElement<{
    isNew: boolean;
    isUnaffordable: boolean;
    rule: Readonly<GameRule>;
    isActive: boolean;
}>()({
    tagName: 'vir-game-rule',
    hostClasses: {
        'vir-game-rule-active': ({inputs}) => inputs.isActive,
        'vir-game-rule-new': ({inputs}) => inputs.isNew,
        'vir-game-rule-unaffordable': ({inputs}) => inputs.isUnaffordable,
    },
    styles({hostClasses}) {
        return css`
            :host {
                width: 640px;
                max-width: 100%;
                box-sizing: border-box;
                display: flex;
                outline: none;
            }

            @keyframes vir-game-rule-new-glow {
                from {
                    box-shadow:
                        inset 0 0 3px 1px
                            ${viraTheme.colors['vira-blue-foreground-non-body'].foreground.value},
                        0 0 5px 1px
                            ${viraTheme.colors['vira-blue-foreground-non-body'].foreground.value};
                }

                to {
                    box-shadow:
                        inset 0 0 12px 3px
                            ${viraTheme.colors['vira-blue-foreground-non-body'].foreground.value},
                        0 0 10px 3px
                            ${viraTheme.colors['vira-blue-foreground-non-body'].foreground.value};
                }
            }

            ${virGameButtonStyles({
                navStateSelector: ':host',
                selector: '.wrapper',
            })}

            .wrapper {
                flex-grow: 1;
                gap: 8px;
                justify-content: flex-start;
                padding-right: 16px;
                text-align: left;
                display: flex;
                ${colorCss(viraTheme.colors['vira-grey-foreground-header'])}
            }

            ${hostClasses['vir-game-rule-active'].selector} .wrapper {
                ${colorCss(viraTheme.colors['vira-green-behind-fg-small-body'])}
            }

            ${hostClasses['vir-game-rule-unaffordable'].selector} .wrapper {
                color: ${viraTheme.colors['vira-grey-foreground-body'].foreground.value};
                background-color: ${viraTheme.colors['vira-red-behind-fg-small-body'].background
                    .value};
            }

            ${hostClasses['vir-game-rule-new'].selector} .wrapper {
                animation: vir-game-rule-new-glow 700ms ease-in infinite alternate;
                border-color: ${viraTheme.colors['vira-blue-foreground-non-body'].foreground.value};
            }

            .text {
                display: flex;
                gap: 8px;
                flex-direction: column;
                flex-grow: 1;
            }

            .cost {
                align-self: center;
            }

            h2,
            p {
                ${noNativeSpacing}
            }

            h2 {
                font-size: 24px;
            }

            p {
                font-size: 16px;
                font-weight: 400;
            }
        `;
    },
    render({inputs}) {
        return html`
            <div class="wrapper">
                <${ViraIcon.assign({
                    icon: inputs.rule.icon,
                    fitContainer: true,
                })}></${ViraIcon}>
                <div class="text">
                    <h2>${inputs.rule.ruleTitle}</h2>
                    <p>${inputs.rule.description}</p>
                </div>
                <span class="cost">${inputs.rule.cost}</span>
            </div>
        `;
    },
});
