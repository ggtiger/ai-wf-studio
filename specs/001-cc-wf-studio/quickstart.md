# Quickstart Guide: Claude Code Workflow Studio

# 快速上手指南：Claude Code Workflow Studio

**Branch**: 001-cc-wf-studio
**Date**: 2025-11-01
**Target Audience**: 開発者（初回セットアップ）

**中文概要：**  
本指南面向首次参与该项目的开发者，说明如何：  
- 搭建 Claude Code Workflow Studio 的本地开发环境  
- 构建并调试 VS Code 扩展与 Webview  
- 运行单元测试、集成测试与 E2E 测试，并了解常见问题排查方式

## Overview

このガイドでは、Claude Code Workflow Studio の開発環境を構築し、最初のワークフローを作成・実行するまでの手順を説明します。

（概览的中文说明）  
本节会带你从零开始完成：安装依赖、编译扩展与 Webview、启动调试环境，并最终创建和运行第一个工作流的完整流程。

---

## Prerequisites

## 前置条件

### Required:
- **Node.js**: 18.x 以上
- **npm**: 9.x 以上
- **VSCode**: 1.80 以上
- **Git**: バージョン管理用

（必备环境的中文说明）  
需要安装 Node.js 18.x、npm 9.x、VS Code 1.80 以上版本以及 Git，用于构建扩展、管理依赖与版本。

### Recommended:
- **VSCode Extensions**:
  - Biome (コードフォーマット・リンター)
  - TypeScript + JavaScript Language Features

（推荐扩展的中文说明）  
建议在 VS Code 中安装 Biome 扩展用作统一的格式化与 Lint 工具，并启用官方 TypeScript/JavaScript 语言特性支持，以获得更好的开发体验。

---

## 1. Initial Setup

## 1. 初始项目设置

### 1.1 Clone Repository

### 1.1 克隆代码仓库

```bash
git clone <repository-url>
cd cc-wf-studio
```

### 1.2 Install Dependencies

### 1.2 安装依赖

```bash
# Extension 側の依存関係
npm install

# Webview 側の依存関係
cd src/webview
npm install
cd ../..
```

### 1.3 Build Webview

### 1.3 构建 Webview

```bash
cd src/webview
npm run build
cd ../..
```

### 1.4 Setup Biome (Code Formatter & Linter)

### 1.4 配置 Biome（代码格式化与 Lint）

```bash
# Biomeのインストール
npm install --save-dev --save-exact @biomejs/biome

# 初期化（biome.json を生成）
npx @biomejs/biome init
```

**VSCode拡張機能のインストール**:

（安装 VS Code 侧 Biome 扩展）
1. VSCodeで `Ctrl+Shift+X` / `Cmd+Shift+X` を押す
2. "Biome" で検索
3. "Biome" (biomejs.biome) をインストール

**設定ファイルの確認**:

（VS Code 设置文件检查：确保保存时由 Biome 负责格式化与整理导入）

`.vscode/settings.json` に以下が含まれていることを確認:
```json
{
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "quickfix.biome": "explicit",
      "source.organizeImports.biome": "explicit"
    }
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "quickfix.biome": "explicit",
      "source.organizeImports.biome": "explicit"
    }
  }
}
```

### 1.5 Compile Extension

### 1.5 编译 VS Code 扩展

```bash
npm run compile
```

---

## 2. Development Workflow

## 2. 开发流程

### 2.1 Start Development

### 2.1 启动开发环境

#### Extension Host (TypeScript)

Extension 側のコードを監視モードでコンパイル:

```bash
npm run watch
```

#### Webview (React + Vite)

#### Webview（React + Vite）

Webview 側のコードを開発サーバーで起動:

```bash
cd src/webview
npm run dev
```

**注意**: Webview の開発サーバーは `http://localhost:5173` で起動しますが、VSCode Extension からは直接アクセスしません。開発時は以下のいずれかの方法を使用します:

（中文说明）  
开发服务器会在 `http://localhost:5173` 启动，但扩展不会直接访问这个地址，而是通过打包后的静态资源加载 Webview。开发时可以选择：  
- 方式 1（推荐）：每次修改后编译 Webview，再由扩展加载  
- 方式 2：配置高级的热重载代理，实现更接近 SPA 的开发体验

