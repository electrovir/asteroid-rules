import {type PartialDeep} from '@augment-vir/common';
import {type ViraIconSvg} from 'vira';
import {type GameModifiers} from './modifiers.js';

export type GameRule = {
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

export function toggleGameRule({
    activeRules,
    rule,
}: Readonly<{
    activeRules: ReadonlyArray<Readonly<GameRule>>;
    rule: Readonly<GameRule>;
}>) {
    return activeRules.includes(rule)
        ? activeRules.filter((activeRule) => activeRule !== rule)
        : activeRules.concat(rule);
}
