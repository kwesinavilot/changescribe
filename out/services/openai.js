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
/**
 * Initializes the chosen LLM provider by setting up the API client and
 * loading any required configuration. The chosen provider is determined by
 * the 'llmProvider' setting in the 'changeScribe' configuration.
 *
 * @throws {Error} If the chosen LLM provider is not supported or if the
 * necessary configuration options are missing.
 * @returns {Promise<void>}
 */
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
/**
 * Initializes the OpenAI API client and loads the OpenAI API key from the
 * 'changeScribe' configuration. The 'openaiApiKey' setting must be set in the
 * extension settings before this function is called.
 *
 * @throws {Error} If the 'openaiApiKey' setting is not set.
 * @returns {Promise<void>}
 */
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
/**
 * Uses the chosen LLM provider to generate a description from a given commit
 * message. The chosen provider is determined by the 'llmProvider' setting in
 * the 'changeScribe' configuration. If the chosen provider is 'openai', the
 * description is generated using the OpenAI API. If the chosen provider is
 * 'azureopenai', the description is generated using the Azure OpenAI API.
 *
 * @param {string} commitMessage The commit message to generate a description
 * for.
 * @returns {Promise<string>} The generated description.
 */
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
/**
 * Uses the OpenAI API to generate a description from a given commit message.
 *
 * @param {string} commitMessage The commit message to generate a description for.
 * @returns {Promise<string>} The generated description.
 * @throws {Error} If the OpenAI API key or model is not set in the configuration.
 * @throws {Error} If the OpenAI API returns an error.
 */
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