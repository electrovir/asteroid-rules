import {defineConfig} from '@virmator/frontend/configs/vite.config.base.js';
import {execFile} from 'node:child_process';
import {resolve} from 'node:path';
import {promisify} from 'node:util';
import {type InjectedViteData} from '../src/data/global-vite-data.js';

const executeFile = promisify(execFile);

async function getBuildCommitHash(packageDirPath: string) {
    const {stdout} = await executeFile(
        'git',
        [
            'rev-parse',
            'HEAD',
        ],
        {
            cwd: packageDirPath,
            encoding: 'utf8',
        },
    );

    return stdout.trim().slice(0, 7);
}

const packageDirPath = resolve(import.meta.dirname, '..');

export default defineConfig(
    {
        forGitHubPages: true,
        packageDirPath,
    },
    async (baseConfig) => {
        return {
            ...baseConfig,
            define: {
                ...baseConfig.define,
                VITE_INJECTED_DATA: JSON.stringify({
                    commitHash: await getBuildCommitHash(packageDirPath),
                } satisfies InjectedViteData),
            },
        };
    },
);
