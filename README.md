# Claude Code Workflow Studio

Claude Code 工作流工作室（Workflow Studio）是一个在 VS Code 及兼容编辑器（如 Cursor, Windsurf, Trae, Qoder 等）中可视化设计 Claude Code 工作流的扩展，帮助你通过拖拽和配置节点来搭建复杂的 AI 自动化流程，无需编写代码。

<p align="center">
  <a href="https://github.com/breaking-brake/cc-wf-studio/stargazers"><img src="https://img.shields.io/github/stars/breaking-brake/cc-wf-studio" alt="GitHub Stars" /></a>
  <a href="https://snyk.io/test/github/breaking-brake/cc-wf-studio"><img src="https://snyk.io/test/github/breaking-brake/cc-wf-studio/badge.svg" alt="Known Vulnerabilities" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=breaking-brake.cc-wf-studio"><img src="https://img.shields.io/visual-studio-marketplace/v/breaking-brake.cc-wf-studio?label=VS%20Marketplace" alt="VS Code Marketplace" /></a>
  <a href="https://open-vsx.org/extension/breaking-brake/cc-wf-studio"><img src="https://img.shields.io/open-vsx/v/breaking-brake/cc-wf-studio?label=OpenVSX" alt="OpenVSX" /></a>
</p>

<p align="center">
  <img src="./resources/hero.png" alt="Claude Code Workflow Studio" width="800">
</p>

<p align="center">
  <strong>Accelerate Claude Code automation with a visual workflow editor (Supports VS Code, Cursor, Windsurf, Trae, Qoder)</strong><br/>
  <strong>使用可视化编辑器，加速你的 Claude Code 自动化工作流（支持 VS Code, Cursor, Windsurf, Trae, Qoder）</strong>
</p>

<p align="center">
  Design complex AI agent workflows intuitively with drag-and-drop. Build Sub-Agent orchestrations and conditional branching without writing code, then export directly to <code>.claude</code> format for immediate execution.<br/>
  通过拖拽直观地设计复杂的 AI Agent 工作流：组合子 Agent、条件分支和用户决策节点，无需写一行代码，即可一键导出为 <code>.claude</code> 文件并立即在 Claude Code 中运行。
</p>

<!-- Hero image placeholder - recommended size: 1600x900px or 16:9 aspect ratio -->
<!-- Place image at: /resources/hero.png -->

---

<!-- AI Edit Demo GIF: PR Code Review Workflow -->
<p align="center">
  <img src="./resources/demo_edit_with_ai.gif" alt="AI-Assisted Workflow Creation Demo - PR Code Review" width="800">
</p>

<p align="center">
  <em>✨ Edit with AI: Create a PR code review workflow with MCP, Skills, and conditional branching – All with natural language</em>
</p>

---

<!-- Run Workflow Demo GIF -->
<p align="center">
  <img src="./resources/demo_run_workflow.gif" alt="Run Workflow Demo - Execute workflows directly from the editor" width="800">
</p>

<p align="center">
  <em>▶️ Run workflows directly from the editor – See your AI automation in action instantly</em>
</p>

---

<!-- Slack Sharing Demo GIFs -->
<p align="center">
  <img src="./resources/slack-export-demo.gif" alt="Export Workflow to Slack" width="800">
</p>

<p align="center">
  <em>📤 Export workflows to Slack with preview cards</em>
</p>

<p align="center">
  <img src="./resources/slack-import-demo.gif" alt="Import Workflow from Slack" width="800">
</p>

<p align="center">
  <em>📥 Import workflows from Slack with one-click import</em>
</p>

---

## Why Claude Code Workflow Studio?

## 为什么使用 Claude Code Workflow Studio？

### 🎯 No-Code Workflow Design
### 🎯 无需编码的工作流设计

No programming required. Connect Sub-Agent and user decision nodes visually to build sophisticated automation flows.

不需要任何编程基础，就可以通过拖拽节点的方式，连接子 Agent 和用户决策节点，构建复杂而清晰的自动化流程。

### ⚡ Ready to Execute
### ⚡ 即刻可用的工作流

