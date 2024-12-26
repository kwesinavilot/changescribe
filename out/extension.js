"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const commands_1 = require("./utils/commands");
function activate(context) {
    vscode.window.showInformationMessage('Change Scribe extension is now active!');
    (0, commands_1.registerCommands)(context);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map