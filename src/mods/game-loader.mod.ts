import {defineAsset} from '@antha/asset';
import {defineAnthaMod} from '@antha/engine';
import {ensureErrorAndPrependMessage} from '@augment-vir/common';
import {type AsteroidsEngineState} from '../data/game-state.js';
import {type FrontendRouter} from '../data/routing/frontend-router.js';
import {type AutosaveModState} from './autosave.mod.js';

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
    hasStartedLoadingGameModules: boolean;
    hasStartedLoadingGameAssets: boolean;
};

export function createGameLoaderMod({router}: Readonly<{router: FrontendRouter}>) {
    return defineAnthaMod<AsteroidsEngineState & GameLoaderModState & AutosaveModState>({
        initState: {
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
                        .bulkLoadAssets(
                            [
                                gameModulesAsset,
                            ],
                            {
                                doNotUnload: true,
                            },
                        )
                        .then(async () => {
                            const gameModules = await assetLoader.loadIndividualAsset({
                                asset: gameModulesAsset,
                            });

                            state.gameModules = gameModules;
                            state.hasLoadedGameModules = true;
                            gameModules.loadAsteroidsGame({
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

            if (state.hasStartedLoadingGameAssets || !entityStore || !gameModules) {
                return;
            }

            state.hasStartedLoadingGameAssets = true;

            void entityStore
                .loadEntityAssets({
                    entities: [
                        gameModules.PlayerEntity,
                    ],
                    otherAssets: [
                        gameModules.gameSaveStateAsset,
                    ],
                })
                .then(async () => {
                    const loadedSaveState = await entityStore.assetLoader.loadIndividualAsset({
                        asset: gameModules.gameSaveStateAsset,
                    });

                    if (loadedSaveState.loadError) {
                        engine.log.error(loadedSaveState.loadError);
                    }

                    state.localDbClient = loadedSaveState.localDbClient;
                    state.saveState = loadedSaveState.saveState;
                    state.hasFinishedLoadingSaveState = true;
                })
                .catch((error: unknown) => {
                    state.hasFinishedLoadingSaveState = true;
                    state.saveState = gameModules.createDefaultAsteroidsSaveState();
                    engine.log.error(
                        ensureErrorAndPrependMessage(error, 'Failed to load game save state.'),
                    );
                });
        },
    });
}