---

### 2.2 Run Extension in Debug Mode

1. VSCode で `F5` キーを押す（または「Run > Start Debugging」）
2. 新しい Extension Development Host ウィンドウが開く
3. コマンドパレット（`Ctrl+Shift+P` / `Cmd+Shift+P`）を開く
4. `Claude Code Workflow Studio: Open Editor` を実行

---

### 2.3 Hot Reload (Webview)

Webview のコードを変更した場合:

1. Webview をリビルド:
   ```bash
   cd src/webview
   npm run build
   cd ../..
   ```

2. Extension Development Host で Webview Panel を閉じて再度開く

**自動化方法**（オプション）:

```bash
# Watch モードで Webview を自動ビルド
cd src/webview
npm run build -- --watch
```

---

## 3. Running Tests

## 3. 运行测试

### 3.1 Unit Tests (Webview)

Vitest で React コンポーネントのユニットテストを実行:

（Webview 单元测试的中文说明）  
使用 Vitest 对 React 组件进行单元测试，可以通过 `npm run test` 或 `npm run test:watch` 在 `src/webview` 目录下执行。

```bash
cd src/webview
npm run test
```

**Watch モード**:
```bash
npm run test:watch
```

---

### 3.2 Integration Tests (Extension)

### 3.2 扩展集成测试

@vscode/test-cli で Extension Host のテストを実行:

```bash
npm run test:integration
```

**前提条件**:
- Extension がコンパイル済みであること（`npm run compile`）
- VSCode がインストールされていること

（前置条件的中文说明）  
在跑集成测试前，需要确保扩展已经完成编译，并且本机安装了 VS Code。

---

### 3.3 E2E Tests (Full Extension)

### 3.3 端到端测试

WebdriverIO で完全な E2E テストを実行:

```bash
npm run test:e2e
```

**注意**: E2E テストは CI 環境または手動実行を推奨（時間がかかる）

（中文说明）  
E2E 测试运行时间较长，适合在 CI 或手动大版本验证时执行，而不是每次修改都运行。

---

## 4. Project Structure Overview

## 4. 项目结构总览

```
cc-wf-studio/
├── src/
│   ├── extension/              # Extension Host 側コード
│   │   ├── extension.ts        # エントリーポイント
│   │   ├── commands/           # VSCode コマンド
│   │   ├── services/           # ビジネスロジック
│   │   └── models/             # 型定義
│   │
│   ├── webview/                # Webview UI 側コード
│   │   ├── src/
│   │   │   ├── main.tsx        # React エントリーポイント
│   │   │   ├── components/     # React コンポーネント
│   │   │   └── services/       # Webview サービス
│   │   ├── vite.config.ts      # Vite 設定
│   │   └── package.json        # Webview 依存関係
│   │
│   └── shared/                 # 共通型定義
│       └── types/
│
├── tests/                      # テストコード
│   ├── extension/              # Extension テスト
│   └── webview/                # Webview テスト
│
├── specs/                      # 仕様ドキュメント
│   └── 001-cc-wf-studio/
│       ├── spec.md
│       ├── plan.md
│       ├── data-model.md
│       └── contracts/
│
├── package.json                # Extension メタデータ
├── tsconfig.json               # TypeScript 設定
└── .vscode/                    # VSCode 設定
    ├── launch.json             # デバッグ設定
    └── tasks.json              # タスク設定
```

---

## 5. Common Tasks

## 5. 常见开发任务

### 5.1 Create a New Node Type

新しいノードタイプ（例: `CustomNode`）を追加する手順:

（添加新节点类型的中文说明）  
通过在共享类型、Webview 组件以及导出逻辑中依次补充 `customNode` 的类型定义和处理分支，即可扩展新的节点类型。

1. **型定義を追加** (`src/shared/types/workflow-definition.ts`):
   ```typescript
   interface CustomNodeData {
     customField: string;
   }

   type CustomNode = Node<CustomNodeData, 'customNode'>;
   type WorkflowNode = SubAgentNode | AskUserQuestionNode | CustomNode;
   ```

