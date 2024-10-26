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
const openai_1 = require("./services/openai");
const git_1 = require("./services/git");
const webview_1 = require("./services/webview");
function activate(context) {
    console.log('Literate extension is now active!');
    let disposable = vscode.commands.registerCommand('literate.generateChangelog', () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, openai_1.initializeLLM)();
            const webviewPanel = (0, webview_1.createWebviewPanel)(context);
            webviewPanel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
                switch (message.type) {
                    case 'webviewReady':
                        yield generateAndStreamChangelog(webviewPanel);
                        break;
                    case 'save':
                        yield (0, webview_1.saveChangelog)(message.content);
                        webviewPanel.webview.postMessage({ type: 'changelogSaved' });
                        break;
                    case 'commit':
                        yield (0, git_1.commitChangelog)(message.content); // Pass the content to commitChangelog
                        vscode.window.showInformationMessage('Changelog committed successfully!');
                        break;
                }
            }), undefined, context.subscriptions);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }));
    context.subscriptions.push(disposable);
    const updateLLMProviderCommand = vscode.commands.registerCommand('literate.updateLLMProvider', () => __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('literate');
        const llmProvider = config.get('llmProvider');
        // Update setting visibility
        yield vscode.commands.executeCommand('setContext', 'literate.isOpenAI', llmProvider === 'openai');
        yield vscode.commands.executeCommand('setContext', 'literate.isAzureOpenAI', llmProvider === 'azureopenai');
        vscode.window.showInformationMessage(`LLM provider updated to ${llmProvider}`);
    }));
    context.subscriptions.push(updateLLMProviderCommand);
    // Run the command once on activation to set initial visibility
    vscode.commands.executeCommand('literate.updateLLMProvider');
}
function generateAndStreamChangelog(panel) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = vscode.workspace.getConfiguration('literate');
            const maxCommits = config.get('maxCommits') || 50;
            const logResult = yield (0, git_1.getGitLog)(maxCommits);
            for (const commit of logResult.all) {
                const changeType = getChangeType(commit.message);
                const aiGeneratedDescription = yield (0, openai_1.getAIGeneratedDescription)(commit.message);
                const changelogEntry = `## ${commit.date}: ${changeType}\n\n${aiGeneratedDescription}\n\nCommit: ${commit.hash}\nAuthor: ${commit.author_name} <${commit.author_email}>\n\n`;
                panel.webview.postMessage({ type: 'updateChangelog', content: changelogEntry });
            }
            panel.webview.postMessage({ type: 'generationComplete' });
        }
        catch (error) {
            throw new Error(`Error generating changelog: ${error instanceof Error ? error.message : String(error)}`);
        }
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
function deactivate() { }
//# sourceMappingURL=extension.js.map