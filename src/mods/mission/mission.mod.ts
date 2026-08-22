import {defineAnthaMod} from '@antha/engine';
import {StableMath} from '@antha/util';
import {html, nothing} from 'element-vir';
import {type AsteroidsGameEngineState} from '../../data/game-state.js';
import {
    calculateExperienceRequiredToReachLevel,
    levelUpPresentationDurationMilliseconds,
} from '../../data/player-level.js';
import {isPrimaryMouseButtonHeld} from '../../data/player-movement.js';
import {getGameRulesUnlockedAtLevel} from '../../data/rules.js';
import {VirMissionHud} from '../../ui/elements/vir-mission-hud.element.js';
import {ensureGameMission, updateMissionAsteroidSpawning} from './game-mission.js';

const timedExperienceIntervalMilliseconds = 1000;
const experiencePerTimedGain = 0.5;

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

        const saveState = state.saveState;
        const missionState = state.missionState;
        const activeLevelUpAnimation =
            missionState.levelUpAnimation && missionState.levelUpAnimation.endsAt > engine.totalMs
                ? missionState.levelUpAnimation
                : undefined;

        if (activeLevelUpAnimation !== missionState.levelUpAnimation) {
            state.missionState = {
                ...missionState,
                levelUpAnimation: activeLevelUpAnimation,
            };
        }

        const timedExperienceIntervals = Math.max(
            0,
            Math.floor(
                StableMath.round(engine.totalMs - missionState.lastTimedExperienceEarnedAt) /
                    timedExperienceIntervalMilliseconds,
            ),
        );

        if (saveState.modifiers.timedXp && !state.menuState && timedExperienceIntervals > 0) {
            const updatedExperience = applyExperience({
                experience: timedExperienceIntervals * experiencePerTimedGain,
                playerLevel: saveState.playerLevel,
                playerLevelExperience: saveState.playerLevelExperience,
            });
            const newlyUnlockedRules = getGameRulesUnlockedAtLevel(
                updatedExperience.playerLevel,
            ).filter((rule) => {
                return !saveState.unlockedGameRules.includes(rule);
            });

            state.saveState = {
                ...saveState,
                ...updatedExperience,
                unlockedGameRules: saveState.unlockedGameRules.concat(newlyUnlockedRules),
            };
            state.missionState = {
                ...missionState,
                lastTimedExperienceEarnedAt: StableMath.round(
                    missionState.lastTimedExperienceEarnedAt +
                        timedExperienceIntervals * timedExperienceIntervalMilliseconds,
                ),
                levelUpAnimation:
                    updatedExperience.playerLevel > saveState.playerLevel
                        ? {
                              endsAt: StableMath.round(
                                  engine.totalMs + levelUpPresentationDurationMilliseconds,
                              ),
                              playerLevel: saveState.playerLevel,
                          }
                        : activeLevelUpAnimation,
                pendingRuleUnlocks: missionState.pendingRuleUnlocks.concat(newlyUnlockedRules),
            };
        } else if (state.menuState || !state.saveState.modifiers.timedXp) {
            state.missionState = {
                ...missionState,
                lastTimedExperienceEarnedAt: StableMath.round(engine.totalMs),
                levelUpAnimation: activeLevelUpAnimation,
            };
        }

        await updateMissionAsteroidSpawning({
            currentTime: engine.totalMs,
            gameState: state,
        });

        return html`
            <${VirMissionHud.assign({
                playerLevel:
                    state.missionState.levelUpAnimation?.playerLevel ?? state.saveState.playerLevel,
                playerLevelExperience: state.missionState.levelUpAnimation
                    ? calculateExperienceRequiredToReachLevel(
                          state.missionState.levelUpAnimation.playerLevel + 1,
                      )
                    : state.saveState.playerLevelExperience,
                progressTransitionDurationMilliseconds: levelUpPresentationDurationMilliseconds,
            })}></${VirMissionHud}>
        `;
    },
});
