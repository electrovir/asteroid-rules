import {css, defineElement, html, listen, nothing} from 'element-vir';
import {noUserSelect, viraTheme, ViraThemeClient, ViraThemeSelection} from 'vira';
import {readInjectedViteData} from '../../data/global-vite-data.js';
import {defaultFrontendRoute} from '../../data/routing/frontend-route.js';
import {createFrontendRouter} from '../../data/routing/frontend-router.js';
import {VirGame} from './vir-game.element.js';

const buildCommitHash = readInjectedViteData().commitHash;

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

        .build-commit {
            bottom: 8px;
            color: ${viraTheme.colors['theme-default'].foreground.value};
            font-size: 10px;
            left: 8px;
            opacity: 0.35;
            pointer-events: none;
            position: fixed;
            z-index: 2;
        }
    `,
    state() {
        const themeClient = new ViraThemeClient();
        themeClient.setSelectedTheme(ViraThemeSelection.Dark);

        return {
            currentRoute: defaultFrontendRoute,
            hasRenderedGameLoadingScreen: false,
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
    render({state, updateState}) {
        return html`
            <${VirGame.assign({
                router: state.router,
            })}
                ${listen(VirGame.events.loadingScreenRendered, () => {
                    updateState({
                        hasRenderedGameLoadingScreen: true,
                    });
                })}
            ></${VirGame}>
            ${state.hasRenderedGameLoadingScreen
                ? nothing
                : html`
                      <slot></slot>
                  `}
            <span class="build-commit">${buildCommitHash}</span>
        `;
    },
});
