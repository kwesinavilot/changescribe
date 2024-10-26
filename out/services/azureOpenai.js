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
exports.getAzureAIGeneratedDescription = getAzureAIGeneratedDescription;
const openai_1 = require("@azure/openai");
const vscode = require("vscode");
let azureOpenaiClient;
function initializeAzureOpenAI() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('literate');
        const apiKey = config.get('azureOpenaiApiKey');
        const endpoint = config.get('azureOpenaiEndpoint');
        if (!apiKey || !endpoint) {
            throw new Error('Azure OpenAI API key or endpoint is not set. Please set them in the extension settings.');
        }
        azureOpenaiClient = new openai_1.OpenAIClient(endpoint, new openai_1.AzureKeyCredential(apiKey));
    });
}
function getAzureAIGeneratedDescription(commitMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const config = vscode.workspace.getConfiguration('literate');
            const deploymentName = config.get('azureOpenaiDeploymentName');
            if (!deploymentName) {
                throw new Error('Azure OpenAI deployment name is not set. Please set it in the extension settings.');
            }
            const response = yield azureOpenaiClient.getChatCompletions(deploymentName, [
                { role: "system", content: "You are a helpful assistant that generates concise and meaningful changelog entries based on commit messages." },
                { role: "user", content: `Generate a changelog entry for the following commit message: "${commitMessage}"` }
            ], { maxTokens: 100 });
            return ((_a = response.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) || 'No description generated.';
        }
        catch (error) {
            console.error('Error generating AI description:', error);
            return 'Error generating description.';
        }
    });
}
//# sourceMappingURL=azureOpenai.js.map