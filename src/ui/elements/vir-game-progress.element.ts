import {clamp, type PartialWithUndefined} from '@augment-vir/common';
import {applyAttributes} from 'device-navigation';
import {css, defineElement, html} from 'element-vir';
import {viraFormCssVars} from 'vira';

// cspell:word valuenow

export const VirGameProgress = defineElement<
    {
        value: number;
    } & PartialWithUndefined<{
        animateDecreases: boolean;
        max: number;
        min: number;
    }>
>()({
    tagName: 'vir-game-progress',
    styles: css`
        :host {
            background-color: ${viraFormCssVars['vira-form-filled-background-color'].value};
            border-radius: 99999999px;
            display: block;
            height: 24px;
            overflow: hidden;
            width: 100%;
        }

        .progress-fill {
            background-color: ${viraFormCssVars['vira-form-accent-primary-color'].value};
            height: 100%;
        }
    `,
    state() {
        return {
            previousValue: undefined as number | undefined,
        };
    },
    render({host, inputs, state, updateState}) {
        const min = inputs.min ?? 0;
        const max = inputs.max ?? 100;
        const value = clamp(inputs.value, {
            min,
            max,
        });
        const percentFull = clamp(Math.round(((value - min) / (max - min)) * 100), {
            min: 0,
            max: 100,
        });
        const shouldAnimate =
            inputs.animateDecreases ||
            state.previousValue == undefined ||
            value >= state.previousValue;

        if (state.previousValue !== value) {
            updateState({
                previousValue: value,
            });
        }

        applyAttributes(host, {
            'aria-valuemax': max,
            'aria-valuemin': min,
            'aria-valuenow': value,
            role: 'progressbar',
        });

        return html`
            <div
                class="progress-fill"
                style=${css`
                    ${shouldAnimate
                        ? css`
                              transition: width 1s linear;
                          `
                        : css`
                              transition: none;
                          `}
                    width: ${percentFull}%;
                `}
            ></div>
        `;
    },
});
