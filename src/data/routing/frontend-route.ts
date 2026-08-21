import {type FullSpaRoute} from 'spa-router-vir';
import {frontendPathTree} from './frontend-path-tree.js';

export type FrontendPaths = Readonly<typeof frontendPathTree.PathsType>;
export type FrontendRoute = Readonly<FullSpaRoute<FrontendPaths, undefined, undefined>>;

export const defaultFrontendRoute: FrontendRoute = {
    hash: undefined,
    paths: frontendPathTree.paths.fullPaths,
    search: undefined,
};
