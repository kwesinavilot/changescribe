"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfig = validateConfig;
const vscode = require("vscode");
function validateConfig() {
    const config = vscode.workspace.getConfiguration('changeScribe');
    const llmProvider = config.get('llmProvider');
    if (llmProvider === 'azureopenai') {
        const azureConfig = {
            apiKey: config.get('azureOpenaiApiKey'),
            endpoint: config.get('azureOpenaiEndpoint'),
            deploymentName: config.get('azureOpenaiDeploymentName')
        };
        if (!azureConfig.apiKey || !azureConfig.endpoint || !azureConfig.deploymentName) {
            throw new Error('Azure OpenAI configuration is incomplete. Please check your settings.');
        }
    }
    else if (llmProvider === 'openai') {
        const openaiConfig = {
            apiKey: config.get('openaiApiKey'),
            endpoint: config.get('openaiApiEndpoint') || 'https://api.openai.com/v1'
        };
        if (!openaiConfig.apiKey) {
            throw new Error('OpenAI configuration is incomplete. Please check your settings.');
        }
    }
    else if (llmProvider === 'openai-compatible') {
        const openaiCompatibleConfig = {
            apiKey: config.get('openaiCompatibleAPIKey'),
            endpoint: config.get('openaiCompatibleApiEndpoint') || 'https://api.openai.com/v1',
            model: config.get('openaiCompatibleModel')
        };
        if (!openaiCompatibleConfig.apiKey) {
            throw new Error('Configuration for an OpenAI-compatible LLM is incomplete. Please check your settings.');
        }
    }
}
//# sourceMappingURL=config.js.map