"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const commands_1 = require("./utils/commands");
const changelogTreeProvider_1 = require("./providers/changelogTreeProvider");
/**
 * Activates the Change Scribe extension.
 *
 * This function is called when the extension is activated. It displays an
 * activation message, registers the extension's commands, and sets up a
 * custom tree data provider for displaying the changelog.
 *
 * @param context - The context in which the extension is running, providing
 *                  access to the extension's environment and resources.
 */
/**
 * Activates the Change Scribe extension.
 *
 * This function is called when the extension is activated. It registers the
 * tree data provider and commands, and sets up a custom tree data provider
 * for displaying the changelog.
 *
 * @param context - The context in which the extension is running, providing
 *                  access to the extension's environment and resources.
 */
function activate(context) {
    // Register the tree data provider
    const changelogProvider = new changelogTreeProvider_1.ChangelogTreeProvider(context);
    vscode.window.registerTreeDataProvider('changeScribeView', changelogProvider);
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('changeScribe.refreshView', () => changelogProvider.refresh));
    (0, commands_1.registerCommands)(context);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map