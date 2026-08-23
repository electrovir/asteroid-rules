import {nav} from '@antha/input';
import {css, defineElement, html, nothing, testId} from 'element-vir';
import {noNativeSpacing, viraTheme} from 'vira';
import {GameAudio, gameAudioFiles} from '../../data/game-audio.js';
import {updateMenuState, type AsteroidsGameEngineState} from '../../data/game-state.js';
import {resetMission} from '../../mods/mission/reset-mission.js';
import {VirGameButton} from './vir-game-button.element.js';

export const VirGameOverMenu = defineElement<{
    experienceEarned: number;
    gameState: Partial<AsteroidsGameEngineState>;
}>()({
    tagName: 'vir-game-over-menu',
    testIds: [
        'terminateMissionButton',
    ],
    styles: css`
        :host {
            align-items: center;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            gap: 24px;
            height: 100%;
            justify-content: center;
            padding: 16px;
            width: 100%;
        }

        h1,
        p {
            ${noNativeSpacing}
        }

        h1 {
            color: ${viraTheme.colors['vira-red-foreground-header'].foreground.value};
            font-size: 48px;
        }

        p {
            font-size: 24px;
        }

        .xp {
            color: ${viraTheme.colors['vira-green-foreground-header'].foreground.value};
        }
    `,
    render({inputs, testIds}) {
        const navController = inputs.gameState.navController;

        if (!navController) {
            return nothing;
        }

        return html`
            <h1>You Died</h1>
            <p>
                You earned
                <span class="xp">${inputs.experienceEarned} XP.</span>
            </p>
            <${VirGameButton}
                ${testId(testIds.terminateMissionButton)}
                ${nav(navController, {
                    autoFocus: true,
                    listeners: {
                        activate: ({enabled}) => {
                            if (enabled) {
                                inputs.gameState.audioPlayer?.stopFile(
                                    gameAudioFiles[GameAudio.PlayerDeathMusic],
                                );
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
                Terminate Mission
            </${VirGameButton}>
        `;
    },
});
