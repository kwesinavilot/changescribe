"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangelogTreeProvider = exports.ChangelogItem = void 0;
const vscode = require("vscode");
class ChangelogItem extends vscode.TreeItem {
    constructor(label, tooltip, collapsibleState, command) {
        super(label, collapsibleState);
        this.label = label;
        this.tooltip = tooltip;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.tooltip = tooltip;
        this.command = command;
    }
}
exports.ChangelogItem = ChangelogItem;
class ChangelogTreeProvider {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this._headerItem = null;
        this.initializeHeader();
    }
    initializeHeader() {
        const headerTreeItem = new vscode.TreeItem('Change Scribe');
        headerTreeItem.iconPath = {
            light: vscode.Uri.file(this.context.asAbsolutePath('resources/light-icon.svg')),
            dark: vscode.Uri.file(this.context.asAbsolutePath('resources/dark-icon.svg'))
        };
        this._headerItem = headerTreeItem;
    }
    setHeaderItem(item) {
        this._headerItem = item;
        this.refresh();
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren() {
        const items = [];
        if (this._headerItem) {
            this._headerItem.contextValue = 'changeScribeHeader';
            items.push(this._headerItem);
        }
        items.push(new ChangelogItem('Generate Changelog', 'Generate a new changelog', vscode.TreeItemCollapsibleState.None, {
            command: 'changeScribe.generateChangelog',
            title: 'Generate Changelog',
            tooltip: 'Generate a new changelog'
        }), new ChangelogItem('Change LLM Provider', 'Update the LLM provider settings', vscode.TreeItemCollapsibleState.None, {
            command: 'changescribe.updateLLMProvider',
            title: 'Change LLM Provider',
            tooltip: 'Update the LLM provider settings'
        }));
        return Promise.resolve(items);
    }
}
exports.ChangelogTreeProvider = ChangelogTreeProvider;
//# sourceMappingURL=changelogTreeProvider.js.map