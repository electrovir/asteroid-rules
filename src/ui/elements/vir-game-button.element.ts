import {colorCss} from '@electrovir/color';
import {navAttribute, NavValue} from 'device-navigation';
import {css, defineElement, html} from 'element-vir';
import {themeDefaultKey} from 'theme-vir';
import {viraTheme} from 'vira';

export const virGameButtonStyles = css`
    :host {
        align-items: center;
        text-align: center;
        justify-content: center;
        ${colorCss(viraTheme.colors[themeDefaultKey])}
        border: 1px solid currentColor;
        border-radius: 8px;
        box-sizing: border-box;
        display: flex;
        font-size: 24px;
        font-weight: 700;
        margin: 3px;
        padding: 4px 8px;
        outline: none;
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
        outline: none;
        border: 4px solid ${viraTheme.colors['vira-blue-foreground-non-body'].foreground.value};
        margin: 0;
    }
`;

export const VirGameButton = defineElement()({
    tagName: 'vir-game-button',
    styles: virGameButtonStyles,
    render() {
        return html`
            <slot></slot>
        `;
    },
});
