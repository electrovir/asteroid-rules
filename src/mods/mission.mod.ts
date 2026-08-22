import {defineAnthaMod} from '@antha/engine';
import {html, nothing} from 'element-vir';
import {type AsteroidsEngineState} from '../data/game-state.js';
import {isPrimaryMouseButtonHeld} from '../data/player-movement.js';
import {VirMissionHud} from '../ui/elements/vir-mission-hud.element.js';
import {ensureGameMission} from './game-mission.js';

export const missionMod = defineAnthaMod<AsteroidsEngineState>({
    initState: {
        isMouseMovementAllowed: false,
    },
    modName: 'mission',
    async execute({state}) {
        state.isMouseMovementAllowed = state.isInMenu
            ? false
            : /** Don't allow player movement until after the mouse button has been lifted _after_ exiting a menu. */
              !isPrimaryMouseButtonHeld(state.rawInputs) || state.isMouseMovementAllowed || false;

        if (state.saveState && !state.missionState && !state.menuState?.onMainMenu) {
            await ensureGameMission({
                gameState: state,
            });
        }

        if (!state.saveState || !state.missionState) {
            return nothing;
        }

        return html`
            <${VirMissionHud.assign({
                playerLevel: state.saveState.playerLevel,
                playerLevelExperience: state.saveState.playerLevelExperience,
            })}></${VirMissionHud}>
        `;
    },
});
