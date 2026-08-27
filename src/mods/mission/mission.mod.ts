import {createEngineTime, defineAnthaMod} from '@antha/engine';
import {StableMath} from '@antha/util';
import {getObjectTypedValues} from '@augment-vir/common';
import {html, nothing} from 'element-vir';
import {GameAudio, playGameAudio} from '../../data/game-audio.js';
import {type AsteroidsGameEngineState, updateMenuState} from '../../data/game-state.js';
import {
    calculateExperienceMultiplier,
    getTimedExperienceMultiplier,
} from '../../data/gameplay-modifiers.js';
import {PlayerAction} from '../../data/player-action.js';
import {
    calculateExperienceRequiredToReachLevel,
    levelUpPresentationDurationMilliseconds,
} from '../../data/player-level.js';
import {getGameRulesUnlockedAtLevel} from '../../data/rules.js';
import {
    isPrimaryMouseButtonHeld,
    PlayerEntity,
    updatePlayerFiringAllowed,
} from '../../entities/player.entity.js';
import {VirMissionHud} from '../../ui/elements/vir-mission-hud.element.js';
import {ensureGameMission, updateMissionAsteroidSpawning} from './game-mission.js';
import {shouldShowGameOver} from './should-show-game-over.js';

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
    const nextPlayerLevelExperience = Math.max(
        0,
        StableMath.round(playerLevelExperience + experience),
    );
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
        isPlayerFiringAllowed: false,
        isMouseMovementAllowed: false,
    },
    modName: 'mission',
    async execute({engine, state}) {
        const isFireButtonHeld = getObjectTypedValues(state.activeBindings || {}).some(
            (bindings) => {
                return !!bindings[PlayerAction.Fire]?.value;
            },
        );

        /** Don't allow player firing until after the button has been lifted after exiting a menu. */
        state.isPlayerFiringAllowed = state.menuState
            ? false
            : updatePlayerFiringAllowed({
                  isFireButtonHeld,
                  wasFiringAllowed: state.isPlayerFiringAllowed || false,
              });
        state.isMouseMovementAllowed = state.menuState
            ? false
            : /** Don't allow player movement until after the mouse button has been lifted _after_ exiting a menu. */
              !isPrimaryMouseButtonHeld(state.rawInputs) || state.isMouseMovementAllowed || false;

        if (state.saveState && !state.menuState) {
            await ensureGameMission({
                currentTime: engine.totalMs,
                gameState: state,
            });
        }

        if (!state.saveState || !state.missionState) {
            return nothing;
        }

        if (
            !state.menuState &&
            state.entityStore &&
            shouldShowGameOver(Array.from(state.entityStore.getEntities(PlayerEntity)))
        ) {
            state.inputDisableEndsAt = createEngineTime(engine.totalMs + 1000);
            updateMenuState(state, {
                youDied: true,
            });
        }

        const saveState = state.saveState;
        const missionState = state.missionState;
        const activeLevelUpAnimation =
            missionState.levelUpAnimation && missionState.levelUpAnimation.endsAt > engine.totalMs
                ? missionState.levelUpAnimation
                : undefined;

        const timedExperienceIntervals = Math.max(
            0,
            Math.floor(
                StableMath.round(engine.totalMs - missionState.lastTimedExperienceEarnedAt) /
                    timedExperienceIntervalMilliseconds,
            ),
        );

        const timedExperienceGained =
            saveState.modifiers.timedXp && !state.menuState
                ? timedExperienceIntervals *
                  experiencePerTimedGain *
                  getTimedExperienceMultiplier(saveState.modifiers)
                : 0;
        const experienceGained = timedExperienceGained + missionState.pendingExperienceGained;
        const experienceSpent = missionState.pendingExperienceSpent;
        const shouldProcessExperience =
            !state.menuState && (experienceGained > 0 || experienceSpent > 0);
        const experienceChange =
            experienceGained *
                calculateExperienceMultiplier({
                    currentTime: engine.totalMs,
                    missionStartedAt: missionState.missionStartedAt,
                    modifiers: saveState.modifiers,
                }) -
            experienceSpent;
        const updatedExperience = shouldProcessExperience
            ? applyExperience({
                  experience: experienceChange,
                  playerLevel: saveState.playerLevel,
                  playerLevelExperience: saveState.playerLevelExperience,
              })
            : {
                  playerLevel: saveState.playerLevel,
                  playerLevelExperience: saveState.playerLevelExperience,
              };
        const newlyUnlockedRules = getGameRulesUnlockedAtLevel(
            updatedExperience.playerLevel,
        ).filter((rule) => {
            return !saveState.unlockedGameRules.includes(rule);
        });

        if (shouldProcessExperience) {
            state.saveState = {
                ...saveState,
                ...updatedExperience,
                newGameRules: saveState.newGameRules.concat(newlyUnlockedRules),
                unlockedGameRules: saveState.unlockedGameRules.concat(newlyUnlockedRules),
            };

            if (newlyUnlockedRules.length) {
                playGameAudio(state, GameAudio.RuleUnlocked);
            }
        }

        state.missionState = {
            ...missionState,
            experienceEarned: shouldProcessExperience
                ? Math.max(0, StableMath.round(missionState.experienceEarned + experienceChange))
                : missionState.experienceEarned,
            lastTimedExperienceEarnedAt:
                state.menuState || !saveState.modifiers.timedXp
                    ? StableMath.round(engine.totalMs)
                    : StableMath.round(
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
            pendingExperienceGained: shouldProcessExperience
                ? 0
                : missionState.pendingExperienceGained,
            pendingExperienceSpent: shouldProcessExperience
                ? 0
                : missionState.pendingExperienceSpent,
        };

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
