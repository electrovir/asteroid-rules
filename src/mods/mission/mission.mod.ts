import {defineAnthaMod} from '@antha/engine';
import {StableMath} from '@antha/util';
import {html, nothing} from 'element-vir';
import {type AsteroidsGameEngineState} from '../../data/game-state.js';
import {calculateExperienceRequiredToReachLevel} from '../../data/player-level.js';
import {isPrimaryMouseButtonHeld} from '../../data/player-movement.js';
import {VirMissionHud} from '../../ui/elements/vir-mission-hud.element.js';
import {ensureGameMission, updateMissionAsteroidSpawning} from './game-mission.js';

const timedExperienceIntervalMilliseconds = 1000;

/** An explicit return type is required because this function recursively applies multi-level gains. */
function applyExperience({
    experience,
    playerLevel,
    playerLevelExperience,
}: Readonly<{
    experience: number;
    playerLevel: number;
    playerLevelExperience: number;
}>): Readonly<{
    playerLevel: number;
    playerLevelExperience: number;
}> {
    const nextPlayerLevelExperience = StableMath.round(playerLevelExperience + experience);
    const experienceRequired = calculateExperienceRequiredToReachLevel(playerLevel + 1);

    if (nextPlayerLevelExperience < experienceRequired) {
        return {
            playerLevel,
            playerLevelExperience: nextPlayerLevelExperience,
        };
    }

    return applyExperience({
        experience: 0,
        playerLevel: playerLevel + 1,
        playerLevelExperience: StableMath.round(nextPlayerLevelExperience - experienceRequired),
    });
}

export const missionMod = defineAnthaMod<AsteroidsGameEngineState>({
    initState: {
        isMouseMovementAllowed: false,
    },
    modName: 'mission',
    async execute({engine, state}) {
        state.isMouseMovementAllowed = state.menuState
            ? false
            : /** Don't allow player movement until after the mouse button has been lifted _after_ exiting a menu. */
              !isPrimaryMouseButtonHeld(state.rawInputs) || state.isMouseMovementAllowed || false;

        if (state.saveState && !state.missionState && !state.menuState) {
            await ensureGameMission({
                currentTime: engine.totalMs,
                gameState: state,
            });
        }

        if (!state.saveState || !state.missionState) {
            return nothing;
        }

        const timedExperienceIntervals = Math.max(
            0,
            Math.floor(
                StableMath.round(engine.totalMs - state.missionState.lastTimedExperienceEarnedAt) /
                    timedExperienceIntervalMilliseconds,
            ),
        );

        if (state.saveState.modifiers.timedXp && !state.menuState && timedExperienceIntervals > 0) {
            state.saveState = {
                ...state.saveState,
                ...applyExperience({
                    experience: timedExperienceIntervals,
                    playerLevel: state.saveState.playerLevel,
                    playerLevelExperience: state.saveState.playerLevelExperience,
                }),
            };
            state.missionState = {
                ...state.missionState,
                lastTimedExperienceEarnedAt: StableMath.round(
                    state.missionState.lastTimedExperienceEarnedAt +
                        timedExperienceIntervals * timedExperienceIntervalMilliseconds,
                ),
            };
        } else if (state.menuState || !state.saveState.modifiers.timedXp) {
            state.missionState = {
                ...state.missionState,
                lastTimedExperienceEarnedAt: StableMath.round(engine.totalMs),
            };
        }

        await updateMissionAsteroidSpawning({
            currentTime: engine.totalMs,
            gameState: state,
        });

        return html`
            <${VirMissionHud.assign({
                playerLevel: state.saveState.playerLevel,
                playerLevelExperience: state.saveState.playerLevelExperience,
            })}></${VirMissionHud}>
        `;
    },
});