Designed workflows automatically export to `.claude/agents/` and `.claude/commands/`. Use them immediately with Claude Code.

在画布中设计好的工作流可以直接导出到 `.claude/agents/` 和 `.claude/commands/` 目录，立即被 Claude Code 识别和执行，无需额外配置。

### 🔄 Easy Iteration
### 🔄 便于迭代优化

Save and load workflows as JSON. Experiment and refine your flows through trial and error.

工作流以 JSON 文件形式保存到 `.vscode/workflows/`，你可以随时保存、加载并反复实验，不断微调和优化自动化流程。

### 🔒 Fully Local & Secure
### 🔒 本地优先且安全

All operations run locally within VS Code and compatible editors (Cursor, Windsurf, Trae, Qoder). **Note:** MCP Tool nodes may require network connectivity depending on the specific MCP server configuration (e.g., remote API servers). Non-MCP features operate entirely offline.

所有核心操作都在本地 VS Code 及兼容编辑器（Cursor, Windsurf, Trae, Qoder）环境中执行，不依赖云端服务。**注意：** 只有在使用某些依赖远程 MCP 服务器的 MCP 工具节点时，才可能需要网络连接；普通工作流设计与导出功能均可完全离线使用。

## Key Features

## 关键特性

✨ **Visual Workflow Editor** - Intuitive drag-and-drop canvas for designing AI workflows without code  
✨ **可视化工作流编辑器** - 通过拖拽在画布上直观搭建 AI 工作流，无需写代码

🤖 **AI-Assisted Workflow Refinement** - Iteratively improve workflows through conversational AI - ask for changes, add features, or refine logic with natural language feedback  
🤖 **AI 辅助工作流改进** - 通过对话式 AI 持续迭代工作流，用自然语言提出“修改、加功能、调逻辑”等请求

📤 **One-Click Export** - Generate `.claude/agents/*.md` and `.claude/commands/*.md` files ready for immediate use with Claude Code  
📤 **一键导出** - 自动生成 `.claude/agents/*.md` 和 `.claude/commands/*.md` 文件，可立即在 Claude Code 中运行

💬 **Slack Workflow Sharing (β)** - Share workflows directly to Slack channels with preview cards and one-click import links for seamless team collaboration  
💬 **Slack 工作流分享（测试版）** - 将工作流一键分享至 Slack 频道，附带预览卡片与一键导入链接，方便团队协作

🤖 **GitHub Copilot Export (β)** - Export workflows to GitHub Copilot format with two execution modes: **VSCode Copilot** (`.github/prompts/*.prompt.md` for Copilot Chat) and **Copilot CLI** (`.github/skills/{name}/SKILL.md` for terminal execution). Select your preferred mode from the dropdown menu. **Note:** This is an experimental feature. Some workflows may not work as expected  
🤖 **GitHub Copilot 导出（测试版）** - 支持导出到 GitHub Copilot，两种执行模式：**VS Code Copilot Chat 提示文件**（`.github/prompts/*.prompt.md`）和 **Copilot CLI 技能**（`.github/skills/{name}/SKILL.md`）。此功能仍在试验中，部分工作流可能需要手动调整。

🧩 **Rich Node Types** - Build complex workflows with diverse node types: Prompt (templates), Sub-Agent (AI tasks), Skill (Claude Code Skills), MCP (external tools), IfElse/Switch (conditional branching), and AskUserQuestion (user decisions)  
🧩 **丰富的节点类型** - 通过多种节点组合构建复杂流程：Prompt 模板节点、Sub-Agent 子代理节点、Skill 技能节点、MCP 外部工具节点、IfElse/Switch 条件分支节点，以及 AskUserQuestion 用户决策节点。

## AI-Assisted Workflow Refinement

### Overview

Iteratively improve your workflows through conversational AI. Instead of generating workflows from scratch once, you can continuously refine them by asking for changes, adding features, or adjusting logic - all in natural language. The AI maintains conversation history and applies your feedback incrementally.

### Prerequisites

