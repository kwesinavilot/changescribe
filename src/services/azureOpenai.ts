import { AzureOpenAI } from "openai";
import * as vscode from 'vscode';
import { CHANGELOG_SYSTEM_PROMPT, CHANGELOG_USER_PROMPT } from '../prompts';

let client: AzureOpenAI;

export async function initializeAzureOpenAI() {
    const config = vscode.workspace.getConfiguration('changeScribe');
    const apiKey = config.get<string>('azureOpenaiApiKey');
    const endpoint = config.get<string>('azureOpenaiEndpoint');
    const deployment = config.get<string>('azureOpenaiDeploymentName');
    const apiVersion = config.get<string>('azureOpenaiApiVersion');

    if (!apiKey) {
        throw new Error('Azure OpenAI API key is not set. Please set it in the extension settings (Change Scribe: Azure Openai Api Key).');
    }
    if (!endpoint) {
        throw new Error('Azure OpenAI endpoint is not set. Please set it in the extension settings (Change Scribe: Azure Openai Endpoint).');
    }
    if (!deployment) {
        throw new Error('Azure OpenAI deployment name is not set. Please set it in the extension settings (Change Scribe: Azure Openai Deployment Name).');
    }

    if (!apiVersion) {
        throw new Error('Azure OpenAI API version is not set. Please set it in the extension settings (Change Scribe: Azure Openai Api Version).');
    }

    client = new AzureOpenAI({
        apiKey,
        endpoint,
        apiVersion,
        deployment
    });
}

export async function generateWithAzureOpenAI(commitMessage: string): Promise<string> {
    try {
        if (!client) {
            throw new Error('Azure OpenAI client is not initialized. Please initialize it first.');
        }

        const config = vscode.workspace.getConfiguration('changeScribe');
        const model = config.get<string>('azureOpenaiModel') ?? 'gpt-35-turbo';

        const response = await client.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: CHANGELOG_SYSTEM_PROMPT },
                { role: "user", content: CHANGELOG_USER_PROMPT(commitMessage) }
            ],
            temperature: 0.4,
            max_tokens: 500
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
