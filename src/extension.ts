import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { initializeLLM, getAIGeneratedDescription } from './services/openai';
import { getGitLog, commitChangelog } from './services/git';
import { createWebviewPanel, saveChangelog } from './services/webview';

export function activate(context: vscode.ExtensionContext) {
    console.log('Change Scribe extension is now active!');

    let disposable = vscode.commands.registerCommand('changeScribe.generateChangelog', async () => {
        try {
            const config = vscode.workspace.getConfiguration('changeScribe');
            const llmProvider = config.get<string>('llmProvider');

            if (llmProvider === 'azureopenai') {
                const azureConfig = {
                    apiKey: config.get<string>('azureOpenaiApiKey'),
                    endpoint: config.get<string>('azureOpenaiEndpoint'),
                    deploymentName: config.get<string>('azureOpenaiDeploymentName')
                };

                if (!azureConfig.apiKey || !azureConfig.endpoint || !azureConfig.deploymentName) {
                    throw new Error('Azure OpenAI configuration is incomplete. Please check your settings.');
                }
            }

            await initializeLLM();
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

        vscode.window.showInformationMessage(`Change Scribe: LLM provider updated to ${llmProvider}`);
    });

    context.subscriptions.push(updateLLMProviderCommand);

    // Run the command once on activation to set initial visibility
    vscode.commands.executeCommand('changescribe.updateLLMProvider');
}

async function generateAndStreamChangelog(panel: vscode.WebviewPanel) {
    try {
        const config = vscode.workspace.getConfiguration('changeScribe');
        const maxCommits = config.get<number>('maxCommits') || 50;

        const logResult = await getGitLog(maxCommits);
        
        let changelogContent = await getExistingChangelogContent();
        if (!changelogContent) {
            changelogContent = getChangelogHeader();
        }

        let newChanges = "## [Unreleased]\n\n";
        const changeTypes: { [key: string]: string[] } = {
            "Added": [],
            "Changed": [],
            "Deprecated": [],
            "Removed": [],
            "Fixed": [],
            "Security": []
        };

        for (const commit of logResult.all) {
            const changeType = getChangeType(commit.message);
            const aiGeneratedDescription = await getAIGeneratedDescription(commit.message);
            
            if (changeTypes[changeType]) {
                changeTypes[changeType].push(`- ${aiGeneratedDescription} (${commit.hash.substring(0, 7)})`);
            } else {
                changeTypes["Changed"].push(`- ${aiGeneratedDescription} (${commit.hash.substring(0, 7)})`);
            }
        }

        for (const [type, changes] of Object.entries(changeTypes)) {
            if (changes.length > 0) {
                newChanges += `### ${type}\n${changes.join('\n')}\n\n`;
            }
        }

        const updatedChangelog = insertNewChanges(changelogContent, newChanges);
        
        panel.webview.postMessage({ type: 'updateChangelog', content: updatedChangelog });
        panel.webview.postMessage({ type: 'generationComplete' });
    } catch (error) {
        panel.webview.postMessage({ 
            type: 'updateChangelog', 
            content: `Error generating changelog: ${error instanceof Error ? error.message : String(error)}\n\n` 
        });
        panel.webview.postMessage({ type: 'generationComplete' });
    }
}

function getChangeType(commitMessage: string): string {
    if (commitMessage.startsWith('feat:')) return 'Added';
    if (commitMessage.startsWith('fix:')) return 'Fixed';
    if (commitMessage.startsWith('docs:')) return 'Changed';
    if (commitMessage.startsWith('style:')) return 'Changed';
    if (commitMessage.startsWith('refactor:')) return 'Changed';
    if (commitMessage.startsWith('test:')) return 'Changed';
    if (commitMessage.startsWith('chore:')) return 'Changed';
    return 'Changed';
}

function getChangelogHeader(): string {
    return `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
}

async function getExistingChangelogContent(): Promise<string | null> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return null;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const changelogPath = path.join(rootPath, 'CHANGELOG.md');

    try {
        const content = await fs.readFile(changelogPath, 'utf8');
        return content;
    } catch (error) {
        return null;
    }
}

function insertNewChanges(existingContent: string, newChanges: string): string {
    const unreleasedIndex = existingContent.indexOf('## [Unreleased]');
    if (unreleasedIndex === -1) {
        return existingContent + '\n' + newChanges;
    }

    const beforeUnreleased = existingContent.substring(0, unreleasedIndex);
    const afterUnreleased = existingContent.substring(unreleasedIndex);

    return beforeUnreleased + newChanges + afterUnreleased;
}

export function deactivate() {}
