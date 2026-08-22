import {css, defineElement, html} from 'element-vir';
import {themeDefaultKey} from 'theme-vir';
import {viraTheme} from 'vira';
import {calculateExperienceRequiredToReachLevel} from '../../data/player-level.js';
import {GameZIndex} from '../../data/z-index.js';
import {VirGameProgress} from './vir-game-progress.element.js';

export const VirMissionHud = defineElement<{
    playerLevel: number;
    playerLevelExperience: number;
    progressTransitionDurationMilliseconds: number;
}>()({
    tagName: 'vir-mission-hud',
    styles: css`
        :host {
            color: ${viraTheme.colors[themeDefaultKey].foreground.value};
            display: flex;
            left: 16px;
            right: 16px;
            top: 16px;
            pointer-events: none;
            position: fixed;
            z-index: ${GameZIndex.Game};
        }

        .level-wrapper {
            height: 100%;
            width: 100%;
            top: 0;
            left: 0;
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            text-shadow:
                -1px -1px 0 black,
                0 -1px 0 black,
                1px -1px 0 black,
                -1px 0 0 black,
                1px 0 0 black,
                -1px 1px 0 black,
                0 1px 0 black,
                1px 1px 0 black;
        }
    `,
    render({inputs}) {
        const experienceRequired = calculateExperienceRequiredToReachLevel(inputs.playerLevel + 1);

        return html`
            <${VirGameProgress.assign({
                max: experienceRequired,
                min: 0,
                transitionDurationMilliseconds: inputs.progressTransitionDurationMilliseconds,
                value: inputs.playerLevelExperience,
            })}></${VirGameProgress}>
            <div class="level-wrapper">
                <span>${inputs.playerLevel || ''}</span>
            </div>
        `;
    },
});
