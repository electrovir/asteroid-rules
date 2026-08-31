import {type VirtualViewportSize} from '@antha/graphics-2d';
import {clamp} from '@augment-vir/common';

export const playerSize = 24;
export const playerHalfWidth = playerSize * 0.8;
export const playerHalfHeight = playerSize;

export function clampPlayerPositionToScreen({
    playerPosition,
    screenSize,
}: Readonly<{
    playerPosition: Readonly<{
        x: number;
        y: number;
    }>;
    screenSize: Readonly<VirtualViewportSize>;
}>) {
    return {
        x: clamp(playerPosition.x, {
            min: playerHalfWidth,
            max: screenSize.width - playerHalfWidth,
        }),
        y: clamp(playerPosition.y, {
            min: playerHalfHeight,
            max: screenSize.height - playerHalfHeight,
        }),
    };
}
