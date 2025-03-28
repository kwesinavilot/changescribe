import * as vscode from 'vscode';
import * as path from 'path';

export class ChangelogWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'changeScribeWebView';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Enable JavaScript in the webview
            enableScripts: true,
            // Restrict the webview to only load resources from the extension's directory
            localResourceRoots: [this._extensionUri]
        };

        // Set the HTML content
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'generateChangelog':
                    vscode.commands.executeCommand('changeScribe.generateChangelog');
                    break;
                case 'openSettings':
                    vscode.commands.executeCommand('workbench.action.openSettings', message.setting);
                    break;
                case 'updateLLMProvider':
                    vscode.commands.executeCommand('changescribe.updateLLMProvider');
                    break;
                case 'openUrl':
                    vscode.env.openExternal(vscode.Uri.parse(message.url));
                    break;
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        // Get the local path to script and css for the webview
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.css')
        );

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
            <link href="${styleUri}" rel="stylesheet">
            <title>Change Scribe</title>
        </head>
        <body>
            <div class="container">
                <section class="section">
                    <h2 class="section-header">CHANGES</h2>
                    <div class="section-content">
                        <div class="item" id="generate-changelog">
                            <span class="codicon codicon-note-add"></span>
                            <span class="item-text">Generate Changelog</span>
                        </div>
                    </div>
                </section>

                <section class="section">
                    <h2 class="section-header">SETTINGS</h2>
                    <div class="section-content">
                        <div class="item" data-setting="changescribe.format">
                            <span class="codicon codicon-note"></span>
                            <span class="item-text">Changelog Format</span>
                        </div>
                        <div class="item" id="update-llm-provider">
                            <span class="codicon codicon-server"></span>
                            <span class="item-text">Change LLM Provider</span>
                        </div>
                        <div class="item" data-setting="changescribe.maxCommits">
                            <span class="codicon codicon-number"></span>
                            <span class="item-text">Set Maximum Commits</span>
                        </div>
                        <div class="item" data-setting="changescribe.includeUnstagedChanges">
                            <span class="codicon codicon-git-commit"></span>
                            <span class="item-text">Include Unstaged Changes</span>
                        </div>
                        <div class="item" data-setting="changescribe">
                            <span class="codicon codicon-gear"></span>
                            <span class="item-text">⚙ Open Full Settings</span>
                        </div>
                    </div>
                </section>

                <section class="section">
                    <h2 class="section-header">HELP & FEEDBACK</h2>
                    <div class="section-content">
                        <div class="item" data-url="https://github.com/kwesinavilot/changescribe#readme">
                            <span class="codicon codicon-book"></span>
                            <span class="item-text">Read Extension Docs</span>
                        </div>
                        <div class="item" data-url="https://github.com/kwesinavilot/changescribe/issues">
                            <span class="codicon codicon-bug"></span>
                            <span class="item-text">Report Issue</span>
                        </div>
                        <div class="item" data-url="https://github.com/kwesinavilot/changescribe">
                            <span class="codicon codicon-git-pull-request"></span>
                            <span class="item-text">Contribute</span>
                        </div>
                    </div>
                </section>
            </div>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
