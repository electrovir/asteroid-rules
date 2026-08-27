import {defineAnthaMod} from '@antha/engine';
import {calculateGameWorldViewport} from '../data/game-screen.js';
import {type AsteroidsGameEngineState} from '../data/game-state.js';

export const gameWorldScaleMod = defineAnthaMod<AsteroidsGameEngineState>({
    modName: 'game-world-scale',
    execute({state}) {
        const pixiApplication = state.pixi?.pixiApplication;

        if (!pixiApplication) {
            return;
        }

        const gameWorldViewport = calculateGameWorldViewport({
            screenSize: pixiApplication.screen,
        });

        if (!gameWorldViewport) {
            return;
        }

        pixiApplication.stage.scale.set(gameWorldViewport.scale);
        state.gameScreen = gameWorldViewport.screen;
    },
});
