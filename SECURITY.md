# Security Policy

# 安全策略

## Supported Versions

## 支持的版本

We release patches for security vulnerabilities. Currently supported versions:

我们会针对安全漏洞发布补丁。目前的支持版本如下：

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: / ✅ |
| < 2.0   | :x: / ❌           |

## Reporting a Vulnerability

## 漏洞报告方式

We take the security of Claude Code Workflow Studio seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Reporting Process

### 报告流程

**Please do NOT report security vulnerabilities through public GitHub issues.**  
**请不要通过公开的 GitHub issue 报告安全漏洞。**

Instead, please report them via:

请使用以下任一方式进行报告：

1. **GitHub Security Advisory**
   - Go to the [Security tab](https://github.com/breaking-brake/cc-wf-studio/security/advisories) of this repository
   - Click "Report a vulnerability"
   - Provide detailed information about the vulnerability

1. **GitHub Security Advisory（推荐）**
   - 打开本仓库的 [Security 标签页](https://github.com/breaking-brake/cc-wf-studio/security/advisories)
   - 点击 “Report a vulnerability”
   - 填写尽可能详细的漏洞信息

2. **Email** (if GitHub Security Advisory is not available)
   - Contact the maintainers directly via GitHub
   - Include "SECURITY" in the subject line
   - Provide as much information as possible about the vulnerability

2. **电子邮件**（如果无法使用 GitHub Security Advisory）
   - 通过 GitHub 直接联系维护者
   - 主题中包含 “SECURITY” 关键词
   - 提供尽可能详细的漏洞说明

### What to Include in Your Report

### 报告中建议包含的信息

Please include the following information:

请尽量在报告中包含以下内容：

- 漏洞类型（例如：代码注入、权限提升等）
- 相关源文件的完整路径
- 受影响代码的位置（tag/分支/commit 或直接的 URL）
- 复现步骤（越详细越好）
- PoC 或利用代码（如有）
- 漏洞的影响范围以及可能的攻击方式

- Type of vulnerability (e.g., code injection, privilege escalation, etc.)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### Response Timeline

### 响应时间线

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours  
  **确认收到**：我们会在 48 小时内确认收到你的漏洞报告
- **Initial Assessment**: We will provide an initial assessment within 5 business days  
  **初步评估**：我们会在 5 个工作日内给出初步评估结果
- **Fix & Disclosure**: We aim to release a fix within 30 days, depending on complexity  
  **修复与披露**：我们会在约 30 天内完成修复并进行公开披露（视漏洞复杂度而定）

## Security Measures

## 安全防护措施

This project implements the following security measures:

### Automated Vulnerability Scanning

### 自动化漏洞扫描

- **Snyk**: Continuous monitoring of dependencies for known vulnerabilities  
  **Snyk**：持续监控依赖中的已知安全漏洞
  - Weekly automated scans every Monday  
    每周一进行一次自动扫描
  - Scans on every push to `main` and `production` branches  
    在每次推送到 `main` 和 `production` 分支时触发扫描
  - PR-based scanning for all pull requests  
    对所有 Pull Request 进行扫描
  - [![Known Vulnerabilities](https://snyk.io/test/github/breaking-brake/cc-wf-studio/badge.svg)](https://snyk.io/test/github/breaking-brake/cc-wf-studio)

- **GitHub Dependabot**: Automated dependency updates for security patches  
  **GitHub Dependabot**：自动创建依赖升级 PR，用于引入安全补丁版本

### Development Practices

### 安全开发实践

- **Code Review**: All changes require review before merging  
  **代码审查**：所有变更在合并前都必须经过 Code Review
- **TypeScript Strict Mode**: Type safety enforcement  
  **TypeScript 严格模式**：通过类型系统减少潜在错误
- **ESLint**: Static code analysis for potential security issues  
  **ESLint**：使用静态分析发现潜在的安全问题
- **Automated Release**: Semantic Release for controlled versioning  
  **自动化发布**：通过 Semantic Release 控制版本和变更日志，降低人为错误风险

### VSCode Extension Security

### VS Code 扩展安全

As a VSCode extension, this project follows [VSCode Extension Security Best Practices](https://code.visualstudio.com/api/references/extension-guidelines#security):

作为 VS Code 扩展，本项目遵循官方的 [扩展安全最佳实践](https://code.visualstudio.com/api/references/extension-guidelines#security)：

- **Sandboxed Webview**: UI components run in isolated webview context  
  **沙箱化 Webview**：界面运行在隔离的 webview 上下文中
- **Content Security Policy**: Strict CSP headers for webview content  
  **内容安全策略（CSP）**：为 webview 配置严格的 CSP 头
- **Input Validation**: All user inputs are validated and sanitized  
  **输入校验**：对所有用户输入进行校验和清洗
- **Local-First Design**: Most operations run locally without network access  
  **本地优先设计**：绝大部分操作在本地完成，不需要网络访问
- **MCP Server Transparency**: Network-dependent MCP tools are clearly documented  
  **MCP 服务器透明性**：所有依赖网络的 MCP 工具都会被清晰标注和说明

## Known Limitations

## 已知限制

### Network Access (MCP Nodes)

### 网络访问（MCP 节点）

MCP Tool nodes may require network connectivity depending on the specific MCP server configuration (e.g., remote API servers). Users should:

某些 MCP 工具节点可能需要访问远程 MCP 服务器，因此会发起网络请求。使用时请注意：

- Review MCP server configurations before use  
  使用前先检查 MCP 服务器的配置和说明
- Only use trusted MCP servers  
  仅连接可信来源的 MCP 服务器
- Be aware of data transmission when using remote MCP tools  
  使用远程 MCP 工具时，了解哪些数据会通过网络发送到外部服务

### File System Access

### 文件系统访问

This extension requires file system access to:

扩展需要访问本地文件系统来完成以下操作：

- Read/write workflows in `.vscode/workflows/`
- Export agents/commands to `.claude/agents/` and `.claude/commands/`
- Scan Skills in `~/.claude/skills/` and `.claude/skills/`

All file operations include conflict detection and user confirmation before overwriting.

所有写入操作都包含冲突检测，并在覆盖文件前提示用户确认。

## Security Updates

## 安全更新

Security updates are released as patch versions (e.g., 2.5.1) and announced via:

安全更新通常以补丁版本（例如 2.5.1）发布，并通过以下渠道公告：

- GitHub Security Advisories
- GitHub Releases
- CHANGELOG.md

## Acknowledgments

## 致谢

We appreciate the security research community's efforts in responsibly disclosing vulnerabilities. Contributors who report valid security issues will be acknowledged in the CHANGELOG (with their permission).

我们感谢安全社区对本项目的关注以及负责任的漏洞披露方式。对于经确认的有效漏洞，在征得同意后，我们会在 CHANGELOG 中对报告者进行鸣谢。

---

For general questions about security, please open a discussion in the [GitHub Discussions](https://github.com/breaking-brake/cc-wf-studio/discussions) section.

如果你有一般性的安全问题（而非漏洞报告），可以在 [GitHub Discussions](https://github.com/breaking-brake/cc-wf-studio/discussions) 中发起讨论。
