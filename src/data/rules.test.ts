import {assert, assertWrap} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {toggleGameRule} from './game-rule.js';
import {
    allGameRules,
    getGameRulesUnlockedAtLevel,
    playerTwoMenuNavigationRule,
    twoPlayersRule,
} from './rules.js';

describe(getGameRulesUnlockedAtLevel.name, () => {
    it('unlocks each added rule at a higher level than the prior added rule', () => {
        const addedRules = allGameRules.slice(2);

        assert.isTrue(
            addedRules.slice(1).every((rule, index) => {
                return rule.unlockLevel > assertWrap.isDefined(addedRules[index]).unlockLevel;
            }),
        );
    });

    it('spaces rule unlocks after the onboarding levels', () => {
        const postOnboardingRules = allGameRules.filter((rule) => {
            return rule.unlockLevel > 5;
        });

        assert.isTrue(
            postOnboardingRules.slice(1).every((rule, index) => {
                return (
                    rule.unlockLevel -
                        assertWrap.isDefined(postOnboardingRules[index]).unlockLevel >=
                    3
                );
            }),
        );
    });

    it('unlocks the free player-two menu rule after Two Players', () => {
        assert.isFalse(
            getGameRulesUnlockedAtLevel(twoPlayersRule.unlockLevel).includes(
                playerTwoMenuNavigationRule,
            ),
        );
        assert.isTrue(
            getGameRulesUnlockedAtLevel(twoPlayersRule.unlockLevel + 1).includes(
                playerTwoMenuNavigationRule,
            ),
        );
        assert.deepEquals(
            toggleGameRule({
                activeRules: [],
                maximumRulePool: 0,
                rule: playerTwoMenuNavigationRule,
            }),
            [playerTwoMenuNavigationRule],
        );
    });

    it('does not unlock a rule before its unlock level', () => {
        assert.isFalse(getGameRulesUnlockedAtLevel(99).some((rule) => rule.unlockLevel === 100));
        assert.isTrue(getGameRulesUnlockedAtLevel(100).some((rule) => rule.unlockLevel === 100));
    });
});
