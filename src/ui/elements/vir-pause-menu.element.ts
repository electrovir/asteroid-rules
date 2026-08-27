import {nav} from '@antha/input';
import {listenToObject} from '@antha/util';
import {clamp, type EmptyFunction} from '@augment-vir/common';
import {css, defineElement, html, nothing, testId} from 'element-vir';
import {noNativeSpacing} from 'vira';
import {defaultGameAudioVolume, gameAudioVolumeStep} from '../../data/game-audio.js';
import {
    checkIfMainMenuAllowed,
    updateMenuState,
    type AsteroidsGameEngineState,
    type FullGameState,
} from '../../data/game-state.js';
import {isDeployed} from '../../data/is-deployed.js';
import {defaultJoystickDeadZone, joystickDeadZoneStep} from '../../data/joystick-dead-zone.js';
import {frontendPathTree} from '../../data/routing/frontend-path-tree.js';
import {resetMission} from '../../mods/mission/reset-mission.js';
import {VirGameButton} from './vir-game-button.element.js';

function adjustJoystickDeadZone({
    adjustment,
    gameState,
}: Readonly<{
    adjustment: number;
    gameState: Partial<AsteroidsGameEngineState>;
}>) {
    const joystickDeadZone = clamp(
        (gameState.deviceHandler?.globalDeadZone ??
            gameState.saveState?.joystickDeadZone ??
            defaultJoystickDeadZone) + adjustment,
        {
            min: defaultJoystickDeadZone,
            max: 1,
        },
    );

    if (gameState.deviceHandler) {
        gameState.deviceHandler.globalDeadZone = joystickDeadZone;
    }

    if (gameState.saveState) {
        gameState.saveState = {
            ...gameState.saveState,
            joystickDeadZone,
        };
    }
}

function adjustAudioVolume({
    adjustment,
    gameState,
}: Readonly<{
    adjustment: number;
    gameState: Partial<AsteroidsGameEngineState>;
}>) {
    const audioVolume = clamp(
        (gameState.audioPlayer?.gainNode.gain.value ??
            gameState.saveState?.audioVolume ??
            defaultGameAudioVolume) + adjustment,
        {
            min: 0,
            max: 1,
        },
    );

    if (gameState.saveState) {
        gameState.saveState = {
            ...gameState.saveState,
            audioVolume,
        };
    }
}

