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
const changelog_1 = require("./services/changelog");
const webview_1 = require("./services/webview");
function activate(context) {
    console.log('Literate extension is now active!');
    const disposable = vscode.commands.registerCommand('literate.generateChangelog', () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, openai_1.initializeLLM)();
            const webviewPanel = (0, webview_1.createWebviewPanel)(context);
            yield generateAndDisplayChangelog(webviewPanel);
            webviewPanel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
                switch (message.type) {
                    case 'save':
                        yield (0, webview_1.saveChangelog)(message.content);
                        break;
                    case 'commit':
                        yield (0, git_1.commitChangelog)(message.content);
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
function generateAndDisplayChangelog(panel) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = vscode.workspace.getConfiguration('literate');
            const maxCommits = config.get('maxCommits') || 50;
            const logResult = yield (0, git_1.getGitLog)(maxCommits);
            const changelog = yield (0, changelog_1.generateChangelog)(logResult);
            panel.webview.postMessage({ type: 'updateChangelog', content: changelog });
        }
        catch (error) {
            throw new Error(`Error generating changelog: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
function deactivate() { }
//# sourceMappingURL=extension.js.map