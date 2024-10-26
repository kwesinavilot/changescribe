import * as vscode from 'vscode';
import { initializeLLM } from './services/openai';
import { getGitLog, commitChangelog } from './services/git';
import { generateChangelog } from './services/changelog';
import { createWebviewPanel, saveChangelog } from './services/webview';

export function activate(context: vscode.ExtensionContext) {
    console.log('Literate extension is now active!');

    const disposable = vscode.commands.registerCommand('literate.generateChangelog', async () => {
        try {
            await initializeLLM();
            const webviewPanel = createWebviewPanel(context);
            await generateAndDisplayChangelog(webviewPanel);

            webviewPanel.webview.onDidReceiveMessage(
                async message => {
                    switch (message.type) {
                        case 'save':
                            await saveChangelog(message.content);
                            break;
                        case 'commit':
                            await commitChangelog(message.content);
                            break;
                    }
                },
                undefined,
                context.subscriptions
            );
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    context.subscriptions.push(disposable);

    const updateLLMProviderCommand = vscode.commands.registerCommand('literate.updateLLMProvider', async () => {
        const config = vscode.workspace.getConfiguration('literate');
        const llmProvider = config.get<string>('llmProvider');

        // Update setting visibility
        await vscode.commands.executeCommand('setContext', 'literate.isOpenAI', llmProvider === 'openai');
        await vscode.commands.executeCommand('setContext', 'literate.isAzureOpenAI', llmProvider === 'azureopenai');

        vscode.window.showInformationMessage(`LLM provider updated to ${llmProvider}`);
    });

    context.subscriptions.push(updateLLMProviderCommand);

    // Run the command once on activation to set initial visibility
    vscode.commands.executeCommand('literate.updateLLMProvider');
}

async function generateAndDisplayChangelog(panel: vscode.WebviewPanel) {
    try {
        const config = vscode.workspace.getConfiguration('literate');
        const maxCommits = config.get<number>('maxCommits') || 50;

        const logResult = await getGitLog(maxCommits);
        const changelog = await generateChangelog(logResult);

        panel.webview.postMessage({ type: 'updateChangelog', content: changelog });
    } catch (error) {
        throw new Error(`Error generating changelog: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export function deactivate() {}
