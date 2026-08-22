import {defineAnthaMod} from '@antha/engine';
import {MenuNavBinding} from '@antha/input';
import {html} from 'element-vir';
import {type AsteroidsEngineState} from '../data/game-state.js';
import {VirPauseMenu} from '../ui/elements/vir-pause-menu.element.js';

export const pauseMenuMod = defineAnthaMod<AsteroidsEngineState>({
    modName: 'pause-menu',
    execute({state}) {
        const shouldPause =
            !!state.missionState &&
            !state.menuState?.isPaused &&
            Object.values(state.activeBindings || {}).reduce((hasPauseRequest, bindings) => {
                const openPauseMenuBinding = bindings[MenuNavBinding.OpenPauseMenu];

                if (openPauseMenuBinding && !openPauseMenuBinding.actCount) {
                    openPauseMenuBinding.actCount = 1;
                    return true;
                }

                return hasPauseRequest;
            }, false);

        if (shouldPause) {
            state.menuState = {
                isPaused: true,
                onMainMenu: !!state.menuState?.onMainMenu,
            };
        }

        state.isInMenu = !!state.menuState?.isPaused;

        return html`
            <${VirPauseMenu.assign({
                gameState: state,
            })}></${VirPauseMenu}>
        `;
    },
});
