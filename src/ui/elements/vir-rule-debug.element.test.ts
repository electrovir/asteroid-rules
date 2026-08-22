import {assert} from '@augment-vir/assert';
import {describe, it, testWeb} from '@augment-vir/test';
import {waitForAnimationFrame} from '@augment-vir/web';
import {NavController, NavDirection, extractNavEntry} from 'device-navigation';
import {ViraButton} from 'vira';
import {type AsteroidsGameState} from '../../data/game-state.js';
import {frontendPathTree} from '../../data/routing/frontend-path-tree.js';
import {createFrontendRouter} from '../../data/routing/frontend-router.js';
import {allGameRules, playerCardinalMovementRule} from '../../data/rules.js';
import {VirGameRuleList} from './vir-game-rule-list.element.js';
import {VirPauseMenu} from './vir-pause-menu.element.js';
import {VirRuleDebug} from './vir-rule-debug.element.js';

function getPauseMenuButtons(pauseMenuElement: Readonly<HTMLElement>) {
    const buttons = Array.from(
        pauseMenuElement.shadowRoot?.querySelectorAll<HTMLElement>(ViraButton.tagName) || [],
    );

    assert.isLengthExactly(buttons, 3);

    return buttons;
}

type TestGameState = {
    menuState: AsteroidsGameState['menuState'];
    missionState: NonNullable<AsteroidsGameState['missionState']>;
    navController: NavController;
    router: AsteroidsGameState['router'];
    saveState: NonNullable<AsteroidsGameState['saveState']>;
};

function createGameState({
    navController,
    router,
}: Readonly<{
    navController: NavController;
    router: ReturnType<typeof createFrontendRouter>;
}>): TestGameState {
    return {
        menuState: {
            isPaused: false,
            onMainMenu: false,
        },
        missionState: {
            modifiers: {},
            players: {},
        },
        navController,
        router,
        saveState: {
            activeRules: [],
            playerLevel: 0,
            playerLevelExperience: 0,
            unlockedGameRules: allGameRules,
        },
    } satisfies TestGameState;
}

describe(VirRuleDebug.tagName, () => {
    it('restores pause-menu navigation when it is removed', async () => {
        const router = createFrontendRouter();
        const navController = new NavController(document.body, {
            alwaysRequireFocused: true,
        });
        const gameState = createGameState({
            navController,
            router,
        });

        try {
            const pauseMenuElement = await testWeb.renderElement(VirPauseMenu, {
                gameState,
            });
            const ruleDebugElement = await testWeb.renderElement(VirRuleDebug, {
                gameState,
            });
            const exitDebugButton = ruleDebugElement.shadowRoot.querySelector<HTMLElement>(
                ViraButton.tagName,
            );

            assert.isDefined(exitDebugButton);

            const exitDebugNavEntry = extractNavEntry(exitDebugButton);

            assert.isDefined(exitDebugNavEntry);
            exitDebugNavEntry.focus(true);

            gameState.menuState = {
                isPaused: true,
                onMainMenu: false,
            };
            ruleDebugElement.remove();

            await waitForAnimationFrame(2);

            const [
                resumeButton,
                debugButton,
                endMissionButton,
            ] = getPauseMenuButtons(pauseMenuElement);

            assert.strictEquals(navController.currentNavEntry?.entry.element, resumeButton);

            navController.navigate({
                allowWrapping: true,
                blockPerpendicularNavigation: true,
                direction: NavDirection.Down,
            });
            assert.strictEquals(navController.currentNavEntry.entry.element, debugButton);

            navController.navigate({
                allowWrapping: true,
                blockPerpendicularNavigation: true,
                direction: NavDirection.Down,
            });
            assert.strictEquals(navController.currentNavEntry.entry.element, endMissionButton);

            navController.navigate({
                allowWrapping: true,
                blockPerpendicularNavigation: true,
                direction: NavDirection.Down,
            });
            assert.strictEquals(navController.currentNavEntry.entry.element, resumeButton);
        } finally {
            router.destroy();
            testWeb.cleanupRender();
        }
    });

    it('resumes the game when Resume is activated', async () => {
        const router = createFrontendRouter();
        const navController = new NavController(document.body, {
            alwaysRequireFocused: true,
        });
        const gameState = createGameState({
            navController,
            router,
        });

        gameState.menuState = {
            isPaused: true,
            onMainMenu: false,
        };
        router.setRoute({
            paths: frontendPathTree.paths.children.debug.children.rules.fullPaths,
        });

        try {
            const ruleDebugElement = await testWeb.renderElement(VirRuleDebug, {
                gameState,
            });
            const resumeButton = ruleDebugElement.shadowRoot.querySelector<HTMLElement>(
                ViraButton.tagName,
            );

            assert.isDefined(resumeButton);

            const resumeNavEntry = extractNavEntry(resumeButton);

            assert.isDefined(resumeNavEntry);
            resumeNavEntry.activate(true);
            await waitForAnimationFrame();

            assert.deepEquals(
                {
                    menuState: gameState.menuState,
                    routePaths: router.readCurrentRoute().paths,
                },
                {
                    menuState: {
                        isPaused: false,
                        onMainMenu: false,
                    },
                    routePaths: [],
                },
            );
        } finally {
            router.destroy();
            testWeb.cleanupRender();
        }
    });

    it('updates the active mission when a debug rule is activated', async () => {
        const router = createFrontendRouter();
        const navController = new NavController(document.body, {
            alwaysRequireFocused: true,
        });
        const gameState = createGameState({
            navController,
            router,
        });

        try {
            const ruleDebugElement = await testWeb.renderElement(VirRuleDebug, {
                gameState,
            });
            const ruleListElement = ruleDebugElement.shadowRoot.querySelector<HTMLElement>(
                VirGameRuleList.tagName,
            );

            assert.isDefined(ruleListElement);
            ruleListElement.dispatchEvent(
                new VirGameRuleList.events.ruleActivated(playerCardinalMovementRule),
            );

            assert.deepEquals(
                {
                    activeRuleIds: gameState.saveState.activeRules.map((rule) => rule.id),
                    modifiers: gameState.missionState.modifiers,
                },
                {
                    activeRuleIds: [
                        playerCardinalMovementRule.id,
                    ],
                    modifiers: {
                        allowPlayerCardinalMovement: true,
                    },
                },
            );
        } finally {
            router.destroy();
            testWeb.cleanupRender();
        }
    });
});
