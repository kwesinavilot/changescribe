import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import * as vscode from 'vscode';

let azureOpenaiClient: OpenAIClient;

export async function initializeAzureOpenAI() {
    const config = vscode.workspace.getConfiguration('literate');
    const apiKey = config.get<string>('azureOpenaiApiKey');
    const endpoint = config.get<string>('azureOpenaiEndpoint');

    if (!apiKey || !endpoint) {
        throw new Error('Azure OpenAI API key or endpoint is not set. Please set them in the extension settings.');
    }

    azureOpenaiClient = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
}

export async function getAzureAIGeneratedDescription(commitMessage: string): Promise<string> {
    try {
        const config = vscode.workspace.getConfiguration('literate');
        const deploymentName = config.get<string>('azureOpenaiDeploymentName');

        if (!deploymentName) {
            throw new Error('Azure OpenAI deployment name is not set. Please set it in the extension settings.');
        }

        const response = await azureOpenaiClient.getChatCompletions(
            deploymentName,
            [
                { role: "system", content: "You are a helpful assistant that generates concise and meaningful changelog entries based on commit messages." },
                { role: "user", content: `Generate a changelog entry for the following commit message: "${commitMessage}"` }
            ],
            { maxTokens: 100 }
        );

        return response.choices[0].message?.content || 'No description generated.';
    } catch (error) {
        console.error('Error generating AI description:', error);
        return 'Error generating description.';
    }
}
