import * as vscode from 'vscode';
import { OpenAI } from 'openai';
import { CHANGELOG_SYSTEM_PROMPT, CHANGELOG_USER_PROMPT } from '../prompts';

let openaiCompatible: OpenAI;

/**
 * Initializes the OpenAI-compatible API client with the API key and endpoint specified
 * in the 'changeScribe' configuration.
 * 
 * @throws {Error} If the OpenAI-compatible API key is not set in the configuration.
 * @returns {Promise<void>}
 */
export async function initializeOpenAICompatible() {
    const config = vscode.workspace.getConfiguration('changeScribe');
    const apiKey = config.get<string>('openaiCompatibleAPIKey');
    const endpoint = config.get<string>('openaiCompatibleApiEndpoint') || 'https://api.openai.com/v1';

    if (!apiKey) {
        throw new Error('OpenAI-compatible API key is not set. Please set it in the extension settings (Change Scribe: Openai Compatible Api Key).');
    }

    if (!endpoint) {
        throw new Error('OpenAI-compatible API endpoint is not set. Please set it in the extension settings (Change Scribe: Openai Compatible Api Endpoint).');
    }

    openaiCompatible = new OpenAI({ 
        apiKey: apiKey,
        baseURL: endpoint 
    });
}

/**
 * Uses the OpenAI-compatible API to generate a description from a given commit message.
 *
 * @param {string} commitMessage The commit message to generate a description for.
 * @returns {Promise<string>} The generated description.
 * @throws {Error} If the OpenAI-compatible API key or model is not set in the configuration.
 * @throws {Error} If the OpenAI-compatible API returns an error.
 */
export async function generateWithOpenAICompatible(commitMessage: string): Promise<string> {
    try {
        const config = vscode.workspace.getConfiguration('changeScribe');
        const model = config.get<string>('openaiCompatibleModel');

        if (!model) {
            throw new Error('OpenAI-compatible model is not set in the configuration. Please set it in the extension settings (Change Scribe: Openai Compatible Model).');
        }

        const response = await openaiCompatible.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: CHANGELOG_SYSTEM_PROMPT },
                { role: "user", content: CHANGELOG_USER_PROMPT(commitMessage) }
            ],
            temperature: 0.4,
            max_tokens: 500,
        });

        return response.choices[0].message.content || 'No description generated.';
    } catch (error) {
        console.error('Error generating AI description:', error);
        return `Error generating description: ${error instanceof Error ? error.message : String(error)}`;
    }
}
