import * as vscode from 'vscode';
import { validateConfig } from './config';
import { initializeLLM, isLLMConfigured } from './llm';
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
                                await generateAndStreamChangelog(webviewPanel, progress);
                                vscode.window.showInformationMessage('Changelog generated successfully!');
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
        const providerNames = {
            'openai': 'OpenAI',
            'azureopenai': 'Azure OpenAI',
            'openai-compatible': 'OpenAI-compatible providers (e.g. Groq, SambaNova)',
            'gemini': 'Google Gemini'
        };

        const currentProvider = config.get<string>('llmProvider');

        // Create QuickPick items with labels and values
        const quickPickItems = Object.entries(providerNames).map(([key, label]) => ({
            label,
            description: currentProvider === key ? '(current)' : '',
            value: key
        }));

        const selected = await vscode.window.showQuickPick(quickPickItems, {
            placeHolder: 'Select LLM Provider',
            ignoreFocusOut: true
        });

        if (selected) {
            // await config.update('llmProvider', selected.value, vscode.ConfigurationTarget.Global);
            const config = vscode.workspace.getConfiguration('changeScribe');
            await config.update('llmProvider', selected, vscode.ConfigurationTarget.Global);

            // Update setting visibility using the internal key
            await vscode.commands.executeCommand('setContext', 'changescribe.isOpenAI', selected.value === 'openai');
            await vscode.commands.executeCommand('setContext', 'changescribe.isAzureOpenAI', selected.value === 'azureopenai');
            await vscode.commands.executeCommand('setContext', 'changescribe.isOpenAICompatible', selected.value === 'openai-compatible');
            await vscode.commands.executeCommand('setContext', 'changescribe.isGemini', selected.value === 'gemini');

            vscode.window.showInformationMessage(`Change Scribe: LLM provider is now set to ${selected.label}`);
        } else {
            const currentName = providerNames[currentProvider as keyof typeof providerNames] || 'Unknown';
            vscode.window.showInformationMessage(`Change Scribe: LLM provider remains ${currentName}`);
        }
    });

    context.subscriptions.push(updateLLMProviderCommand);

    if (!isLLMConfigured()) {
        vscode.commands.executeCommand('changescribe.updateLLMProvider');
    }
}