2. **React コンポーネントを作成** (`src/webview/src/components/nodes/CustomNode.tsx`):
   ```tsx
   export const CustomNode: React.FC<NodeProps<CustomNode>> = (props) => {
     return <div>{props.data.customField}</div>;
   };
   ```

3. **ノードタイプを登録** (`src/webview/src/components/WorkflowEditor.tsx`):
   ```typescript
   const nodeTypes: NodeTypes = {
     subAgent: SubAgentNode,
     askUserQuestion: AskUserQuestionNode,
     customNode: CustomNode, // 追加
   };
   ```

4. **エクスポートロジックを更新** (`src/extension/services/export-service.ts`):
   ```typescript
   if (node.type === 'customNode') {
     // .claude ファイル生成ロジック
   }
   ```

---

### 5.2 Add a New Command

### 5.2 新增 VS Code 命令

新しいコマンド（例: `cc-wf-studio.duplicateWorkflow`）を追加する手順:

1. **コマンドハンドラを作成** (`src/extension/commands/duplicate-workflow.ts`):
   ```typescript
   export function registerDuplicateWorkflowCommand(context: vscode.ExtensionContext) {
     context.subscriptions.push(
       vscode.commands.registerCommand('cc-wf-studio.duplicateWorkflow', async () => {
         // 実装
       })
     );
   }
   ```

2. **`package.json` に登録**:
   ```json
   {
     "contributes": {
       "commands": [
         {
           "command": "cc-wf-studio.duplicateWorkflow",
           "title": "Claude Code Workflow Studio: Duplicate Workflow"
         }
       ]
     }
   }
   ```

3. **`extension.ts` で登録**:
   ```typescript
   import { registerDuplicateWorkflowCommand } from './commands/duplicate-workflow';

   export function activate(context: vscode.ExtensionContext) {
     registerDuplicateWorkflowCommand(context);
   }
   ```

---

### 5.3 Update Extension-Webview API

### 5.3 扩展与 Webview 通信协议更新

新しいメッセージタイプを追加する手順:

1. **型定義を追加** (`src/shared/types/messages.ts`):
   ```typescript
   export interface NewActionPayload {
     data: string;
   }

   export type WebviewMessage =
     | Message<SaveWorkflowPayload, 'SAVE_WORKFLOW'>
     | Message<NewActionPayload, 'NEW_ACTION'>; // 追加
   ```

2. **Extension 側でハンドラを追加** (`src/extension/extension.ts`):
   ```typescript
   panel.webview.onDidReceiveMessage((message) => {
     switch (message.type) {
       case 'NEW_ACTION':
         handleNewAction(message.payload);
         break;
     }
   });
   ```

3. **Webview 側で送信** (`src/webview/src/services/vscode-bridge.ts`):
   ```typescript
   export function sendNewAction(data: string) {
     vscode.postMessage({
       type: 'NEW_ACTION',
       payload: { data }
     });
   }
   ```

---

## 6. Debugging

## 6. 调试

### 6.1 Debug Extension Host

1. ブレークポイントを `src/extension/` のコードに設定
2. `F5` キーで Extension Development Host を起動
3. コマンドを実行してブレークポイントで停止

（扩展侧调试的中文说明）  
在 `src/extension/` 中打断点后，通过 F5 启动调试会话，然后在开发者主机窗口中执行相关命令，即可在断点处暂停。

---

### 6.2 Debug Webview

### 6.2 调试 Webview

Webview のデバッグには **Chrome DevTools** を使用します:

1. Extension Development Host で Webview を開く
2. `Ctrl+Shift+P` / `Cmd+Shift+P` → `Developer: Open Webview Developer Tools`
3. Chrome DevTools でコンソール、ネットワーク、要素を確認

---

### 6.3 Debug Tests

### 6.3 调试测试

テストのデバッグ:

```bash
# Vitest (Webview)
cd src/webview
npm run test -- --inspect-brk
# Chrome で chrome://inspect を開いてアタッチ

# @vscode/test-cli (Extension)
npm run test:integration -- --inspect-brk
```

---

## 7. Building for Production

## 7. 生产构建

### 7.1 Production Build

```bash
# Webview をプロダクションビルド
cd src/webview
npm run build
cd ../..

# Extension をコンパイル
npm run compile
```

