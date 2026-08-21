import {SpaRouter, type FullSpaRoute} from 'spa-router-vir';
import {frontendPathTree} from './frontend-path-tree.js';
import {type FrontendPaths} from './frontend-route.js';

const githubPagesBasePath = 'asteroid-rules';

export type FrontendRouter = SpaRouter<FrontendPaths>;

export function createFrontendRouter() {
    return new SpaRouter<FrontendPaths>({
        basePath: githubPagesBasePath,
        sanitizeRoute(rawRoute: Readonly<FullSpaRoute>) {
            return {
                hash: undefined,
                paths: frontendPathTree.sanitizePaths(rawRoute.paths),
                search: undefined,
            };
        },
    });
}
