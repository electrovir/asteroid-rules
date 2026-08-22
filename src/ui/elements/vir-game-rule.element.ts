import {colorCss} from '@electrovir/color';
import {css, defineElement, html} from 'element-vir';
import {noNativeSpacing, ViraIcon, viraTheme} from 'vira';
import {type GameRule} from '../../data/game-rule.js';
import {virGameButtonStyles} from './vir-game-button.element.js';

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
                width: 640px;
                max-width: 100%;
                box-sizing: border-box;
                display: flex;
                outline: none;
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
                ${colorCss(viraTheme.colors['vira-green-behind-fg-non-body'])}
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
            </div>
        `;
    },
});
