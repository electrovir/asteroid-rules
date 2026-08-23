import {
    position2dParamsMap,
    position2dParamsShape,
    type BaseEntity2d,
    type EntityUpdateParams,
} from '@antha/entity-2d';
import {Graphics} from '@antha/graphics-2d';
import {
    createAxeName,
    createButtonName,
    InputDeviceKey,
    type ActiveBinding,
    type ActiveBindings,
    type RawInputs,
} from '@antha/input';
import {StableMath, stableRandom} from '@antha/util';
import {clamp, createArray, type SeededRandom} from '@augment-vir/common';
import {Polygon} from 'detect-collisions';
import {defineShape, enumShape, nonEmptyStringShape} from 'object-shape-tester';
import {GameAudio, playGameAudio} from '../data/game-audio.js';
import {PlayerPosition, queueMissionExperience} from '../data/game-state.js';
import {
    getPlayerBulletBounceCount,
    getPlayerBulletDamageMultiplier,
    getPlayerBulletHomingTurnRate,
    getPlayerBulletPierceCount,
    getPlayerBulletRadiusMultiplier,
    getPlayerBulletSlowDuration,
    getPlayerBulletSpeedMultiplier,
    getPlayerBulletSplashDamage,
    getPlayerBulletSplashRadius,
    getPlayerCollisionProtectionCount,
    getPlayerGunCount,
    getPlayerMovementSpeedMultiplier,
    getPlayerShotIntervalMultiplier,
    getShotExperienceCost,
} from '../data/gameplay-modifiers.js';
import {type GameModifiers} from '../data/modifiers.js';
import {PlayerAction, type GameInputAction} from '../data/player-action.js';
import {defineEntity} from '../mods/game-entity.mod.js';
import {AsteroidEntity} from './asteroid.entity.js';
import {PlayerBulletEntity} from './player-bullet.entity.js';
import {PlayerExplosionParticleEntity} from './player-explosion-particle.entity.js';

const playerSize = 24;
const playerHalfWidth = playerSize * 0.8;
const playerHalfHeight = playerSize;
const playerDeathAnimationDurationMilliseconds = 500;
const playerExplosionParticleCount = 20;
const playerExplosionParticleLifetimeMilliseconds = 500;
const maximumExplosionParticleSpeed = 0.24;
const minimumExplosionParticleSpeed = 0.08;
const playerBulletSpeedPixelsPerMillisecond = 0.8;
const playerShotIntervalMilliseconds = 200;
const playerSpeedPixelsPerMillisecond = 0.4;
export const playerBulletDamage = 1;
export const playerBulletRadius = 6;
const playerBulletColor = '#ffff66';
const autoTurretBulletColor = '#66ffff';
const playerOutlinePoints = [
    {
        x: 0,
        y: -playerSize,
    },
    {
        x: playerSize * 0.8,
        y: playerSize,
    },
    {
        x: 0,
        y: playerSize * 0.55,
    },
    {
        x: -playerSize * 0.8,
        y: playerSize,
    },
];

export function calculatePlayerMovement({
    activeBindings,
    mouseMovementTarget,
    msSinceLastUpdate,
    playerPosition,
    speedMultiplier = 1,
}: Readonly<{
    activeBindings: ActiveBindings<GameInputAction> | undefined;
    mouseMovementTarget:
        | {
              x: number;
              y: number;
          }
        | undefined;
    msSinceLastUpdate: number;
    playerPosition: Readonly<{
        x: number;
        y: number;
    }>;
    speedMultiplier?: number | undefined;
}>) {
    const cardinalMovement = calculateCardinalMovement({
        activeBindings,
        msSinceLastUpdate,
        speedMultiplier,
    });
    const mouseMovement = calculateMouseMovement({
        mouseMovementTarget,
        msSinceLastUpdate,
        playerPosition,
        speedMultiplier,
    });
    const x = (cardinalMovement?.x || 0) + (mouseMovement?.x || 0);
    const y = (cardinalMovement?.y || 0) + (mouseMovement?.y || 0);
    const movementMagnitude = Math.hypot(x, y);

    if (!movementMagnitude) {
        return undefined;
    }

    const movementMultiplier = Math.min(
        (msSinceLastUpdate * playerSpeedPixelsPerMillisecond * speedMultiplier) / movementMagnitude,
        1,
    );

    return {
        x: x * movementMultiplier,
        y: y * movementMultiplier,
    };
}

