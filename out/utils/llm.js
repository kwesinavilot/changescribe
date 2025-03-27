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
const vscode = require("vscode");
const openai_1 = require("../services/openai");
const azureOpenai_1 = require("../services/azureOpenai");
const openaicompatible_1 = require("../services/openaicompatible");
const gemini_1 = require("../services/gemini");
let currentProvider;
/**
 * Initializes the currently selected LLM provider.
 *
 * @throws {Error} If the configured LLM provider is not supported.
 * @returns {Promise<void>}
 */
function initializeLLM() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('changeScribe');
        currentProvider = config.get('llmProvider') || 'openai';
        switch (currentProvider) {
            case 'openai':
                (0, openai_1.initializeOpenAI)();
                break;
            case 'azureopenai':
                (0, azureOpenai_1.initializeAzureOpenAI)();
                break;
            case 'openai-compatible':
                (0, openaicompatible_1.initializeOpenAICompatible)();
                break;
            case 'gemini':
                (0, gemini_1.initializeGemini)();
                break;
            default:
                throw new Error(`Unsupported LLM provider: ${currentProvider}`);
        }
    });
}
/**
 * Uses the configured LLM provider to generate a clear and concise changelog entry from a given commit message.
 *
 * @param {string} commitMessage The commit message to generate a description for.
 * @returns {Promise<string>} The generated description.
 * @throws {Error} If the LLM provider is not supported.
 */
function getAIGeneratedDescription(commitMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `Generate a clear and concise changelog entry from this commit message: "${commitMessage}"`;
        switch (currentProvider) {
            case 'openai':
                return (0, openai_1.generateWithOpenAI)(prompt);
            case 'azureopenai':
                return (0, azureOpenai_1.generateWithAzureOpenAI)(prompt);
            case 'openai-compatible':
                return (0, openaicompatible_1.generateWithOpenAICompatible)(prompt);
            case 'gemini':
                return (0, gemini_1.generateWithGemini)(prompt);
            default:
                throw new Error(`Unsupported LLM provider: ${currentProvider}`);
        }
    });
}
//# sourceMappingURL=llm.js.map