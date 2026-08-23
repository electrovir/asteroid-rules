import {assert, assertWrap} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {allGameRules, getGameRulesUnlockedAtLevel} from './rules.js';

describe(getGameRulesUnlockedAtLevel.name, () => {
    it('unlocks each added rule at a higher level than the prior added rule', () => {
        const addedRules = allGameRules.slice(2);

        assert.isTrue(
            addedRules.slice(1).every((rule, index) => {
                return rule.unlockLevel > assertWrap.isDefined(addedRules[index]).unlockLevel;
            }),
        );
    });

    it('does not unlock a rule before its unlock level', () => {
        assert.isFalse(getGameRulesUnlockedAtLevel(9).some((rule) => rule.unlockLevel === 10));
        assert.isTrue(getGameRulesUnlockedAtLevel(10).some((rule) => rule.unlockLevel === 10));
    });
});
