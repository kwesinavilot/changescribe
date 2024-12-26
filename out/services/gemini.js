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
exports.initializeGemini = initializeGemini;
exports.generateWithGemini = generateWithGemini;
const generative_ai_1 = require("@google/generative-ai");
const vscode = require("vscode");
const prompts_1 = require("../prompts");
let genAI;
function initializeGemini() {
    const config = vscode.workspace.getConfiguration('changeScribe');
    const apiKey = config.get('geminiApiKey');
    if (!apiKey) {
        throw new Error('Gemini API key is not configured. Please set it in the extension settings (Change Scribe: Gemini API Key).');
    }
    genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
}
function generateWithGemini(commitMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('changeScribe');
        const modelName = config.get('geminiModel') || 'gemini-1.5-flash';
        const model = genAI.getGenerativeModel({ model: modelName });
        try {
            // Gemini uses a different format, combine system and user prompts
            const prompt = `${prompts_1.CHANGELOG_SYSTEM_PROMPT}\n\n${(0, prompts_1.CHANGELOG_USER_PROMPT)(commitMessage)}`;
            const result = yield model.generateContent(prompt);
            return result.response.text();
        }
        catch (error) {
            throw new Error(`Gemini API error: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
//# sourceMappingURL=gemini.js.map