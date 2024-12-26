import { initializeOpenAI, getOpenAIGeneration } from '../services/openai';
import { initializeAzureOpenAI, getAzureAIGeneratedDescription } from '../services/azureopenai';
import { initializeOAICompatible, getOAICompatibleGeneration } from '../services/openaicompatible';
import * as vscode from 'vscode';

let llmProvider: string;

export async function initializeLLM() {
    const config = vscode.workspace.getConfiguration('changeScribe');
    llmProvider = config.get<string>('llmProvider') || 'openai';

    if (llmProvider === 'openai') {
        await initializeOpenAI();
    } else if (llmProvider === 'azureopenai') {
        await initializeAzureOpenAI();
    } else if (llmProvider === 'openai-compatible') {
        await initializeOAICompatible();
    }
}

export async function getAIGeneratedDescription(commitMessage: string): Promise<string> {
    if (llmProvider === 'openai') {
        return await getOpenAIGeneration(commitMessage);
    } else if (llmProvider === 'azureopenai') {
        return await getAzureAIGeneratedDescription(commitMessage);
    } else if (llmProvider === 'openai-compatible') {
        return await getOAICompatibleGeneration(commitMessage);
    } else {
        throw new Error('LLM provider is not initialized or not supported.');
    }
}