- **Claude Code CLI** must be installed and accessible in your PATH
- Install from: https://claude.com/claude-code

To verify installation:
```bash
claude --version
```

### How to Use

1. **Open or Create a Workflow**
   - Launch Claude Code Workflow Studio
   - Create a new workflow or open an existing one

2. **Click "Edit with AI" Button**
   - Located in the main toolbar (sparkle icon ✨)
   - Opens the AI refinement dialog

3. **Describe Your Changes**
   - Write a natural language request (max 2000 characters)
   - Example: "Add a new Sub-Agent node that validates the input data"
   - Example: "Add an AskUserQuestion node before the processor to choose the output format"
   - Example: "Connect the error handler to a logging Sub-Agent"

4. **Refine Iteratively**
   - Click "Apply Changes" or press `Ctrl+Enter` / `Cmd+Enter`
   - AI processes your request and updates the workflow
   - Review the changes on the canvas
   - Ask follow-up questions or request further refinements
   - Repeat until satisfied

5. **Accept or Discard**
   - Click "Accept Changes" to keep the refined workflow
   - Click "Cancel" to discard all AI modifications and return to your original workflow

### Features

- **Conversational Refinement**: Build workflows through multiple rounds of feedback
- **Context Awareness**: AI remembers previous changes in the conversation
- **Smart Positioning**: New nodes are placed automatically to avoid overlaps
- **Incremental Updates**: Only requested changes are applied, preserving the rest of your workflow
- **Validation**: All AI output is validated against schema rules (max 50 nodes, valid connections, etc.)
- **Error Handling**: Clear error messages with actionable guidance if refinement fails
- **Multilingual**: All UI elements and error messages support 5 languages (en, ja, ko, zh-CN, zh-TW)

### Tips for Best Results

✅ **Be Specific**: Mention exact node types and connections
✅ **One Change at a Time**: Request small, focused changes for better accuracy
✅ **Build Incrementally**: Start simple, then add complexity through iterations
✅ **Review Each Step**: Verify changes before requesting more refinements

❌ **Avoid**: Vague requests like "make it better"
❌ **Avoid**: Asking for complete rewrites (use "Generate with AI" instead)
❌ **Avoid**: Too many changes in one request (break into smaller steps)

### Example Refinement Requests

**Pattern 1: Initial Creation** (See Demo GIF above)
```
e.g. Create a PR code review workflow with MCP, Skills, and conditional branching
```

**Pattern 2: Iterative Refinement**
```
e.g. Add error handling when the MCP tool fails to fetch PR details
```

**Adding Validation Logic**
```
Add a Sub-Agent node that validates user input before processing
```

**Modifying Connections**
```
Connect the error output of the validator to a new error handler Sub-Agent
```

**Adjusting Configuration**
```
Change the AskUserQuestion node to have 3 options instead of 2: High, Medium, Low
```

**Complex Multi-Step Request**
```
1. Add a Skill node that reads PDF files
2. Connect it after the input Prompt node
3. Add error handling if the PDF read fails
```

### Error Messages

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `COMMAND_NOT_FOUND` | Claude Code CLI not installed | Install Claude Code CLI |
| `TIMEOUT` | Request exceeded configured timeout | Simplify request, increase timeout setting, or try again |
| `PARSE_ERROR` | AI output couldn't be parsed | Rephrase request and retry |
| `VALIDATION_ERROR` | Workflow exceeds limits (50 nodes max) | Remove nodes or reduce complexity |

### Limitations

- Maximum 50 nodes per workflow
- AI processing timeout (default 90 seconds, configurable via UI selector: 30s-5min)
- Request limited to 2000 characters
- Conversation history stored only during active session
- Requires active Claude Code CLI installation

## Getting Started

### Installation

**From VSCode Marketplace** (Coming Soon)

1. Open VSCode Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search for "Claude Code Workflow Studio"
3. Click **Install**

**From Source**

1. Clone the repository
   ```bash
   git clone https://github.com/breaking-brake/cc-wf-studio.git
   cd cc-wf-studio
   ```
