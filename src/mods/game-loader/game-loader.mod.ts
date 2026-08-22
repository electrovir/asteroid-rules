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
                    const gameAssetLoadSession = assetLoader.createLoadSession();
                    state.gameAssetLoadSession = gameAssetLoadSession;

                    void assetLoader
                        .bulkLoadAssets(
                            [
                                gameModulesAsset,
                            ],
                            {
                                doNotUnload: true,
                                loadSession: gameAssetLoadSession,
                            },
                        )
                        .then(async () => {
                            const gameModules = await assetLoader.loadIndividualAsset({
                                asset: gameModulesAsset,
                            });

                            state.gameModules = gameModules;
                            state.hasLoadedGameModules = true;
                            gameModules.loadGame({
                                engine,
                                router,
                            });
                        })
                        .catch((error: unknown) => {
                            gameAssetLoadSession.complete();
                            engine.log.error(
                                ensureErrorAndPrependMessage(error, 'Failed to load game code.'),
                            );
                        });
                }

                return;
            }

            const entityStore = state.entityStore;
            const gameModules = state.gameModules;
            const gameAssetLoadSession = state.gameAssetLoadSession;

            if (
                state.hasStartedLoadingGameAssets ||
                !assetLoader ||
                !entityStore ||
                !gameModules ||
                !gameAssetLoadSession
            ) {
                return;
            }

            state.hasStartedLoadingGameAssets = true;

            void entityStore
                .loadEntityAssets(
                    {
                        entities: [
                            gameModules.PlayerEntity,
                        ],
                        otherAssets: [
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
                    handleMainMenu({
                        gameState: state,
                    });
                    state.hasFinishedLoadingSaveState = true;
                    gameAssetLoadSession.complete();
                })
                .catch((error: unknown) => {
                    state.hasFinishedLoadingSaveState = true;
                    state.saveState = gameModules.createDefaultAsteroidsSaveState();
                    handleMainMenu({
                        gameState: state,
                    });
                    gameAssetLoadSession.complete();
                    engine.log.error(
                        ensureErrorAndPrependMessage(error, 'Failed to load game save state.'),
                    );
                });
        },
    });
}
