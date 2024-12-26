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
exports.initializeAzureOpenAI = initializeAzureOpenAI;
exports.generateWithAzureOpenAI = generateWithAzureOpenAI;
const openai_1 = require("openai");
const vscode = require("vscode");
const prompts_1 = require("../prompts");
let client;
function initializeAzureOpenAI() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('changeScribe');
        const apiKey = config.get('azureOpenaiApiKey');
        const endpoint = config.get('azureOpenaiEndpoint');
        const deployment = config.get('azureOpenaiDeploymentName');
        const apiVersion = config.get('azureOpenaiApiVersion');
        if (!apiKey) {
            throw new Error('Azure OpenAI API key is not set. Please set it in the extension settings (Change Scribe: Azure Openai Api Key).');
        }
        if (!endpoint) {
            throw new Error('Azure OpenAI endpoint is not set. Please set it in the extension settings (Change Scribe: Azure Openai Endpoint).');
        }
        if (!deployment) {
            throw new Error('Azure OpenAI deployment name is not set. Please set it in the extension settings (Change Scribe: Azure Openai Deployment Name).');
        }
        if (!apiVersion) {
            throw new Error('Azure OpenAI API version is not set. Please set it in the extension settings (Change Scribe: Azure Openai Api Version).');
        }
        client = new openai_1.AzureOpenAI({
            apiKey,
            endpoint,
            apiVersion,
            deployment
        });
    });
}
function generateWithAzureOpenAI(commitMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            if (!client) {
                throw new Error('Azure OpenAI client is not initialized. Please initialize it first.');
            }
            const config = vscode.workspace.getConfiguration('changeScribe');
            const model = (_a = config.get('azureOpenaiModel')) !== null && _a !== void 0 ? _a : 'gpt-35-turbo';
            const response = yield client.chat.completions.create({
                model: model,
                messages: [
                    { role: "system", content: prompts_1.CHANGELOG_SYSTEM_PROMPT },
                    { role: "user", content: (0, prompts_1.CHANGELOG_USER_PROMPT)(commitMessage) }
                ],
                temperature: 0.4,
                max_tokens: 500
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
//# sourceMappingURL=azureopenai.js.map