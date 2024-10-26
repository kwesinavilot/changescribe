import { AzureOpenAI } from "openai";
import * as vscode from 'vscode';

let client: AzureOpenAI;

export async function initializeAzureOpenAI() {
    const config = vscode.workspace.getConfiguration('changeScribe');
    const apiKey = config.get<string>('azureOpenaiApiKey');
    const endpoint = config.get<string>('azureOpenaiEndpoint');
    const deployment = config.get<string>('azureOpenaiDeploymentName');
    const apiVersion = config.get<string>('azureOpenaiApiVersion');

    if (!apiKey) {
        throw new Error('Azure OpenAI API key is not set. Please set it in the extension settings (changeScribe.azureOpenaiApiKey).');
    }
    if (!endpoint) {
        throw new Error('Azure OpenAI endpoint is not set. Please set it in the extension settings (changeScribe.azureOpenaiEndpoint).');
    }
    if (!deployment) {
        throw new Error('Azure OpenAI deployment name is not set. Please set it in the extension settings (changeScribe.azureOpenaiDeploymentName).');
    }

    if (!apiVersion) {
        throw new Error('Azure OpenAI API version is not set. Please set it in the extension settings (changeScribe.azureOpenaiApiVersion).');
    }

    client = new AzureOpenAI({
        apiKey,
        endpoint,
        apiVersion,
        deployment
    });
}

export async function getAzureAIGeneratedDescription(commitMessage: string): Promise<string> {
    try {
        if (!client) {
            throw new Error('Azure OpenAI client is not initialized. Please initialize it first.');
        }

        const config = vscode.workspace.getConfiguration('changeScribe');
        const azureOpenAIModel = config.get<string>('azureOpenaiModel');

        // Ensure the model is set in the configuration
        if (!azureOpenAIModel) {
            throw new Error('Azure OpenAI model is not set in the configuration. Please set it in the extension settings.');
        }

        const response = await client.chat.completions.create(
            {
                model: azureOpenAIModel,
                messages: [
                    { role: "system", content: "You are a helpful assistant that generates concise and meaningful changelog entries based on commit messages." },
                    { role: "user", content: `Generate a changelog entry for the following commit message: "${commitMessage}"` }
                ],
                temperature: 0.1,
                max_tokens: 150
            }
        );

        return response.choices[0].message?.content || 'No description generated.';
    } catch (error) {
        console.error('Error generating AI description:', error);

        if (error instanceof Error && error.message.includes('API deployment for this resource does not exist')) {
            return `Error: Azure OpenAI deployment not found. Please check your deployment configuration.`;
        }

        return `Error generating description: ${error instanceof Error ? error.message : String(error)}`;
    }
}
