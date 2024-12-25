import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { initializeLLM, getAIGeneratedDescription } from './services/openai';
import { getGitLog, commitChangelog } from './services/git';
import { createWebviewPanel, saveChangelog } from './services/webview';

/**
 * Called when the extension is activated.
 * 
 * This function registers commands to generate changelogs, save them, and commit them to the Git repository.
 * It also sets up event listeners for the webview to receive messages from the UI and interact with the codebase.
 * 
 * @param {vscode.ExtensionContext} context The context of the extension activation.
 */
export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('Change Scribe extension is now active!');

    let disposable = vscode.commands.registerCommand('changeScribe.generateChangelog', async () => {
        try {
            const config = vscode.workspace.getConfiguration('changeScribe');
            const llmProvider = config.get<string>('llmProvider');

            // Check if the necessary configuration options are set
            if (llmProvider === 'azureopenai') {
                const azureConfig = {
                    apiKey: config.get<string>('azureOpenaiApiKey'),
                    endpoint: config.get<string>('azureOpenaiEndpoint'),
                    deploymentName: config.get<string>('azureOpenaiDeploymentName')
                };

                if (!azureConfig.apiKey || !azureConfig.endpoint || !azureConfig.deploymentName) {
                    throw new Error('Azure OpenAI configuration is incomplete. Please check your settings.');
                }
            } else if (llmProvider === 'openai') {
                // for OpenAI, check if there's an apiKey and a custom endpoint
                const openaiConfig = {
                    apiKey: config.get<string>('openaiApiKey'),
                    endpoint: config.get<string>('openaiApiEndpoint') || 'https://api.openai.com/v1'
                };

                if (!openaiConfig.apiKey) {
                    throw new Error('OpenAI configuration is incomplete. Please check your settings.');
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

        vscode.window.showInformationMessage(`Change Scribe: LLM provider is currently set to ${llmProvider}`);
    });

    context.subscriptions.push(updateLLMProviderCommand);

    // Run the command once on activation to set initial visibility
    vscode.commands.executeCommand('changescribe.updateLLMProvider');
}

        /**
         * Generates a changelog based on the latest commits in the Git repository and streams it to the webview.
         * 
         * This function gets the latest commits from the Git repository, generates descriptions for each using AI,
         * and then builds a changelog based on the commit messages. The changelog is then streamed to the webview
         * for display and further editing.
         * 
         * If an error occurs during generation, the error message is displayed in the webview and in a notification
         * box.
         * 
         * @param {vscode.WebviewPanel} panel The webview panel to stream the changelog to.
         */
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
        vscode.window.showErrorMessage(`Error generating changelog: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Given a commit message, returns the type of change it represents. This is
 * determined by the first word of the commit message, which should be one of
 * "feat", "fix", "docs", "style", "refactor", "test", or "chore". If the first
 * word is not one of those, then the change type is "Changed". The returned
 * string is one of "Added", "Fixed", "Changed", "Deprecated", "Removed",
 * or "Security".
 * @param {string} commitMessage The commit message to parse.
 * @returns {string} The type of change represented by the commit message.
 */
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

/**
 * Generates the header section for a changelog file.
 *
 * The header includes a title, a brief description of the purpose of the changelog,
 * and references to the Keep a Changelog format and Semantic Versioning.
 *
 * @returns {string} The formatted changelog header.
 */
function getChangelogHeader(): string {
    return `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
}

/**
 * Reads the contents of the CHANGELOG.md file in the root of the current workspace.
 * If no workspace is open or the file does not exist, returns null.
 * @returns {Promise<string | null>} The contents of the CHANGELOG.md file or null.
 */
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

/**
 * Inserts the new changes into the existing changelog content.
 * If the existing changelog content does not contain an "## [Unreleased]" header,
 * the new changes are appended to the end of the existing content.
 * Otherwise, the new changes are inserted before the "## [Unreleased]" header.
 * @param {string} existingContent - The existing changelog content.
 * @param {string} newChanges - The new changes to be inserted.
 * @returns {string} The updated changelog content.
 */
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
