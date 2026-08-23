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
import {defineShape, enumShape} from 'object-shape-tester';
import {GameAudio, playGameAudio} from '../data/game-audio.js';
import {PlayerPosition, queueMissionExperience} from '../data/game-state.js';
import {getPlayerGunCount, getShotExperienceCost} from '../data/gameplay-modifiers.js';
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
}>) {
    const cardinalMovement = calculateCardinalMovement({
        activeBindings,
        msSinceLastUpdate,
    });
    const mouseMovement = calculateMouseMovement({
        mouseMovementTarget,
        msSinceLastUpdate,
        playerPosition,
    });
    const x = (cardinalMovement?.x || 0) + (mouseMovement?.x || 0);
    const y = (cardinalMovement?.y || 0) + (mouseMovement?.y || 0);
    const movementMagnitude = Math.hypot(x, y);

    if (!movementMagnitude) {
        return undefined;
    }

    const movementMultiplier = Math.min(
        (msSinceLastUpdate * playerSpeedPixelsPerMillisecond) / movementMagnitude,
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
    playerX,
    playerY,
}: Readonly<{
    directionX: number;
    directionY: number;
    gunOffset: number;
    playerX: number;
    playerY: number;
}>) {
    const lateralDirectionX = -directionY;
    const lateralDirectionY = directionX;

    return {
        velocityX: StableMath.round(directionX * playerBulletSpeedPixelsPerMillisecond),
        velocityY: StableMath.round(directionY * playerBulletSpeedPixelsPerMillisecond),
        x: StableMath.round(playerX + directionX * playerSize + lateralDirectionX * gunOffset),
        y: StableMath.round(playerY + directionY * playerSize + lateralDirectionY * gunOffset),
    };
}

function calculateCardinalMovement({
    activeBindings,
    msSinceLastUpdate,
}: Readonly<{
    activeBindings: ActiveBindings<GameInputAction> | undefined;
    msSinceLastUpdate: number;
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
        x: (movementX / movementMagnitude) * msSinceLastUpdate * playerSpeedPixelsPerMillisecond,
        y: (movementY / movementMagnitude) * msSinceLastUpdate * playerSpeedPixelsPerMillisecond,
    };
}

function calculateMouseMovement({
    mouseMovementTarget,
    msSinceLastUpdate,
    playerPosition,
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
        msSinceLastUpdate * playerSpeedPixelsPerMillisecond,
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

export class PlayerEntity extends defineEntity({
    assets: {
        player: {
            maxProgress: 1,
            load({incrementProgressCallback}) {
                const graphics = new Graphics();

                playerOutlinePoints.forEach((point, index) => {
                    if (index) {
                        graphics.lineTo(point.x, point.y);
                    } else {
                        graphics.moveTo(point.x, point.y);
                    }
                });

                graphics.closePath().fill('#39ff14');

                incrementProgressCallback();

                return {
                    value: graphics,
                };
            },
        },
    },
    key: 'asteroids-player',
    paramsMap: position2dParamsMap,
    paramsShape: defineShape({
        ...position2dParamsShape.default,
        inputPlayerPosition: enumShape(PlayerPosition),
    }),
}) {
    protected deathAnimationRemainingMilliseconds: number | undefined;
    protected hasSpawnedDeathExplosion = false;
    protected shotCooldownMilliseconds = 0;

    public override async createView() {
        return {
            view: (await this.getAsset.player()).clone(),
            hitbox: new Polygon(
                {
                    x: this.params.x,
                    y: this.params.y,
                },
                playerOutlinePoints,
            ),
        };
    }

    public override collide(otherEntity: BaseEntity2d) {
        if (otherEntity instanceof AsteroidEntity) {
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
              })
            : undefined;

        if (movement) {
            const rotation = Math.atan2(movement.y, movement.x) + Math.PI / 2;
            this.view.rotation = rotation;
            this.hitbox?.setAngle(rotation);
            this.params.x = clamp(this.params.x + movement.x, {
                min: playerHalfWidth,
                max: this.pixi.screen.width - playerHalfWidth,
            });
            this.params.y = clamp(this.params.y + movement.y, {
                min: playerHalfHeight,
                max: this.pixi.screen.height - playerHalfHeight,
            });
        }

        const gunCount = getPlayerGunCount(modifiers);
        const isFiring =
            this.state.isPlayerFiringAllowed &&
            gunCount > 0 &&
            !!activeBindings?.[PlayerAction.Fire]?.value;

        this.shotCooldownMilliseconds = isFiring
            ? Math.max(0, this.shotCooldownMilliseconds - msSinceLastUpdate)
            : 0;

        if (!isFiring || this.shotCooldownMilliseconds) {
            return;
        }

        const directionX = Math.sin(this.view.rotation);
        const directionY = -Math.cos(this.view.rotation);

        await Promise.all(
            (gunCount === 2
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
        this.shotCooldownMilliseconds = playerShotIntervalMilliseconds;
    }
}
