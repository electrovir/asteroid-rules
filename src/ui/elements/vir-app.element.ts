import {css, defineElement, html} from 'element-vir';
import {noUserSelect, viraTheme, ViraThemeClient, ViraThemeSelection} from 'vira';
import {defaultFrontendRoute} from '../../data/routing/frontend-route.js';
import {createFrontendRouter} from '../../data/routing/frontend-router.js';
import {VirGame} from './vir-game.element.js';

export const VirApp = defineElement()({
    tagName: 'vir-app',
    styles: css`
        :host {
            color: ${viraTheme.colors['theme-default'].foreground.value};
            display: block;
            height: 100%;
            width: 100%;
            font-family: sans-serif;
            ${noUserSelect}
        }
    `,
    state() {
        const themeClient = new ViraThemeClient();
        themeClient.setSelectedTheme(ViraThemeSelection.Dark);

        return {
            currentRoute: defaultFrontendRoute,
            router: createFrontendRouter(),
            themeClient,
        };
    },
    init({state, updateState}) {
        state.router.listen(true, (currentRoute) => {
            updateState({
                currentRoute,
            });
        });
    },
    cleanup({state}) {
        state.router.destroy();
        state.themeClient.destroy();
    },
    render({state}) {
        return html`
            <${VirGame.assign({
                router: state.router,
            })}></${VirGame}>
        `;
    },
});
