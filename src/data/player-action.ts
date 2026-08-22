import {MenuNavBinding} from '@antha/input';
import {type Values} from '@augment-vir/common';

export enum PlayerAction {
    MoveDown = 'move-down',
    MoveLeft = 'move-left',
    MoveRight = 'move-right',
    MoveUp = 'move-up',
}

export const GameInputAction = {
    ...MenuNavBinding,
    ...PlayerAction,
};
export type GameInputAction = Values<typeof GameInputAction>;
