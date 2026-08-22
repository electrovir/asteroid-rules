import {assert, assertWrap} from '@augment-vir/assert';
import {SeededRandom} from '@augment-vir/common';
import {describe, it, testWeb} from '@augment-vir/test';
import {NavController, extractNavEntry} from 'device-navigation';
import {html, testIdSelector} from 'element-vir';
import {type GameRule} from '../../data/game-rule.js';
import {type FullGameState} from '../../data/game-state.js';
import {createFrontendRouter} from '../../data/routing/frontend-router.js';
import {allGameRules, playerCardinalMovementRule} from '../../data/rules.js';
import {VirGameButton} from './vir-game-button.element.js';
import {VirPauseMenu} from './vir-pause-menu.element.js';

type TestGameState = {
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
    return {
        menuState: {
            isPaused: true,
        },
        missionState: {
            lastAsteroidSpawnedAt: 0,
            lastTimedExperienceEarnedAt: 0,
            players: {},
            seededRandom: SeededRandom.fromSeed('pause-menu-test'),
        },
        navController,
        router,
        saveState: {
            activeRules: [],
            modifiers: {},
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

async function renderPauseMenu(gameState: Readonly<TestGameState>) {
    const renderedElement = await testWeb.render(html`
        <${VirPauseMenu.assign({
            gameState,
        })}></${VirPauseMenu}>
    `);

    return assertWrap.instanceOf(renderedElement, VirPauseMenu);
}

describe(VirPauseMenu.tagName, () => {
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
                onMainMenu: true,
            });
        } finally {
            router.destroy();
            testWeb.cleanupRender();
        }
    });
});
