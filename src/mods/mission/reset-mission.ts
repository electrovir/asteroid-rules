import {type AsteroidsGameEngineState} from '../../data/game-state.js';

export function resetMission({
    gameState,
}: Readonly<{
    gameState: Partial<AsteroidsGameEngineState>;
}>) {
    gameState.entityStore?.destroyAllEntities();
    gameState.missionState = undefined;
}
