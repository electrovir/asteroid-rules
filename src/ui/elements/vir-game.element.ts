import {createAnthaAssetMod} from '@antha/asset';
import {AnthaEngine, AnthaUi} from '@antha/engine';
import {type EmptyFunction} from '@augment-vir/common';
import {css, defineElement, defineElementEvent, html} from 'element-vir';
import {type AsteroidsGameEngineState} from '../../data/game-state.js';
import {type FrontendRouter} from '../../data/routing/frontend-router.js';
import {createGameLoaderMod} from '../../mods/game-loader/game-loader.mod.js';

const loadingScreenFadeMs = 500;

export const VirGame = defineElement<{
    router: FrontendRouter;
}>()({
    tagName: 'vir-game',
    events: {
        loadingScreenRendered: defineElementEvent<void>(),
    },
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
        const engine = new AnthaEngine<AsteroidsGameEngineState>({
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
                createAnthaAssetMod({
                    loadingScreenFadeMs,
                }),
                createGameLoaderMod({
                    router: inputs.router,
                }),
            ],
        });

        return {
            engine,
            removeEngineObservableListener: undefined as undefined | EmptyFunction,
        };
    },
    init({dispatch, events, state, updateState}) {
        const removeEngineObservableListener = state.engine.observable.listen(false, () => {
            removeEngineObservableListener();
            updateState({
                removeEngineObservableListener: undefined,
            });
            dispatch(new events.loadingScreenRendered(undefined));
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
        `;
    },
});
