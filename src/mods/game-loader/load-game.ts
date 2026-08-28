import {defineAsset, type AssetLoader, type AssetLoadSession} from '@antha/asset';
import {AudioPlayer, createAnthaAudioMod} from '@antha/audio';
import {defineAnthaMod, type AnthaEngine} from '@antha/engine';
import {loadAnthaAssets} from '@antha/entity-2d';
import {createAnthaFpsMod} from '@antha/fps';
import {createAnthaGraphics2dMod} from '@antha/graphics-2d';
import {
    createAnthaInputBindingsMod,
    createAnthaMenuNavMod,
    createAnthaReadRawInputMod,
} from '@antha/input';
import {ensureErrorAndPrependMessage} from '@augment-vir/common';
import {css, html} from 'element-vir';
import {LocalDbClient} from 'local-db-client';
import {defaultPlayerInputBindings} from '../../data/default-bindings.js';
import {gameAudioFilesToLoad} from '../../data/game-audio.js';
import {
    checkIfMainMenuAllowed,
    updateMenuState,
    type AsteroidsGameEngineState,
    type AsteroidsSaveState,
} from '../../data/game-state.js';
import {isDeployed} from '../../data/is-deployed.js';
import {type GameInputAction} from '../../data/player-action.js';
import {type FrontendRouter} from '../../data/routing/frontend-router.js';
import {GameZIndex} from '../../data/z-index.js';
import {AsteroidEntity} from '../../entities/asteroid.entity.js';
import {PlayerBulletEntity} from '../../entities/player-bullet.entity.js';
import {PlayerExplosionParticleEntity} from '../../entities/player-explosion-particle.entity.js';
import {PlayerEntity} from '../../entities/player.entity.js';
import {VirGameBuildCommit} from '../../ui/elements/vir-game-build-commit.element.js';
import {
    autosaveMod,
    createDefaultAsteroidsSaveState,
    createGameSaveState,
    saveStateDbShapes,
    type AutosaveModState,
    type SaveStateDbClient,
} from '../autosave.mod.js';
import {gameAudioMod} from '../game-audio.mod.js';
import {gameEntityMod} from '../game-entity.mod.js';
import {
    createAnthaVirtualViewportMod,
    createVirtualViewportPixiOptions,
} from '../game-world-scale.mod.js';
import {isOnDebugPage, menuMod} from '../menu.mod.js';
import {missionMod} from '../mission/mission.mod.js';

const gameEntityClasses = [
    AsteroidEntity,
    PlayerBulletEntity,
    PlayerExplosionParticleEntity,
    PlayerEntity,
];

const buildCommitMod = defineAnthaMod<AsteroidsGameEngineState>({
    modName: 'game-build-commit',
    execute() {
        return html`
            <${VirGameBuildCommit}></${VirGameBuildCommit}>
        `;
    },
});

type LoadedGameSaveState = {
    loadError: Error | undefined;
    localDbClient: SaveStateDbClient | undefined;
    saveState: AsteroidsSaveState;
};

const gameSaveStateAsset = defineAsset<LoadedGameSaveState>({
    assetName: 'Game save state',
    maxProgress: 1,
    async load({incrementProgressCallback}) {
        try {
            const localDbClient = await LocalDbClient.createClient(saveStateDbShapes, {
                storeName: 'asteroid-rules',
            });
            incrementProgressCallback();

            return {
                value: {
                    loadError: undefined,
                    localDbClient,
                    saveState: createGameSaveState(localDbClient.value.saveState),
                },
            };
        } catch (error) {
            incrementProgressCallback();

            return {
                value: {
                    loadError: ensureErrorAndPrependMessage(
                        error,
                        'Failed to load game save state.',
                    ),
                    localDbClient: undefined,
                    saveState: createGameSaveState(undefined),
                },
            };
        }
    },
});

