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
function activate(context) {
    // Register the tree data provider
    const changelogTreeProvider = new changelogTreeProvider_1.ChangelogTreeProvider(context);
    const treeView = vscode.window.createTreeView('changeScribeChangelog', {
        treeDataProvider: changelogTreeProvider,
        showCollapseAll: true
    });
    context.subscriptions.push(treeView);
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('changeScribe.refreshView', () => changelogTreeProvider.refresh()));
    (0, commands_1.registerCommands)(context);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map