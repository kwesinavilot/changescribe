import { GoogleGenerativeAI } from '@google/generative-ai';
import * as vscode from 'vscode';

let genAI: GoogleGenerativeAI;

export function initializeGemini(): void {
    const config = vscode.workspace.getConfiguration('changeScribe');
    const apiKey = config.get<string>('geminiApiKey');

    if (!apiKey) {
        throw new Error('Gemini API key is not configured. Please set it in the extension settings (Change Scribe: Gemini API Key).');
    }

    genAI = new GoogleGenerativeAI(apiKey);
}

export async function generateWithGemini(prompt: string): Promise<string> {
    const config = vscode.workspace.getConfiguration('changeScribe');
    const modelName = config.get<string>('geminiModel') || 'gemini-1.5-flash';
    
    const model = genAI.getGenerativeModel({ model: modelName });
    
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        throw new Error(`Gemini API error: ${error instanceof Error ? error.message : String(error)}`);
    }
}
