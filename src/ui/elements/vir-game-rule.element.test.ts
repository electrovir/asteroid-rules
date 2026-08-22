import {assert} from '@augment-vir/assert';
import {describe, it, testWeb} from '@augment-vir/test';
import {html} from 'element-vir';
import {playerCardinalMovementRule} from '../../data/rules.js';
import {VirGameRule} from './vir-game-rule.element.js';

describe(VirGameRule.tagName, () => {
    it('marks active rules with a host class', async () => {
        const fixture = await testWeb.render(html`
            <${VirGameRule.assign({
                isActive: true,
                rule: playerCardinalMovementRule,
            })}></${VirGameRule}>
        `);

        assert.isTrue(fixture.classList.contains('vir-game-rule-active'));
    });
});