export function getMouseMovementTarget({
    canvas,
    rawInputs,
    screen,
}: Readonly<{
    canvas: HTMLCanvasElement | undefined;
    rawInputs: RawInputs | undefined;
    screen: Readonly<{
        height: number;
        width: number;
    }>;
}>) {
    const mouseInputs = rawInputs?.[InputDeviceKey.Mouse];
    const mouseX = mouseInputs?.[createAxeName('x')]?.inputValue;
    const mouseY = mouseInputs?.[createAxeName('y')]?.inputValue;

    if (
        !canvas ||
        !isPrimaryMouseButtonHeld(rawInputs) ||
        mouseX == undefined ||
        mouseY == undefined
    ) {
        return undefined;
    }

    const canvasBounds = canvas.getBoundingClientRect();

    if (!canvasBounds.width || !canvasBounds.height) {
        return undefined;
    }

    return {
        x: ((mouseX - canvasBounds.left) / canvasBounds.width) * screen.width,
        y: ((mouseY - canvasBounds.top) / canvasBounds.height) * screen.height,
    };
}

export function isPrimaryMouseButtonHeld(rawInputs: RawInputs | undefined) {
    return !!rawInputs?.[InputDeviceKey.Mouse]?.[createButtonName(0)]?.inputValue;
}

export function updatePlayerFiringAllowed({
    isFireButtonHeld,
    wasFiringAllowed,
}: Readonly<{
    isFireButtonHeld: boolean;
    wasFiringAllowed: boolean;
}>) {
    return wasFiringAllowed || !isFireButtonHeld;
}

export function createPlayerBulletParams({
    directionX,
    directionY,
    gunOffset,
    modifiers,
    playerX,
    playerY,
}: Readonly<{
    directionX: number;
    directionY: number;
    gunOffset: number;
    modifiers: Readonly<GameModifiers>;
    playerX: number;
    playerY: number;
}>) {
    const lateralDirectionX = -directionY;
    const lateralDirectionY = directionX;

    return {
        color: modifiers.autoTurret ? autoTurretBulletColor : playerBulletColor,
        damage: playerBulletDamage * getPlayerBulletDamageMultiplier(modifiers),
        homingTurnRate: getPlayerBulletHomingTurnRate(modifiers),
        radius: playerBulletRadius * getPlayerBulletRadiusMultiplier(modifiers),
        remainingBounces: getPlayerBulletBounceCount(modifiers),
        remainingPierces: getPlayerBulletPierceCount(modifiers),
        slowDurationMilliseconds: getPlayerBulletSlowDuration(modifiers),
        splashDamage: getPlayerBulletSplashDamage(modifiers),
        splashRadius: getPlayerBulletSplashRadius(modifiers),
        velocityX: StableMath.round(
            directionX *
                playerBulletSpeedPixelsPerMillisecond *
                getPlayerBulletSpeedMultiplier(modifiers),
        ),
        velocityY: StableMath.round(
            directionY *
                playerBulletSpeedPixelsPerMillisecond *
                getPlayerBulletSpeedMultiplier(modifiers),
        ),
        x: StableMath.round(playerX + directionX * playerSize + lateralDirectionX * gunOffset),
        y: StableMath.round(playerY + directionY * playerSize + lateralDirectionY * gunOffset),
    };
}

