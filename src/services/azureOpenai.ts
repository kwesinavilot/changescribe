import { AzureOpenAI } from "openai";
import * as vscode from 'vscode';

let client: AzureOpenAI;

export async function initializeAzureOpenAI() {
    const config = vscode.workspace.getConfiguration('literate');
    const apiKey = config.get<string>('azureOpenaiApiKey');
    const endpoint = config.get<string>('azureOpenaiEndpoint');
    const deployment = config.get<string>('azureOpenaiDeploymentName');
    const apiVersion = config.get<string>('azureOpenaiApiVersion') || '2023-05-15'; // Default to a recent version if not set

    if (!apiKey || !endpoint || !deployment) {
        throw new Error('Azure OpenAI API key, endpoint, or deployment name is not set. Please set them in the extension settings.');
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

        const config = vscode.workspace.getConfiguration('literate');
        const aoaiModel = config.get<string>('azureOpenaiModel');

        // Ensure the model is set in the configuration
        if (!aoaiModel) {
            throw new Error('Azure OpenAI model is not set in the configuration. Please set it in the extension settings.');
        }

        const response = await client.chat.completions.create(
            {
                model: aoaiModel,
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
        return 'Error generating description.';
    }
}