import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {checkValidShape} from 'object-shape-tester';
import {defaultJoystickDeadZone} from '../data/joystick-dead-zone.js';
import {createGameSaveState, SavedGameStateVersion, saveStateDbShapes} from './autosave.mod.js';

function createSavedGameState() {
    return {
        activeRuleIds: [],
        newGameRuleIds: [],
        playerLevel: 1,
        playerLevelExperience: 0,
        unlockedGameRuleIds: [],
        version: SavedGameStateVersion.Initial,
    } satisfies NonNullable<Parameters<typeof createGameSaveState>[0]>;
}

describe('saved joystick dead zone', () => {
    it('loads the saved value', () => {
        const savedGameState = {
            ...createSavedGameState(),
            joystickDeadZone: 0.3,
        };

        assert.isTrue(checkValidShape(savedGameState, saveStateDbShapes.saveState.shape));
        assert.strictEquals(createGameSaveState(savedGameState).joystickDeadZone, 0.3);
    });

    it('defaults missing values from legacy saves', () => {
        assert.strictEquals(
            createGameSaveState(createSavedGameState()).joystickDeadZone,
            defaultJoystickDeadZone,
        );
    });
});
