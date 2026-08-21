import {defineAnthaMod, SkipExecution} from '@antha/engine';
import {type AsteroidsEngineState, PlayerPosition} from '../data/asteroids-game-state.js';
import {PlayerEntity} from '../entities/player.entity.js';

export const asteroidsGameMod = defineAnthaMod<AsteroidsEngineState>({
    modName: 'asteroids-game',
    async execute({state}) {
        if (!state.entityStore) {
            return SkipExecution;
        }

        if (!state.players?.[PlayerPosition['1']]) {
            state.players = {
                [PlayerPosition['1']]: await state.entityStore.addEntity(PlayerEntity),
            };
        }

        return undefined;
    },
});
