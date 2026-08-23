import {defineAnthaMod} from '@antha/engine';
import {GameAudio, gameAudioFiles} from '../data/game-audio.js';
import {type AsteroidsGameEngineState} from '../data/game-state.js';

type GameAudioModState = {
    activeBackgroundAudio: GameAudio | undefined;
    backgroundAudioPlaybackId: number;
    isBackgroundAudioPlaying: boolean;
    isWaitingForAudioPermission: boolean;
};

export function selectBackgroundGameAudio({
    hasNewRules,
    hasMission,
    isMainMenu,
    isPlayerDead,
}: Readonly<{
    hasNewRules: boolean;
    hasMission: boolean;
    isMainMenu: boolean;
    isPlayerDead: boolean;
}>) {
    if (isMainMenu) {
        return GameAudio.MenuMusic;
    } else if (hasMission && !isPlayerDead && !hasNewRules) {
        return GameAudio.GameMusic;
    } else {
        return undefined;
    }
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
        isBackgroundAudioPlaying: false,
        isWaitingForAudioPermission: false,
    },
    modName: 'game-audio',
    execute({state}) {
        const audioPlayer = state.audioPlayer;

        if (!audioPlayer) {
            return;
        }

        const backgroundAudio = selectBackgroundGameAudio({
            hasNewRules: !!state.saveState?.newGameRules.length,
            hasMission: !!state.missionState,
            isMainMenu: !!state.menuState?.mainMenu,
            isPlayerDead: !!state.menuState?.youDied,
        });

        if (backgroundAudio !== state.activeBackgroundAudio) {
            const previousBackgroundAudio = state.activeBackgroundAudio;

            state.activeBackgroundAudio = backgroundAudio;
            state.backgroundAudioPlaybackId = (state.backgroundAudioPlaybackId || 0) + 1;
            state.isBackgroundAudioPlaying = false;
            state.isWaitingForAudioPermission = false;

            if (previousBackgroundAudio) {
                audioPlayer.stopFile(gameAudioFiles[previousBackgroundAudio]);
            }
        }

        if (
            !backgroundAudio ||
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
