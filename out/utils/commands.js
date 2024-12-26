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
exports.registerCommands = registerCommands;
const vscode = require("vscode");
const config_1 = require("./config");
const llm_1 = require("./llm");
const webview_1 = require("../services/webview");
const changelog_1 = require("./changelog");
const git_1 = require("../services/git");
function registerCommands(context) {
    let disposable = vscode.commands.registerCommand('changeScribe.generateChangelog', () => __awaiter(this, void 0, void 0, function* () {
        try {
            // Validate the configuration
            (0, config_1.validateConfig)();
            // Initialize the LLM provider
            yield (0, llm_1.initializeLLM)();
            // Create the webview panel
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
                            yield (0, changelog_1.generateAndStreamChangelog)(webviewPanel);
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
        yield vscode.commands.executeCommand('setContext', 'changescribe.isOpenAICompatible', llmProvider === 'openai-compatible');
        vscode.window.showInformationMessage(`Change Scribe: LLM provider is currently set to ${llmProvider}`);
    }));
    context.subscriptions.push(updateLLMProviderCommand);
    // Run the command once on activation to set initial visibility
    vscode.commands.executeCommand('changescribe.updateLLMProvider');
}
//# sourceMappingURL=commands.js.map