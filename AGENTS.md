# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Build & Development Commands

### Essential Commands
```bash
# Install dependencies
npm install
cd src/webview && npm install && cd ../..

# Code quality checks (REQUIRED before commit)
npm run format    # Auto-format with Biome
npm run lint      # Check linting issues
npm run check     # Run all Biome checks (lint + format)

# Build for testing
npm run build     # Production build (generates toon schema + builds extension + webview)
npm run build:dev # Development build (faster, no minification)

# Individual component builds
npm run build:extension     # Build extension host only
npm run build:webview       # Build webview UI only
npm run generate:toon       # Generate toon schema from JSON schema
npm run generate:editing-flow # Generate editing flow constants

# Development mode
npm run watch           # Watch extension changes
npm run watch:webview   # Watch webview changes (dev server)

# Testing
npm run test            # Run all tests (unit + integration)
npm run test:unit       # Webview unit tests only
npm run test:integration # VSCode integration tests
npm run test:e2e        # E2E tests with WebdriverIO
```

### Packaging
```bash
npx vsce package  # Generate .vsix file for distribution
```

### Manual Testing in VSCode
1. Run `npm run build`
2. Press F5 or Run > Start Debugging
3. VSCode Extension Development Host will launch
4. Open the workflow editor with `Cmd+Shift+P` → "Claude Code Workflow Studio: Open Editor"

## Architecture Overview

### High-Level Structure
This is a **VSCode extension** with a **React-based Webview UI**. It follows a dual-process architecture:

```
┌─────────────────────────────────────────────┐
│ VSCode Extension (Node.js)                  │
│ ├── Extension Host (src/extension/)         │
│ │   ├── Commands (command handlers)         │
│ │   ├── Services (business logic)           │
│ │   └── Utils (validation, file ops)        │
│ │                                            │
│ └── Webview (React, src/webview/src/)       │
│     ├── Components (UI)                     │
│     ├── Stores (Zustand state management)   │
│     └── Services (API bridge)               │
└─────────────────────────────────────────────┘
         │
         ↓ postMessage API
         │
┌─────────────────────────────────────────────┐
│ External Services                           │
│ ├── File System (.vscode/workflows/)        │
│ ├── Claude Code CLI (AI generation)         │
│ ├── Slack API (workflow sharing)            │
│ └── MCP Servers (Model Context Protocol)    │
└─────────────────────────────────────────────┘
```

### Key Communication Pattern
- **Webview → Extension**: `vscode.postMessage({ type: 'COMMAND_NAME', payload: {...} })`
- **Extension → Webview**: `panel.webview.postMessage({ type: 'EVENT_NAME', payload: {...} })`
- Message types defined in `src/shared/types/messages.ts`

## Project Structure

```
cc-wf-studio/
├── src/
│   ├── extension/           # Extension Host (Node.js)
│   │   ├── commands/        # Command handlers (save, export, AI generation, Slack)
│   │   ├── services/        # Core services (Claude CLI, MCP, Slack, file I/O)
│   │   ├── utils/           # Validation, path utils, error handling
│   │   ├── i18n/            # Extension-side i18n (minimal)
│   │   └── extension.ts     # Entry point, activation logic
│   │
│   ├── webview/             # Webview UI (React)
│   │   └── src/
│   │       ├── components/  # React components (nodes, dialogs, toolbar)
│   │       ├── stores/      # Zustand state stores (workflow-store, refinement-store)
│   │       ├── services/    # Bridge services to Extension Host
│   │       ├── i18n/        # UI internationalization (5 languages)
│   │       ├── hooks/       # React hooks
│   │       └── main.tsx     # React entry point
│   │
│   └── shared/              # Shared TypeScript types between Extension & Webview
│       └── types/           # workflow-definition, messages, mcp-node, ai-metrics
│
├── resources/               # Static resources
│   └── workflow-schema.json # AI prompt schema (used by Claude Code CLI)
│
├── scripts/                 # Build scripts
│   ├── generate-toon-schema.ts        # Converts JSON schema to toon format
│   └── generate-editing-flow.ts       # Generates editing flow constants
│
├── docs/                    # Documentation
│   └── schema-maintenance.md # Schema maintenance guide
│
├── .github/workflows/       # CI/CD
│   └── release.yml          # Semantic Release automation
│
├── package.json             # Root package.json (extension metadata)
├── tsconfig.json            # TypeScript config (Extension Host)
├── vite.extension.config.ts # Vite config for extension bundling
└── src/webview/package.json # Webview package.json (React dependencies)
```

