import {createGameModifiers} from '../data/game-rule.js';
import {PlayerPosition, type AsteroidsEngineState} from '../data/game-state.js';
import {PlayerEntity} from '../entities/player.entity.js';

export async function ensureGameMission({
    gameState,
}: Readonly<{
    gameState: Partial<AsteroidsEngineState>;
}>) {
    if (gameState.missionState) {
        return true;
    }

    const pixiApplication = gameState.pixi?.pixiApplication;

    if (!gameState.entityStore || !pixiApplication) {
        return false;
    }

    gameState.missionState = {
        modifiers: createGameModifiers(gameState.saveState?.activeRules || []),
        players: {
            [PlayerPosition['1']]: await gameState.entityStore.addEntity(PlayerEntity, {
                inputPlayerPosition: PlayerPosition['1'],
                x: pixiApplication.screen.width / 2,
                y: pixiApplication.screen.height / 2,
            }),
        },
    };

    return true;
}
