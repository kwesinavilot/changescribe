import * as vscode from 'vscode';
import { initializeOpenAI, generateWithOpenAI } from '../services/openai';
import { initializeAzureOpenAI, generateWithAzureOpenAI } from '../services/azureopenai';
import { initializeOpenAICompatible, generateWithOpenAICompatible } from '../services/openaicompatible';
import { initializeGemini, generateWithGemini } from '../services/gemini';

let currentProvider: string;

export async function initializeLLM(): Promise<void> {
    const config = vscode.workspace.getConfiguration('changeScribe');
    currentProvider = config.get<string>('llmProvider') || 'openai';

    switch (currentProvider) {
        case 'openai':
            initializeOpenAI();
            break;
        case 'azureopenai':
            initializeAzureOpenAI();
            break;
        case 'openai-compatible':
            initializeOpenAICompatible();
            break;
        case 'gemini':
            initializeGemini();
            break;
        default:
            throw new Error(`Unsupported LLM provider: ${currentProvider}`);
    }
}

export async function getAIGeneratedDescription(commitMessage: string): Promise<string> {
    const prompt = `Generate a clear and concise changelog entry from this commit message: "${commitMessage}"`;

    switch (currentProvider) {
        case 'openai':
            return generateWithOpenAI(prompt);
        case 'azureopenai':
            return generateWithAzureOpenAI(prompt);
        case 'openai-compatible':
            return generateWithOpenAICompatible(prompt);
        case 'gemini':
            return generateWithGemini(prompt);
        default:
            throw new Error(`Unsupported LLM provider: ${currentProvider}`);
    }
}