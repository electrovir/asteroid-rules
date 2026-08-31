import {type VirtualViewportSize} from '@antha/graphics-2d';
import {clampPlayerPositionToScreen} from '../../entities/player-bounds.js';

function calculateGameEntityPositionShift({
    playerPosition,
    previousScreenSize,
    screenSize,
}: Readonly<{
    playerPosition:
        | Readonly<{
              x: number;
              y: number;
          }>
        | undefined;
    previousScreenSize: Readonly<VirtualViewportSize>;
    screenSize: Readonly<VirtualViewportSize>;
}>) {
    const centeredXOffset = (screenSize.width - previousScreenSize.width) / 2;
    const centeredYOffset = (screenSize.height - previousScreenSize.height) / 2;

    if (!playerPosition) {
        return {
            x: centeredXOffset,
            y: centeredYOffset,
        };
    }

    const constrainedPlayerPosition = clampPlayerPositionToScreen({
        playerPosition: {
            x: playerPosition.x + centeredXOffset,
            y: playerPosition.y + centeredYOffset,
        },
        screenSize,
    });

    return {
        x: constrainedPlayerPosition.x - playerPosition.x,
        y: constrainedPlayerPosition.y - playerPosition.y,
    };
}

export function shiftGameEntityPositions({
    entities,
    playerPosition,
    previousScreenSize,
    screenSize,
}: Readonly<{
    entities: ReadonlyArray<{
        params: {
            x: number;
            y: number;
        };
    }>;
    playerPosition:
        | Readonly<{
              x: number;
              y: number;
          }>
        | undefined;
    previousScreenSize: Readonly<VirtualViewportSize>;
    screenSize: Readonly<VirtualViewportSize>;
}>) {
    const positionShift = calculateGameEntityPositionShift({
        playerPosition,
        previousScreenSize,
        screenSize,
    });

    entities.forEach((entity) => {
        entity.params.x += positionShift.x;
        entity.params.y += positionShift.y;
    });
}
