export const asteroidSpawnIntervalMilliseconds = 1500;

export function calculateAsteroidSpawnCount({
    currentTime,
    lastAsteroidSpawnedAt,
}: Readonly<{
    currentTime: number;
    lastAsteroidSpawnedAt: number;
}>) {
    return Math.max(
        0,
        Math.floor((currentTime - lastAsteroidSpawnedAt) / asteroidSpawnIntervalMilliseconds),
    );
}
