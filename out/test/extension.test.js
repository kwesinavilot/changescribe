"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const changelog_1 = require("../services/changelog");
suite('Extension Test Suite', () => {
    test('getChangeType should return correct change type', () => {
        assert.strictEqual((0, changelog_1.getChangeType)('feat: new feature'), 'Feature');
        assert.strictEqual((0, changelog_1.getChangeType)('fix: bug fix'), 'Bug Fix');
        assert.strictEqual((0, changelog_1.getChangeType)('docs: update readme'), 'Documentation');
        assert.strictEqual((0, changelog_1.getChangeType)('style: format code'), 'Style');
        assert.strictEqual((0, changelog_1.getChangeType)('refactor: improve performance'), 'Refactor');
        assert.strictEqual((0, changelog_1.getChangeType)('test: add unit tests'), 'Test');
        assert.strictEqual((0, changelog_1.getChangeType)('chore: update dependencies'), 'Chore');
        assert.strictEqual((0, changelog_1.getChangeType)('other commit message'), 'Other');
    });
});
//# sourceMappingURL=extension.test.js.map