## Critical Files & Their Roles

### Extension Host (Node.js)

#### Entry Point
- **`src/extension/extension.ts`**: Activation/deactivation, command registration, URI handler for deep links

#### Commands (src/extension/commands/)
- **`open-editor.ts`**: Opens workflow editor webview, handles message routing
- **`ai-generation.ts`**: AI workflow generation via Claude Code CLI
- **`workflow-refinement.ts`**: AI-assisted workflow editing (conversational refinement)
- **`save-workflow.ts`**: Saves workflow JSON to `.vscode/workflows/`
- **`export-workflow.ts`**: Exports to `.claude/agents/` and `.claude/commands/`
- **`slack-share-workflow.ts`**: Uploads workflow to Slack with preview cards
- **`slack-import-workflow.ts`**: Imports workflow from Slack deep links
- **`mcp-handlers.ts`**: Lists MCP servers and tools

#### Services (src/extension/services/)
- **`claude-code-service.ts`**: Executes Claude Code CLI via `nano-spawn`, handles streaming
- **`refinement-service.ts`**: AI workflow refinement logic, prompt building
- **`schema-loader-service.ts`**: Loads and caches `workflow-schema.json`
- **`skill-service.ts`**: Scans and loads Skills from `~/.claude/skills/` and `.claude/skills/`
- **`skill-relevance-matcher.ts`**: Keyword-based skill relevance scoring for AI prompts
- **`mcp-cli-service.ts`**: MCP server/tool discovery via Claude Code CLI
- **`slack-api-service.ts`**: Slack API integration (file upload, messaging)
- **`file-service.ts`**: File I/O utilities

#### Validation (src/extension/utils/)
- **`validate-workflow.ts`**: Validates AI-generated workflows (node count, connections, required fields)
- **`workflow-validator.ts`**: Validates user-edited workflows before save
- **`sensitive-data-detector.ts`**: Detects API keys, tokens in workflows before Slack sharing

### Webview (React)

#### Entry Point
- **`src/webview/src/main.tsx`**: React root, initializes app

#### Core Components
- **`App.tsx`**: Main app container, handles webview state
- **`WorkflowEditor.tsx`**: React Flow canvas integration
- **`Toolbar.tsx`**: Top toolbar (save, export, AI generation, Slack share)
- **`NodePalette.tsx`**: Left sidebar, draggable node types
- **`PropertyOverlay.tsx`**: Right sidebar, node property editing (81KB, handles all node types)

#### State Management (Zustand)
- **`workflow-store.ts`**: Global workflow state (nodes, edges, canvas interactions)
- **`refinement-store.ts`**: AI refinement chat state (conversation history, streaming messages)

#### Dialogs (src/webview/src/components/dialogs/)
All dialogs use **Radix UI Dialog** with 3-layer z-index hierarchy:
- **Base (9999)**: Standalone/parent dialogs (McpNodeDialog, SkillBrowserDialog, SlackShareDialog)
- **Nested (10000)**: Child dialogs (SkillCreationDialog, SlackManualTokenDialog)
- **Confirm (10001)**: Confirmation dialogs (ConfirmDialog)

Key dialogs:
- **`RefinementChatPanel.tsx`**: AI workflow refinement interface with streaming
- **`McpNodeDialog.tsx`**: MCP tool configuration with dynamic form generation
- **`SkillBrowserDialog.tsx`**: Skill browser and creation UI
- **`SlackShareDialog.tsx`**: Slack workspace/channel selection

