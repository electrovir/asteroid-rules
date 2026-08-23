import {defineAsset, type AssetLoadSession} from '@antha/asset';
import {defineAnthaMod} from '@antha/engine';
import {ensureErrorAndPrependMessage} from '@augment-vir/common';
import {
    checkIfMainMenuAllowed,
    updateMenuState,
    type AsteroidsGameEngineState,
} from '../../data/game-state.js';
import {type FrontendRouter} from '../../data/routing/frontend-router.js';
import {type AutosaveModState} from '../autosave.mod.js';

const gameModulesAsset = defineAsset({
    name: 'Game code',
    maxProgress: 1,
    async load({incrementProgressCallback}) {
        const gameModules = await import('./load-game.js');

        incrementProgressCallback();

        return {
            value: gameModules,
        };
    },
});

type GameLoaderModState = {
    gameAssetLoadSession: AssetLoadSession | undefined;
    gameModules: typeof import('./load-game.js') | undefined;
    hasLoadedGameModules: boolean;
    hasStartedLoadingGameModules: boolean;
    hasStartedLoadingGameAssets: boolean;
};

function handleMainMenu({
    gameState,
}: Readonly<{
    gameState: Partial<AsteroidsGameEngineState>;
}>) {
    if (
        checkIfMainMenuAllowed({
            saveState: gameState.saveState,
        })
    ) {
        updateMenuState(gameState, {
            mainMenu: true,
        });
    } else {
        updateMenuState(gameState, undefined);
    }
}

function applyJoystickDeadZone({
    gameState,
}: Readonly<{
    gameState: Partial<AsteroidsGameEngineState>;
}>) {
    if (!gameState.deviceHandler || !gameState.saveState) {
        return;
    }

    gameState.deviceHandler.globalDeadZone = gameState.saveState.joystickDeadZone;
}

function completeGameSaveStateLoading({
    gameAssetLoadSession,
    gameState,
}: Readonly<{
    gameAssetLoadSession: AssetLoadSession;
    gameState: Partial<AsteroidsGameEngineState & AutosaveModState>;
}>) {
    applyJoystickDeadZone({
        gameState,
    });
    handleMainMenu({
        gameState,
    });
    gameState.hasFinishedLoadingSaveState = true;
    gameAssetLoadSession.complete();
}

export function createGameLoaderMod({router}: Readonly<{router: FrontendRouter}>) {
    return defineAnthaMod<AsteroidsGameEngineState & GameLoaderModState & AutosaveModState>({
        initState: {
            gameAssetLoadSession: undefined,
            gameModules: undefined,
            hasLoadedGameModules: false,
            hasStartedLoadingGameModules: false,
            hasStartedLoadingGameAssets: false,
        },
        modName: 'game-loader',
        execute({engine, state}) {
            const assetLoader = state.assetLoader;

            if (!state.hasLoadedGameModules) {
                if (!state.hasStartedLoadingGameModules && assetLoader) {
                    state.hasStartedLoadingGameModules = true;

                    void assetLoader
                        .loadIndividualAsset({
                            asset: gameModulesAsset,
                        })
                        .then((gameModules) => {
                            state.gameModules = gameModules;
                            state.hasLoadedGameModules = true;
                            gameModules.loadGame({
                                engine,
                                router,
                            });
                        })
                        .catch((error: unknown) => {
                            engine.log.error(
                                ensureErrorAndPrependMessage(error, 'Failed to load game code.'),
                            );
                        });
                }

                return;
            }

            const entityStore = state.entityStore;
            const gameModules = state.gameModules;
            const audioPlayer = state.audioPlayer;

            if (
                state.hasStartedLoadingGameAssets ||
                !assetLoader ||
                !audioPlayer ||
                !entityStore ||
                !gameModules
            ) {
                return;
            }

            state.hasStartedLoadingGameAssets = true;
            const gameAssetLoadSession = assetLoader.createLoadSession();
            state.gameAssetLoadSession = gameAssetLoadSession;

            void entityStore
                .loadEntityAssets(
                    {
                        entities: [
                            gameModules.PlayerEntity,
                        ],
                        otherAssets: [
                            gameModules.createGameAudioAsset({
                                audioPlayer,
                            }),
                            gameModules.gameSaveStateAsset,
                        ],
                    },
                    {
                        doNotUnload: true,
                        loadSession: gameAssetLoadSession,
                    },
                )
                .then(async () => {
                    const loadedSaveState = await assetLoader.loadIndividualAsset({
                        asset: gameModules.gameSaveStateAsset,
                    });

                    if (loadedSaveState.loadError) {
                        engine.log.error(loadedSaveState.loadError);
                    }

                    state.localDbClient = loadedSaveState.localDbClient;
                    state.saveState = loadedSaveState.saveState;
                    completeGameSaveStateLoading({
                        gameAssetLoadSession,
                        gameState: state,
                    });
                })
                .catch((error: unknown) => {
                    state.saveState = gameModules.createDefaultAsteroidsSaveState();
                    completeGameSaveStateLoading({
                        gameAssetLoadSession,
                        gameState: state,
                    });
                    engine.log.error(
                        ensureErrorAndPrependMessage(error, 'Failed to load game save state.'),
                    );
                });
        },
    });
}
