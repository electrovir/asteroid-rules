import {css, defineElement, html, nothing, type HtmlInterpolation} from 'element-vir';
import {getMappedPathTreeValue, mapPathTree} from 'spa-router-vir';
import {frontendPathTree} from '../../data/routing/frontend-path-tree.js';
import {defaultFrontendRoute} from '../../data/routing/frontend-route.js';
import {createFrontendRouter} from '../../data/routing/frontend-router.js';
import {VirGame} from './vir-game.element.js';
import {VirRuleDebug} from './vir-rule-debug.element.js';

const templatePathMap = mapPathTree<() => HtmlInterpolation>()(frontendPathTree.tree, {
    root: () => {
        return html`
            <${VirGame}></${VirGame}>
        `;
    },
    children: {
        debug: {
            children: {
                rules: {
                    root: () => {
                        return html`
                            <${VirRuleDebug}></${VirRuleDebug}>
                        `;
                    },
                },
            },
        },
    },
});

export const VirApp = defineElement()({
    tagName: 'vir-app',
    styles: css`
        :host {
            display: block;
            height: 100%;
            width: 100%;
            font-family: sans-serif;
        }
    `,
    state() {
        return {
            currentRoute: defaultFrontendRoute,
            router: createFrontendRouter(),
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
    },
    render({state}) {
        const templateCreator = getMappedPathTreeValue(state.currentRoute.paths, templatePathMap);

        if (!templateCreator) {
            state.router.setRoute({
                paths: [],
            });
            return nothing;
        }

        return templateCreator();
    },
});
