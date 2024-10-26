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
exports.initializeLLM = initializeLLM;
exports.getAIGeneratedDescription = getAIGeneratedDescription;
const openai_1 = require("openai");
const vscode = require("vscode");
const azureopenai_1 = require("./azureopenai");
let openai;
function initializeLLM() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('changeScribe');
        const llmProvider = config.get('llmProvider');
        if (llmProvider === 'azureopenai') {
            yield (0, azureopenai_1.initializeAzureOpenAI)();
        }
        else {
            yield initializeOpenAI();
        }
    });
}
function initializeOpenAI() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('changeScribe');
        const apiKey = config.get('openaiApiKey');
        if (!apiKey) {
            throw new Error('OpenAI API key is not set. Please set it in the extension settings.');
        }
        openai = new openai_1.OpenAI({ apiKey });
    });
}
function getAIGeneratedDescription(commitMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('changeScribe');
        const llmProvider = config.get('llmProvider');
        if (llmProvider === 'azureopenai') {
            return (0, azureopenai_1.getAzureAIGeneratedDescription)(commitMessage);
        }
        else {
            return getOpenAIGeneratedDescription(commitMessage);
        }
    });
}
function getOpenAIGeneratedDescription(commitMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = vscode.workspace.getConfiguration('changeScribe');
            const model = config.get('openaiModel');
            if (!model) {
                throw new Error('OpenAI model is not set in the configuration. Please set it in the extension settings.');
            }
            const response = yield openai.chat.completions.create({
                model: model,
                messages: [
                    { role: "system", content: "You are a helpful assistant that generates concise and meaningful changelog entries based on commit messages." },
                    { role: "user", content: `Generate a changelog entry for the following commit message: "${commitMessage}"` }
                ],
                temperature: 0.1,
                max_tokens: 150,
            });
            return response.choices[0].message.content || 'No description generated.';
        }
        catch (error) {
            console.error('Error generating AI description:', error);
            if (error instanceof Error && error.message.includes('API deployment for this resource does not exist')) {
                return `Error: Azure OpenAI deployment not found. Please check your deployment configuration.`;
            }
            return `Error generating description: ${error instanceof Error ? error.message : String(error)}`;
        }
    });
}
//# sourceMappingURL=openai.js.map