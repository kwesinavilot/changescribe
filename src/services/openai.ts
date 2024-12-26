import { OpenAI } from 'openai';
import * as vscode from 'vscode';
import { CHANGELOG_SYSTEM_PROMPT, CHANGELOG_USER_PROMPT } from '../prompts';

let openai: OpenAI;

/**
 * Initializes the OpenAI API client with the API key and endpoint specified
 * in the 'changeScribe' configuration.
 * 
 * If there's a custom endpoint, it will be used instead of the default 'https://api.openai.com/v1'.
 *
 * @throws {Error} If the OpenAI API key is not set in the configuration.
 * @returns {Promise<void>}
 */
export async function initializeOpenAI() {
    const config = vscode.workspace.getConfiguration('changeScribe');
    const apiKey = config.get<string>('openaiApiKey');
    const endpoint = config.get<string>('openaiApiEndpoint') || 'https://api.openai.com/v1'

    if (!apiKey) {
        throw new Error('OpenAI API key is not set. Please set it in the extension settings (Change Scribe: Openai Api Key).');
    }

    openai = new OpenAI({ 
        apiKey: apiKey,
        baseURL: endpoint 
    });
}

/**
 * Uses the OpenAI API to generate a description from a given commit message.
 *
 * @param {string} commitMessage The commit message to generate a description for.
 * @returns {Promise<string>} The generated description.
 * @throws {Error} If the OpenAI API key or model is not set in the configuration.
 * @throws {Error} If the OpenAI API returns an error.
 */
export async function generateWithOpenAI(commitMessage: string): Promise<string> {
    try {
        const config = vscode.workspace.getConfiguration('changeScribe');
        const model = config.get<string>('openaiModel') || 'gpt-3.5-turbo';

        const response = await openai.chat.completions.create({
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

        if (error instanceof Error && error.message.includes('API deployment for this resource does not exist')) {
            return `Error: Azure OpenAI deployment not found. Please check your deployment configuration.`;
        }

        return `Error generating description: ${error instanceof Error ? error.message : String(error)}`;
    }
}
