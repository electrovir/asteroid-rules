import {defineAnthaMod} from '@antha/engine';
import {html} from 'element-vir';
import {type AsteroidsEngineState} from '../data/asteroids-game-state.js';
import {VirMainMenu} from '../ui/elements/vir-main-menu.element.js';

export const mainMenuMod = defineAnthaMod<AsteroidsEngineState>({
    modName: 'main-menu',
    execute({state}) {
        state.isInMenu = !!state.menuState?.isPaused || !!state.menuState?.onMainMenu;

        return html`
            <${VirMainMenu.assign({
                gameState: state,
            })}></${VirMainMenu}>
        `;
    },
});