function calculateCardinalMovement({
    activeBindings,
    msSinceLastUpdate,
    speedMultiplier,
}: Readonly<{
    activeBindings: ActiveBindings<GameInputAction> | undefined;
    msSinceLastUpdate: number;
    speedMultiplier: number;
}>) {
    const upMovement = createMovementInput(activeBindings?.[PlayerAction.MoveUp]);
    const downMovement = createMovementInput(activeBindings?.[PlayerAction.MoveDown]);
    const leftMovement = createMovementInput(activeBindings?.[PlayerAction.MoveLeft]);
    const rightMovement = createMovementInput(activeBindings?.[PlayerAction.MoveRight]);

    const movementY =
        upMovement.value && upMovement.durationMs < downMovement.durationMs
            ? -upMovement.value
            : downMovement.value && downMovement.durationMs < upMovement.durationMs
              ? downMovement.value
              : 0;
    const movementX =
        leftMovement.value && leftMovement.durationMs < rightMovement.durationMs
            ? -leftMovement.value
            : rightMovement.value && rightMovement.durationMs < leftMovement.durationMs
              ? rightMovement.value
              : 0;
    const movementMagnitude = Math.hypot(movementX, movementY);

    if (!movementMagnitude) {
        return undefined;
    }

    return {
        x:
            (movementX / movementMagnitude) *
            msSinceLastUpdate *
            playerSpeedPixelsPerMillisecond *
            speedMultiplier,
        y:
            (movementY / movementMagnitude) *
            msSinceLastUpdate *
            playerSpeedPixelsPerMillisecond *
            speedMultiplier,
    };
}

function calculateMouseMovement({
    mouseMovementTarget,
    msSinceLastUpdate,
    playerPosition,
    speedMultiplier,
}: Readonly<{
    mouseMovementTarget:
        | {
              x: number;
              y: number;
          }
        | undefined;
    msSinceLastUpdate: number;
    playerPosition: Readonly<{
        x: number;
        y: number;
    }>;
    speedMultiplier: number;
}>) {
    if (!mouseMovementTarget) {
        return undefined;
    }

    const xDistance = mouseMovementTarget.x - playerPosition.x;
    const yDistance = mouseMovementTarget.y - playerPosition.y;
    const distance = Math.hypot(xDistance, yDistance);

    if (!distance) {
        return undefined;
    }

    const movementDistance = Math.min(
        distance,
        msSinceLastUpdate * playerSpeedPixelsPerMillisecond * speedMultiplier,
    );

    return {
        x: (xDistance / distance) * movementDistance,
        y: (yDistance / distance) * movementDistance,
    };
}

function createMovementInput(activeBinding: ActiveBinding | undefined) {
    return {
        durationMs: activeBinding?.holdDuration.milliseconds ?? Infinity,
        value: clamp(activeBinding?.value || 0, {
            min: 0,
            max: 1,
        }),
    };
}

function createPlayerGraphics({color}: Readonly<{color: string}>) {
    const graphics = new Graphics();

    playerOutlinePoints.forEach((point, index) => {
        if (index) {
            graphics.lineTo(point.x, point.y);
        } else {
            graphics.moveTo(point.x, point.y);
        }
    });

    return graphics.closePath().fill(color);
}

function wrapPlayerPosition({
    maximum,
    minimum,
    value,
}: Readonly<{
    maximum: number;
    minimum: number;
    value: number;
}>) {
    return value < minimum ? maximum : value > maximum ? minimum : value;
}

function findClosestAsteroid({
    asteroids,
    playerPosition,
}: Readonly<{
    asteroids: ReadonlySet<AsteroidEntity>;
    playerPosition: Readonly<{
        x: number;
        y: number;
    }>;
}>) {
    return Array.from(asteroids)
        .filter((asteroid) => {
            return !asteroid.isDestroyed;
        })
        .reduce<
            | {
                  asteroid: AsteroidEntity;
                  distance: number;
              }
            | undefined
        >((closestAsteroid, asteroid) => {
            const distance = Math.hypot(
                asteroid.params.x - playerPosition.x,
                asteroid.params.y - playerPosition.y,
            );

            return !closestAsteroid || distance < closestAsteroid.distance
                ? {
                      asteroid,
                      distance,
                  }
                : closestAsteroid;
        }, undefined)?.asteroid;
}

function calculateTargetDirection({
    playerPosition,
    targetPosition,
}: Readonly<{
    playerPosition: Readonly<{
        x: number;
        y: number;
    }>;
    targetPosition: Readonly<{
        x: number;
        y: number;
    }>;
}>) {
    const xDistance = targetPosition.x - playerPosition.x;
    const yDistance = targetPosition.y - playerPosition.y;
    const distance = Math.hypot(xDistance, yDistance);

    if (!distance) {
        return undefined;
    }

    return {
        x: xDistance / distance,
        y: yDistance / distance,
    };
}

