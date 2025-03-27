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
                            yield (0, changelog_1.generateAndStreamChangelog)(webviewPanel, progress);
                            vscode.window.showInformationMessage('Changelog generated successfully!');
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
        const providerNames = {
            'openai': 'OpenAI',
            'azureopenai': 'Azure OpenAI',
            'openai-compatible': 'OpenAI-compatible providers (e.g. Groq, SambaNova)',
            'gemini': 'Google Gemini'
        };
        const currentProvider = config.get('llmProvider');
        // Create QuickPick items with labels and values
        const quickPickItems = Object.entries(providerNames).map(([key, label]) => ({
            label,
            description: currentProvider === key ? '(current)' : '',
            value: key
        }));
        const selected = yield vscode.window.showQuickPick(quickPickItems, {
            placeHolder: 'Select LLM Provider',
            ignoreFocusOut: true
        });
        if (selected) {
            // await config.update('llmProvider', selected.value, vscode.ConfigurationTarget.Global);
            const config = vscode.workspace.getConfiguration('changeScribe');
            yield config.update('llmProvider', selected, vscode.ConfigurationTarget.Global);
            // Update setting visibility using the internal key
            yield vscode.commands.executeCommand('setContext', 'changescribe.isOpenAI', selected.value === 'openai');
            yield vscode.commands.executeCommand('setContext', 'changescribe.isAzureOpenAI', selected.value === 'azureopenai');
            yield vscode.commands.executeCommand('setContext', 'changescribe.isOpenAICompatible', selected.value === 'openai-compatible');
            yield vscode.commands.executeCommand('setContext', 'changescribe.isGemini', selected.value === 'gemini');
            vscode.window.showInformationMessage(`Change Scribe: LLM provider is now set to ${selected.label}`);
        }
        else {
            const currentName = providerNames[currentProvider] || 'Unknown';
            vscode.window.showInformationMessage(`Change Scribe: LLM provider remains ${currentName}`);
        }
    }));
    context.subscriptions.push(updateLLMProviderCommand);
    if (!(0, llm_1.isLLMConfigured)()) {
        vscode.commands.executeCommand('changescribe.updateLLMProvider');
    }
}
//# sourceMappingURL=commands.js.map