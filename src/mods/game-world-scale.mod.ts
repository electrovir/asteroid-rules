import {defineAnthaMod} from '@antha/engine';
import {type AnthaGraphics2dModState} from '@antha/graphics-2d';

export type VirtualViewport = {
    height: number;
    scale: number;
    width: number;
};
export type VirtualViewportSize = Pick<VirtualViewport, 'height' | 'width'>;

export type AnthaVirtualViewportModState = AnthaGraphics2dModState & {
    virtualViewport: VirtualViewport | undefined;
};

export function calculateVirtualViewport({
    screenSize,
    virtualWidth,
}: Readonly<{
    screenSize: Readonly<VirtualViewportSize>;
    virtualWidth: number;
}>) {
    if (!screenSize.width || !virtualWidth) {
        return undefined;
    }

    const scale = screenSize.width / virtualWidth;

    return {
        height: screenSize.height / scale,
        scale,
        width: virtualWidth,
    };
}

export function calculateVirtualViewportPoint({
    canvasBounds,
    clientPoint,
    virtualViewport,
}: Readonly<{
    canvasBounds: Readonly<{
        height: number;
        left: number;
        top: number;
        width: number;
    }>;
    clientPoint: Readonly<{
        x: number;
        y: number;
    }>;
    virtualViewport: Readonly<VirtualViewportSize>;
}>) {
    if (!canvasBounds.width || !canvasBounds.height) {
        return undefined;
    }

    return {
        x: ((clientPoint.x - canvasBounds.left) / canvasBounds.width) * virtualViewport.width,
        y: ((clientPoint.y - canvasBounds.top) / canvasBounds.height) * virtualViewport.height,
    };
}

export function createVirtualViewportPixiOptions() {
    return {
        autoDensity: true,
        resolution: globalThis.devicePixelRatio || 1,
    };
}

function hasSameVirtualViewport({
    previousVirtualViewport,
    virtualViewport,
}: Readonly<{
    previousVirtualViewport: VirtualViewport | undefined;
    virtualViewport: VirtualViewport;
}>) {
    return (
        previousVirtualViewport != undefined &&
        Math.abs(previousVirtualViewport.height - virtualViewport.height) < 0.01 &&
        Math.abs(previousVirtualViewport.scale - virtualViewport.scale) < 0.0001 &&
        previousVirtualViewport.width === virtualViewport.width
    );
}

function updateVirtualViewportHostElement({
    hostElement,
    virtualViewport,
}: Readonly<{
    hostElement: HTMLElement;
    virtualViewport: VirtualViewport;
}>) {
    hostElement.style.height = `${100 / virtualViewport.scale}%`;
    hostElement.style.transform = `scale(${virtualViewport.scale})`;
    hostElement.style.transformOrigin = 'top left';
    hostElement.style.width = `${100 / virtualViewport.scale}%`;
}

function resetVirtualViewportHostElement({
    hostElement,
}: Readonly<{
    hostElement: HTMLElement;
}>) {
    hostElement.style.removeProperty('height');
    hostElement.style.removeProperty('transform');
    hostElement.style.removeProperty('transform-origin');
    hostElement.style.removeProperty('width');
}

export function createAnthaVirtualViewportMod({
    virtualWidth,
}: Readonly<{
    /**
     * The reference width for your game screen. Any browser window wider or skinnier than this will
     * be scaled.
     */
    virtualWidth: number;
}>) {
    return defineAnthaMod<AnthaVirtualViewportModState>({
        modName: 'antha-virtual-viewport',
        cleanup({hostElement, state}) {
            resetVirtualViewportHostElement({
                hostElement,
            });
            state.virtualViewport = undefined;
        },
        execute({hostElement, state}) {
            const virtualViewport = calculateVirtualViewport({
                screenSize: hostElement.getBoundingClientRect(),
                virtualWidth,
            });

            if (!virtualViewport) {
                return;
            }

            const hasViewportChanged =
                !hasSameVirtualViewport({
                    previousVirtualViewport: state.virtualViewport,
                    virtualViewport,
                }) || hostElement.style.transform !== `scale(${virtualViewport.scale})`;

            if (hasViewportChanged) {
                updateVirtualViewportHostElement({
                    hostElement,
                    virtualViewport,
                });
                state.virtualViewport = virtualViewport;
            }

            const pixiApplication = state.pixi?.pixiApplication;

            if (
                !pixiApplication ||
                (!hasViewportChanged &&
                    pixiApplication.renderer.resolution ===
                        (globalThis.devicePixelRatio || 1) * virtualViewport.scale &&
                    pixiApplication.stage.scale.x === 1 &&
                    pixiApplication.stage.scale.y === 1)
            ) {
                return;
            }

            pixiApplication.renderer.resolution =
                (globalThis.devicePixelRatio || 1) * virtualViewport.scale;
            pixiApplication.resize();
            pixiApplication.stage.scale.set(1);
        },
    });
}
