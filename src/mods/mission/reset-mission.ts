import {type AsteroidsGameEngineState} from '../../data/game-state.js';

export function resetMission({
    gameState,
}: Readonly<{
    gameState: Partial<AsteroidsGameEngineState>;
}>) {
    gameState.entityStore?.currentEntityInstances.forEach((entity) => {
        entity.immediatelyDestroy();
    });
    gameState.missionState = undefined;
}
