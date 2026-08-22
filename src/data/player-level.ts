import {StableMath} from '@antha/util';

const initialLevelExperienceRequired = 100;
const levelAtWhichExperienceRequirementDoubles = 10;

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
