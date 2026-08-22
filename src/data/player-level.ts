import {StableMath} from '@antha/util';

const initialLevelExperienceRequired = 10;
const levelAtWhichExperienceRequirementDoubles = 5;
export const levelUpPresentationDurationMilliseconds = 300;

export function calculateExperienceRequiredToReachLevel(level: number) {
    return Math.floor(
        StableMath.round(
            initialLevelExperienceRequired *
                (1 +
                    (Math.max(1, Math.floor(level)) - 1) /
                        (levelAtWhichExperienceRequirementDoubles - 1)),
        ),
    );
}
