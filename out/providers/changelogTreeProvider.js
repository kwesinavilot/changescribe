"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangelogTreeProvider = exports.HelpTreeProvider = exports.SettingsTreeProvider = exports.ChangesTreeProvider = exports.ChangelogItem = void 0;
const vscode = require("vscode");
// Base TreeItem class that can be used by all providers
class ChangelogItem extends vscode.TreeItem {
    constructor(label, tooltip, collapsibleState, command, iconName) {
        super(label, collapsibleState);
        this.label = label;
        this.tooltip = tooltip;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.iconName = iconName;
        this.tooltip = tooltip;
        this.command = command;
        if (iconName) {
            this.iconPath = new vscode.ThemeIcon(iconName);
        }
    }
}
exports.ChangelogItem = ChangelogItem;
// Changes section provider
class ChangesTreeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return Promise.resolve([]);
        }
        return Promise.resolve([
            new ChangelogItem('Generate Changelog', 'Generate a new changelog', vscode.TreeItemCollapsibleState.None, {
                command: 'changeScribe.generateChangelog',
                title: 'Generate Changelog'
            }, 'note-add')
        ]);
    }
}
exports.ChangesTreeProvider = ChangesTreeProvider;
// Settings section provider
class SettingsTreeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return Promise.resolve([]);
        }
        return Promise.resolve([
            new ChangelogItem('Changelog Format', 'Configure changelog format', vscode.TreeItemCollapsibleState.None, { command: 'workbench.action.openSettings', title: '', arguments: ['changescribe.format'] }, 'note'),
            new ChangelogItem('Change LLM Provider', 'Update the LLM provider settings', vscode.TreeItemCollapsibleState.None, { command: 'changescribe.updateLLMProvider', title: '' }, 'server'),
            new ChangelogItem('Set Maximum Commits', 'Set maximum commits to include', vscode.TreeItemCollapsibleState.None, { command: 'workbench.action.openSettings', title: '', arguments: ['changescribe.maxCommits'] }, 'number'),
            new ChangelogItem('Include Unstaged Changes', 'Toggle inclusion of unstaged changes', vscode.TreeItemCollapsibleState.None, { command: 'workbench.action.openSettings', title: '', arguments: ['changescribe.includeUnstagedChanges'] }, 'git-commit'),
            new ChangelogItem('⚙ Open Full Settings', 'Open all Change Scribe settings', vscode.TreeItemCollapsibleState.None, { command: 'workbench.action.openSettings', title: '', arguments: ['changescribe'] }, 'gear')
        ]);
    }
}
exports.SettingsTreeProvider = SettingsTreeProvider;
// Help & Feedback section provider
class HelpTreeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return Promise.resolve([]);
        }
        return Promise.resolve([
            new ChangelogItem('Read Extension Docs', 'View documentation', vscode.TreeItemCollapsibleState.None, { command: 'vscode.open', title: '', arguments: ['https://github.com/kwesinavilot/changescribe#readme'] }, 'book'),
            new ChangelogItem('Report Issue', 'Report a bug or suggest a feature', vscode.TreeItemCollapsibleState.None, { command: 'vscode.open', title: '', arguments: ['https://github.com/kwesinavilot/changescribe/issues'] }, 'bug'),
            new ChangelogItem('Contribute', 'Contribute to Change Scribe', vscode.TreeItemCollapsibleState.None, { command: 'vscode.open', title: '', arguments: ['https://github.com/kwesinavilot/changescribe'] }, 'git-pull-request')
        ]);
    }
}
exports.HelpTreeProvider = HelpTreeProvider;
// Keep the original ChangelogTreeProvider for backward compatibility if needed
class ChangelogTreeProvider {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        // This provider is kept for backward compatibility
        // You can remove it if not needed
        return Promise.resolve([]);
    }
}
exports.ChangelogTreeProvider = ChangelogTreeProvider;
//# sourceMappingURL=changelogTreeProvider.js.map