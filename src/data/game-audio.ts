import {type AudioPlayer, type AudioSetupParams} from '@antha/audio';
import {getObjectTypedValues} from '@augment-vir/common';
import {buildUrl} from 'url-vir';

export enum GameAudio {
    AsteroidCollisionCrash = 'asteroidCollisionCrash',
    AsteroidCollisionMetalOne = 'asteroidCollisionMetalOne',
    AsteroidCollisionMetalThree = 'asteroidCollisionMetalThree',
    AsteroidCollisionMetalTwo = 'asteroidCollisionMetalTwo',
    AsteroidDeath = 'asteroidDeath',
    AsteroidDeathExplosionOne = 'asteroidDeathExplosionOne',
    AsteroidDeathExplosionThree = 'asteroidDeathExplosionThree',
    AsteroidDeathExplosionTwo = 'asteroidDeathExplosionTwo',
    GameMusic = 'gameMusic',
    MenuMusic = 'menuMusic',
    PlayerDeath = 'playerDeath',
    PlayerDeathMusic = 'playerDeathMusic',
    RuleUnlocked = 'ruleUnlocked',
    Shoot = 'shoot',
}

function createGameAudioSource(fileName: string) {
    return buildUrl(document.baseURI, `./audio/${fileName}`).href;
}

export const gameAudioFiles = {
    [GameAudio.AsteroidCollisionCrash]: {
        sources: createGameAudioSource('asteroid-collision-0.ogg'),
        volume: 0.03,
    },
    [GameAudio.AsteroidCollisionMetalOne]: {
        sources: createGameAudioSource('asteroid-collision-1.ogg'),
        volume: 0.08,
    },
    [GameAudio.AsteroidCollisionMetalThree]: {
        sources: createGameAudioSource('asteroid-collision-3.ogg'),
        volume: 0.08,
    },
    [GameAudio.AsteroidCollisionMetalTwo]: {
        sources: createGameAudioSource('asteroid-collision-2.ogg'),
        volume: 0.08,
    },
    [GameAudio.AsteroidDeath]: {
        sources: createGameAudioSource('asteroid-death-0.ogg'),
        volume: 0.12,
    },
    [GameAudio.AsteroidDeathExplosionOne]: {
        sources: createGameAudioSource('asteroid-death-1.ogg'),
        volume: 0.12,
    },
    [GameAudio.AsteroidDeathExplosionThree]: {
        sources: createGameAudioSource('asteroid-death-3.ogg'),
        volume: 0.12,
    },
    [GameAudio.AsteroidDeathExplosionTwo]: {
        sources: createGameAudioSource('asteroid-death-2.ogg'),
        volume: 0.12,
    },
    [GameAudio.GameMusic]: {
        sources: createGameAudioSource('game-music.mp3'),
        volume: 0.12,
    },
    [GameAudio.MenuMusic]: {
        sources: createGameAudioSource('menu-music.ogg'),
        volume: 0.24,
    },
    [GameAudio.PlayerDeath]: {
        sources: createGameAudioSource('player-death.ogg'),
        volume: 0.35,
    },
    [GameAudio.PlayerDeathMusic]: {
        sources: createGameAudioSource('player-death-music.ogg'),
        volume: 0.1,
    },
    [GameAudio.RuleUnlocked]: {
        sources: createGameAudioSource('rule-unlocked.ogg'),
        volume: 0.3,
    },
    [GameAudio.Shoot]: {
        sources: createGameAudioSource('shoot.ogg'),
        volume: 0.3,
    },
} satisfies Record<GameAudio, AudioSetupParams>;

export const gameAudioFilesToLoad = getObjectTypedValues(gameAudioFiles);

export function playGameAudio(
    gameState: {audioPlayer?: AudioPlayer | undefined},
    audioFile: GameAudio,
) {
    if (!gameState.audioPlayer) {
        return;
    }

    void gameState.audioPlayer.play(gameAudioFiles[audioFile]).catch(() => {});
}

export function resumeGameAudio({
    audioPlayer,
}: Readonly<{
    audioPlayer: AudioPlayer | undefined;
}>) {
    void audioPlayer?.audioContext.resume().catch(() => {});
}
