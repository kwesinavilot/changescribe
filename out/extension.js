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
exports.activate = activate;
exports.getChangeType = getChangeType;
exports.deactivate = deactivate;
const vscode = require("vscode");
const simple_git_1 = require("simple-git");
const openai_1 = require("openai");
const fs = require("fs/promises");
const path = require("path");
let openai;
function activate(context) {
    console.log('Literate extension is now active!');
    const disposable = vscode.commands.registerCommand('literate.generateChangelog', () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield initializeOpenAI();
            const webviewPanel = createWebviewPanel(context);
            yield generateAndDisplayChangelog(webviewPanel);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }));
    context.subscriptions.push(disposable);
}
function initializeOpenAI() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('literate');
        const apiKey = config.get('openaiApiKey');
        if (!apiKey) {
            throw new Error('OpenAI API key is not set. Please set it in the extension settings.');
        }
        openai = new openai_1.OpenAI({ apiKey });
    });
}
function createWebviewPanel(context) {
    const panel = vscode.window.createWebviewPanel('literateChangelog', 'Literate Changelog', vscode.ViewColumn.One, {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
    });
    panel.webview.html = getWebviewContent();
    panel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
        switch (message.type) {
            case 'save':
                yield saveChangelog(message.content);
                break;
            case 'commit':
                yield commitChangelog(message.content);
                break;
        }
    }), undefined, context.subscriptions);
    return panel;
}
function generateAndDisplayChangelog(panel) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder found. Please open a project.');
        }
        const rootPath = workspaceFolders[0].uri.fsPath;
        const git = (0, simple_git_1.simpleGit)(rootPath);
        try {
            const config = vscode.workspace.getConfiguration('literate');
            const maxCommits = config.get('maxCommits') || 50;
            const logResult = yield git.log({ maxCount: maxCommits });
            const changelog = yield generateChangelog(logResult);
            panel.webview.postMessage({ type: 'updateChangelog', content: changelog });
        }
        catch (error) {
            throw new Error(`Error generating changelog: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
function generateChangelog(logResult) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('literate');
        const changelogFormat = config.get('changelogFormat') || 'conventional';
        let changelog = '# Changelog\n\n';
        for (const commit of logResult.all) {
            const changeType = getChangeType(commit.message);
            const aiGeneratedDescription = yield getAIGeneratedDescription(commit.message);
            if (changelogFormat === 'conventional') {
                changelog += `## ${commit.date}: ${changeType}\n\n`;
                changelog += `${aiGeneratedDescription}\n\n`;
                changelog += `Commit: ${commit.hash}\n`;
                changelog += `Author: ${commit.author_name} <${commit.author_email}>\n\n`;
            }
            else if (changelogFormat === 'keepachangelog') {
                changelog += `### ${changeType}\n`;
                changelog += `- ${aiGeneratedDescription} (${commit.hash})\n\n`;
            }
        }
        return changelog;
    });
}
function getChangeType(commitMessage) {
    if (commitMessage.startsWith('feat:'))
        return 'Feature';
    if (commitMessage.startsWith('fix:'))
        return 'Bug Fix';
    if (commitMessage.startsWith('docs:'))
        return 'Documentation';
    if (commitMessage.startsWith('style:'))
        return 'Style';
    if (commitMessage.startsWith('refactor:'))
        return 'Refactor';
    if (commitMessage.startsWith('test:'))
        return 'Test';
    if (commitMessage.startsWith('chore:'))
        return 'Chore';
    return 'Other';
}
function getAIGeneratedDescription(commitMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful assistant that generates concise and meaningful changelog entries based on commit messages." },
                    { role: "user", content: `Generate a changelog entry for the following commit message: "${commitMessage}"` }
                ],
                max_tokens: 100,
            });
            return response.choices[0].message.content || 'No description generated.';
        }
        catch (error) {
            console.error('Error generating AI description:', error);
            return 'Error generating description.';
        }
    });
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
function commitChangelog(content) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder found. Please open a project.');
        }
        const rootPath = workspaceFolders[0].uri.fsPath;
        const git = (0, simple_git_1.simpleGit)(rootPath);
        try {
            yield saveChangelog(content);
            yield git.add('CHANGELOG.md');
            yield git.commit('Update CHANGELOG.md');
            vscode.window.showInformationMessage('Changelog committed successfully!');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error committing changelog: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
function deactivate() { }
//# sourceMappingURL=extension.js.map