---

### 7.2 Package Extension

### 7.2 打包扩展

VSIX パッケージを作成:

```bash
npm install -g @vscode/vsce
vsce package
```

出力: `cc-wf-studio-1.0.0.vsix`

（中文说明）  
这里使用 `@vscode/vsce` 将扩展打包为 VSIX 文件，之后可以在本地或其他环境安装。

---

### 7.3 Install Packaged Extension

### 7.3 安装打包好的扩展

```bash
code --install-extension cc-wf-studio-1.0.0.vsix
```

---

## 8. Configuration

## 8. 配置

### 8.1 Workspace Settings

`.vscode/settings.json` に以下の設定を追加可能:

```json
{
  "cc-wf-studio.workflowsDirectory": ".vscode/workflows",
  "cc-wf-studio.exportDirectory": ".claude"
}
```

---

### 8.2 Extension Settings

### 8.2 扩展级配置

`package.json` の `contributes.configuration` で設定を定義:

```json
{
  "contributes": {
    "configuration": {
      "title": "Claude Code Workflow Studio",
      "properties": {
        "cc-wf-studio.workflowsDirectory": {
          "type": "string",
          "default": ".vscode/workflows",
          "description": "ワークフロー定義ファイルの保存先ディレクトリ"
        }
      }
    }
  }
}
```

---

## 9. Troubleshooting

## 9. 故障排查

### 9.1 Webview が表示されない

**原因**: Webview のビルドが完了していない

**解決方法**:
```bash
cd src/webview
npm run build
```

---

### 9.2 Extension が読み込まれない

### 9.2 扩展未被激活

**原因**: `package.json` の `activationEvents` が不足

**解決方法**: `package.json` に以下を追加:
```json
{
  "activationEvents": [
    "onCommand:cc-wf-studio.openEditor"
  ]
}
```

---

### 9.3 TypeScript エラー

### 9.3 TypeScript 报错

**原因**: 型定義の不一致

**解決方法**:
```bash
# 型定義を再インストール
npm install
cd src/webview
npm install
```

---

### 9.4 Webview が古いコンテンツを表示

**原因**: Webview のキャッシュ

**解決方法**:
1. Webview Panel を閉じる
2. Extension Development Host を再起動（`Ctrl+R` / `Cmd+R`）
3. Webview を再度開く

---

## 10. Next Steps

開発環境が整ったら、以下のドキュメントを参照してください:

- **Feature Spec**: `/specs/001-cc-wf-studio/spec.md`
- **Implementation Plan**: `/specs/001-cc-wf-studio/plan.md`
- **Data Model**: `/specs/001-cc-wf-studio/data-model.md`
- **API Contracts**: `/specs/001-cc-wf-studio/contracts/`
- **Tasks (Phase 2)**: `/specs/001-cc-wf-studio/tasks.md` (Phase 2 で生成)

---

## 11. Useful Commands Summary

| コマンド | 説明 |
|---------|------|
| `npm install` | Extension 依存関係をインストール |
| `npm run compile` | Extension をコンパイル |
| `npm run watch` | Extension を監視モードでコンパイル |
| `npm run lint` | Biome でコードをリント |
| `npm run format` | Biome でコードをフォーマット |
| `npm run check` | Biome でリント+フォーマットを一括実行 |
| `npm run test:integration` | Extension 統合テストを実行 |
| `npm run test:e2e` | E2E テストを実行 |
| `cd src/webview && npm install` | Webview 依存関係をインストール |
| `cd src/webview && npm run build` | Webview をビルド |
| `cd src/webview && npm run dev` | Webview 開発サーバーを起動 |
| `cd src/webview && npm run test` | Webview ユニットテストを実行 |
| `vsce package` | VSIX パッケージを作成 |

---

## 12. Support & Resources

- **VSCode Extension API**: https://code.visualstudio.com/api
- **React Flow Docs**: https://reactflow.dev/
- **Zustand Docs**: https://docs.pmnd.rs/zustand
- **Vitest Docs**: https://vitest.dev/
- **WebdriverIO Docs**: https://webdriver.io/
- **Biome Docs**: https://biomejs.dev/

---

**Happy Coding!** 🚀
