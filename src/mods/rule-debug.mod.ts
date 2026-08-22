import {defineAnthaMod} from '@antha/engine';
import {html, nothing} from 'element-vir';
import {routeHasPaths} from 'spa-router-vir';
import {type AsteroidsEngineState} from '../data/game-state.js';
import {frontendPathTree} from '../data/routing/frontend-path-tree.js';
import {type FrontendRouter} from '../data/routing/frontend-router.js';
import {VirRuleDebug} from '../ui/elements/vir-rule-debug.element.js';

export function isOnDebugPage(router: FrontendRouter | undefined): boolean {
    return (
        !!router &&
        routeHasPaths(
            router.readCurrentRoute(),
            frontendPathTree.paths.children.debug.children.rules,
            {
                exactMatch: true,
            },
        )
    );
}

export const ruleDebugMod = defineAnthaMod<AsteroidsEngineState>({
    modName: 'rule-debug',
    execute({state}) {
        if (!isOnDebugPage(state.router)) {
            return nothing;
        }

        state.isInMenu = true;

        return html`
            <${VirRuleDebug.assign({
                gameState: state,
            })}></${VirRuleDebug}>
        `;
    },
});
