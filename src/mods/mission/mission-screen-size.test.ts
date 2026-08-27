import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {shiftGameEntityPositions} from './mission-screen-size.js';

describe(shiftGameEntityPositions.name, () => {
    it('keeps all entities in the same positions relative to the centered player on resize', () => {
        const player = {
            params: {
                x: 500,
                y: 400,
            },
        };
        const asteroid = {
            params: {
                x: 620,
                y: 480,
            },
        };
        const entities = [
            player,
            asteroid,
        ];

        shiftGameEntityPositions({
            entities,
            playerPosition: player.params,
            previousScreenSize: {
                height: 800,
                width: 1000,
            },
            screenSize: {
                height: 1000,
                width: 1600,
            },
        });

        assert.deepEquals(entities, [
            {
                params: {
                    x: 800,
                    y: 500,
                },
            },
            {
                params: {
                    x: 920,
                    y: 580,
                },
            },
        ]);
    });

    it('keeps the player on screen when its centered position would be outside a smaller viewport', () => {
        const player = {
            params: {
                x: 1900,
                y: 540,
            },
        };
        const asteroid = {
            params: {
                x: 1800,
                y: 500,
            },
        };
        const entities = [
            player,
            asteroid,
        ];

        shiftGameEntityPositions({
            entities,
            playerPosition: player.params,
            previousScreenSize: {
                height: 1080,
                width: 1920,
            },
            screenSize: {
                height: 540,
                width: 960,
            },
        });

        assert.deepEquals(entities, [
            {
                params: {
                    x: 940.8,
                    y: 270,
                },
            },
            {
                params: {
                    x: 840.8,
                    y: 230,
                },
            },
        ]);
    });
});
