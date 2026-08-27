import {AudioPlayer} from '@antha/audio';
import {assert, assertWrap} from '@augment-vir/assert';
import {SeededRandom} from '@augment-vir/common';
import {describe, it, testWeb} from '@augment-vir/test';
import {NavController, extractNavEntry} from 'device-navigation';
import {html, testIdSelector} from 'element-vir';
import {defaultGameAudioVolume, gameAudioVolumeStep} from '../../data/game-audio.js';
import {type GameRule} from '../../data/game-rule.js';
import {type FullGameState} from '../../data/game-state.js';
import {defaultJoystickDeadZone, joystickDeadZoneStep} from '../../data/joystick-dead-zone.js';
import {createFrontendRouter} from '../../data/routing/frontend-router.js';
import {allGameRules, playerCardinalMovementRule} from '../../data/rules.js';
import {VirGameButton} from './vir-game-button.element.js';
import {VirPauseMenu} from './vir-pause-menu.element.js';

type TestGameState = {
    audioPlayer: AudioPlayer;
    deviceHandler: FullGameState['deviceHandler'];
    menuState: FullGameState['menuState'];
    missionState: NonNullable<FullGameState['missionState']> | undefined;
    navController: NavController;
    router: FullGameState['router'];
    saveState: NonNullable<FullGameState['saveState']>;
};

function createGameState({
    navController,
    router,
    unlockedGameRules,
}: Readonly<{
    navController: NavController;
    router: ReturnType<typeof createFrontendRouter>;
    unlockedGameRules: ReadonlyArray<GameRule>;
}>): TestGameState {
    const audioPlayer = new AudioPlayer();
    audioPlayer.gainNode.gain.value = defaultGameAudioVolume;

    return {
        audioPlayer,
        deviceHandler: {
            globalDeadZone: defaultJoystickDeadZone,
            readAllDevices() {
                return {};
            },
        },
        menuState: {
            pause: true,
        },
        missionState: {
            experienceEarned: 0,
            lastAsteroidSpawnedAt: 0,
            lastTimedExperienceEarnedAt: 0,
            levelUpAnimation: undefined,
            missionStartedAt: 0,
            pendingExperienceGained: 0,
            pendingExperienceSpent: 0,
            players: {},
            seededRandom: SeededRandom.fromSeed('pause-menu-test'),
            screenSize: {
                height: 600,
                width: 800,
            },
        },
        navController,
        router,
        saveState: {
            activeRules: [],
            audioVolume: defaultGameAudioVolume,
            joystickDeadZone: defaultJoystickDeadZone,
            modifiers: {},
            newGameRules: [],
            playerLevel: 0,
            playerLevelExperience: 0,
            unlockedGameRules: [...unlockedGameRules],
        },
    } satisfies TestGameState;
}

function getPauseMenuButton({
    pauseMenuElement,
    testId,
}: Readonly<{
    pauseMenuElement: HTMLElement;
    testId: string;
}>) {
    const shadowRoot = assertWrap.isDefined(pauseMenuElement.shadowRoot);

    return assertWrap.instanceOf(shadowRoot.querySelector(testIdSelector(testId)), VirGameButton);
}

function getPauseMenuNavEntry({
    pauseMenuElement,
    testId,
}: Readonly<{
    pauseMenuElement: HTMLElement;
    testId: string;
}>) {
    return assertWrap.isDefined(
        extractNavEntry(
            getPauseMenuButton({
                pauseMenuElement,
                testId,
            }),
        ),
    );
}

function activatePauseMenuButton({
    pauseMenuElement,
    testId,
}: Readonly<{
    pauseMenuElement: HTMLElement;
    testId: string;
}>) {
    const navEntry = getPauseMenuNavEntry({
        pauseMenuElement,
        testId,
    });

    navEntry.activate(true);
    navEntry.activate(false);
}

async function renderPauseMenu(gameState: Readonly<TestGameState>) {
    const renderedElement = await testWeb.render(html`
        <${VirPauseMenu.assign({
            gameState,
        })}></${VirPauseMenu}>
    `);

    return assertWrap.instanceOf(renderedElement, VirPauseMenu);
}

