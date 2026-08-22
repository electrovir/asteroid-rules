import {createStableRandom, StableMath} from '@antha/util';
import {createCuid2, executeCount} from '@augment-vir/common';
import {PlayerPosition, type AsteroidsGameEngineState} from '../../data/game-state.js';
import {AsteroidEntity, createAsteroidParams} from '../../entities/asteroid.entity.js';
import {PlayerEntity} from '../../entities/player.entity.js';
import {
    asteroidSpawnIntervalMilliseconds,
    calculateAsteroidSpawnCount,
} from './asteroid-spawning.js';

export async function ensureGameMission({
    currentTime,
    gameState,
}: Readonly<{
    currentTime: number;
    gameState: Partial<AsteroidsGameEngineState>;
}>) {
    if (gameState.missionState) {
        return true;
    }

    const pixiApplication = gameState.pixi?.pixiApplication;

    const entityStore = gameState.entityStore;

    if (!entityStore || !pixiApplication) {
        return false;
    }

    const players = {
        [PlayerPosition['1']]: await entityStore.addEntity(PlayerEntity, {
            inputPlayerPosition: PlayerPosition['1'],
            x: pixiApplication.screen.width / 2,
            y: pixiApplication.screen.height / 2,
        }),
    };

    gameState.missionState = {
        lastAsteroidSpawnedAt: -asteroidSpawnIntervalMilliseconds,
        lastTimedExperienceEarnedAt: StableMath.round(currentTime),
        levelUpAnimation: undefined,
        players,
        seededRandom: createStableRandom(createCuid2()),
    };

    return true;
}

export async function updateMissionAsteroidSpawning({
    currentTime,
    gameState,
}: Readonly<{
    currentTime: number;
    gameState: Partial<AsteroidsGameEngineState>;
}>) {
    const missionState = gameState.missionState;
    const entityStore = gameState.entityStore;
    const pixiApplication = gameState.pixi?.pixiApplication;

    if (!missionState || !entityStore || !pixiApplication) {
        return;
    } else if (gameState.menuState) {
        gameState.missionState = {
            ...missionState,
            /**
             * Keep the last asteroid spawned at time up to date when paused so that pausing doesn't
             * accumulate asteroids.
             */
            lastAsteroidSpawnedAt: StableMath.round(currentTime),
        };
        return;
    }

    const asteroidSpawnCount = calculateAsteroidSpawnCount({
        currentTime,
        lastAsteroidSpawnedAt: missionState.lastAsteroidSpawnedAt,
    });

    if (!asteroidSpawnCount) {
        return;
    }

    await executeCount(asteroidSpawnCount, async () => {
        await entityStore.addEntity(
            AsteroidEntity,
            createAsteroidParams({
                random: missionState.seededRandom,
                screen: pixiApplication.screen,
            }),
        );
    });

    gameState.missionState = {
        ...missionState,
        lastAsteroidSpawnedAt: StableMath.round(
            missionState.lastAsteroidSpawnedAt +
                asteroidSpawnCount * asteroidSpawnIntervalMilliseconds,
        ),
    };
}