2. Install dependencies
   ```bash
   npm install
   cd src/webview && npm install && cd ../..
   ```
3. Build the extension
   ```bash
   npm run build
   ```
4. Package the extension
   ```bash
   npx vsce package
   ```
5. Install the generated `.vsix` file
   - Open VSCode Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
   - Click the `...` menu → "Install from VSIX..."
   - Select the generated `cc-wf-studio-x.x.x.vsix` file

### Quick Start

**1. Open the Editor**
   - Press `Ctrl+Shift+P` / `Cmd+Shift+P`
   - Type "Claude Code Workflow Studio: Open Editor"
   - Press Enter

**2. Take the Interactive Tour** (First-time users)
   - An interactive onboarding tour will automatically start on your first launch
   - Follow the step-by-step guided tutorial to learn workflow creation hands-on
   - Click the **?** button in the toolbar anytime to restart the tour
   - Available in English, Japanese, Korean, Simplified Chinese, and Traditional Chinese

**3. Create Your Workflow**
   - **Add Nodes**: The left palette is organized into sections:
     - **Basic Nodes**: Prompt (templates), Sub-Agent (AI tasks)
     - **Control Flow**: IfElse (binary branching), Switch (multi-way branching), AskUserQuestion (user decisions)
     - **Integration**: Skill (Claude Code Skills), MCP (Model Context Protocol tools)
   - **Configure**: Click a node to edit its properties in the right panel
   - **Connect**: Drag from output ports (right) to input ports (left) to create flow

**4. Save & Export**
   - Enter a workflow name in the toolbar
   - Click **Save** to store as JSON in `.vscode/workflows/`
   - Click **Export** to generate `.claude` files ready for Claude Code

## How It Works

### Prompt Nodes
Define reusable prompt templates with:
- Template variables using `{{variableName}}` syntax
- Dynamic value substitution at runtime
- Variable detection and validation

### Sub-Agent Nodes
Configure autonomous AI agents with:
- Custom system prompts
- Tool permissions (Read, Write, Bash, etc.)
- Model selection (Sonnet for balance, Opus for complex tasks, Haiku for speed)

### Skill Nodes
Integrate Claude Code Skills into your workflows:
- **Personal Skills**: Reference Skills from `~/.claude/skills/` for individual use
- **Project Skills**: Use team-shared Skills from `.claude/skills/` for consistent collaboration
- **Create New Skills**: Build Skills directly from the visual editor with a guided form
- **Browse & Select**: Interactive Skill browser displays available Skills with descriptions and scope indicators
- **Automatic Dependency Tracking**: Exported workflows include documentation of all referenced Skills

Skills are specialized agent capabilities defined in `SKILL.md` files with YAML frontmatter. When a workflow references a Skill, Claude Code automatically invokes it based on the Skill's description trigger.

**Creating a New Skill:**
1. Select a Skill node in your workflow
2. Click "Create New Skill" in the property panel
3. Fill in the Skill details:
   - **Name**: Lowercase, hyphens allowed (e.g., `pdf-analyzer`)
   - **Description**: Brief summary of what the Skill does and when to use it
   - **Instructions**: Full prompt/instructions in markdown format
   - **Allowed Tools**: Optional tool restrictions (Read, Grep, Bash, etc.)
   - **Scope**: Choose Personal (your machine only) or Project (shared with team)
4. The Skill is automatically created and referenced by the node

### MCP Tool Nodes
Integrate Model Context Protocol (MCP) tools into your workflows:
- **MCP Server Discovery**: Browse available MCP servers configured in Claude Code
- **Tool Selection**: Search and filter MCP tools from any connected server
- **Parameter Configuration**: Dynamic form generation based on tool schemas (string, number, boolean, array, object types)
- **Real-time Validation**: Automatic parameter validation with error messages
- **Export Integration**: Exported workflows include complete MCP tool documentation with server, tool name, and configured parameters

MCP (Model Context Protocol) is Claude Code's extensibility system that allows integration with external tools and services. MCP tools can access databases, APIs, file systems, and more - extending Claude's capabilities beyond built-in tools.

