import {PathTree} from 'spa-router-vir';

export const frontendPathTree = new PathTree({
    allowBare: true,
    children: {
        debug: {
            allowBare: false,
            children: {
                rules: {},
            },
        },
    },
});