#### Services (src/webview/src/services/)
- **`vscode-bridge.ts`**: Webview ↔ Extension Host communication (postMessage wrapper)
- **`ai-generation-service.ts`**: Sends AI generation requests
- **`refinement-service.ts`**: Sends refinement requests
- **`workflow-service.ts`**: Save/load workflow operations
- **`mcp-service.ts`**: MCP server/tool discovery
- **`slack-integration-service.ts`**: Slack connection and sharing

### Shared Types (src/shared/types/)
- **`workflow-definition.ts`**: Core workflow data structures (18KB)
- **`messages.ts`**: All message types for Extension ↔ Webview (40KB)
- **`mcp-node.ts`**: MCP node type definitions
- **`ai-metrics.ts`**: AI generation metrics (execution time, token counts)

## Key Design Patterns

### Message-Based Communication
All Extension ↔ Webview communication uses typed messages:

```typescript
// Webview → Extension
vscode.postMessage({ type: 'SAVE_WORKFLOW', payload: { workflow, fileName } });

// Extension → Webview
panel.webview.postMessage({ type: 'SAVE_SUCCESS', payload: { filePath } });
```

Message types are in `src/shared/types/messages.ts`.

### AI Generation Flow
1. User inputs description in `AiGenerationDialog.tsx`
2. Webview sends `GENERATE_WORKFLOW` message
3. `ai-generation.ts` loads schema, scans skills, filters by relevance
4. Calls `claude-code-service.ts` with constructed prompt
5. Validates response with `validate-workflow.ts`
6. Sends `GENERATION_SUCCESS` or `GENERATION_FAILED` back
7. Webview updates canvas via `workflow-store.ts`

### AI Refinement Flow (Conversational)
1. User opens `RefinementChatPanel.tsx`, enters request
2. Webview sends `REFINE_WORKFLOW` message with conversation history
3. `workflow-refinement.ts` calls `refinement-service.ts`
4. `refinement-service.ts` builds prompt with history, calls `claude-code-service.ts` with streaming
5. Streams `REFINEMENT_PROGRESS` messages back to Webview
6. Webview updates chat UI in real-time via `refinement-store.ts`
7. On completion, validates and sends `REFINEMENT_SUCCESS`
8. Webview updates canvas and preserves conversation history

### Skill Relevance Matching
- **File**: `src/extension/services/skill-relevance-matcher.ts`
- **Algorithm**: Keyword tokenization (removes stopwords, min 3 chars) + Jaccard similarity
- **Threshold**: 0.3 (30%) - tuned for balance between recall and precision
- **Max Skills in Prompt**: 20 (prevents timeout)
- **Duplicate Handling**: Project scope preferred over personal

### MCP Integration
- **Discovery**: Via Claude Code CLI (`claude mcp servers`, `claude mcp tools`)
- **Caching**: `mcp-cache-service.ts` caches servers for 5 minutes
- **Parameter Validation**: Dynamic form generation based on JSON schema (string, number, boolean, array, object)
- **Export**: MCP tool invocations documented in exported `.claude/agents/*.md`

### Slack Integration
- **Connection**: Manual token input (OAuth flow not fully implemented)
- **Sharing**: Uploads workflow JSON + sends preview card with "Import to VS Code" button
- **Import**: Deep link (`vscode://cc-wf-studio/import?...`) opens editor and loads workflow
- **Security**: `sensitive-data-detector.ts` warns before sharing workflows with API keys

## Internationalization (i18n)

### Supported Languages
- English (en)
- Japanese (ja)
- Korean (ko)
- Simplified Chinese (zh-CN)
- Traditional Chinese (zh-TW)

### Implementation
- **Webview**: `src/webview/src/i18n/` (43-50KB per translation file)
- **Extension**: `src/extension/i18n/` (minimal, ~500B per file)
- **Auto-detection**: Uses `vscode.env.language`
- **Translation Keys**: Centralized in `translation-keys.ts`

