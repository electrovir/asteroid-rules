import {AnthaEngine, AnthaUi} from '@antha/engine';
import {createAnthaFpsMod} from '@antha/fps';
import {createAnthaGraphics2dMod} from '@antha/graphics-2d';
import {createAnthaInputBindingsMod, createAnthaReadRawInputMod} from '@antha/input';
import {css, defineElement, html} from 'element-vir';
import {type AsteroidsEngineState} from '../../data/asteroids-game-state.js';
import {defaultPlayerInputBindings, type PlayerInputAction} from '../../data/player-input.js';
import {asteroidsEntityMod} from '../../mods/asteroids-entity.mod.js';
import {asteroidsGameMod} from '../../mods/asteroids-game.mod.js';

export const VirGame = defineElement()({
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
    state() {
        const engine = new AnthaEngine<AsteroidsEngineState>({
            initState: {
                bindingAssignments: defaultPlayerInputBindings,
                modifiers: {
                    allowPlayerCardinalMovement: true,
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
                createAnthaInputBindingsMod<PlayerInputAction>(),
                asteroidsEntityMod,
                asteroidsGameMod,
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
