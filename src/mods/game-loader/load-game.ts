import {defineAsset} from '@antha/asset';
import {createAnthaAudioMod, type AudioPlayer} from '@antha/audio';
import {type AnthaEngine} from '@antha/engine';
import {createAnthaFpsMod} from '@antha/fps';
import {createAnthaGraphics2dMod} from '@antha/graphics-2d';
import {
    createAnthaInputBindingsMod,
    createAnthaMenuNavMod,
    createAnthaReadRawInputMod,
} from '@antha/input';
import {ensureErrorAndPrependMessage} from '@augment-vir/common';
import {css} from 'element-vir';
import {LocalDbClient} from 'local-db-client';
import {defaultPlayerInputBindings} from '../../data/default-bindings.js';
import {gameAudioFilesToLoad} from '../../data/game-audio.js';
import {
    updateMenuState,
    type AsteroidsGameEngineState,
    type AsteroidsSaveState,
} from '../../data/game-state.js';
import {isDeployed} from '../../data/is-deployed.js';
import {defaultJoystickDeadZone} from '../../data/joystick-dead-zone.js';
import {type GameInputAction} from '../../data/player-action.js';
import {type FrontendRouter} from '../../data/routing/frontend-router.js';
import {GameZIndex} from '../../data/z-index.js';
import {
    autosaveMod,
    createGameSaveState,
    saveStateDbShapes,
    type SaveStateDbClient,
} from '../autosave.mod.js';
import {gameAudioMod} from '../game-audio.mod.js';
import {gameEntityMod} from '../game-entity.mod.js';
import {isOnDebugPage, menuMod} from '../menu.mod.js';
import {missionMod} from '../mission/mission.mod.js';

export {PlayerEntity} from '../../entities/player.entity.js';
export {createDefaultAsteroidsSaveState} from '../autosave.mod.js';

type LoadedGameSaveState = {
    loadError: Error | undefined;
    localDbClient: SaveStateDbClient | undefined;
    saveState: AsteroidsSaveState;
};

export const gameSaveStateAsset = defineAsset<LoadedGameSaveState>({
    name: 'Game save state',
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

export function createGameAudioAsset({audioPlayer}: Readonly<{audioPlayer: AudioPlayer}>) {
    return defineAsset({
        name: 'Game audio',
        maxProgress: gameAudioFilesToLoad.length,
        async load({incrementProgressCallback}) {
            await audioPlayer.loadFiles(gameAudioFilesToLoad, {
                progressCallback() {
                    incrementProgressCallback();
                },
                serial: true,
            });

            return {
                value: undefined,
            };
        },
    });
}

export function loadGame({
    engine,
    router,
}: Readonly<{
    engine: AnthaEngine<AsteroidsGameEngineState>;
    router: FrontendRouter;
}>) {
    engine.state.bindingAssignments = defaultPlayerInputBindings;
    updateMenuState(
        engine.state,
        isOnDebugPage(router)
            ? {
                  ruleDebug: true,
              }
            : {
                  mainMenu: true,
              },
    );
    engine.state.missionState = undefined;
    engine.state.router = router;

    engine.currentMods.push(
        autosaveMod,
        createAnthaGraphics2dMod({
            extraCanvasWrapperStyles: css`
                z-index: ${GameZIndex.Game};
            `,
            pixiOptions: {
                background: 'black',
            },
        }),
        createAnthaAudioMod(),
        createAnthaReadRawInputMod({
            deviceHandlerOptions: {
                globalDeadZone: defaultJoystickDeadZone,
            },
        }),
        createAnthaInputBindingsMod<GameInputAction>(),
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
    );
}