## Schema Maintenance

### workflow-schema.json
- **Location**: `resources/workflow-schema.json`
- **Purpose**: AI prompt schema for Claude Code CLI
- **Size**: <10KB target, max 15KB
- **Format**: Dual format support (JSON and toon)
  - **JSON**: Traditional format (~15KB)
  - **Toon**: Compressed format (~11KB, 23% reduction)
  - Generated via `npm run generate:toon`
- **Contents**: Node type definitions, validation rules, 3 example workflows
- **Maintenance**: See `docs/schema-maintenance.md`

### Synchronization
When adding/modifying node types:
1. Update TypeScript types in `src/shared/types/workflow-definition.ts`
2. Update `resources/workflow-schema.json`
3. Update validation in `src/extension/utils/validate-workflow.ts`
4. Run `npm run generate:toon` to regenerate toon schema
5. Update i18n files if new UI strings added

## Testing Strategy

### Current Approach
- **Manual E2E Testing**: Required for all features and bug fixes
- **Unit Tests**: Deferred (in webview: `npm run test`)
- **Integration Tests**: Deferred (in root: `npm run test:integration`)

### Manual Testing Workflow
1. Run `npm run build`
2. Press F5 to launch Extension Development Host
3. Test feature in real VSCode environment
4. Verify logs in "Claude Code Workflow Studio" Output Channel

## Version & Release Management

### Automated Release (Semantic Release)
- **Trigger**: Push to `production` branch
- **Workflow**: `.github/workflows/release.yml`
- **Steps**: Analyze commits → Bump version → Update CHANGELOG → Create GitHub Release → Build VSIX → Upload → Sync to `main`

### Commit Message Convention
- `feat:` → Minor version bump
- `fix:` → Patch version bump
- `improvement:` → Patch version bump
- `docs:`, `chore:`, `refactor:` → No release
- `feat!:` or `BREAKING CHANGE` → Major version bump

### Version Files (All Must Match)
- `package.json` (root)
- `src/webview/package.json`
- `src/webview/package-lock.json`

## Dialog Component Guidelines

### Required Library
**Always use `@radix-ui/react-dialog`** for all dialogs (mandatory).

### z-index Hierarchy (3 Layers)
```
Layer          z-index   Usage
─────────────────────────────────────────────────
Base           9999      Standalone/parent dialogs
Nested         10000     Child dialogs
Confirm        10001     Confirmation dialogs
```

### Implementation Checklist
- [ ] Uses `@radix-ui/react-dialog`
- [ ] `Dialog.Overlay` has `zIndex` set
- [ ] z-index follows hierarchy (9999/10000/10001)
- [ ] ESC key closes dialog
- [ ] Overlay click closes dialog

## Common Development Tasks

### Adding a New Node Type
1. Define type in `src/shared/types/workflow-definition.ts`
2. Add node component in `src/webview/src/components/nodes/`
3. Update `PropertyOverlay.tsx` to handle new type
4. Add validation in `src/extension/utils/validate-workflow.ts`
5. Update `resources/workflow-schema.json`
6. Run `npm run generate:toon`
7. Add i18n strings to all 5 languages
8. Add to `NodePalette.tsx`
9. Run `npm run format && npm run lint && npm run check && npm run build`

### Adding a New Command
1. Create command handler in `src/extension/commands/`
2. Register in `src/extension/extension.ts` via `context.subscriptions.push()`
3. Add message type to `src/shared/types/messages.ts`
4. Update `src/extension/commands/open-editor.ts` message router
5. Add webview service method in `src/webview/src/services/vscode-bridge.ts`
6. Add UI trigger in appropriate component
7. Test with `npm run build` + F5

### Modifying AI Prompts
- **Workflow Generation**: `src/extension/commands/ai-generation.ts` (constructs prompt)
- **Workflow Refinement**: `src/extension/services/refinement-prompt-builder.ts`
- **Schema**: `resources/workflow-schema.json` (included in AI context)
- **Skill Filtering**: `src/extension/services/skill-relevance-matcher.ts` (relevance threshold)

