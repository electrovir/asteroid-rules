import {colorCss} from '@electrovir/color';
import {navAttribute, NavValue} from 'device-navigation';
import {css, defineElement, html, unsafeCSS} from 'element-vir';
import {themeDefaultKey} from 'theme-vir';
import {viraTheme} from 'vira';

export function virGameButtonStyles({
    navStateSelector,
    selector,
}: Readonly<{
    navStateSelector: string;
    selector: string;
}>) {
    const navContentSelector = navStateSelector === selector ? '' : ` ${selector}`;
    const navStateSelectorCss = unsafeCSS(navStateSelector);
    const navContentSelectorCss = unsafeCSS(navContentSelector);
    const selectorCss = unsafeCSS(selector);

    return css`
        ${selectorCss} {
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

        ${navStateSelectorCss}(
            ${navAttribute.css({
            navValue: NavValue.Focused,
        })}
        )${navContentSelectorCss},
    ${navStateSelectorCss}(
            ${navAttribute.css({
            navValue: NavValue.Active,
        })}
        )${navContentSelectorCss} {
            outline: none;
            border: 4px solid ${viraTheme.colors['vira-blue-foreground-non-body'].foreground.value};
            margin: 0;
        }
    `;
}

export const VirGameButton = defineElement()({
    tagName: 'vir-game-button',
    styles: css`
        ${virGameButtonStyles({
            navStateSelector: ':host',
            selector: ':host',
        })}

        :host {
            align-items: center;
            justify-content: center;
            text-align: center;
        }
    `,
    render() {
        return html`
            <slot></slot>
        `;
    },
});
