"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebviewPanel = createWebviewPanel;
exports.getWebviewContent = getWebviewContent;
exports.saveChangelog = saveChangelog;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs/promises");
function createWebviewPanel(context) {
    const panel = vscode.window.createWebviewPanel('literateChangelog', 'Literate Changelog', vscode.ViewColumn.One, {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
    });
    panel.webview.html = getWebviewContent();
    return panel;
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
function saveChangelog(content) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder found. Please open a project.');
        }
        const rootPath = workspaceFolders[0].uri.fsPath;
        const changelogPath = path.join(rootPath, 'CHANGELOG.md');
        try {
            yield fs.writeFile(changelogPath, content, 'utf8');
            vscode.window.showInformationMessage('Changelog saved successfully!');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error saving changelog: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
//# sourceMappingURL=webview.js.map