## Code Quality Standards

### Before Every Commit
```bash
npm run format && npm run lint && npm run check
```

### Before Pull Request
```bash
npm run build  # Verify compilation
# Manual E2E test in Extension Development Host
```

### Linting & Formatting
- **Tool**: Biome (replaces ESLint + Prettier)
- **Config**: `biome.json`
- **Auto-fix**: `npm run format` and `npm run check`

## Important Constraints

### AI Generation Limits
- Max 50 nodes per workflow
- Timeout: 30-300 seconds (user-configurable)
- Max 20 Skills in prompt (prevents timeout)
- Skill relevance threshold: 0.3 (30%)
- Request max: 2000 characters

### File Paths
- Workflows: `.vscode/workflows/*.json`
- Exported Agents: `.claude/agents/*.md`
- Exported Commands: `.claude/commands/*.md`
- Personal Skills: `~/.claude/skills/[skill-name]/SKILL.md`
- Project Skills: `.claude/skills/[skill-name]/SKILL.md`

### External Dependencies
- **Claude Code CLI**: Required for AI generation/refinement
- **MCP Servers**: Required for MCP node execution (configured in Claude Code)
- **Slack API**: Optional, for workflow sharing

## Known Patterns & Anti-Patterns

### ✅ DO
- Use Radix UI for all new dialogs
- Run `npm run format && npm run lint && npm run check` before commit
- Test in Extension Development Host before PR
- Follow z-index hierarchy (9999/10000/10001)
- Use message types from `src/shared/types/messages.ts`
- Log to Output Channel for debugging (`getOutputChannel()` from `extension.ts`)

### ❌ DON'T
- Create custom dialog implementations (use Radix UI)
- Manually update version numbers (use Semantic Release)
- Skip code quality checks before commit
- Add new external dependencies without discussion
- Implement AI control features that promise deterministic outcomes (AI is probabilistic)
- Create documentation files unless explicitly requested
- Over-engineer simple features (avoid premature abstraction)

## Useful Debugging Tips

### Viewing Logs
1. Open "Claude Code Workflow Studio" Output Channel in VSCode
2. All extension-side operations are logged there
3. Webview logs appear in DevTools (Help > Toggle Developer Tools)

### Inspecting Webview State
1. Open DevTools in Extension Development Host (Help > Toggle Developer Tools)
2. Use Redux DevTools extension for Zustand stores
3. Check `window.vscode` for postMessage API

### Common Issues
- **"Claude Code CLI not found"**: Ensure `claude` is in PATH
- **Timeout during AI generation**: Reduce number of Skills, simplify request, or increase timeout
- **Workflow validation errors**: Check `validate-workflow.ts` for specific error codes
- **MCP tools not loading**: Verify MCP servers are configured in Claude Code settings
- **Slack import fails**: Check token validity with `/test` command in Extension Development Host

## Dependencies & Tech Stack

### Extension Host (Node.js)
- `@modelcontextprotocol/sdk`: ^1.25.2 (MCP client)
- `@slack/web-api`: ^7.13.0 (Slack API)
- `@toon-format/toon`: ^2.1.0 (toon schema format)
- `nano-spawn`: ^2.0.0 (Claude CLI execution)

### Webview (React)
- `react`: ^19.2.3
- `react-dom`: ^19.2.3
- `reactflow`: ^11.10.0 (visual canvas)
- `zustand`: ^5.0.9 (state management)
- `@radix-ui/*`: Dialog, Select, Tooltip, etc.
- `driver.js`: ^1.4.0 (onboarding tour)
- `lucide-react`: ^0.562.0 (icons)

### Build Tools
- `vite`: ^7.3.0 (bundler)
- `typescript`: ^5.3.0
- `@biomejs/biome`: 2.3.10 (linter/formatter)
- `semantic-release`: ^25.0.2 (versioning)

## License
AGPL-3.0-or-later (all modifications must remain open source, including network services)
