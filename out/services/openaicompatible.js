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
exports.initializeOpenAICompatible = initializeOpenAICompatible;
exports.generateWithOpenAICompatible = generateWithOpenAICompatible;
const vscode = require("vscode");
const openai_1 = require("openai");
const prompts_1 = require("../prompts");
let openaiCompatible;
/**
 * Initializes the OpenAI-compatible API client with the API key and endpoint specified
 * in the 'changeScribe' configuration.
 *
 * @throws {Error} If the OpenAI-compatible API key is not set in the configuration.
 * @returns {Promise<void>}
 */
function initializeOpenAICompatible() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('changeScribe');
        const apiKey = config.get('openaiCompatibleAPIKey');
        const endpoint = config.get('openaiCompatibleApiEndpoint') || 'https://api.openai.com/v1';
        if (!apiKey) {
            throw new Error('OpenAI-compatible API key is not set. Please set it in the extension settings (Change Scribe: Openai Compatible Api Key).');
        }
        if (!endpoint) {
            throw new Error('OpenAI-compatible API endpoint is not set. Please set it in the extension settings (Change Scribe: Openai Compatible Api Endpoint).');
        }
        openaiCompatible = new openai_1.OpenAI({
            apiKey: apiKey,
            baseURL: endpoint
        });
    });
}
/**
 * Uses the OpenAI-compatible API to generate a description from a given commit message.
 *
 * @param {string} commitMessage The commit message to generate a description for.
 * @returns {Promise<string>} The generated description.
 * @throws {Error} If the OpenAI-compatible API key or model is not set in the configuration.
 * @throws {Error} If the OpenAI-compatible API returns an error.
 */
function generateWithOpenAICompatible(commitMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = vscode.workspace.getConfiguration('changeScribe');
            const model = config.get('openaiCompatibleModel');
            if (!model) {
                throw new Error('OpenAI-compatible model is not set in the configuration. Please set it in the extension settings (Change Scribe: Openai Compatible Model).');
            }
            const response = yield openaiCompatible.chat.completions.create({
                model: model,
                messages: [
                    { role: "system", content: prompts_1.CHANGELOG_SYSTEM_PROMPT },
                    { role: "user", content: (0, prompts_1.CHANGELOG_USER_PROMPT)(commitMessage) }
                ],
                temperature: 0.4,
                max_tokens: 500,
            });
            return response.choices[0].message.content || 'No description generated.';
        }
        catch (error) {
            console.error('Error generating AI description:', error);
            return `Error generating description: ${error instanceof Error ? error.message : String(error)}`;
        }
    });
}
//# sourceMappingURL=openaicompatible.js.map