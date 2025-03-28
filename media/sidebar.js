(function() {
    const vscode = acquireVsCodeApi();

    // Handle clicks on items
    document.querySelectorAll('.item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.id === 'generate-changelog') {
                vscode.postMessage({
                    command: 'generateChangelog'
                });
            } else if (item.id === 'update-llm-provider') {
                vscode.postMessage({
                    command: 'updateLLMProvider'
                });
            } else if (item.dataset.setting) {
                vscode.postMessage({
                    command: 'openSettings',
                    setting: item.dataset.setting
                });
            } else if (item.dataset.url) {
                vscode.postMessage({
                    command: 'openUrl',
                    url: item.dataset.url
                });
            }
        });
    });
})();
