import {
    position2dParamsMap,
    position2dParamsShape,
    type EntityUpdateParams,
} from '@antha/entity-2d';
import {Graphics} from '@antha/graphics-2d';
import {StableMath, stableRandom, stableRandomInteger} from '@antha/util';
import {createArray, type SeededRandom} from '@augment-vir/common';
import {defineShape} from 'object-shape-tester';
import {defineEntity} from '../mods/game-entity.mod.js';

const asteroidOutlineColor = '#a3a3a3';
const asteroidFillColor = '#3d3d3d';
const asteroidSpawnPadding = 2;
const asteroidSpeedMaxPixelsPerMillisecond = 0.07;
const asteroidSpeedMinPixelsPerMillisecond = 0.04;
const asteroidSpinSpeedMaxRadiansPerMillisecond = 0.0003;
const asteroidSpinSpeedMinRadiansPerMillisecond = 0.0001;

export function createAsteroidParams({
    random,
    screen,
}: Readonly<{
    random: SeededRandom;
    screen: Readonly<{
        height: number;
        width: number;
    }>;
}>) {
    const radius = stableRandomInteger({
        random,
        min: 24,
        max: 48,
    });
    const spawnAngle = StableMath.degreesToRadians(stableRandom(random) * 360);
    const spawnDirectionX = StableMath.cos(spawnAngle);
    const spawnDirectionY = StableMath.sin(spawnAngle);
    const spawnDistance = StableMath.round(
        Math.min(
            (screen.width / 2 + radius + asteroidSpawnPadding) / Math.abs(spawnDirectionX),
            (screen.height / 2 + radius + asteroidSpawnPadding) / Math.abs(spawnDirectionY),
        ),
    );
    const x = StableMath.round(screen.width / 2 + spawnDirectionX * spawnDistance);
    const y = StableMath.round(screen.height / 2 + spawnDirectionY * spawnDistance);
    const targetX = StableMath.round(stableRandom(random) * screen.width);
    const targetY = StableMath.round(stableRandom(random) * screen.height);
    const xDistance = targetX - x;
    const yDistance = targetY - y;
    const targetDistance = StableMath.hypot([
        xDistance,
        yDistance,
    ]);
    const speed = StableMath.round(
        asteroidSpeedMinPixelsPerMillisecond +
            stableRandom(random) *
                (asteroidSpeedMaxPixelsPerMillisecond - asteroidSpeedMinPixelsPerMillisecond),
    );
    const rotationSpeed = StableMath.round(
        (stableRandom(random) < 0.5 ? -1 : 1) *
            (asteroidSpinSpeedMinRadiansPerMillisecond +
                stableRandom(random) *
                    (asteroidSpinSpeedMaxRadiansPerMillisecond -
                        asteroidSpinSpeedMinRadiansPerMillisecond)),
    );
    const pointCount = stableRandomInteger({
        random,
        min: 9,
        max: 13,
    });
    const outlinePoints = createArray(pointCount, (index) => {
        const pointAngle = StableMath.degreesToRadians(
            (index / pointCount) * 360 + (stableRandom(random) - 0.5) * (360 / pointCount) * 0.4,
        );
        const pointRadius = StableMath.round(radius * (0.72 + stableRandom(random) * 0.28));

        return {
            x: StableMath.round(StableMath.cos(pointAngle) * pointRadius),
            y: StableMath.round(StableMath.sin(pointAngle) * pointRadius),
        };
    });

    return {
        hasEnteredScreen: false,
        outlinePoints,
        radius,
        rotation: StableMath.degreesToRadians(stableRandom(random) * 360),
        rotationSpeed,
        velocityX: StableMath.round((xDistance / targetDistance) * speed),
        velocityY: StableMath.round((yDistance / targetDistance) * speed),
        x,
        y,
    };
}

export class AsteroidEntity extends defineEntity({
    key: 'asteroids-asteroid',
    paramsMap: {
        ...position2dParamsMap,
        view: {
            ...position2dParamsMap.view,
            rotation: true,
        },
    },
    paramsShape: defineShape({
        ...position2dParamsShape.default,
        hasEnteredScreen: false,
        outlinePoints: [
            {
                x: 0,
                y: 0,
            },
        ],
        radius: 0,
        rotation: 0,
        rotationSpeed: 0,
        velocityX: 0,
        velocityY: 0,
    }),
}) {
    public override createView() {
        const graphics = new Graphics();

        this.params.outlinePoints.forEach((point, index) => {
            if (index) {
                graphics.lineTo(point.x, point.y);
            } else {
                graphics.moveTo(point.x, point.y);
            }
        });

        return {
            view: graphics
                .closePath()
                .fill({
                    color: asteroidFillColor,
                })
                .stroke({
                    color: asteroidOutlineColor,
                    width: 2,
                }),
        };
    }

    public override update({msSinceLastUpdate}: Readonly<EntityUpdateParams>) {
        if (this.state.menuState) {
            return;
        }

        this.params.x = StableMath.round(this.params.x + this.params.velocityX * msSinceLastUpdate);
        this.params.y = StableMath.round(this.params.y + this.params.velocityY * msSinceLastUpdate);
        this.params.rotation = StableMath.round(
            this.params.rotation + this.params.rotationSpeed * msSinceLastUpdate,
        );

        if (this.isInBounds()) {
            this.params.hasEnteredScreen = true;
        } else if (this.params.hasEnteredScreen) {
            this.destroy();
        }
    }
}
