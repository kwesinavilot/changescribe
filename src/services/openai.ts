import { OpenAI } from 'openai';
import * as vscode from 'vscode';

let openai: OpenAI;

export async function initializeOpenAI() {
    const config = vscode.workspace.getConfiguration('literate');
    const apiKey = config.get<string>('openaiApiKey');

    if (!apiKey) {
        throw new Error('OpenAI API key is not set. Please set it in the extension settings.');
    }

    openai = new OpenAI({ apiKey });
}

export async function getAIGeneratedDescription(commitMessage: string): Promise<string> {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant that generates concise and meaningful changelog entries based on commit messages." },
                { role: "user", content: `Generate a changelog entry for the following commit message: "${commitMessage}"` }
            ],
            max_tokens: 100,
        });

        return response.choices[0].message.content || 'No description generated.';
    } catch (error) {
        console.error('Error generating AI description:', error);
        return 'Error generating description.';
    }
}
