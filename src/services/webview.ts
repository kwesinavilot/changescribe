import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

export function createWebviewPanel(context: vscode.ExtensionContext): vscode.WebviewPanel {
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
    return panel;
}

export function getWebviewContent() {
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
                    vscode.postMessage({ type: 'save', content: changelogElement.textContent });
                });

                commitButton.addEventListener('click', () => {
                    vscode.postMessage({ type: 'commit', content: changelogElement.textContent });
                });
            </script>
        </body>
        </html>
    `;
}

export async function saveChangelog(content: string) {
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
