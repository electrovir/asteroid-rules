import {assert, assertWrap} from '@augment-vir/assert';
import {SeededRandom, wait} from '@augment-vir/common';
import {describe, it, testWeb} from '@augment-vir/test';
import {waitForAnimationFrame} from '@augment-vir/web';
import {NavController, extractNavEntry} from 'device-navigation';
import {html, testIdSelector} from 'element-vir';
import {type FullGameState} from '../../data/game-state.js';
import {playerCardinalMovementRule} from '../../data/rules.js';
import {VirGameRule} from './vir-game-rule.element.js';
import {VirRuleUnlockMenu} from './vir-rule-unlock-menu.element.js';

type TestGameState = {
    menuState: FullGameState['menuState'];
    missionState: NonNullable<FullGameState['missionState']>;
    navController: NavController;
    saveState: NonNullable<FullGameState['saveState']>;
};

function createGameState({navController}: Readonly<{navController: NavController}>): TestGameState {
    return {
        menuState: {
            isOnRuleUnlock: true,
        },
        missionState: {
            lastAsteroidSpawnedAt: 0,
            lastTimedExperienceEarnedAt: 0,
            levelUpAnimation: undefined,
            pendingRuleUnlocks: [
                playerCardinalMovementRule,
            ],
            players: {},
            seededRandom: SeededRandom.fromSeed('rule-unlock-menu-test'),
        },
        navController,
        saveState: {
            activeRules: [],
            modifiers: {},
            playerLevel: 1,
            playerLevelExperience: 0,
            unlockedGameRules: [
                playerCardinalMovementRule,
            ],
        },
    } satisfies TestGameState;
}

describe(VirRuleUnlockMenu.tagName, () => {
    it('shows an enabled rule before applying it and closing the menu', async () => {
        const navController = new NavController(document.body, {
            alwaysRequireFocused: true,
        });
        const gameState = createGameState({
            navController,
        });

        try {
            const ruleUnlockMenuElement = assertWrap.instanceOf(
                await testWeb.render(html`
                    <${VirRuleUnlockMenu.assign({
                        gameState,
                    })}></${VirRuleUnlockMenu}>
                `),
                VirRuleUnlockMenu,
            );
            const enableButton = assertWrap.instanceOf(
                assertWrap
                    .isDefined(ruleUnlockMenuElement.shadowRoot)
                    .querySelector(testIdSelector(VirRuleUnlockMenu.testIds.enableButton)),
                HTMLElement,
            );

            assertWrap.isDefined(extractNavEntry(enableButton)).activate(true);
            await waitForAnimationFrame();

            assert.isTrue(
                assertWrap.instanceOf(
                    assertWrap
                        .isDefined(ruleUnlockMenuElement.shadowRoot)
                        .querySelector(VirGameRule.tagName),
                    VirGameRule,
                ).instanceInputs.isActive,
            );
            assert.deepEquals(
                {
                    activeRuleIds: gameState.saveState.activeRules.map((rule) => rule.id),
                    menuState: gameState.menuState,
                    pendingRuleIds: gameState.missionState.pendingRuleUnlocks.map(
                        (rule) => rule.id,
                    ),
                },
                {
                    activeRuleIds: [],
                    menuState: {
                        isOnRuleUnlock: true,
                    },
                    pendingRuleIds: [
                        playerCardinalMovementRule.id,
                    ],
                },
            );

            await wait({
                milliseconds: 550,
            });

            assert.deepEquals(
                {
                    activeRuleIds: gameState.saveState.activeRules.map((rule) => rule.id),
                    menuState: gameState.menuState,
                    modifiers: gameState.saveState.modifiers,
                    pendingRuleIds: gameState.missionState.pendingRuleUnlocks.map(
                        (rule) => rule.id,
                    ),
                },
                {
                    activeRuleIds: [
                        playerCardinalMovementRule.id,
                    ],
                    menuState: undefined,
                    modifiers: {
                        allowPlayerCardinalMovement: true,
                    },
                    pendingRuleIds: [],
                },
            );
        } finally {
            testWeb.cleanupRender();
        }
    });
});
