# Project Rules

- **AI Guidance**: NEVER modify the root `CLAUDE.md`. All project-specific guidance for Claude should be placed in `.claude/CLAUDE.md` or `.claude/rules.md`.
- **Environment**: Always use Node `v24.12.0` for this project.
- **Package Manager**: Use `yarn` for the `wallet` project and `crms` project.
- **Platform**: The primary mobile platform for development is iOS.
- **Workflow**: 
  - For `wallet` changes, always run `yarn build` in the root `wallet/` directory to update internal packages.
  - For iOS development, ensure `pod install` is executed in `wallet/samples/app/ios` whenever dependencies change.
