import * as vscode from 'vscode';
import { initializeLLM, getAIGeneratedDescription } from './services/openai';
import { getGitLog, commitChangelog } from './services/git';
import { createWebviewPanel, saveChangelog } from './services/webview';

export function activate(context: vscode.ExtensionContext) {
    console.log('Literate extension is now active!');

    let disposable = vscode.commands.registerCommand('literate.generateChangelog', async () => {
        try {
            await initializeLLM();
            const webviewPanel = createWebviewPanel(context);
            
            webviewPanel.webview.onDidReceiveMessage(
                async message => {
                    switch (message.type) {
                        case 'webviewReady':
                            await generateAndStreamChangelog(webviewPanel);
                            break;
                        case 'save':
                            await saveChangelog(message.content);
                            webviewPanel.webview.postMessage({ type: 'changelogSaved' });
                            break;
                        case 'commit':
                            await commitChangelog(message.content);
                            vscode.window.showInformationMessage('Changelog committed successfully!');
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

async function generateAndStreamChangelog(panel: vscode.WebviewPanel) {
    try {
        const config = vscode.workspace.getConfiguration('literate');
        const maxCommits = config.get<number>('maxCommits') || 50;

        const logResult = await getGitLog(maxCommits);
        
        for (const commit of logResult.all) {
            const changeType = getChangeType(commit.message);
            const aiGeneratedDescription = await getAIGeneratedDescription(commit.message);

            const changelogEntry = `## ${commit.date}: ${changeType}\n\n${aiGeneratedDescription}\n\nCommit: ${commit.hash}\nAuthor: ${commit.author_name} <${commit.author_email}>\n\n`;
            
            panel.webview.postMessage({ type: 'updateChangelog', content: changelogEntry });
        }

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
    if (commitMessage.startsWith('feat:')) return 'Feature';
    if (commitMessage.startsWith('fix:')) return 'Bug Fix';
    if (commitMessage.startsWith('docs:')) return 'Documentation';
    if (commitMessage.startsWith('style:')) return 'Style';
    if (commitMessage.startsWith('refactor:')) return 'Refactor';
    if (commitMessage.startsWith('test:')) return 'Test';
    if (commitMessage.startsWith('chore:')) return 'Chore';
    return 'Other';
}

export function deactivate() {}
