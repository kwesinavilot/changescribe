import * as vscode from 'vscode';

export function validateConfig() {
    const config = vscode.workspace.getConfiguration('changeScribe');
    const llmProvider = config.get<string>('llmProvider');

    if (llmProvider === 'azureopenai') {
        const azureConfig = {
            apiKey: config.get<string>('azureOpenaiApiKey'),
            endpoint: config.get<string>('azureOpenaiEndpoint'),
            deploymentName: config.get<string>('azureOpenaiDeploymentName')
        };

        if (!azureConfig.apiKey || !azureConfig.endpoint || !azureConfig.deploymentName) {
            throw new Error('Azure OpenAI configuration is incomplete. Please check your settings.');
        }
    } else if (llmProvider === 'openai') {
        const openaiConfig = {
            apiKey: config.get<string>('openaiApiKey'),
            endpoint: config.get<string>('openaiApiEndpoint') || 'https://api.openai.com/v1'
        };

        if (!openaiConfig.apiKey) {
            throw new Error('OpenAI configuration is incomplete. Please check your settings.');
        }
    } else if (llmProvider === 'openai-compatible') {
        const openaiCompatibleConfig = {
            apiKey: config.get<string>('openaiCompatibleAPIKey'),
            endpoint: config.get<string>('openaiCompatibleApiEndpoint') || 'https://api.openai.com/v1',
            model: config.get<string>('openaiCompatibleModel')
        };

        if (!openaiCompatibleConfig.apiKey) {
            throw new Error('Configuration for an OpenAI-compatible LLM is incomplete. Please check your settings.');
        }
    }
}