function createGameInitializationMod({
    loadedSaveState,
    router,
}: Readonly<{
    loadedSaveState: LoadedGameSaveState;
    router: FrontendRouter;
}>) {
    return defineAnthaMod<
        AsteroidsGameEngineState &
            AutosaveModState & {
                hasInitialized: boolean;
            }
    >({
        modName: 'game-initialization',
        execute({state}) {
            if (state.hasInitialized) {
                return;
            }

            state.localDbClient = loadedSaveState.localDbClient;
            state.missionState = undefined;
            state.router = router;
            state.saveState = loadedSaveState.saveState;
            state.hasFinishedLoadingSaveState = true;
            updateMenuState(
                state,
                isOnDebugPage(router)
                    ? {
                          ruleDebug: true,
                      }
                    : checkIfMainMenuAllowed({
                            saveState: loadedSaveState.saveState,
                        })
                      ? {
                            mainMenu: true,
                        }
                      : undefined,
            );
            state.hasInitialized = true;
        },
    });
}

async function loadInitialGameAssets({
    assetLoader,
    audioPlayer,
    engine,
    loadSession,
}: Readonly<{
    assetLoader: AssetLoader;
    audioPlayer: AudioPlayer;
    engine: AnthaEngine;
    loadSession: AssetLoadSession;
}>) {
    try {
        await loadAnthaAssets(
            {
                assetLoader,
                assets: [gameSaveStateAsset],
                audio: {
                    assetName: 'Game audio',
                    audioPlayer,
                    files: gameAudioFilesToLoad,
                    serial: true,
                },
                entities: gameEntityClasses,
            },
            {
                doNotUnload: true,
                loadSession,
            },
        );
        const loadedSaveState = await assetLoader.loadIndividualAsset({
            asset: gameSaveStateAsset,
        });

        if (loadedSaveState.loadError) {
            engine.log.error(loadedSaveState.loadError);
        }

        return loadedSaveState;
    } catch (error) {
        engine.log.error(ensureErrorAndPrependMessage(error, 'Failed to load game save state.'));

        return {
            loadError: undefined,
            localDbClient: undefined,
            saveState: createDefaultAsteroidsSaveState(),
        };
    }
}

export async function bootstrapGame({
    assetLoader,
    engine,
    loadSession,
    router,
    state,
}: Readonly<{
    assetLoader: AssetLoader;
    engine: AnthaEngine;
    loadSession: AssetLoadSession;
    router: FrontendRouter;
    state: Partial<AsteroidsGameEngineState>;
}>) {
    engine.currentMods.push(
        createAnthaVirtualViewportMod({
            virtualWidth: 2560,
        }),
    );
    const audioPlayer = new AudioPlayer();
    state.audioPlayer = audioPlayer;
    state.bindingAssignments = defaultPlayerInputBindings;
    const loadedSaveState = await loadInitialGameAssets({
        assetLoader,
        audioPlayer,
        engine,
        loadSession,
    });

    return {
        mods: [
            buildCommitMod,
            autosaveMod,
            createAnthaGraphics2dMod({
                extraCanvasWrapperStyles: css`
                    z-index: ${GameZIndex.Game};
                `,
                pixiOptions: {
                    background: 'black',
                    ...createVirtualViewportPixiOptions(),
                },
            }),
            createAnthaAudioMod(),
            createAnthaReadRawInputMod({
                deviceHandlerOptions: {
                    globalDeadZone: loadedSaveState.saveState.joystickDeadZone,
                },
            }),
            createAnthaInputBindingsMod<GameInputAction>(),
            createGameInitializationMod({
                loadedSaveState,
                router,
            }),
            menuMod,
            createAnthaMenuNavMod({
                allowWrapping: true,
                alwaysRequireFocused: true,
                blockPerpendicularNavigation: true,
            }),
            gameEntityMod,
            missionMod,
            gameAudioMod,
            ...(isDeployed
                ? []
                : [
                      createAnthaFpsMod(),
                  ]),
        ],
    };
}
