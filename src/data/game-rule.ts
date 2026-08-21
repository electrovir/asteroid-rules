import {type PartialDeep} from '@augment-vir/common';
import {type ViraIconSvg} from 'vira';
import {type GameModifiers} from './modifiers.js';

export type GameRule = {
    ruleTitle: string;
    icon: ViraIconSvg;
    description: string;
    effects: PartialDeep<GameModifiers>;
};
