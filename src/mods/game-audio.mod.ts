import {defineAnthaMod} from '@antha/engine';
import {check} from '@augment-vir/assert';
import {defaultGameAudioVolume, GameAudio, gameAudioFiles} from '../data/game-audio.js';
import {type AsteroidsGameEngineState} from '../data/game-state.js';

type GameAudioModState = {
    activeBackgroundAudio: GameAudio | undefined;
    backgroundAudioPlaybackId: number;
    isBackgroundAudioPaused: boolean;
    isBackgroundAudioPlaying: boolean;
    isWaitingForAudioPermission: boolean;
};

export function selectBackgroundGameAudio({
    hasMission,
    isMainMenu,
    isPlayerDead,
}: Readonly<{
    hasMission: boolean;
    isMainMenu: boolean;
    isPlayerDead: boolean;
}>) {
    if (isMainMenu) {
        return GameAudio.MenuMusic;
    } else if (hasMission && !isPlayerDead) {
        return GameAudio.GameMusic;
    } else {
        return undefined;
    }
}

export function shouldPauseBackgroundGameAudio({
    backgroundAudio,
    isPauseMenuOpen,
    isRuleUnlockMenuOpen,
}: Readonly<{
    backgroundAudio: GameAudio | undefined;
    isPauseMenuOpen: boolean;
    isRuleUnlockMenuOpen: boolean;
}>) {
    return backgroundAudio === GameAudio.GameMusic && (isPauseMenuOpen || isRuleUnlockMenuOpen);
}

async function playBackgroundGameAudio({
    audio,
    audioPlayer,
    gameState,
    playbackId,
}: Readonly<{
    audio: GameAudio;
    audioPlayer: NonNullable<AsteroidsGameEngineState['audioPlayer']>;
    gameState: Partial<AsteroidsGameEngineState & GameAudioModState>;
    playbackId: number;
}>) {
    const didPlay = await audioPlayer.play(gameAudioFiles[audio]);

    if (
        gameState.activeBackgroundAudio !== audio ||
        gameState.backgroundAudioPlaybackId !== playbackId
    ) {
        return;
    }

    gameState.isBackgroundAudioPlaying = false;
    gameState.isWaitingForAudioPermission = !didPlay;
}

export const gameAudioMod = defineAnthaMod<AsteroidsGameEngineState & GameAudioModState>({
    initState: {
        activeBackgroundAudio: undefined,
        backgroundAudioPlaybackId: 0,
        isBackgroundAudioPaused: false,
        isBackgroundAudioPlaying: false,
        isWaitingForAudioPermission: false,
    },
    modName: 'game-audio',
    execute({state}) {
        const audioPlayer = state.audioPlayer;

        if (!audioPlayer) {
            return;
        }

        const audioVolume = state.saveState?.audioVolume ?? defaultGameAudioVolume;

        if (!check.isApproximately(audioPlayer.gainNode.gain.value, audioVolume, 0.00001)) {
            audioPlayer.gainNode.gain.value = audioVolume;
        }

        const backgroundAudio = selectBackgroundGameAudio({
            hasMission: !!state.missionState,
            isMainMenu: !!state.menuState?.mainMenu,
            isPlayerDead: !!state.menuState?.youDied,
        });

        if (backgroundAudio !== state.activeBackgroundAudio) {
            const previousBackgroundAudio = state.activeBackgroundAudio;

            state.activeBackgroundAudio = backgroundAudio;
            state.backgroundAudioPlaybackId = (state.backgroundAudioPlaybackId || 0) + 1;
            state.isBackgroundAudioPaused = false;
            state.isBackgroundAudioPlaying = false;
            state.isWaitingForAudioPermission = false;

            if (previousBackgroundAudio) {
                audioPlayer.stopFile(gameAudioFiles[previousBackgroundAudio]);
            }
        }

        const shouldPauseBackgroundAudio = shouldPauseBackgroundGameAudio({
            backgroundAudio,
            isPauseMenuOpen: !!state.menuState?.pause,
            isRuleUnlockMenuOpen: !!state.menuState?.ruleUnlock,
        });

        if (shouldPauseBackgroundAudio && !state.isBackgroundAudioPaused) {
            audioPlayer.pauseFile(gameAudioFiles[GameAudio.GameMusic]);
            state.isBackgroundAudioPaused = true;
        } else if (!shouldPauseBackgroundAudio && state.isBackgroundAudioPaused) {
            audioPlayer.resumeFile(gameAudioFiles[GameAudio.GameMusic]);
            state.isBackgroundAudioPaused = false;
        }

        if (
            !backgroundAudio ||
            shouldPauseBackgroundAudio ||
            state.isBackgroundAudioPlaying ||
            (state.isWaitingForAudioPermission && audioPlayer.audioContext.state !== 'running')
        ) {
            return;
        }

        state.isBackgroundAudioPlaying = true;
        void playBackgroundGameAudio({
            audio: backgroundAudio,
            audioPlayer,
            gameState: state,
            playbackId: state.backgroundAudioPlaybackId || 0,
        }).catch(() => {
            state.isBackgroundAudioPlaying = false;
        });
    },
});
