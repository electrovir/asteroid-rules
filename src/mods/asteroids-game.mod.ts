import {defineAnthaMod, SkipExecution} from '@antha/engine';
import {type AsteroidsEngineState, PlayerPosition} from '../data/asteroids-game-state.js';
import {PlayerEntity} from '../entities/player.entity.js';

export const asteroidsGameMod = defineAnthaMod<AsteroidsEngineState>({
    modName: 'asteroids-game',
    async execute({state}) {
        const pixiApplication = state.pixi?.pixiApplication;

        if (!state.entityStore || !pixiApplication) {
            return SkipExecution;
        }

        if (!state.players?.[PlayerPosition['1']]) {
            state.players = {
                ...state.players,
                [PlayerPosition['1']]: await state.entityStore.addEntity(PlayerEntity, {
                    inputPlayerPosition: PlayerPosition['1'],
                    x: pixiApplication.screen.width / 2,
                    y: pixiApplication.screen.height / 2,
                }),
            };
        }

        return undefined;
    },
});
