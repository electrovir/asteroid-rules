import {nav} from '@antha/input';
import {wait} from '@augment-vir/common';
import {css, defineElement, html, nothing, testId} from 'element-vir';
import {noNativeSpacing} from 'vira';
import {type GameRule} from '../../data/game-rule.js';
import {
    updateAsteroidsSaveStateRules,
    updateMenuState,
    type AsteroidsGameEngineState,
} from '../../data/game-state.js';
import {VirGameButton} from './vir-game-button.element.js';
import {VirGameRule} from './vir-game-rule.element.js';

export const VirRuleUnlockMenu = defineElement<{
    gameState: Partial<AsteroidsGameEngineState>;
}>()({
    tagName: 'vir-rule-unlock-menu',
    testIds: [
        'enableButton',
    ],
    state() {
        return {
            isEnablingRule: false,
        };
    },
    styles: css`
        :host {
            align-items: center;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            gap: 24px;
            height: 100%;
            justify-content: center;
            padding: 32px;
            width: 100%;
        }

        h1,
        p {
            ${noNativeSpacing}
        }

        h1 {
            font-size: 48px;
        }

        .menu-options {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
    `,
    render({inputs, state, testIds, updateState}) {
        const navController = inputs.gameState.navController;
        const unlockedRule = inputs.gameState.missionState?.pendingRuleUnlocks.at(0);

        if (!navController || !unlockedRule) {
            return nothing;
        }

        return html`
            <h1>Rule Unlocked</h1>
            <${VirGameRule.assign({
                isActive: state.isEnablingRule,
                rule: unlockedRule,
            })}></${VirGameRule}>
            <p>Enable this rule now?</p>
            <div class="menu-options">
                <${VirGameButton}
                    ${testId(testIds.enableButton)}
                    ${nav(navController, {
                        y: 0,
                        listeners: {
                            activate: async ({enabled}) => {
                                if (enabled && !state.isEnablingRule) {
                                    updateState({
                                        isEnablingRule: true,
                                    });
                                    await wait({
                                        milliseconds: 500,
                                    });
                                    resolveRuleUnlock({
                                        enableRule: true,
                                        gameState: inputs.gameState,
                                        rule: unlockedRule,
                                    });
                                    updateState({
                                        isEnablingRule: false,
                                    });
                                }
                            },
                        },
                    })}
                >
                    Enable
                </${VirGameButton}>
                <${VirGameButton}
                    ${nav(navController, {
                        y: 1,
                        listeners: {
                            activate: ({enabled}) => {
                                if (enabled && !state.isEnablingRule) {
                                    resolveRuleUnlock({
                                        enableRule: false,
                                        gameState: inputs.gameState,
                                        rule: unlockedRule,
                                    });
                                }
                            },
                        },
                    })}
                >
                    Not Now
                </${VirGameButton}>
            </div>
        `;
    },
});

function resolveRuleUnlock({
    enableRule,
    gameState,
    rule,
}: Readonly<{
    enableRule: boolean;
    gameState: Partial<AsteroidsGameEngineState>;
    rule: Readonly<GameRule>;
}>) {
    const missionState = gameState.missionState;
    const saveState = gameState.saveState;

    if (!missionState || !saveState) {
        return;
    }

    const pendingRuleUnlocks = missionState.pendingRuleUnlocks.filter((pendingRule) => {
        return pendingRule !== rule;
    });

    gameState.missionState = {
        ...missionState,
        pendingRuleUnlocks,
    };

    if (enableRule) {
        gameState.saveState = updateAsteroidsSaveStateRules({
            activeRules: saveState.activeRules.includes(rule)
                ? saveState.activeRules
                : saveState.activeRules.concat(rule),
            saveState,
        });
    }

    updateMenuState(
        gameState,
        pendingRuleUnlocks.length
            ? {
                  isOnRuleUnlock: true,
              }
            : undefined,
    );
}
