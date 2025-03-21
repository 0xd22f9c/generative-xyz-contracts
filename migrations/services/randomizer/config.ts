import * as fs from 'fs';
import * as path from 'path';

const CONFIG_FILE_PATH = path.join(__dirname, '../../../config.json');

interface Config {
    cryptoAIAddress?: string;
    randomizerAddress?: string;
    contractAddress?: string;
}

export async function initConfig(): Promise<Config> {
    try {
        const configData = await fs.promises.readFile(CONFIG_FILE_PATH, 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        return {};
    }
}

export async function updateConfig(key: keyof Config, value: string): Promise<void> {
    try {
        const config = await initConfig();
        config[key] = value;
        await fs.promises.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error updating config:', error);
        throw error;
    }
}

export async function getConfig(): Promise<Config> {
    return initConfig();
}
