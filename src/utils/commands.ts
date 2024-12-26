import * as vscode from 'vscode';
import { validateConfig } from './config';
import { initializeLLM } from './llm';
import { createWebviewPanel, saveChangelog } from '../services/webview';
import { generateAndStreamChangelog } from './changelog';
import { commitChangelog } from '../services/git';

export function registerCommands(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('changeScribe.generateChangelog', async () => {
        try {
            // Validate the configuration
            validateConfig();

            // Initialize the LLM provider
            await initializeLLM();

            // Create the webview panel
            const webviewPanel = createWebviewPanel(context);

            webviewPanel.webview.onDidReceiveMessage(
                async message => {
                    switch (message.type) {
                        case 'webviewReady':
                            vscode.window.withProgress({
                                location: vscode.ProgressLocation.Notification,
                                title: "Change Scribe",
                                cancellable: false
                            }, async (progress) => {
                                progress.report({ message: 'Initializing changelog generation...' });
                                await generateAndStreamChangelog(webviewPanel);
                            });
                            break;
                        case 'save':
                            vscode.window.withProgress({
                                location: vscode.ProgressLocation.Notification,
                                title: "Change Scribe",
                                cancellable: false
                            }, async (progress) => {
                                progress.report({ message: 'Saving changelog...' });
                                await saveChangelog(message.content);
                                webviewPanel.webview.postMessage({ type: 'changelogSaved' });
                                vscode.window.showInformationMessage('Changelog saved successfully!');
                            });
                            break;
                        case 'commit':
                            vscode.window.withProgress({
                                location: vscode.ProgressLocation.Notification,
                                title: "Change Scribe",
                                cancellable: false
                            }, async (progress) => {
                                progress.report({ message: 'Committing changelog...' });
                                await commitChangelog(message.content);
                                vscode.window.showInformationMessage('Changelog committed successfully!');
                            });
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

    const updateLLMProviderCommand = vscode.commands.registerCommand('changescribe.updateLLMProvider', async () => {
        const config = vscode.workspace.getConfiguration('changeScribe');
        const llmProvider = config.get<string>('llmProvider');

        // Update setting visibility
        await vscode.commands.executeCommand('setContext', 'changescribe.isOpenAI', llmProvider === 'openai');
        await vscode.commands.executeCommand('setContext', 'changescribe.isAzureOpenAI', llmProvider === 'azureopenai');
        await vscode.commands.executeCommand('setContext', 'changescribe.isOpenAICompatible', llmProvider === 'openai-compatible');

        vscode.window.showInformationMessage(`Change Scribe: LLM provider is currently set to ${llmProvider}`);
    });

    context.subscriptions.push(updateLLMProviderCommand);

    // Run the command once on activation to set initial visibility
    vscode.commands.executeCommand('changescribe.updateLLMProvider');
}