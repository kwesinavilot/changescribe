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
const openai_1 = require("../services/openai");
const azureopenai_1 = require("../services/azureopenai");
const openaicompatible_1 = require("../services/openaicompatible");
const vscode = require("vscode");
let llmProvider;
function initializeLLM() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('changeScribe');
        llmProvider = config.get('llmProvider') || 'openai';
        if (llmProvider === 'openai') {
            yield (0, openai_1.initializeOpenAI)();
        }
        else if (llmProvider === 'azureopenai') {
            yield (0, azureopenai_1.initializeAzureOpenAI)();
        }
        else if (llmProvider === 'openai-compatible') {
            yield (0, openaicompatible_1.initializeOAICompatible)();
        }
    });
}
function getAIGeneratedDescription(commitMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        if (llmProvider === 'openai') {
            return yield (0, openai_1.getOpenAIGeneration)(commitMessage);
        }
        else if (llmProvider === 'azureopenai') {
            return yield (0, azureopenai_1.getAzureAIGeneratedDescription)(commitMessage);
        }
        else if (llmProvider === 'openai-compatible') {
            return yield (0, openaicompatible_1.getOAICompatibleGeneration)(commitMessage);
        }
        else {
            throw new Error('LLM provider is not initialized or not supported.');
        }
    });
}
//# sourceMappingURL=llm.js.map