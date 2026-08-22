import {AnthaAssetLoadingScreen, createAnthaAssetMod} from '@antha/asset';
import {AnthaEngine, AnthaUi} from '@antha/engine';
import {type EmptyFunction} from '@augment-vir/common';
import {css, defineElement, html, nothing} from 'element-vir';
import {type AsteroidsEngineState} from '../../data/game-state.js';
import {type FrontendRouter} from '../../data/routing/frontend-router.js';
import {createGameLoaderMod} from '../../mods/game-loader.mod.js';

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
                isShowingLoadingScreen: true,
                loadingScreenState: {
                    completedAt: undefined,
                    current: 0,
                    currentResourceName: undefined,
                    total: -1,
                },
            },
            mods: [
                createAnthaAssetMod(),
                createGameLoaderMod({
                    router: inputs.router,
                }),
            ],
        });

        return {
            engine,
            hasRenderedFirstEngineFrame: false,
            removeEngineObservableListener: undefined as undefined | EmptyFunction,
        };
    },
    init({state, updateState}) {
        const removeEngineObservableListener = state.engine.observable.listen(false, () => {
            removeEngineObservableListener();
            updateState({
                hasRenderedFirstEngineFrame: true,
                removeEngineObservableListener: undefined,
            });
        });

        updateState({
            removeEngineObservableListener,
        });
    },
    cleanup({state}) {
        state.removeEngineObservableListener?.();
    },
    render({state}) {
        return html`
            <${AnthaUi.assign({
                engine: state.engine,
            })}></${AnthaUi}>
            ${state.hasRenderedFirstEngineFrame
                ? nothing
                : html`
                      <${AnthaAssetLoadingScreen.assign({
                          completed: false,
                          currentResourceName: undefined,
                          dotCount: 0,
                          progressPercent: 0,
                      })}></${AnthaAssetLoadingScreen}>
                  `}
        `;
    },
});
