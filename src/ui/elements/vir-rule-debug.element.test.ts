import {assert, assertWrap} from '@augment-vir/assert';
import {SeededRandom} from '@augment-vir/common';
import {describe, it, testWeb} from '@augment-vir/test';
import {waitForAnimationFrame} from '@augment-vir/web';
import {NavController, NavDirection, extractNavEntry} from 'device-navigation';
import {html, testIdSelector} from 'element-vir';
import {type FullGameState} from '../../data/game-state.js';
import {frontendPathTree} from '../../data/routing/frontend-path-tree.js';
import {createFrontendRouter} from '../../data/routing/frontend-router.js';
import {allGameRules, playerCardinalMovementRule, playerForwardGunRule} from '../../data/rules.js';
import {VirGameButton} from './vir-game-button.element.js';
import {VirGameRuleList} from './vir-game-rule-list.element.js';
import {VirGameRule} from './vir-game-rule.element.js';
import {VirPauseMenu} from './vir-pause-menu.element.js';
import {VirRuleDebug} from './vir-rule-debug.element.js';

function getPauseMenuButtons(pauseMenuElement: Readonly<HTMLElement>) {
    const buttons = Array.from(
        pauseMenuElement.shadowRoot?.querySelectorAll<HTMLElement>(VirGameButton.tagName) || [],
    );

    assert.isLengthExactly(buttons, 4);

    return buttons;
}

type TestGameState = {
    menuState: FullGameState['menuState'];
    missionState: NonNullable<FullGameState['missionState']>;
    navController: NavController;
    router: FullGameState['router'];
    saveState: NonNullable<FullGameState['saveState']>;
};

function createGameState({
    navController,
    router,
}: Readonly<{
    navController: NavController;
    router: ReturnType<typeof createFrontendRouter>;
}>): TestGameState {
    return {
        menuState: undefined,
        missionState: {
            experienceEarned: 0,
            lastAsteroidSpawnedAt: 0,
            lastTimedExperienceEarnedAt: 0,
            levelUpAnimation: undefined,
            missionStartedAt: 0,
            pendingExperienceGained: 0,
            pendingExperienceSpent: 0,
            players: {},
            seededRandom: SeededRandom.fromSeed('test-seed'),
        },
        navController,
        router,
        saveState: {
            activeRules: [],
            modifiers: {},
            newGameRules: [],
            playerLevel: 1,
            playerLevelExperience: 0,
            unlockedGameRules: allGameRules,
        },
    } satisfies TestGameState;
}

function createRestrictedSaveState() {
    return {
        activeRules: [
            playerCardinalMovementRule,
        ],
        modifiers: {
            allowPlayerCardinalMovement: true,
        },
        newGameRules: [],
        playerLevel: 3,
        playerLevelExperience: 900,
        unlockedGameRules: [
            playerCardinalMovementRule,
        ],
    } satisfies TestGameState['saveState'];
}

async function renderRuleDebug(gameState: Readonly<TestGameState>) {
    const renderedElement = await testWeb.render(html`
        <${VirRuleDebug.assign({
            gameState,
        })}></${VirRuleDebug}>
    `);

    return assertWrap.instanceOf(renderedElement, VirRuleDebug);
}

