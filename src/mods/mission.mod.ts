import {defineAnthaMod} from '@antha/engine';
import {type AsteroidsEngineState} from '../data/game-state.js';
import {ensureGameMission} from './game-mission.js';

export const missionMod = defineAnthaMod<AsteroidsEngineState>({
    modName: 'mission',
    async execute({state}) {
        if (state.saveState && !state.missionState) {
            await ensureGameMission({
                gameState: state,
            });
        }
    },
});
