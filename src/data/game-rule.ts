import {type PartialDeep} from '@augment-vir/common';
import {type ViraIconSvg} from 'vira';
import {type GameModifiers} from './modifiers.js';

export type GameRule = {
    cost: number;
    unlockLevel: number;
    id: string;
    ruleTitle: string;
    icon: ViraIconSvg;
    description: string;
    effects: PartialDeep<GameModifiers>;
};

export function createGameModifiers(activeRules: ReadonlyArray<Readonly<GameRule>>) {
    return activeRules.reduce<GameModifiers>((modifiers, rule) => {
        return {
            ...modifiers,
            ...rule.effects,
        };
    }, {});
}

export function calculateGameRulePoolCost(gameRules: ReadonlyArray<GameRule>) {
    return gameRules.reduce((totalCost, gameRule) => {
        return totalCost + gameRule.cost;
    }, 0);
}

export function limitGameRulesToPool({
    gameRules,
    maximumRulePool,
}: Readonly<{
    gameRules: ReadonlyArray<GameRule>;
    maximumRulePool: number;
}>) {
    return gameRules.reduce<GameRule[]>((includedGameRules, gameRule) => {
        const nextIncludedGameRules = includedGameRules.concat(gameRule);

        return calculateGameRulePoolCost(nextIncludedGameRules) <= maximumRulePool
            ? nextIncludedGameRules
            : includedGameRules;
    }, []);
}

export function toggleGameRule({
    activeRules,
    maximumRulePool,
    rule,
}: Readonly<{
    activeRules: ReadonlyArray<GameRule>;
    maximumRulePool: number;
    rule: GameRule;
}>) {
    if (activeRules.includes(rule)) {
        return activeRules.filter((activeRule) => activeRule !== rule);
    }

    const nextActiveRules = activeRules.concat(rule);

    return calculateGameRulePoolCost(nextActiveRules) <= maximumRulePool
        ? nextActiveRules
        : activeRules.slice();
}