describe(VirRuleDebug.tagName, () => {
    it('orders rules by unlock level', async () => {
        const router = createFrontendRouter();
        const navController = new NavController(document.body, {
            alwaysRequireFocused: true,
        });
        const gameState = createGameState({
            navController,
            router,
        });
        gameState.saveState.newGameRules = [playerForwardGunRule];

        try {
            const ruleDebugElement = await renderRuleDebug(gameState);
            const ruleListElement = assertWrap.instanceOf(
                ruleDebugElement.shadowRoot.querySelector(VirGameRuleList.tagName),
                VirGameRuleList,
            );
            const displayedRules = Array.from(
                ruleListElement.shadowRoot.querySelectorAll<InstanceType<typeof VirGameRule>>(
                    VirGameRule.tagName,
                ),
            ).map((ruleElement) => {
                return ruleElement.instanceInputs.rule;
            });

            assert.isTrue(
                displayedRules.slice(1).every((rule, index) => {
                    const previousRule = assertWrap.isDefined(displayedRules[index]);

                    return rule.unlockLevel >= previousRule.unlockLevel;
                }),
            );
        } finally {
            router.destroy();
            testWeb.cleanupRender();
        }
    });

    it('clears the save state', async () => {
        const router = createFrontendRouter();
        const navController = new NavController(document.body, {
            alwaysRequireFocused: true,
        });
        const gameState = createGameState({
            navController,
            router,
        });

        gameState.saveState = createRestrictedSaveState();

        try {
            const ruleDebugElement = await renderRuleDebug(gameState);
            const ruleListElement = assertWrap.instanceOf(
                ruleDebugElement.shadowRoot.querySelector(VirGameRuleList.tagName),
                VirGameRuleList,
            );
            const clearSaveStateButton = ruleDebugElement.shadowRoot.querySelector<HTMLElement>(
                testIdSelector(VirRuleDebug.testIds.clearSaveStateButton),
            );

            assert.isLengthExactly(
                ruleListElement.shadowRoot.querySelectorAll(VirGameRule.tagName),
                allGameRules.length,
            );
            assert.isDefined(clearSaveStateButton);

            const clearSaveStateNavEntry = extractNavEntry(clearSaveStateButton);

            assert.isDefined(clearSaveStateNavEntry);
            clearSaveStateNavEntry.activate(true);

            assert.isUndefined(gameState.saveState);
            assert.isDefined(
                ruleDebugElement.shadowRoot.querySelector(
                    testIdSelector(VirRuleDebug.testIds.resumeButton),
                ),
            );
        } finally {
            router.destroy();
            testWeb.cleanupRender();
        }
    });

    it('makes all rules available', async () => {
        const router = createFrontendRouter();
        const navController = new NavController(document.body, {
            alwaysRequireFocused: true,
        });
        const gameState = createGameState({
            navController,
            router,
        });
        gameState.saveState = createRestrictedSaveState();

        try {
            const ruleDebugElement = await renderRuleDebug(gameState);
            const unlockAllRulesButton = ruleDebugElement.shadowRoot.querySelector<HTMLElement>(
                testIdSelector(VirRuleDebug.testIds.unlockAllRulesButton),
            );

            assert.isDefined(unlockAllRulesButton);
            assertWrap.isDefined(extractNavEntry(unlockAllRulesButton)).activate(true);

            assert.deepEquals(gameState.saveState.unlockedGameRules, allGameRules);
        } finally {
            router.destroy();
            testWeb.cleanupRender();
        }
    });

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
            const pauseMenuElement = assertWrap.instanceOf(
                await testWeb.render(html`
                    <${VirPauseMenu.assign({
                        gameState,
                    })}></${VirPauseMenu}>
                `),
                VirPauseMenu,
            );
            const ruleDebugElement = await renderRuleDebug(gameState);
            const exitDebugButton = ruleDebugElement.shadowRoot.querySelector<HTMLElement>(
                VirGameButton.tagName,
            );

            assert.isDefined(exitDebugButton);

            const exitDebugNavEntry = extractNavEntry(exitDebugButton);

            assert.isDefined(exitDebugNavEntry);
            exitDebugNavEntry.focus(true);

            gameState.menuState = {
                pause: true,
            };
            ruleDebugElement.remove();

            await waitForAnimationFrame(2);

            const [
                resumeButton,
                debugButton,
                restartMissionButton,
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
            assert.strictEquals(navController.currentNavEntry.entry.element, restartMissionButton);

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
            ruleDebug: true,
        };
        router.setRoute({
            paths: frontendPathTree.paths.children.debug.children.rules.fullPaths,
        });

        try {
            const ruleDebugElement = await renderRuleDebug(gameState);
            const resumeButton = ruleDebugElement.shadowRoot.querySelector<HTMLElement>(
                testIdSelector(VirRuleDebug.testIds.resumeButton),
            );

            assert.isDefined(resumeButton);

            const resumeNavEntry = extractNavEntry(resumeButton);

            assert.isDefined(resumeNavEntry);
            resumeNavEntry.activate(true);
            await waitForAnimationFrame();

            assert.isUndefined(gameState.menuState);
            assert.deepEquals(router.readCurrentRoute().paths, []);
        } finally {
            router.destroy();
            testWeb.cleanupRender();
        }
    });

    it('updates the active save state when a debug rule is activated', async () => {
        const router = createFrontendRouter();
        const navController = new NavController(document.body, {
            alwaysRequireFocused: true,
        });
        const gameState = createGameState({
            navController,
            router,
        });

        try {
            const ruleDebugElement = await renderRuleDebug(gameState);
            const ruleListElement = assertWrap.instanceOf(
                ruleDebugElement.shadowRoot.querySelector(VirGameRuleList.tagName),
                VirGameRuleList,
            );

            const playerRuleElement = assertWrap.isDefined(
                Array.from(
                    ruleListElement.shadowRoot.querySelectorAll<InstanceType<typeof VirGameRule>>(
                        VirGameRule.tagName,
                    ),
                ).find((ruleElement) => {
                    return ruleElement.instanceInputs.rule === playerCardinalMovementRule;
                }),
            );
            const playerRuleNavEntry = extractNavEntry(playerRuleElement);

            assert.isDefined(playerRuleNavEntry);
            playerRuleNavEntry.activate(true);

            assert.deepEquals(
                {
                    activeRuleIds: gameState.saveState.activeRules.map((rule) => rule.id),
                    modifiers: gameState.saveState.modifiers,
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
