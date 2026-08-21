import {defineAnthaMod, SkipExecution} from '@antha/engine';
import {type AnthaEntity2dModState} from '@antha/entity-2d';
import {PlayerPosition, type AsteroidsGameState} from '../data/asteroids-game-state.js';
import {PlayerEntity} from '../entities/player.entity.js';

export type AsteroidsEngineState = AnthaEntity2dModState<AsteroidsGameState>;

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