describe(VirPauseMenu.tagName, () => {
    it('adjusts the joystick dead zone', async () => {
        const router = createFrontendRouter();
        const navController = new NavController(document.body, {
            alwaysRequireFocused: true,
        });
        const gameState = createGameState({
            navController,
            router,
            unlockedGameRules: allGameRules,
        });

        try {
            const pauseMenuElement = await renderPauseMenu(gameState);
            activatePauseMenuButton({
                pauseMenuElement,
                testId: VirPauseMenu.testIds.increaseJoystickDeadZoneButton,
            });

            assert.strictEquals(
                gameState.deviceHandler.globalDeadZone,
                defaultJoystickDeadZone + joystickDeadZoneStep,
            );
            assert.strictEquals(
                gameState.saveState.joystickDeadZone,
                defaultJoystickDeadZone + joystickDeadZoneStep,
            );

            activatePauseMenuButton({
                pauseMenuElement,
                testId: VirPauseMenu.testIds.decreaseJoystickDeadZoneButton,
            });

            assert.strictEquals(gameState.deviceHandler.globalDeadZone, defaultJoystickDeadZone);
            assert.strictEquals(gameState.saveState.joystickDeadZone, defaultJoystickDeadZone);

            gameState.deviceHandler.globalDeadZone = joystickDeadZoneStep;
            gameState.saveState = {
                ...gameState.saveState,
                joystickDeadZone: joystickDeadZoneStep,
            };

            activatePauseMenuButton({
                pauseMenuElement,
                testId: VirPauseMenu.testIds.decreaseJoystickDeadZoneButton,
            });

            assert.strictEquals(gameState.deviceHandler.globalDeadZone, 0);
            assert.strictEquals(gameState.saveState.joystickDeadZone, 0);
        } finally {
            await gameState.audioPlayer.destroy();
            router.destroy();
            testWeb.cleanupRender();
        }
    });

    it('adjusts the audio volume', async () => {
        const router = createFrontendRouter();
        const navController = new NavController(document.body, {
            alwaysRequireFocused: true,
        });
        const gameState = createGameState({
            navController,
            router,
            unlockedGameRules: allGameRules,
        });

        try {
            const pauseMenuElement = await renderPauseMenu(gameState);
            activatePauseMenuButton({
                pauseMenuElement,
                testId: VirPauseMenu.testIds.increaseAudioVolumeButton,
            });

            assert.isApproximately(
                gameState.saveState.audioVolume,
                defaultGameAudioVolume + gameAudioVolumeStep,
                0.00001,
            );

            activatePauseMenuButton({
                pauseMenuElement,
                testId: VirPauseMenu.testIds.increaseAudioVolumeButton,
            });
            activatePauseMenuButton({
                pauseMenuElement,
                testId: VirPauseMenu.testIds.decreaseAudioVolumeButton,
            });

            assert.isApproximately(
                gameState.saveState.audioVolume,
                defaultGameAudioVolume + gameAudioVolumeStep,
                0.00001,
            );
        } finally {
            await gameState.audioPlayer.destroy();
            router.destroy();
            testWeb.cleanupRender();
        }
    });

    it('only offers restarting the mission when there is one available rule', async () => {
        const router = createFrontendRouter();
        const navController = new NavController(document.body, {
            alwaysRequireFocused: true,
        });
        const gameState = createGameState({
            navController,
            router,
            unlockedGameRules: [
                playerCardinalMovementRule,
            ],
        });

        try {
            const pauseMenuElement = await renderPauseMenu(gameState);
            const restartMissionButton = getPauseMenuButton({
                pauseMenuElement,
                testId: VirPauseMenu.testIds.restartMissionButton,
            });
            const restartMissionNavEntry = assertWrap.isDefined(
                extractNavEntry(restartMissionButton),
            );

            assert.strictEquals(restartMissionButton.textContent.trim(), 'Restart Mission');
            assert.strictEquals(
                assertWrap
                    .isDefined(pauseMenuElement.shadowRoot)
                    .querySelector(testIdSelector(VirPauseMenu.testIds.endMissionButton)),
                null,
            );

            restartMissionNavEntry.activate(true);

            assert.isUndefined(gameState.missionState);
            assert.isUndefined(gameState.menuState);
        } finally {
            await gameState.audioPlayer.destroy();
            router.destroy();
            testWeb.cleanupRender();
        }
    });

    it('offers ending the mission when the main menu is allowed', async () => {
        const router = createFrontendRouter();
        const navController = new NavController(document.body, {
            alwaysRequireFocused: true,
        });
        const gameState = createGameState({
            navController,
            router,
            unlockedGameRules: allGameRules,
        });

        try {
            const pauseMenuElement = await renderPauseMenu(gameState);
            const restartMissionButton = getPauseMenuButton({
                pauseMenuElement,
                testId: VirPauseMenu.testIds.restartMissionButton,
            });
            const endMissionButton = getPauseMenuButton({
                pauseMenuElement,
                testId: VirPauseMenu.testIds.endMissionButton,
            });
            const endMissionNavEntry = assertWrap.isDefined(extractNavEntry(endMissionButton));

            assert.strictEquals(restartMissionButton.textContent.trim(), 'Restart Mission');
            assert.strictEquals(endMissionButton.textContent.trim(), 'End Mission');

            endMissionNavEntry.activate(true);

            assert.isUndefined(gameState.missionState);
            assert.deepEquals(gameState.menuState, {
                mainMenu: true,
            });
        } finally {
            await gameState.audioPlayer.destroy();
            router.destroy();
            testWeb.cleanupRender();
        }
    });
});
