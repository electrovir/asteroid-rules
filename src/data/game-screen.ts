export type GameScreen = {
    height: number;
    width: number;
};

export const gameWorldWidth = 2560;

export function calculateGameWorldViewport({
    screenSize,
}: Readonly<{
    screenSize: Readonly<GameScreen>;
}>) {
    if (!screenSize.width) {
        return undefined;
    }

    const scale = screenSize.width / gameWorldWidth;

    return {
        scale,
        screen: {
            height: screenSize.height / scale,
            width: gameWorldWidth,
        },
    };
}
