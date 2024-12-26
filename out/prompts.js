"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHANGELOG_EXAMPLE = exports.CHANGELOG_USER_PROMPT = exports.CHANGELOG_SYSTEM_PROMPT = void 0;
exports.CHANGELOG_SYSTEM_PROMPT = `You are a semantic changelog generator that helps developers document their changes effectively. Your role is to:
1. Analyze commit messages and generate clear, meaningful descriptions
2. Create human-readable changelog entries that helps developers to understand their changes and foster team collaboration

Format your responses in a clear, concise manner using:
- Present tense for actions
- Bullet points for multiple changes
- Brief but informative descriptions`;
const CHANGELOG_USER_PROMPT = (commits) => `Analyze these recent commits and generate semantic changelog entries:

${commits}

Requirements:
1. Use clear, professional language
4. Include technical details where relevant
5. Focus on the impact to developers and users

Format each entry as:
- Brief description of change (technical context)`;
exports.CHANGELOG_USER_PROMPT = CHANGELOG_USER_PROMPT;
exports.CHANGELOG_EXAMPLE = `Input commits:
- feat: add user authentication
- fix: resolve login redirect issue
- style: update button colors

Output entries:
- Implemented user authentication system (JWT-based) [Enables secure user access]
- Fixed post-login redirect logic (Navigation state persistence) [Improves user flow]
- Updated UI button color scheme (Design system compliance) [Maintains consistency]`;
//# sourceMappingURL=prompts.js.map