**Adding an MCP Tool:**
1. Add an MCP node to your workflow from the palette
2. Select an MCP server from the dropdown (configured in Claude Code)
3. Browse available tools or use the search to filter by name
4. Select a tool - the node will display its description
5. Configure parameters in the property panel:
   - Required parameters are marked with asterisks
   - Each parameter shows its type (string, number, boolean, etc.)
   - Validation errors appear in real-time
6. Save your workflow - MCP tool configuration is preserved

**Prerequisites:**
- Claude Code CLI must be installed and configured with MCP servers
- MCP servers must be properly configured in Claude Code settings (user/project/enterprise scope)

**Network Connectivity:**
- **Local MCP servers** (e.g., file system tools): No external network required
- **Remote MCP servers** (e.g., cloud APIs): External network connectivity required
- The extension itself does not communicate externally - network usage depends entirely on your configured MCP servers

### Conditional Branching Nodes
Implement conditional logic with specialized nodes:

#### IfElse Node
Fixed 2-way branching for binary conditions:
- True/False, Yes/No, Success/Error patterns
- Simplified configuration for common conditional scenarios
- Clear visual distinction between branches (green/red indicators)

#### Switch Node
Variable multi-way branching (2-N branches):
- Multiple conditional paths from a single decision point
- Dynamic branch management (add/remove cases)
- Ideal for complex routing logic

#### Branch Node (Legacy - Deprecated)
The original Branch node with dual modes is deprecated:
- Still available for backward compatibility
- Marked with deprecation warning in the palette
- **Recommended**: Use IfElse or Switch nodes for new workflows

### AskUserQuestion Nodes
Create decision points where:
- Users choose from 2-4 options (or multiple selections)
- Each option branches to different nodes
- AI can dynamically generate options based on context

### Export Format
Generates ready-to-use files:
- `.claude/agents/*.md` - Sub-Agent definitions
- `.claude/commands/*.md` - SlashCommand to execute the workflow

**Internationalization**: The Visual Editor UI and all exported files automatically adapt to your VSCode display language setting (`vscode.env.language`). Supported languages: English (default), Japanese, Korean, Simplified Chinese (zh-CN), and Traditional Chinese (zh-TW/zh-HK). This ensures both the editing experience and generated workflows are accessible for international teams regardless of their location.

## Usage Examples

### Example 1: Data Analysis Pipeline
1. **Collect Data** Sub-Agent → Gathers data from files
2. **Ask User**: "Choose analysis type" → Statistical / Visual
3. **Statistical Analysis** Sub-Agent OR **Data Visualization** Sub-Agent
4. **Generate Report** Sub-Agent → Creates final output

### Example 2: Code Review Workflow
1. **Code Scanner** Sub-Agent → Identifies issues
2. **Ask User**: "Priority level?" → Critical Only / All Issues
3. **Filter Results** Sub-Agent
4. **Generate Fix Suggestions** Sub-Agent

### Example 3: Document Processing with Skills
1. **Upload Document** Prompt → Asks user for file path
2. **PDF Extractor** Skill (Personal) → Extracts text from PDF files
3. **Ask User**: "Processing type?" → Summarize / Translate / Analyze
4. **Document Processor** Skill (Project) → Team-shared processing logic
5. **Format Results** Sub-Agent → Creates final output

### Example 4: Web Automation with MCP Tools
1. **Input URL** Prompt → Asks user for target website
2. **Playwright Navigate** MCP Tool → Opens browser and navigates to URL (using playwright-mcp server)
3. **Ask User**: "Action type?" → Screenshot / Extract Text / Click Element
4. **Playwright Action** MCP Tool → Performs the selected browser action
5. **Process Results** Sub-Agent → Analyzes and formats the output

## FAQ

**Q: What is Claude Code?**
A: Claude Code is Anthropic's official CLI tool for building AI-powered workflows. This extension makes it easier to create and manage those workflows visually.

**Q: Do I need programming experience?**
A: No! The visual editor is designed for anyone. Simply drag, drop, and configure nodes through the UI.

