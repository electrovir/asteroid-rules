import {type VirtualViewportSize} from '@antha/graphics-2d';
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
import {shiftGameEntityPositions} from './mission-screen-size.js';

function updateMissionScreenSize({
    entityStore,
    missionState,
    screenSize,
}: Readonly<{
    entityStore: NonNullable<AsteroidsGameEngineState['entityStore']>;
    missionState: NonNullable<AsteroidsGameEngineState['missionState']>;
    screenSize: Readonly<VirtualViewportSize>;
}>) {
    if (
        missionState.screenSize.width === screenSize.width &&
        missionState.screenSize.height === screenSize.height
    ) {
        return missionState;
    }

    shiftGameEntityPositions({
        entities: Array.from(entityStore.currentEntityInstances),
        playerPosition: missionState.players[PlayerPosition['1']]?.params,
        previousScreenSize: missionState.screenSize,
        screenSize,
    });

    return {
        ...missionState,
        screenSize,
    };
}

async function updateMissionPlayers({
    gameState,
}: Readonly<{
    gameState: Partial<AsteroidsGameEngineState>;
}>) {
    const entityStore = gameState.entityStore;
    const virtualViewport = gameState.virtualViewport;
    const missionState = gameState.missionState;

    if (!entityStore || !virtualViewport || !missionState) {
        return;
    }

    const secondPlayer = missionState.players[PlayerPosition['2']];

    if (gameState.saveState?.modifiers.twoPlayers && !secondPlayer) {
        const addedSecondPlayer = await entityStore.addEntity(PlayerEntity, {
            color: '#00aaff',
            inputPlayerPosition: PlayerPosition['2'],
            x: virtualViewport.width * 0.65,
            y: virtualViewport.height / 2,
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
    const entityStore = gameState.entityStore;
    const virtualViewport = gameState.virtualViewport;

    if (!entityStore || !virtualViewport) {
        return false;
    }

    if (gameState.missionState) {
        gameState.missionState = updateMissionScreenSize({
            entityStore,
            missionState: gameState.missionState,
            screenSize: virtualViewport,
        });
    } else {
        const players = {
            [PlayerPosition['1']]: await entityStore.addEntity(PlayerEntity, {
                color: '#39ff14',
                inputPlayerPosition: PlayerPosition['1'],
                x: virtualViewport.width / 2,
                y: virtualViewport.height / 2,
            }),
        };
        const asteroidSpawnInterval = getAsteroidSpawnInterval({
            modifiers: gameState.saveState?.modifiers || {},
        });

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
            screenSize: virtualViewport,
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
    const virtualViewport = gameState.virtualViewport;

    if (!missionState || !entityStore || !virtualViewport) {
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

    const asteroidSpawnInterval = getAsteroidSpawnInterval({
        missionDurationMilliseconds: currentTime - missionState.missionStartedAt,
        modifiers: gameState.saveState?.modifiers || {},
    });

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
                screen: virtualViewport,
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