export const VirPauseMenu = defineElement<{
    gameState: Partial<AsteroidsGameEngineState>;
}>()({
    tagName: 'vir-pause-menu',
    testIds: [
        'decreaseJoystickDeadZoneButton',
        'increaseJoystickDeadZoneButton',
        'decreaseAudioVolumeButton',
        'increaseAudioVolumeButton',
        'restartMissionButton',
        'endMissionButton',
    ],
    state(): {
        cleanup: EmptyFunction | undefined;
        showPauseMenu: boolean;
    } {
        return {
            cleanup: undefined,
            showPauseMenu: false,
        };
    },
    hostClasses: {
        'vir-pause-menu-visible': ({state}) => state.showPauseMenu,
    },
    styles({hostClasses}) {
        return css`
            :host {
                align-items: center;
                box-sizing: border-box;
                display: none;
                flex-direction: column;
                flex-grow: 1;
                gap: 24px;
                height: 100%;
                justify-content: center;
                padding: 16px;
                width: 100%;
            }

            ${hostClasses['vir-pause-menu-visible'].selector} {
                display: flex;
            }

            h1 {
                font-size: 48px;
                font-weight: 700;
                margin: 0;
            }

            .menu-options {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .settings-control {
                align-items: center;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .settings-buttons {
                display: flex;
                gap: 8px;
            }

            .settings-control p {
                ${noNativeSpacing}
                font-size: 18px;
            }
        `;
    },
    init({host, inputs, updateState}) {
        function updatePauseMenuVisibility(
            this: void,
            menuState: FullGameState['menuState'] | undefined,
        ) {
            updateState({
                showPauseMenu: !!menuState?.pause,
            });
            host.requestUpdate();
        }

        updatePauseMenuVisibility(inputs.gameState.menuState);
        updateState({
            cleanup: listenToObject(inputs.gameState, 'menuState', updatePauseMenuVisibility),
        });
    },
    cleanup({state}) {
        state.cleanup?.();
    },
    render({host, inputs, state, testIds}) {
        const navController = inputs.gameState.navController;
        const router = inputs.gameState.router;
        const mainMenuAllowed = checkIfMainMenuAllowed({
            saveState: inputs.gameState.saveState,
        });
        const debugRoute = {
            paths: frontendPathTree.paths.children.debug.children.rules.fullPaths,
        };

        if (!state.showPauseMenu || !navController || !router) {
            return nothing;
        }

        return html`
            <h1>Paused</h1>
            <div class="menu-options">
                <${VirGameButton}
                    ${nav(navController, {
                        y: 0,
                        listeners: {
                            activate: ({enabled}) => {
                                if (enabled) {
                                    updateMenuState(inputs.gameState, undefined);
                                }
                            },
                        },
                    })}
                >
                    Resume
                </${VirGameButton}>
                <div class="settings-control">
                    <p>
                        Joystick Dead Zone:
                        ${Math.round(
                            (inputs.gameState.deviceHandler?.globalDeadZone ??
                                inputs.gameState.saveState?.joystickDeadZone ??
                                defaultJoystickDeadZone) * 100,
                        )}%
                    </p>
                    <div class="settings-buttons">
                        <${VirGameButton}
                            ${testId(testIds.decreaseJoystickDeadZoneButton)}
                            ${nav(navController, {
                                x: 0,
                                y: 1,
                                listeners: {
                                    activate: ({enabled}) => {
                                        if (enabled) {
                                            adjustJoystickDeadZone({
                                                adjustment: -joystickDeadZoneStep,
                                                gameState: inputs.gameState,
                                            });
                                            host.requestUpdate();
                                        }
                                    },
                                },
                            })}
                        >
                            -
                        </${VirGameButton}>
                        <${VirGameButton}
                            ${testId(testIds.increaseJoystickDeadZoneButton)}
                            ${nav(navController, {
                                y: 1,
                                x: 1,
                                listeners: {
                                    activate: ({enabled}) => {
                                        if (enabled) {
                                            adjustJoystickDeadZone({
                                                adjustment: joystickDeadZoneStep,
                                                gameState: inputs.gameState,
                                            });
                                            host.requestUpdate();
                                        }
                                    },
                                },
                            })}
                        >
                            +
                        </${VirGameButton}>
                    </div>
                </div>
                <div class="settings-control">
                    <p>
                        Volume:
                        ${Math.round(
                            (inputs.gameState.audioPlayer?.gainNode.gain.value ??
                                inputs.gameState.saveState?.audioVolume ??
                                defaultGameAudioVolume) * 100,
                        )}%
                    </p>
                    <div class="settings-buttons">
                        <${VirGameButton}
                            ${testId(testIds.decreaseAudioVolumeButton)}
                            ${nav(navController, {
                                x: 0,
                                y: 2,
                                listeners: {
                                    activate: ({enabled}) => {
                                        if (enabled) {
                                            adjustAudioVolume({
                                                adjustment: -gameAudioVolumeStep,
                                                gameState: inputs.gameState,
                                            });
                                            host.requestUpdate();
                                        }
                                    },
                                },
                            })}
                        >
                            -
                        </${VirGameButton}>
                        <${VirGameButton}
                            ${testId(testIds.increaseAudioVolumeButton)}
                            ${nav(navController, {
                                x: 1,
                                y: 2,
                                listeners: {
                                    activate: ({enabled}) => {
                                        if (enabled) {
                                            adjustAudioVolume({
                                                adjustment: gameAudioVolumeStep,
                                                gameState: inputs.gameState,
                                            });
                                            host.requestUpdate();
                                        }
                                    },
                                },
                            })}
                        >
                            +
                        </${VirGameButton}>
                    </div>
                </div>
                ${isDeployed
                    ? nothing
                    : html`
                          <${VirGameButton}
                              ${nav(navController, {
                                  y: 3,
                                  listeners: {
                                      activate: ({enabled}) => {
                                          if (enabled) {
                                              updateMenuState(inputs.gameState, {
                                                  ruleDebug: true,
                                              });
                                              router.setRoute(debugRoute);
                                          }
                                      },
                                  },
                              })}
                          >
                              Debug
                          </${VirGameButton}>
                      `}
                <${VirGameButton}
                    ${testId(testIds.restartMissionButton)}
                    ${nav(navController, {
                        y: isDeployed ? 3 : 4,
                        listeners: {
                            activate({enabled}) {
                                if (enabled) {
                                    resetMission({
                                        gameState: inputs.gameState,
                                    });
                                    updateMenuState(inputs.gameState, undefined);
                                }
                            },
                        },
                    })}
                >
                    Restart Mission
                </${VirGameButton}>
                ${mainMenuAllowed
                    ? html`
                          <${VirGameButton}
                              ${testId(testIds.endMissionButton)}
                              ${nav(navController, {
                                  y: isDeployed ? 4 : 5,
                                  listeners: {
                                      activate({enabled}) {
                                          if (enabled) {
                                              resetMission({
                                                  gameState: inputs.gameState,
                                              });
                                              updateMenuState(inputs.gameState, {
                                                  mainMenu: true,
                                              });
                                          }
                                      },
                                  },
                              })}
                          >
                              End Mission
                          </${VirGameButton}>
                      `
                    : nothing}
            </div>
        `;
    },
});
