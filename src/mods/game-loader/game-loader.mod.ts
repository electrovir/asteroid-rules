import {AssetLoaderProgressUpdateEvent, defineAsset} from '@antha/asset';
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
    gameModules: typeof import('./load-game.js') | undefined;
    hasLoadedGameModules: boolean;
    hasFinishedLoadingGameAssets: boolean;
    hasStartedLoadingGameModules: boolean;
    hasStartedLoadingGameAssets: boolean;
    hasStartedLoadingScreenFade: boolean;
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
            onMainMenu: true,
        });
    } else {
        updateMenuState(gameState, undefined);
    }
}

export function createGameLoaderMod({router}: Readonly<{router: FrontendRouter}>) {
    return defineAnthaMod<AsteroidsGameEngineState & GameLoaderModState & AutosaveModState>({
        initState: {
            gameModules: undefined,
            hasLoadedGameModules: false,
            hasFinishedLoadingGameAssets: false,
            hasStartedLoadingGameModules: false,
            hasStartedLoadingGameAssets: false,
            hasStartedLoadingScreenFade: false,
        },
        modName: 'game-loader',
        execute({engine, state}) {
            const assetLoader = state.assetLoader;

            if (!state.hasLoadedGameModules) {
                if (!state.hasStartedLoadingGameModules && assetLoader) {
                    state.hasStartedLoadingGameModules = true;
                    state.loadingScreenState = {
                        completedAt: undefined,
                        current: 0,
                        currentResourceName: gameModulesAsset.name,
                        total: 1,
                    };

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
            } else if (
                state.hasFinishedLoadingGameAssets &&
                !state.hasStartedLoadingScreenFade &&
                assetLoader
            ) {
                state.hasStartedLoadingScreenFade = true;
                assetLoader.dispatch(
                    new AssetLoaderProgressUpdateEvent({
                        detail: {
                            complete: true,
                            current: 1,
                            currentResourceName: undefined,
                            total: 1,
                        },
                    }),
                );

                return;
            }

            const entityStore = state.entityStore;
            const gameModules = state.gameModules;

            if (state.hasStartedLoadingGameAssets || !entityStore || !gameModules) {
                return;
            }

            state.hasStartedLoadingGameAssets = true;
            state.loadingScreenState = {
                completedAt: undefined,
                current: 0,
                currentResourceName: 'Game assets',
                total: 1,
            };

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
                    },
                )
                .then(async () => {
                    entityStore.assetLoader.dispatch(
                        new AssetLoaderProgressUpdateEvent({
                            detail: {
                                complete: false,
                                current: 1,
                                currentResourceName: state.loadingScreenState?.currentResourceName,
                                total: 1,
                            },
                        }),
                    );
                    const loadedSaveState = await entityStore.assetLoader.loadIndividualAsset({
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
                    state.hasFinishedLoadingGameAssets = true;
                    state.hasFinishedLoadingSaveState = true;
                })
                .catch((error: unknown) => {
                    state.hasFinishedLoadingGameAssets = true;
                    state.hasFinishedLoadingSaveState = true;
                    state.saveState = gameModules.createDefaultAsteroidsSaveState();
                    handleMainMenu({
                        gameState: state,
                    });
                    engine.log.error(
                        ensureErrorAndPrependMessage(error, 'Failed to load game save state.'),
                    );
                });
        },
    });
}
