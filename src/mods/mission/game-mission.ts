import {createStableRandom, StableMath} from '@antha/util';
import {createCuid2, executeCount} from '@augment-vir/common';
import {PlayerPosition, type AsteroidsGameEngineState} from '../../data/game-state.js';
import {getAsteroidHealth, getAsteroidSpawnInterval} from '../../data/gameplay-modifiers.js';
import {
    AsteroidEntity,
    calculateAsteroidSpawnCount,
    createAsteroidParams,
} from '../../entities/asteroid.entity.js';
import {PlayerEntity} from '../../entities/player.entity.js';

async function updateMissionPlayers({
    gameState,
}: Readonly<{
    gameState: Partial<AsteroidsGameEngineState>;
}>) {
    const entityStore = gameState.entityStore;
    const missionState = gameState.missionState;
    const pixiApplication = gameState.pixi?.pixiApplication;

    if (!entityStore || !missionState || !pixiApplication) {
        return;
    }

    const secondPlayer = missionState.players[PlayerPosition['2']];

    if (gameState.saveState?.modifiers.twoPlayers && !secondPlayer) {
        const addedSecondPlayer = await entityStore.addEntity(PlayerEntity, {
            color: '#00aaff',
            inputPlayerPosition: PlayerPosition['2'],
            x: pixiApplication.screen.width * 0.65,
            y: pixiApplication.screen.height / 2,
        });

        gameState.missionState = {
            ...missionState,
            players: {
                ...missionState.players,
                [PlayerPosition['2']]: addedSecondPlayer,
            },
        };
    } else if (!gameState.saveState?.modifiers.twoPlayers && secondPlayer) {
        if (!secondPlayer.isDestroyed) {
            secondPlayer.destroy();
        }
        gameState.missionState = {
            ...missionState,
            players: {
                ...missionState.players,
                [PlayerPosition['2']]: undefined,
            },
        };
    }
}

export async function ensureGameMission({
    currentTime,
    gameState,
}: Readonly<{
    currentTime: number;
    gameState: Partial<AsteroidsGameEngineState>;
}>) {
    const pixiApplication = gameState.pixi?.pixiApplication;
    const entityStore = gameState.entityStore;

    if (!entityStore || !pixiApplication) {
        return false;
    }

    if (!gameState.missionState) {
        const players = {
            [PlayerPosition['1']]: await entityStore.addEntity(PlayerEntity, {
                color: '#39ff14',
                inputPlayerPosition: PlayerPosition['1'],
                x: pixiApplication.screen.width / 2,
                y: pixiApplication.screen.height / 2,
            }),
        };
        const asteroidSpawnInterval = getAsteroidSpawnInterval(
            gameState.saveState?.modifiers || {},
        );

        gameState.missionState = {
            experienceEarned: 0,
            lastAsteroidSpawnedAt: StableMath.round(currentTime - asteroidSpawnInterval),
            lastTimedExperienceEarnedAt: StableMath.round(currentTime),
            levelUpAnimation: undefined,
            missionStartedAt: StableMath.round(currentTime),
            pendingExperienceGained: 0,
            pendingExperienceSpent: 0,
            players,
            seededRandom: createStableRandom(createCuid2()),
        };
    }

    await updateMissionPlayers({
        gameState,
    });

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

    const asteroidSpawnInterval = getAsteroidSpawnInterval(gameState.saveState?.modifiers || {});

    const asteroidSpawnCount = calculateAsteroidSpawnCount({
        currentTime,
        lastAsteroidSpawnedAt: missionState.lastAsteroidSpawnedAt,
        spawnIntervalMilliseconds: asteroidSpawnInterval,
    });

    if (!asteroidSpawnCount) {
        return;
    }

    await executeCount(asteroidSpawnCount, async () => {
        await entityStore.addEntity(
            AsteroidEntity,
            createAsteroidParams({
                health: getAsteroidHealth(gameState.saveState?.modifiers || {}),
                random: missionState.seededRandom,
                screen: pixiApplication.screen,
            }),
        );
    });

    gameState.missionState = {
        ...missionState,
        lastAsteroidSpawnedAt: StableMath.round(
            missionState.lastAsteroidSpawnedAt + asteroidSpawnCount * asteroidSpawnInterval,
        ),
    };
}
