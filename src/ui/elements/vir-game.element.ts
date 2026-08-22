import {createAnthaAssetMod} from '@antha/asset';
import {AnthaEngine, AnthaUi} from '@antha/engine';
import {createAnthaFpsMod} from '@antha/fps';
import {createAnthaGraphics2dMod} from '@antha/graphics-2d';
import {
    createAnthaInputBindingsMod,
    createAnthaMenuNavMod,
    createAnthaReadRawInputMod,
} from '@antha/input';
import {css, defineElement, html} from 'element-vir';
import {defaultPlayerInputBindings} from '../../data/default-bindings.js';
import {type AsteroidsEngineState} from '../../data/game-state.js';
import {type GameInputAction} from '../../data/player-action.js';
import {type FrontendRouter} from '../../data/routing/frontend-router.js';
import {GameZIndex} from '../../data/z-index.js';
import {asteroidsEntityMod} from '../../mods/asteroids-entity.mod.js';
import {mainMenuMod} from '../../mods/main-menu.mod.js';
import {missionMod} from '../../mods/mission.mod.js';
import {pauseMenuMod} from '../../mods/pause-menu.mod.js';
import {isOnDebugPage, ruleDebugMod} from '../../mods/rule-debug.mod.js';
import {saveStateMod} from '../../mods/save-state.mod.js';

export const VirGame = defineElement<{
    router: FrontendRouter;
}>()({
    tagName: 'vir-game',
    styles: css`
        :host {
            background: black;
            display: block;
            height: 100%;
            overflow: hidden;
            position: relative;
            width: 100%;
        }

        ${AnthaUi} {
            display: block;
            height: 100%;
            padding: 0;
            position: relative;
            width: 100%;
        }
    `,
    state({inputs}) {
        const engine = new AnthaEngine<AsteroidsEngineState>({
            initState: {
                bindingAssignments: defaultPlayerInputBindings,
                isShowingLoadingScreen: true,
                loadingScreenState: {
                    completedAt: undefined,
                    current: 0,
                    currentResourceName: undefined,
                    total: -1,
                },
                missionState: undefined,
                router: inputs.router,
                menuState: {
                    isPaused: false,
                    onMainMenu: !isOnDebugPage(inputs.router),
                },
            },
            mods: [
                createAnthaAssetMod(),
                saveStateMod,
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
            ],
        });

        return {
            engine,
        };
    },
    render({state}) {
        return html`
            <${AnthaUi.assign({
                engine: state.engine,
            })}></${AnthaUi}>
        `;
    },
});
