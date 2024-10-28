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
exports.deactivate = deactivate;
const vscode = require("vscode");
const fs = require("fs/promises");
const path = require("path");
const openai_1 = require("./services/openai");
const git_1 = require("./services/git");
const webview_1 = require("./services/webview");
function activate(context) {
    console.log('Change Scribe extension is now active!');
    let disposable = vscode.commands.registerCommand('changeScribe.generateChangelog', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const config = vscode.workspace.getConfiguration('changeScribe');
            const llmProvider = config.get('llmProvider');
            if (llmProvider === 'azureopenai') {
                const azureConfig = {
                    apiKey: config.get('azureOpenaiApiKey'),
                    endpoint: config.get('azureOpenaiEndpoint'),
                    deploymentName: config.get('azureOpenaiDeploymentName')
                };
                if (!azureConfig.apiKey || !azureConfig.endpoint || !azureConfig.deploymentName) {
                    throw new Error('Azure OpenAI configuration is incomplete. Please check your settings.');
                }
            }
            yield (0, openai_1.initializeLLM)();
            const webviewPanel = (0, webview_1.createWebviewPanel)(context);
            webviewPanel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
                switch (message.type) {
                    case 'webviewReady':
                        vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: "Change Scribe",
                            cancellable: false
                        }, (progress) => __awaiter(this, void 0, void 0, function* () {
                            progress.report({ message: 'Initializing changelog generation...' });
                            yield generateAndStreamChangelog(webviewPanel);
                        }));
                        break;
                    case 'save':
                        vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: "Change Scribe",
                            cancellable: false
                        }, (progress) => __awaiter(this, void 0, void 0, function* () {
                            progress.report({ message: 'Saving changelog...' });
                            yield (0, webview_1.saveChangelog)(message.content);
                            webviewPanel.webview.postMessage({ type: 'changelogSaved' });
                            vscode.window.showInformationMessage('Changelog saved successfully!');
                        }));
                        break;
                    case 'commit':
                        vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: "Change Scribe",
                            cancellable: false
                        }, (progress) => __awaiter(this, void 0, void 0, function* () {
                            progress.report({ message: 'Committing changelog...' });
                            yield (0, git_1.commitChangelog)(message.content);
                            vscode.window.showInformationMessage('Changelog committed successfully!');
                        }));
                        break;
                }
            }), undefined, context.subscriptions);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }));
    context.subscriptions.push(disposable);
    const updateLLMProviderCommand = vscode.commands.registerCommand('changescribe.updateLLMProvider', () => __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('changeScribe');
        const llmProvider = config.get('llmProvider');
        // Update setting visibility
        yield vscode.commands.executeCommand('setContext', 'changescribe.isOpenAI', llmProvider === 'openai');
        yield vscode.commands.executeCommand('setContext', 'changescribe.isAzureOpenAI', llmProvider === 'azureopenai');
        vscode.window.showInformationMessage(`Change Scribe: LLM provider updated to ${llmProvider}`);
    }));
    context.subscriptions.push(updateLLMProviderCommand);
    // Run the command once on activation to set initial visibility
    vscode.commands.executeCommand('changescribe.updateLLMProvider');
}
function generateAndStreamChangelog(panel) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = vscode.workspace.getConfiguration('changeScribe');
            const maxCommits = config.get('maxCommits') || 50;
            const logResult = yield (0, git_1.getGitLog)(maxCommits);
            let changelogContent = yield getExistingChangelogContent();
            if (!changelogContent) {
                changelogContent = getChangelogHeader();
            }
            let newChanges = "## [Unreleased]\n\n";
            const changeTypes = {
                "Added": [],
                "Changed": [],
                "Deprecated": [],
                "Removed": [],
                "Fixed": [],
                "Security": []
            };
            for (const commit of logResult.all) {
                const changeType = getChangeType(commit.message);
                const aiGeneratedDescription = yield (0, openai_1.getAIGeneratedDescription)(commit.message);
                if (changeTypes[changeType]) {
                    changeTypes[changeType].push(`- ${aiGeneratedDescription} (${commit.hash.substring(0, 7)})`);
                }
                else {
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
        }
        catch (error) {
            panel.webview.postMessage({
                type: 'updateChangelog',
                content: `Error generating changelog: ${error instanceof Error ? error.message : String(error)}\n\n`
            });
            panel.webview.postMessage({ type: 'generationComplete' });
        }
    });
}
function getChangeType(commitMessage) {
    if (commitMessage.startsWith('feat:'))
        return 'Added';
    if (commitMessage.startsWith('fix:'))
        return 'Fixed';
    if (commitMessage.startsWith('docs:'))
        return 'Changed';
    if (commitMessage.startsWith('style:'))
        return 'Changed';
    if (commitMessage.startsWith('refactor:'))
        return 'Changed';
    if (commitMessage.startsWith('test:'))
        return 'Changed';
    if (commitMessage.startsWith('chore:'))
        return 'Changed';
    return 'Changed';
}
function getChangelogHeader() {
    return `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
}
function getExistingChangelogContent() {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return null;
        }
        const rootPath = workspaceFolders[0].uri.fsPath;
        const changelogPath = path.join(rootPath, 'CHANGELOG.md');
        try {
            const content = yield fs.readFile(changelogPath, 'utf8');
            return content;
        }
        catch (error) {
            return null;
        }
    });
}
function insertNewChanges(existingContent, newChanges) {
    const unreleasedIndex = existingContent.indexOf('## [Unreleased]');
    if (unreleasedIndex === -1) {
        return existingContent + '\n' + newChanges;
    }
    const beforeUnreleased = existingContent.substring(0, unreleasedIndex);
    const afterUnreleased = existingContent.substring(unreleasedIndex);
    return beforeUnreleased + newChanges + afterUnreleased;
}
function deactivate() { }
//# sourceMappingURL=extension.js.map