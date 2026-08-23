import {assertValidShape, ensureNullableShape, partialShape} from 'object-shape-tester';

const injectedViteDataShape = ensureNullableShape(
    partialShape({
        commitHash: '',
    }),
);

export type InjectedViteData = typeof injectedViteDataShape.runtimeType;

declare const VITE_INJECTED_DATA: InjectedViteData;

export function readInjectedViteData(): InjectedViteData {
    if (typeof VITE_INJECTED_DATA === 'undefined') {
        return {};
    }

    const injectedViteData: InjectedViteData = VITE_INJECTED_DATA;
    assertValidShape(injectedViteData, injectedViteDataShape);

    return injectedViteData;
}
