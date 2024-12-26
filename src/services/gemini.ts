import { GoogleGenerativeAI } from '@google/generative-ai';
import * as vscode from 'vscode';
import { CHANGELOG_SYSTEM_PROMPT, CHANGELOG_USER_PROMPT } from '../prompts';

let genAI: GoogleGenerativeAI;

export function initializeGemini(): void {
    const config = vscode.workspace.getConfiguration('changeScribe');
    const apiKey = config.get<string>('geminiApiKey');

    if (!apiKey) {
        throw new Error('Gemini API key is not configured. Please set it in the extension settings (Change Scribe: Gemini API Key).');
    }

    genAI = new GoogleGenerativeAI(apiKey);
}

export async function generateWithGemini(commitMessage: string): Promise<string> {
    const config = vscode.workspace.getConfiguration('changeScribe');
    const modelName = config.get<string>('geminiModel') || 'gemini-1.5-flash';
    
    const model = genAI.getGenerativeModel({ model: modelName });
    
    try {
        // Gemini uses a different format, combine system and user prompts
        const prompt = `${CHANGELOG_SYSTEM_PROMPT}\n\n${CHANGELOG_USER_PROMPT(commitMessage)}`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        throw new Error(`Gemini API error: ${error instanceof Error ? error.message : String(error)}`);
    }
}
