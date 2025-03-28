"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangelogTreeProvider = exports.ChangelogItem = void 0;
const vscode = require("vscode");
class ChangelogItem extends vscode.TreeItem {
    constructor(label, tooltip, collapsibleState, command, iconName, isSection = false) {
        super(label, collapsibleState);
        this.label = label;
        this.tooltip = tooltip;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.iconName = iconName;
        this.isSection = isSection;
        this.tooltip = tooltip;
        this.command = command;
        if (iconName) {
            this.iconPath = new vscode.ThemeIcon(iconName);
        }
        if (isSection) {
            // Make section headers uppercase
            this.label = label.toUpperCase();
            // Remove left padding and line
            this.contextValue = 'section';
            // These properties help remove the indentation
            this.description = '';
            this.resourceUri = undefined;
        }
    }
}
exports.ChangelogItem = ChangelogItem;
class ChangelogTreeProvider {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this._items = [];
        this.initializeItems();
    }
    initializeItems() {
        // Changes section
        const changesSection = new ChangelogItem('Changes', 'Manage changes', vscode.TreeItemCollapsibleState.Expanded, undefined, 'history', true // Mark as section
        );
        // Settings section
        const settingsSection = new ChangelogItem('Settings', 'Configure Change Scribe', vscode.TreeItemCollapsibleState.Expanded, undefined, 'settings-gear', true // Mark as section
        );
        // Help section
        const helpSection = new ChangelogItem('Help & Feedback', 'Get help and provide feedback', vscode.TreeItemCollapsibleState.Expanded, undefined, 'question', true // Mark as section
        );
        this._items = [changesSection, settingsSection, helpSection];
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            // Root level - return main sections
            return Promise.resolve(this._items);
        }
        // Child items based on parent section
        switch (element.label) {
            case 'CHANGES':
                return Promise.resolve([
                    new ChangelogItem('Generate Changelog', 'Generate a new changelog', vscode.TreeItemCollapsibleState.None, {
                        command: 'changeScribe.generateChangelog',
                        title: 'Generate Changelog'
                    }, 'note-add')
                ]);
            case 'SETTINGS':
                return Promise.resolve([
                    new ChangelogItem('Changelog Format', 'Configure changelog format', vscode.TreeItemCollapsibleState.None, { command: 'workbench.action.openSettings', title: '', arguments: ['changescribe.format'] }, 'note'),
                    new ChangelogItem('Change LLM Provider', 'Update the LLM provider settings', vscode.TreeItemCollapsibleState.None, { command: 'changescribe.updateLLMProvider', title: '' }, 'server'),
                    new ChangelogItem('Set Maximum Commits', 'Set maximum commits to include', vscode.TreeItemCollapsibleState.None, { command: 'workbench.action.openSettings', title: '', arguments: ['changescribe.maxCommits'] }, 'number'),
                    new ChangelogItem('Include Unstaged Changes', 'Toggle inclusion of unstaged changes', vscode.TreeItemCollapsibleState.None, { command: 'workbench.action.openSettings', title: '', arguments: ['changescribe.includeUnstagedChanges'] }, 'git-commit'),
                    new ChangelogItem('⚙ Open Full Settings', 'Open all Change Scribe settings', vscode.TreeItemCollapsibleState.None, { command: 'workbench.action.openSettings', title: '', arguments: ['changescribe'] }, 'gear')
                ]);
            case 'HELP & FEEDBACK':
                return Promise.resolve([
                    new ChangelogItem('Read Extension Docs', 'View documentation', vscode.TreeItemCollapsibleState.None, { command: 'vscode.open', title: '', arguments: ['https://github.com/kwesinavilot/changescribe#readme'] }, 'book'),
                    new ChangelogItem('Report Issue', 'Report a bug or suggest a feature', vscode.TreeItemCollapsibleState.None, { command: 'vscode.open', title: '', arguments: ['https://github.com/kwesinavilot/changescribe/issues'] }, 'bug'),
                    new ChangelogItem('Contribute', 'Contribute to Change Scribe', vscode.TreeItemCollapsibleState.None, { command: 'vscode.open', title: '', arguments: ['https://github.com/kwesinavilot/changescribe'] }, 'git-pull-request')
                ]);
            default:
                return Promise.resolve([]);
        }
    }
}
exports.ChangelogTreeProvider = ChangelogTreeProvider;
//# sourceMappingURL=changelogTreeProvider.js.map