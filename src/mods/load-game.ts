import {defineAsset} from '@antha/asset';
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
import {defaultPlayerInputBindings} from '../data/default-bindings.js';
import {type AsteroidsEngineState, type AsteroidsSaveState} from '../data/game-state.js';
import {type GameInputAction} from '../data/player-action.js';
import {type FrontendRouter} from '../data/routing/frontend-router.js';
import {GameZIndex} from '../data/z-index.js';
import {asteroidsEntityMod} from './asteroids-entity.mod.js';
import {
    autosaveMod,
    createAsteroidsSaveState,
    saveStateDbShapes,
    type SaveStateDbClient,
} from './autosave.mod.js';
import {mainMenuMod} from './main-menu.mod.js';
import {missionMod} from './mission.mod.js';
import {pauseMenuMod} from './pause-menu.mod.js';
import {isOnDebugPage, ruleDebugMod} from './rule-debug.mod.js';

export {PlayerEntity} from '../entities/player.entity.js';
export {createDefaultAsteroidsSaveState} from './autosave.mod.js';

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
                    saveState: createAsteroidsSaveState(localDbClient.value.saveState),
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
                    saveState: createAsteroidsSaveState(undefined),
                },
            };
        }
    },
});

export function loadAsteroidsGame({
    engine,
    router,
}: Readonly<{
    engine: AnthaEngine<AsteroidsEngineState>;
    router: FrontendRouter;
}>) {
    engine.state.bindingAssignments = defaultPlayerInputBindings;
    engine.state.menuState = {
        isPaused: false,
        onMainMenu: !isOnDebugPage(router),
    };
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
        createAnthaReadRawInputMod(),
        createAnthaInputBindingsMod<GameInputAction>(),
        pauseMenuMod,
        mainMenuMod,
        ruleDebugMod,
        createAnthaMenuNavMod({
            allowWrapping: true,
            alwaysRequireFocused: true,
            blockPerpendicularNavigation: true,
        }),
        asteroidsEntityMod,
        missionMod,
        createAnthaFpsMod(),
    );
}