**Q: Can I edit exported files manually?**
A: Yes! Exported `.claude` files are plain markdown with frontmatter. Edit them directly if needed.

**Q: What if a workflow file already exists?**
A: The extension will detect conflicts and ask for confirmation before overwriting any files.

**Q: How many nodes can I add?**
A: Up to 50 nodes per workflow. Most workflows use 3-10 nodes.

**Q: What languages are supported?**
A: Both the Visual Editor UI and exported workflows automatically use your VSCode display language setting. Currently supported: English (default), Japanese, Korean, Simplified Chinese (zh-CN), and Traditional Chinese (zh-TW/zh-HK). The extension detects `vscode.env.language` and displays all UI elements and generates documentation in the appropriate language. This includes toolbar buttons, node palette, property panel labels, and all exported files.

**Q: What are Skill nodes?**
A: Skill nodes allow you to integrate Claude Code Skills (specialized agent capabilities) into your workflows. Skills are defined in `SKILL.md` files with YAML frontmatter and can be invoked automatically by Claude based on their description triggers.

**Q: What's the difference between Personal and Project Skills?**
A: Personal Skills are stored in `~/.claude/skills/` and are specific to your machine. Project Skills are stored in `.claude/skills/` within your project directory and can be shared with your team via version control. Use Personal Skills for individual workflows and Project Skills for team collaboration.

**Q: Can I create Skills manually instead of using the visual editor?**
A: Yes! You can create `SKILL.md` files manually in the appropriate directory (`~/.claude/skills/[skill-name]/` or `.claude/skills/[skill-name]/`). The Skill browser will automatically detect them. The visual editor's "Create New Skill" feature is just a convenience.

**Q: What happens if a referenced Skill file is missing?**
A: The visual editor will detect missing Skill files when loading workflows and display a warning indicator on the Skill node. You can then re-select a valid Skill or remove the broken reference.

**Q: What are MCP Tool nodes?**
A: MCP (Model Context Protocol) Tool nodes allow you to integrate external tools and services into your workflows. MCP is Claude Code's extensibility system that can connect to databases, APIs, web browsers (via Playwright), file systems, and more. The visual editor automatically discovers available MCP servers and tools configured in Claude Code.

**Q: How do I set up MCP servers?**
A: MCP servers are configured in Claude Code settings, not in this extension. You need to install and configure MCP servers through Claude Code CLI first. Once configured, they will automatically appear in the MCP node's server dropdown. See Claude Code documentation for MCP server setup instructions.

**Q: What happens if an MCP server is not running?**
A: The visual editor will detect unavailable MCP servers when loading the tool list and display a validation warning on the MCP node. The workflow can still be saved and exported, but execution will fail if the server is not available at runtime. Make sure all required MCP servers are running before executing exported workflows.

## Troubleshooting

**Workflow won't save**
- Ensure workflow name contains only letters, numbers, hyphens, and underscores
- Check all required fields are filled
- Look for error messages in VSCode notifications

**Export fails**
- Verify all nodes have valid configurations
- Ensure node names are unique
- Check write permissions for `.claude` directory

**Can't load workflow**
- Click refresh button (↻) to update the list
- Verify file exists in `.vscode/workflows/`
- Check JSON file isn't corrupted

## License

This project is licensed under the **GNU Affero General Public License v3.0** (AGPL-3.0-or-later).

See the [LICENSE](./LICENSE) file for the full license text.

### What this means

- You can use, modify, and distribute this software
- If you modify and deploy this software (including as a network service), you must:
  - Make your modified source code available under AGPL-3.0
  - Provide access to the source code for users interacting with the service
- Commercial use is allowed, but proprietary modifications are not

Copyright (c) 2025 breaking-brake

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=breaking-brake/cc-wf-studio&type=Date)](https://star-history.com/#breaking-brake/cc-wf-studio&Date)

## Acknowledgments

Built with [React Flow](https://reactflow.dev/) • Powered by [Claude Code](https://claude.com/claude-code) • Inspired by [Dify](https://dify.ai/)

---

**Made with Claude Code Workflow Studio**
