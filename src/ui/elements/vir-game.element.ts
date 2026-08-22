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
import {allGameRules} from '../../data/rules.js';
import {asteroidsEntityMod} from '../../mods/asteroids-entity.mod.js';
import {mainMenuMod} from '../../mods/main-menu.mod.js';
import {pauseMenuMod} from '../../mods/pause-menu.mod.js';

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
                missionState: undefined,
                router: inputs.router,
                menuState: {
                    isPaused: false,
                    onMainMenu: true,
                },
                saveState: {
                    playerLevel: 0,
                    playerLevelExperience: 0,
                    activeRules: [],
                    unlockedGameRules: allGameRules,
                },
            },
            mods: [
                createAnthaGraphics2dMod({
                    extraCanvasWrapperStyles: css`
                        z-index: 0;
                    `,
                    pixiOptions: {
                        background: 'black',
                    },
                }),
                createAnthaReadRawInputMod(),
                createAnthaInputBindingsMod<GameInputAction>(),
                pauseMenuMod,
                mainMenuMod,
                createAnthaMenuNavMod({
                    allowWrapping: true,
                    alwaysRequireFocused: true,
                    blockPerpendicularNavigation: true,
                }),
                asteroidsEntityMod,
                createAnthaFpsMod({
                    debugFps: true,
                }),
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
