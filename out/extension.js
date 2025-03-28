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
    // Register the original TreeView provider (keep this)
    const changesProvider = new changelogTreeProvider_1.ChangesTreeProvider();
    const settingsProvider = new changelogTreeProvider_1.SettingsTreeProvider();
    const helpProvider = new changelogTreeProvider_1.HelpTreeProvider();
    vscode.window.registerTreeDataProvider('changeScribeChangesView', changesProvider);
    vscode.window.registerTreeDataProvider('changeScribeSettingsView', settingsProvider);
    vscode.window.registerTreeDataProvider('changeScribeHelpView', helpProvider);
    // Register the new WebView provider
    // const webviewProvider = new ChangelogWebviewProvider(context.extensionUri);
    // context.subscriptions.push(
    //     vscode.window.registerWebviewViewProvider(
    //         ChangelogWebviewProvider.viewType, 
    //         webviewProvider
    //     )
    // );
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('changeScribe.refreshView', () => {
        changesProvider.refresh();
        settingsProvider.refresh();
        helpProvider.refresh();
    }));
    (0, commands_1.registerCommands)(context);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map