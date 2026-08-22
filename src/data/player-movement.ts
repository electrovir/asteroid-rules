import {
    createAxeName,
    createButtonName,
    InputDeviceKey,
    type ActiveBinding,
    type ActiveBindings,
    type RawInputs,
} from '@antha/input';
import {clamp} from '@augment-vir/common';
import {PlayerAction, type GameInputAction} from './player-action.js';

const playerSpeedPixelsPerMillisecond = 0.4;

export function calculatePlayerMovement({
    activeBindings,
    mouseMovementTarget,
    msSinceLastUpdate,
    playerPosition,
}: Readonly<{
    activeBindings: ActiveBindings<GameInputAction> | undefined;
    mouseMovementTarget:
        | {
              x: number;
              y: number;
          }
        | undefined;
    msSinceLastUpdate: number;
    playerPosition: Readonly<{
        x: number;
        y: number;
    }>;
}>) {
    const cardinalMovement = calculateCardinalMovement({
        activeBindings,
        msSinceLastUpdate,
    });
    const mouseMovement = calculateMouseMovement({
        mouseMovementTarget,
        msSinceLastUpdate,
        playerPosition,
    });
    const x = (cardinalMovement?.x || 0) + (mouseMovement?.x || 0);
    const y = (cardinalMovement?.y || 0) + (mouseMovement?.y || 0);
    const movementMagnitude = Math.hypot(x, y);

    if (!movementMagnitude) {
        return undefined;
    }

    const movementMultiplier = Math.min(
        (msSinceLastUpdate * playerSpeedPixelsPerMillisecond) / movementMagnitude,
        1,
    );

    return {
        x: x * movementMultiplier,
        y: y * movementMultiplier,
    };
}

export function getMouseMovementTarget({
    canvas,
    rawInputs,
    screen,
}: Readonly<{
    canvas: HTMLCanvasElement | undefined;
    rawInputs: RawInputs | undefined;
    screen: Readonly<{
        height: number;
        width: number;
    }>;
}>) {
    const mouseInputs = rawInputs?.[InputDeviceKey.Mouse];
    const mouseX = mouseInputs?.[createAxeName('x')]?.inputValue;
    const mouseY = mouseInputs?.[createAxeName('y')]?.inputValue;

    if (
        !canvas ||
        !isPrimaryMouseButtonHeld(rawInputs) ||
        mouseX == undefined ||
        mouseY == undefined
    ) {
        return undefined;
    }

    const canvasBounds = canvas.getBoundingClientRect();

    if (!canvasBounds.width || !canvasBounds.height) {
        return undefined;
    }

    return {
        x: ((mouseX - canvasBounds.left) / canvasBounds.width) * screen.width,
        y: ((mouseY - canvasBounds.top) / canvasBounds.height) * screen.height,
    };
}

export function isPrimaryMouseButtonHeld(rawInputs: RawInputs | undefined) {
    return !!rawInputs?.[InputDeviceKey.Mouse]?.[createButtonName(0)]?.inputValue;
}

function calculateCardinalMovement({
    activeBindings,
    msSinceLastUpdate,
}: Readonly<{
    activeBindings: ActiveBindings<GameInputAction> | undefined;
    msSinceLastUpdate: number;
}>) {
    const upMovement = createMovementInput(activeBindings?.[PlayerAction.MoveUp]);
    const downMovement = createMovementInput(activeBindings?.[PlayerAction.MoveDown]);
    const leftMovement = createMovementInput(activeBindings?.[PlayerAction.MoveLeft]);
    const rightMovement = createMovementInput(activeBindings?.[PlayerAction.MoveRight]);

    const movementY =
        upMovement.value && upMovement.durationMs < downMovement.durationMs
            ? -upMovement.value
            : downMovement.value && downMovement.durationMs < upMovement.durationMs
              ? downMovement.value
              : 0;
    const movementX =
        leftMovement.value && leftMovement.durationMs < rightMovement.durationMs
            ? -leftMovement.value
            : rightMovement.value && rightMovement.durationMs < leftMovement.durationMs
              ? rightMovement.value
              : 0;
    const movementMagnitude = Math.hypot(movementX, movementY);

    if (!movementMagnitude) {
        return undefined;
    }

    return {
        x: (movementX / movementMagnitude) * msSinceLastUpdate * playerSpeedPixelsPerMillisecond,
        y: (movementY / movementMagnitude) * msSinceLastUpdate * playerSpeedPixelsPerMillisecond,
    };
}

function calculateMouseMovement({
    mouseMovementTarget,
    msSinceLastUpdate,
    playerPosition,
}: Readonly<{
    mouseMovementTarget:
        | {
              x: number;
              y: number;
          }
        | undefined;
    msSinceLastUpdate: number;
    playerPosition: Readonly<{
        x: number;
        y: number;
    }>;
}>) {
    if (!mouseMovementTarget) {
        return undefined;
    }

    const xDistance = mouseMovementTarget.x - playerPosition.x;
    const yDistance = mouseMovementTarget.y - playerPosition.y;
    const distance = Math.hypot(xDistance, yDistance);

    if (!distance) {
        return undefined;
    }

    const movementDistance = Math.min(
        distance,
        msSinceLastUpdate * playerSpeedPixelsPerMillisecond,
    );

    return {
        x: (xDistance / distance) * movementDistance,
        y: (yDistance / distance) * movementDistance,
    };
}

function createMovementInput(activeBinding: ActiveBinding | undefined) {
    return {
        durationMs: activeBinding?.holdDuration.milliseconds ?? Infinity,
        value: clamp(activeBinding?.value || 0, {
            min: 0,
            max: 1,
        }),
    };
}
