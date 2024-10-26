import * as vscode from 'vscode';
import { simpleGit, SimpleGit, LogResult } from 'simple-git';
import { OpenAI } from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';

let openai: OpenAI;

export function activate(context: vscode.ExtensionContext) {
    console.log('Literate extension is now active!');

    const disposable = vscode.commands.registerCommand('literate.generateChangelog', async () => {
        try {
            await initializeOpenAI();
            const webviewPanel = createWebviewPanel(context);
            await generateAndDisplayChangelog(webviewPanel);
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    context.subscriptions.push(disposable);
}

async function initializeOpenAI() {
    const config = vscode.workspace.getConfiguration('literate');
    const apiKey = config.get<string>('openaiApiKey');

    if (!apiKey) {
        throw new Error('OpenAI API key is not set. Please set it in the extension settings.');
    }

    openai = new OpenAI({ apiKey });
}

function createWebviewPanel(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'literateChangelog',
        'Literate Changelog',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
        }
    );

    panel.webview.html = getWebviewContent();
    panel.webview.onDidReceiveMessage(
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
    return panel;
}

async function generateAndDisplayChangelog(panel: vscode.WebviewPanel) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder found. Please open a project.');
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const git: SimpleGit = simpleGit(rootPath);

    try {
        const config = vscode.workspace.getConfiguration('literate');
        const maxCommits = config.get<number>('maxCommits') || 50;

        const logResult: LogResult = await git.log({ maxCount: maxCommits });
        const changelog = await generateChangelog(logResult);

        panel.webview.postMessage({ type: 'updateChangelog', content: changelog });
    } catch (error) {
        throw new Error(`Error generating changelog: ${error instanceof Error ? error.message : String(error)}`);
    }
}

async function generateChangelog(logResult: LogResult): Promise<string> {
    const config = vscode.workspace.getConfiguration('literate');
    const changelogFormat = config.get<string>('changelogFormat') || 'conventional';

    let changelog = '# Changelog\n\n';

    for (const commit of logResult.all) {
        const changeType = getChangeType(commit.message);
        const aiGeneratedDescription = await getAIGeneratedDescription(commit.message);

        if (changelogFormat === 'conventional') {
            changelog += `## ${commit.date}: ${changeType}\n\n`;
            changelog += `${aiGeneratedDescription}\n\n`;
            changelog += `Commit: ${commit.hash}\n`;
            changelog += `Author: ${commit.author_name} <${commit.author_email}>\n\n`;
        } else if (changelogFormat === 'keepachangelog') {
            changelog += `### ${changeType}\n`;
            changelog += `- ${aiGeneratedDescription} (${commit.hash})\n\n`;
        }
    }

    return changelog;
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

async function getAIGeneratedDescription(commitMessage: string): Promise<string> {
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

function getWebviewContent() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Literate Changelog</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                #changelog { white-space: pre-wrap; }
                #controls { margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div id="controls">
                <button id="saveButton">Save Changelog</button>
                <button id="commitButton">Commit Changelog</button>
            </div>
            <div id="changelog"></div>
            <script>
                const vscode = acquireVsCodeApi();
                const changelogElement = document.getElementById('changelog');
                const saveButton = document.getElementById('saveButton');
                const commitButton = document.getElementById('commitButton');

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'updateChangelog':
                            changelogElement.textContent = message.content;
                            break;
                    }
                });

                saveButton.addEventListener('click', () => {
                    vscode.postMessage({ type: 'save' });
                });

                commitButton.addEventListener('click', () => {
                    vscode.postMessage({ type: 'commit' });
                });
            </script>
        </body>
        </html>
    `;
}

async function saveChangelog(content: string) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder found. Please open a project.');
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const changelogPath = path.join(rootPath, 'CHANGELOG.md');

    try {
        await fs.writeFile(changelogPath, content, 'utf8');
        vscode.window.showInformationMessage('Changelog saved successfully!');
    } catch (error) {
        vscode.window.showErrorMessage(`Error saving changelog: ${error instanceof Error ? error.message : String(error)}`);
    }
}

async function commitChangelog(content: string) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder found. Please open a project.');
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const git: SimpleGit = simpleGit(rootPath);

    try {
        await saveChangelog(content);
        await git.add('CHANGELOG.md');
        await git.commit('Update CHANGELOG.md');
        vscode.window.showInformationMessage('Changelog committed successfully!');
    } catch (error) {
        vscode.window.showErrorMessage(`Error committing changelog: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export function deactivate() { }
