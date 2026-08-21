import {createAnthaEntityMod2d} from '@antha/entity-2d';
import {type AsteroidsGameState} from '../data/asteroids-game-state.js';

export const {defineEntity, mod: asteroidsEntityMod} = createAnthaEntityMod2d<AsteroidsGameState>();
