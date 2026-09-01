import {InputDeviceKey, InputDirection} from '@antha/input';
import {assert} from '@augment-vir/assert';
import {selectFrom} from '@augment-vir/common';
import {describe, it} from '@augment-vir/test';
import {defaultGameAudioVolume} from './game-audio.js';
import {checkIfMainMenuAllowed, type AsteroidsSaveState} from './game-state.js';
import {PlayerAction} from './player-action.js';
import {createGameSaveState, SavedGameStateVersion} from './save-data.js';

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

function createCustomizedBindingAssignments() {
    return {
        '1': {
            [PlayerAction.Fire]: [
                {
                    deviceKey: InputDeviceKey.Keyboard,
                    direction: InputDirection.Positive,
                    inputName: 'button-KeyF',
                },
            ],
        },
    } satisfies AsteroidsSaveState['bindingAssignments'];
}

describe('saved joystick dead zone', () => {
    it('loads the saved value', () => {
        const savedGameState = {
            ...createSavedGameState(),
            joystickDeadZone: 0.3,
        };

        assert.strictEquals(createGameSaveState(savedGameState).joystickDeadZone, 0.3);
    });

    it('defaults missing values from legacy saves to 25 percent', () => {
        assert.strictEquals(createGameSaveState(createSavedGameState()).joystickDeadZone, 0.25);
    });
});

describe('saved audio volume', () => {
    it('loads the saved value', () => {
        const savedGameState = {
            ...createSavedGameState(),
            audioVolume: 0.6,
        };

        assert.strictEquals(createGameSaveState(savedGameState).audioVolume, 0.6);
    });

    it('defaults missing values from legacy saves to 80 percent', () => {
        assert.strictEquals(
            createGameSaveState(createSavedGameState()).audioVolume,
            defaultGameAudioVolume,
        );
    });
});

describe('saved input bindings', () => {
    it('loads a customized binding', () => {
        const savedGameState = {
            ...createSavedGameState(),
            bindingAssignments: createCustomizedBindingAssignments(),
        };

        assert.deepEquals(
            createGameSaveState(savedGameState).bindingAssignments,
            createCustomizedBindingAssignments(),
        );
    });
});

describe('default save state', () => {
    it('keeps the main menu hidden until a second rule unlocks', () => {
        assert.isFalse(
            checkIfMainMenuAllowed({
                saveState: createGameSaveState(undefined),
            }),
        );
    });
});

describe(createGameSaveState.name, () => {
    it('loads a partial legacy modifier record without losing level progress', () => {
        const savedGameState = {
            modifiers: {
                allowPlayerCardinalMovement: true,
                removedModifier: true,
            },
            playerLevel: 10,
            playerLevelExperience: 42,
        };
        assert.deepEquals(
            selectFrom(createGameSaveState(savedGameState), {
                playerLevel: true,
                playerLevelExperience: true,
                modifiers: true,
            }),
            {
                modifiers: {
                    allowPlayerCardinalMovement: true,
                },
                playerLevel: 10,
                playerLevelExperience: 42,
            },
        );
    });
});
