import * as vscode from 'vscode';
import { initializeOpenAI, generateWithOpenAI } from '../services/openai';
import { initializeAzureOpenAI, generateWithAzureOpenAI } from '../services/azureOpenai';
import { initializeOpenAICompatible, generateWithOpenAICompatible } from '../services/openaicompatible';
import { initializeGemini, generateWithGemini } from '../services/gemini';

let currentProvider: string;

/**
 * Initializes the currently selected LLM provider.
 *
 * @throws {Error} If the configured LLM provider is not supported.
 * @returns {Promise<void>}
 */
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

/**
 * Uses the configured LLM provider to generate a clear and concise changelog entry from a given commit message.
 *
 * @param {string} commitMessage The commit message to generate a description for.
 * @returns {Promise<string>} The generated description.
 * @throws {Error} If the LLM provider is not supported.
 */
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