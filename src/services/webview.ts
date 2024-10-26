import * as vscode from 'vscode';
import * as path from 'path';

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
                #saveButton, #commitButton { display: none; }
                #loadingIndicator { display: none; }
            </style>
        </head>
        <body>
            <div id="controls">
                <button id="saveButton" disabled>Save Changelog</button>
                <button id="commitButton" disabled>Commit Changelog</button>
                <div id="loadingIndicator">Generating changelog...</div>
            </div>
            <div id="changelog"></div>
            <script>
                const vscode = acquireVsCodeApi();
                const changelogElement = document.getElementById('changelog');
                const saveButton = document.getElementById('saveButton');
                const commitButton = document.getElementById('commitButton');
                const loadingIndicator = document.getElementById('loadingIndicator');

                let changelogSaved = false;

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'updateChangelog':
                            changelogElement.textContent += message.content;
                            break;
                        case 'generationComplete':
                            loadingIndicator.style.display = 'none';
                            saveButton.style.display = 'inline-block';
                            saveButton.disabled = false;
                            break;
                        case 'changelogSaved':
                            changelogSaved = true;
                            commitButton.style.display = 'inline-block';
                            commitButton.disabled = false;
                            break;
                    }
                });

                saveButton.addEventListener('click', () => {
                    vscode.postMessage({ type: 'save', content: changelogElement.textContent });
                });

                commitButton.addEventListener('click', () => {
                    if (changelogSaved) {
                        vscode.postMessage({ type: 'commit' });
                    }
                });

                // Show loading indicator when the webview is ready
                vscode.postMessage({ type: 'webviewReady' });
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
        await vscode.workspace.fs.writeFile(vscode.Uri.file(changelogPath), Buffer.from(content, 'utf8'));
        vscode.window.showInformationMessage('Changelog saved successfully!');
    } catch (error) {
        vscode.window.showErrorMessage(`Error saving changelog: ${error instanceof Error ? error.message : String(error)}`);
    }
}
