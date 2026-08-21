import {defineAnthaMod} from '@antha/engine';
import {MenuNavBinding} from '@antha/input';
import {html} from 'element-vir';
import {type AsteroidsEngineState} from '../data/asteroids-game-state.js';
import {VirPauseMenu} from '../ui/elements/vir-pause-menu.element.js';

export const pauseMenuMod = defineAnthaMod<AsteroidsEngineState>({
    modName: 'pause-menu',
    initState: {
        isPaused: false,
    },
    execute({state}) {
        if (!state.isPaused) {
            Object.values(state.activeBindings || {}).forEach((bindings) => {
                const openPauseMenuBinding = bindings[MenuNavBinding.OpenPauseMenu];

                if (openPauseMenuBinding && !openPauseMenuBinding.actCount) {
                    openPauseMenuBinding.actCount = 1;
                    state.isPaused = true;
                }
            });
        }

        state.isInMenu = !!state.isPaused;

        return html`
            <${VirPauseMenu.assign({
                gameState: state,
            })}></${VirPauseMenu}>
        `;
    },
});
