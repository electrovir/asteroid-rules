import {defineConfig} from '@virmator/frontend/configs/vite.config.base.js';
import {execFile} from 'node:child_process';
import {resolve} from 'node:path';
import {promisify} from 'node:util';

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
                'import.meta.env.VITE_GIT_COMMIT_HASH': JSON.stringify(
                    await getBuildCommitHash(packageDirPath),
                ),
            },
        };
    },
);
