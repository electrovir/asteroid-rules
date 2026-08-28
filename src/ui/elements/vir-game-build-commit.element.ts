import {css, defineElement, html} from 'element-vir';
import {viraTheme} from 'vira';
import {readInjectedViteData} from '../../data/global-vite-data.js';
import {GameZIndex} from '../../data/z-index.js';

const buildCommitHash = readInjectedViteData().commitHash;

export const VirGameBuildCommit = defineElement()({
    tagName: 'vir-game-build-commit',
    styles: css`
        :host {
            bottom: 8px;
            color: ${viraTheme.colors['theme-default'].foreground.value};
            display: block;
            font-size: 10px;
            left: 8px;
            opacity: 0.35;
            pointer-events: none;
            position: fixed;
            z-index: ${GameZIndex.BuildCommit};
        }
    `,
    render() {
        return html`
            ${buildCommitHash}
        `;
    },
});
