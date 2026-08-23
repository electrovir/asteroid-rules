import {type PlayerEntity} from '../../entities/player.entity.js';

export function shouldShowGameOver(
    players: ReadonlyArray<Readonly<Pick<PlayerEntity, 'isDestroyed' | 'isGhostMode'>>>,
) {
    return !players.some((player) => {
        return !player.isDestroyed && !player.isGhostMode;
    });
}
