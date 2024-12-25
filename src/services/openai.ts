import { OpenAI } from 'openai';
import * as vscode from 'vscode';
import { initializeAzureOpenAI, getAzureAIGeneratedDescription } from './azureopenai';

let openai: OpenAI;

/**
 * Initializes the chosen LLM provider by setting up the API client and
 * loading any required configuration. The chosen provider is determined by
 * the 'llmProvider' setting in the 'changeScribe' configuration.
 *
 * @throws {Error} If the chosen LLM provider is not supported or if the
 * necessary configuration options are missing.
 * @returns {Promise<void>}
 */
export async function initializeLLM() {
    const config = vscode.workspace.getConfiguration('changeScribe');
    const llmProvider = config.get<string>('llmProvider');

    if (llmProvider === 'azureopenai') {
        await initializeAzureOpenAI();
    } else {
        await initializeOpenAI();
    }
}

/**
 * Initializes the OpenAI API client and loads the OpenAI API key from the
 * 'changeScribe' configuration. The 'openaiApiKey' setting must be set in the
 * extension settings before this function is called.
 *
 * @throws {Error} If the 'openaiApiKey' setting is not set.
 * @returns {Promise<void>}
 */
async function initializeOpenAI() {
    const config = vscode.workspace.getConfiguration('changeScribe');
    const apiKey = config.get<string>('openaiApiKey');

    if (!apiKey) {
        throw new Error('OpenAI API key is not set. Please set it in the extension settings.');
    }

    openai = new OpenAI({ apiKey });
}

/**
 * Uses the chosen LLM provider to generate a description from a given commit
 * message. The chosen provider is determined by the 'llmProvider' setting in
 * the 'changeScribe' configuration. If the chosen provider is 'openai', the
 * description is generated using the OpenAI API. If the chosen provider is
 * 'azureopenai', the description is generated using the Azure OpenAI API.
 *
 * @param {string} commitMessage The commit message to generate a description
 * for.
 * @returns {Promise<string>} The generated description.
 */
export async function getAIGeneratedDescription(commitMessage: string): Promise<string> {
    const config = vscode.workspace.getConfiguration('changeScribe');
    const llmProvider = config.get<string>('llmProvider');

    if (llmProvider === 'azureopenai') {
        return getAzureAIGeneratedDescription(commitMessage);
    } else {
        return getOpenAIGeneratedDescription(commitMessage);
    }
}

/**
 * Uses the OpenAI API to generate a description from a given commit message.
 *
 * @param {string} commitMessage The commit message to generate a description for.
 * @returns {Promise<string>} The generated description.
 * @throws {Error} If the OpenAI API key or model is not set in the configuration.
 * @throws {Error} If the OpenAI API returns an error.
 */
async function getOpenAIGeneratedDescription(commitMessage: string): Promise<string> {
    try {
        const config = vscode.workspace.getConfiguration('changeScribe');
        const model = config.get<string>('openaiModel');

        if (!model) {
            throw new Error('OpenAI model is not set in the configuration. Please set it in the extension settings.');
        }

        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: "You are a helpful assistant that generates concise and meaningful changelog entries based on commit messages." },
                { role: "user", content: `Generate a changelog entry for the following commit message: "${commitMessage}"` }
            ],
            temperature: 0.1,
            max_tokens: 150,
        });

        return response.choices[0].message.content || 'No description generated.';
    } catch (error) {
        console.error('Error generating AI description:', error);

        if (error instanceof Error && error.message.includes('API deployment for this resource does not exist')) {
            return `Error: Azure OpenAI deployment not found. Please check your deployment configuration.`;
        }

        return `Error generating description: ${error instanceof Error ? error.message : String(error)}`;
    }
}
