import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {calculateGameWorldViewport} from './game-screen.js';

describe(calculateGameWorldViewport.name, () => {
    it('uses the same world dimensions at 1440p and 720p', () => {
        assert.deepEquals(
            calculateGameWorldViewport({
                screenSize: {
                    height: 1440,
                    width: 2560,
                },
            }),
            {
                scale: 1,
                screen: {
                    height: 1440,
                    width: 2560,
                },
            },
        );
        assert.deepEquals(
            calculateGameWorldViewport({
                screenSize: {
                    height: 720,
                    width: 1280,
                },
            }),
            {
                scale: 0.5,
                screen: {
                    height: 1440,
                    width: 2560,
                },
            },
        );
    });

    it('waits to calculate a viewport until the canvas has width', () => {
        assert.isUndefined(
            calculateGameWorldViewport({
                screenSize: {
                    height: 0,
                    width: 0,
                },
            }),
        );
    });
});
