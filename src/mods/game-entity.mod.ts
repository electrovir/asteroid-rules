import {createAnthaEntityMod2d} from '@antha/entity-2d';
import {type FullGameState} from '../data/game-state.js';

export const {defineEntity, mod: gameEntityMod} = createAnthaEntityMod2d<FullGameState>();
