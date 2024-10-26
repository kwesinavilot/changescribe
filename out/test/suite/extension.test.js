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
const assert = require("assert");
const vscode = require("vscode");
suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');
    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('YourPublisherName.literate'));
    });
    test('Should activate extension', () => __awaiter(void 0, void 0, void 0, function* () {
        const ext = vscode.extensions.getExtension('YourPublisherName.literate');
        yield (ext === null || ext === void 0 ? void 0 : ext.activate());
        assert.ok(ext === null || ext === void 0 ? void 0 : ext.isActive);
    }));
    test('Should register generate changelog command', () => {
        return vscode.commands.getCommands(true).then((commands) => {
            assert.ok(commands.includes('literate.generateChangelog'));
        });
    });
});
//# sourceMappingURL=extension.test.js.map