export class PlayerEntity extends defineEntity({
    key: 'asteroids-player',
    paramsMap: position2dParamsMap,
    paramsShape: defineShape({
        ...position2dParamsShape.default,
        color: nonEmptyStringShape(),
        inputPlayerPosition: enumShape(PlayerPosition),
    }),
}) {
    protected collisionProtectionUses = 0;
    protected deathAnimationRemainingMilliseconds: number | undefined;
    protected hasSpawnedDeathExplosion = false;
    protected shotCooldownMilliseconds = 0;

    public override createView() {
        return {
            view: createPlayerGraphics({
                color: this.params.color,
            }),
            hitbox: new Polygon(
                {
                    x: this.params.x,
                    y: this.params.y,
                },
                playerOutlinePoints,
            ),
        };
    }

    public override async collide(otherEntity: BaseEntity2d) {
        if (otherEntity instanceof AsteroidEntity) {
            await this.handleAsteroidCollision({
                asteroid: otherEntity,
            });
        }
    }

    public async handleAsteroidCollision({asteroid}: Readonly<{asteroid: AsteroidEntity}>) {
        if (this.deathAnimationRemainingMilliseconds != undefined) {
            return;
        } else if (
            this.collisionProtectionUses <
            getPlayerCollisionProtectionCount(this.state.saveState?.modifiers || {})
        ) {
            this.collisionProtectionUses += 1;
            await asteroid.takeDamage({
                damage: asteroid.params.health,
            });
            return;
        } else {
            this.startDeathAnimation();
        }
    }

    public startDeathAnimation() {
        if (this.deathAnimationRemainingMilliseconds != undefined) {
            return;
        }

        this.deathAnimationRemainingMilliseconds = playerDeathAnimationDurationMilliseconds;
        playGameAudio(this.state, GameAudio.PlayerDeath);
        playGameAudio(this.state, GameAudio.PlayerDeathMusic);
    }

    protected async spawnExplosionParticles({
        particleCount,
        random,
    }: Readonly<{
        particleCount: number;
        random: SeededRandom;
    }>) {
        await createArray(particleCount, async () => {
            const particleAngle = StableMath.degreesToRadians(stableRandom(random) * 360);
            const particleSpeed =
                minimumExplosionParticleSpeed +
                stableRandom(random) *
                    (maximumExplosionParticleSpeed - minimumExplosionParticleSpeed);

            await this.entityStore.addEntity(PlayerExplosionParticleEntity, {
                color: this.params.color,
                lifetimeMilliseconds: playerExplosionParticleLifetimeMilliseconds,
                remainingLifetimeMilliseconds: playerExplosionParticleLifetimeMilliseconds,
                rotation: StableMath.degreesToRadians(stableRandom(random) * 360),
                rotationSpeed: (stableRandom(random) - 0.5) * 0.03,
                velocityX: StableMath.round(StableMath.cos(particleAngle) * particleSpeed),
                velocityY: StableMath.round(StableMath.sin(particleAngle) * particleSpeed),
                x: this.params.x,
                y: this.params.y,
            });
        });
    }

    protected async spawnDeathExplosion() {
        const random = this.state.missionState?.seededRandom;

        if (!random || this.hasSpawnedDeathExplosion) {
            return;
        }

        this.hasSpawnedDeathExplosion = true;
        await this.spawnExplosionParticles({
            particleCount: playerExplosionParticleCount,
            random,
        });
    }

    public override async update({msSinceLastUpdate}: Readonly<EntityUpdateParams>) {
        if (this.state.menuState) {
            return;
        } else if (this.deathAnimationRemainingMilliseconds != undefined) {
            await this.spawnDeathExplosion();
            this.deathAnimationRemainingMilliseconds = Math.max(
                0,
                this.deathAnimationRemainingMilliseconds - msSinceLastUpdate,
            );
            const animationProgress =
                1 -
                this.deathAnimationRemainingMilliseconds / playerDeathAnimationDurationMilliseconds;

            this.view.alpha = Math.max(0, 1 - animationProgress * 3);
            this.view.scale.set(1 - animationProgress);

            if (!this.deathAnimationRemainingMilliseconds) {
                this.destroy();
            }
            return;
        }

        const activeBindings = this.state.activeBindings[this.params.inputPlayerPosition];
        const modifiers = this.state.saveState?.modifiers || {};
        const movement = modifiers.allowPlayerCardinalMovement
            ? calculatePlayerMovement({
                  activeBindings,
                  msSinceLastUpdate,
                  mouseMovementTarget: this.state.isMouseMovementAllowed
                      ? getMouseMovementTarget({
                            canvas: this.state.pixi.canvas,
                            rawInputs: this.state.rawInputs,
                            screen: this.pixi.screen,
                        })
                      : undefined,
                  playerPosition: this.params,
                  speedMultiplier: getPlayerMovementSpeedMultiplier(modifiers),
              })
            : undefined;

        if (movement) {
            const rotation = Math.atan2(movement.y, movement.x) + Math.PI / 2;
            this.view.rotation = rotation;
            this.hitbox?.setAngle(rotation);
            this.params.x = modifiers.phaseDrive
                ? wrapPlayerPosition({
                      maximum: this.pixi.screen.width + playerHalfWidth,
                      minimum: -playerHalfWidth,
                      value: this.params.x + movement.x,
                  })
                : clamp(this.params.x + movement.x, {
                      min: playerHalfWidth,
                      max: this.pixi.screen.width - playerHalfWidth,
                  });
            this.params.y = modifiers.phaseDrive
                ? wrapPlayerPosition({
                      maximum: this.pixi.screen.height + playerHalfHeight,
                      minimum: -playerHalfHeight,
                      value: this.params.y + movement.y,
                  })
                : clamp(this.params.y + movement.y, {
                      min: playerHalfHeight,
                      max: this.pixi.screen.height - playerHalfHeight,
                  });
        }

        const autoTurretTarget = modifiers.autoTurret
            ? findClosestAsteroid({
                  asteroids: this.entityStore.getEntities(AsteroidEntity),
                  playerPosition: this.params,
              })
            : undefined;
        const autoTurretDirection = autoTurretTarget
            ? calculateTargetDirection({
                  playerPosition: this.params,
                  targetPosition: autoTurretTarget.params,
              })
            : undefined;
        const gunCount = getPlayerGunCount(modifiers);
        const isFiring =
            this.state.isPlayerFiringAllowed &&
            gunCount > 0 &&
            (!!activeBindings?.[PlayerAction.Fire]?.value || !!autoTurretDirection);

        this.shotCooldownMilliseconds = isFiring
            ? Math.max(0, this.shotCooldownMilliseconds - msSinceLastUpdate)
            : 0;

        if (!isFiring || this.shotCooldownMilliseconds) {
            return;
        }

        const directionX = autoTurretDirection?.x ?? Math.sin(this.view.rotation);
        const directionY = autoTurretDirection?.y ?? -Math.cos(this.view.rotation);

        if (autoTurretDirection) {
            const rotation = Math.atan2(directionY, directionX) + Math.PI / 2;

            this.view.rotation = rotation;
            this.hitbox?.setAngle(rotation);
        }

        await Promise.all(
            (gunCount === 3
                ? [
                      -12,
                      0,
                      12,
                  ]
                : gunCount === 2
                  ? [
                        -8,
                        8,
                    ]
                  : [
                        0,
                    ]
            ).map(async (gunOffset) => {
                await this.addEntity(
                    PlayerBulletEntity,
                    createPlayerBulletParams({
                        directionX,
                        directionY,
                        gunOffset,
                        modifiers,
                        playerX: this.params.x,
                        playerY: this.params.y,
                    }),
                );
            }),
        );
        queueMissionExperience({
            experienceSpent: getShotExperienceCost(modifiers) * gunCount,
            gameState: this.state,
        });
        playGameAudio(this.state, GameAudio.Shoot);
        this.shotCooldownMilliseconds =
            playerShotIntervalMilliseconds * getPlayerShotIntervalMultiplier(modifiers);
    }
}
