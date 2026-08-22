import {css, defineElement, html} from 'element-vir';
import {GameZIndex} from '../../data/z-index.js';

export const VirMenuBackground = defineElement()({
    tagName: 'vir-menu-background',
    styles: css`
        :host {
            backdrop-filter: blur(3px);
            background: rgba(0, 0, 0, 0.4);
            box-sizing: border-box;
            display: flex;
            inset: 0;
            position: fixed;
            z-index: ${GameZIndex.Menu};
        }
    `,
    render() {
        return html`
            <slot></slot>
        `;
    },
});
