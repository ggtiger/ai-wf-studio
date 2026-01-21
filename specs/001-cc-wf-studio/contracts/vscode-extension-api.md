# VSCode Extension API Contract / VSCode 插件 API 协议

**Version / 版本**: 1.0.0
**Date / 日期**: 2025-11-01
**Target VSCode Version / 目标 VSCode 版本**: 1.80+

## Overview / 概览

このドキュメントは、Claude Code Workflow Studio 拡張機能が使用する VSCode Extension API の契約を定義します。すべての API 呼び出しは `vscode` モジュールを通じて行われます。 / 本文档定义了 Claude Code Workflow Studio 插件使用的 VSCode Extension API 协议。所有 API 调用均通过 `vscode` 模块进行。

---

## 1. Commands / 命令

拡張機能が登録するコマンドとその動作です。 / 插件注册的命令及其行为。

### 1.1 `cc-wf-studio.openEditor`

ワークフローエディタを開きます。 / 打开工作流编辑器。

**Command ID / 命令 ID**: `cc-wf-studio.openEditor`

**Title / 标题**: `Claude Code Workflow Studio: Open Editor`

**Trigger / 触发方式**:
- コマンドパレットから実行 / 从命令面板执行
- アクティビティバーのアイコンクリック（オプション） / 点击活动栏图标（可选）

**Behavior / 行为**:
1. 新しい Webview Panel を作成 / 创建一个新的 Webview Panel
2. React アプリケーション（Vite ビルド成果物）を読み込み / 加载 React 应用程序（Vite 构建产物）
3. 既存のワークフローがある場合、リストを表示 / 如果存在现有工作流，则显示列表

**Implementation / 实现**:
```typescript
vscode.commands.registerCommand('cc-wf-studio.openEditor', () => {
  const panel = vscode.window.createWebviewPanel(
    'cc-wf-studio',
    'Workflow Studio',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.joinPath(extensionUri, 'dist', 'webview')
      ]
    }
  );

  panel.webview.html = getWebviewContent(panel.webview, extensionUri);
});
```

---

### 1.2 `cc-wf-studio.newWorkflow`

新しいワークフローを作成します。 / 创建新工作流。

**Command ID / 命令 ID**: `cc-wf-studio.newWorkflow`

**Title / 标题**: `Claude Code Workflow Studio: New Workflow`

**Trigger / 触发方式**: コマンドパレット / 命令面板

**Behavior / 行为**:
1. エディタを開く（未開封の場合） / 打开编辑器（如果尚未打开）
2. 新規ワークフローの初期状態を Webview に送信 / 向 Webview 发送新工作流的初始状态

---

### 1.3 `cc-wf-studio.saveWorkflow`

現在のワークフローを保存します。 / 保存当前工作流。

**Command ID / 命令 ID**: `cc-wf-studio.saveWorkflow`

**Title / 标题**: `Claude Code Workflow Studio: Save Workflow`

**Keybinding / 快捷键**: `Ctrl+S` (Windows/Linux), `Cmd+S` (macOS)

**Trigger / 触发方式**:
- コマンドパレット / 命令面板
- キーボードショートカット / 键盘快捷键
- Webview からの `SAVE_WORKFLOW` メッセージ / 来自 Webview 的 `SAVE_WORKFLOW` 消息

**Behavior / 行为**:
1. Webview から現在のワークフロー状態を取得 / 从 Webview 获取当前工作流状态
2. `.vscode/workflows/{workflow-name}.json` に保存 / 保存到 `.vscode/workflows/{workflow-name}.json`
3. `SAVE_SUCCESS` メッセージを Webview に送信 / 向 Webview 发送 `SAVE_SUCCESS` 消息

---

### 1.4 `cc-wf-studio.exportWorkflow`

ワークフローを `.claude` 形式にエクスポートします。 / 将工作流导出为 `.claude` 格式。

**Command ID / 命令 ID**: `cc-wf-studio.exportWorkflow`

**Title / 标题**: `Claude Code Workflow Studio: Export Workflow`

**Trigger / 触发方式**:
- コマンドパレット / 命令面板
- Webview からの `EXPORT_WORKFLOW` メッセージ / 来自 Webview 的 `EXPORT_WORKFLOW` 消息

**Behavior / 行为**:
1. ワークフローを `.claude/agents/*.md` と `.claude/commands/*.md` に変換 / 将工作流转换为 `.claude/agents/*.md` 和 `.claude/commands/*.md`
2. 既存ファイルがある場合、上書き確認ダイアログを表示 / 如果存在现有文件，显示覆盖确认对话框
3. エクスポート完了後、`EXPORT_SUCCESS` メッセージを Webview に送信 / 导出完成后，向 Webview 发送 `EXPORT_SUCCESS` 消息

---

## 2. File System API / 文件系统 API

### 2.1 Workspace Folder Access / 工作区文件夹访问

**API**: `vscode.workspace.workspaceFolders`

**Usage / 用法**:
```typescript
const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
if (!workspaceFolder) {
  vscode.window.showErrorMessage('ワークスペースが開かれていません。'); // 未打开工作区。
  return;
}

const workflowsDir = vscode.Uri.joinPath(
  workspaceFolder.uri,
  '.vscode',
  'workflows'
);
```

**Contract / 协议**:
- ✅ ワークスペースが開かれている場合のみ動作 / 仅在打开工作区时运行
- ✅ マルチルートワークスペースの場合、最初のフォルダを使用 / 在多根工作区中，使用第一个文件夹
- ✅ ワークスペースが未開封の場合、エラーメッセージを表示 / 如果未打开工作区，显示错误消息

---

### 2.2 File Read / 文件读取

**API**: `vscode.workspace.fs.readFile()`

**Usage / 用法**:
```typescript
async function loadWorkflow(filePath: vscode.Uri): Promise<Workflow> {
  try {
    const fileData = await vscode.workspace.fs.readFile(filePath);
    const jsonString = Buffer.from(fileData).toString('utf8');
    const workflow = JSON.parse(jsonString);
    return workflow;
  } catch (error) {
    if (error.code === 'FileNotFound') {
      throw new Error('ワークフローファイルが見つかりません。'); // 找不到工作流文件。
    } else if (error instanceof SyntaxError) {
      throw new Error('ワークフローファイルのJSON形式が不正です。'); // 工作流文件的 JSON 格式无效。
    }
    throw error;
  }
}
```

**Contract / 协议**:
- ✅ ファイルが存在しない場合、`FileNotFound` エラーをスロー / 如果文件不存在，抛出 `FileNotFound` 错误
- ✅ JSON パースエラーの場合、`SyntaxError` をスロー / 如果 JSON 解析错误，抛出 `SyntaxError`
- ✅ UTF-8 エンコーディングを使用 / 使用 UTF-8 编码

---

### 2.3 File Write / 文件写入

**API**: `vscode.workspace.fs.writeFile()`

**Usage / 用法**:
```typescript
async function saveWorkflow(
  filePath: vscode.Uri,
  workflow: Workflow
): Promise<void> {
  const jsonString = JSON.stringify(workflow, null, 2);
  const fileData = Buffer.from(jsonString, 'utf8');

  await vscode.workspace.fs.writeFile(filePath, fileData);
}
```

**Contract / 协议**:
- ✅ ディレクトリが存在しない場合、`FileNotFound` エラーをスロー（事前に `createDirectory` 必要） / 如果目录不存在，抛出 `FileNotFound` 错误（需要提前调用 `createDirectory`）
- ✅ ファイルが既存の場合、上書き / 如果文件已存在，则覆盖
- ✅ UTF-8 エンコーディングを使用 / 使用 UTF-8 编码

---

### 2.4 Directory Creation / 目录创建

**API**: `vscode.workspace.fs.createDirectory()`

**Usage / 用法**:
```typescript
async function ensureWorkflowsDirectory(): Promise<void> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) return;

  const workflowsDir = vscode.Uri.joinPath(
    workspaceFolder.uri,
    '.vscode',
    'workflows'
  );

  try {
    await vscode.workspace.fs.createDirectory(workflowsDir);
  } catch (error) {
    if (error.code !== 'FileExists') {
      throw error;
    }
    // ディレクトリが既存の場合は無視 / 如果目录已存在，则忽略
  }
}
```

**Contract / 协议**:
- ✅ ディレクトリが既存の場合、`FileExists` エラーをスロー（無視可能） / 如果目录已存在，抛出 `FileExists` 错误（可忽略）
- ✅ 親ディレクトリが存在しない場合、自動的に作成されない（事前作成必要） / 如果父目录不存在，不会自动创建（需要提前创建）

---

### 2.5 File Stat (Existence Check) / 文件状态（存在检查）

**API**: `vscode.workspace.fs.stat()`

**Usage / 用法**:
```typescript
async function fileExists(filePath: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(filePath);
    return true;
  } catch (error) {
    if (error.code === 'FileNotFound') {
      return false;
    }
    throw error;
  }
}
```

**Contract / 协议**:
- ✅ ファイルが存在する場合、`FileStat` オブジェクトを返す / 如果文件存在，返回 `FileStat` 对象
- ✅ ファイルが存在しない場合、`FileNotFound` エラーをスロー / 如果文件不存在，抛出 `FileNotFound` 错误

---

## 3. UI API

### 3.1 Information Message / 信息消息

**API**: `vscode.window.showInformationMessage()`

**Usage / 用法**:
```typescript
vscode.window.showInformationMessage(
  'ワークフローを保存しました。' // 工作流已保存。
);
```

**Contract / 协议**:
- ✅ 通知メッセージを画面右下に表示 / 在屏幕右下角显示通知消息
- ✅ 自動的に数秒後に消える / 数秒后自动消失
- ✅ アクションボタンを追加可能（オプション） / 可添加操作按钮（可选）

---

### 3.2 Error Message / 错误消息

**API**: `vscode.window.showErrorMessage()`

**Usage / 用法**:
```typescript
vscode.window.showErrorMessage(
  'ワークフローの保存に失敗しました。', // 工作流保存失败。
  '再試行' // 重试
).then((selection) => {
  if (selection === '再試行') {
    // 再試行処理 / 重试处理
  }
});
```

**Contract / 协议**:
- ✅ エラーメッセージを画面右下に表示（赤色） / 在屏幕右下角显示错误消息（红色）
- ✅ アクションボタンを追加可能 / 可添加操作按钮
- ✅ Promise で選択されたボタンを返す / 通过 Promise 返回选中的按钮

---

### 3.3 Warning Message / 警告消息

**API**: `vscode.window.showWarningMessage()`

**Usage / 用法**:
```typescript
const selection = await vscode.window.showWarningMessage(
  'ファイルが既に存在します。上書きしますか?', // 文件已存在。要覆盖吗？
  '上書き', // 覆盖
  'キャンセル' // 取消
);

if (selection === '上書き') {
  // 上書き処理 / 覆盖处理
}
```

**Contract / 协议**:
- ✅ 警告メッセージを画面右下に表示（黄色） / 在屏幕右下角显示警告消息（黄色）
- ✅ アクションボタンを追加可能 / 可添加操作按钮
- ✅ Promise で選択されたボタンを返す（キャンセル時は `undefined`） / 通过 Promise 返回选中的按钮（取消时为 `undefined`）

---

### 3.4 Input Box / 输入框

**API**: `vscode.window.showInputBox()`

**Usage / 用法**:
```typescript
const workflowName = await vscode.window.showInputBox({
  prompt: 'ワークフロー名を入力してください', // 请输入工作流名称
  placeHolder: 'my-workflow',
  validateInput: (value) => {
    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      return '英数字、ハイフン、アンダースコアのみ使用できます。'; // 仅能使用字母数字、连字符和下划线。
    }
    return null;
  }
});

if (!workflowName) {
  return; // キャンセルされた / 已取消
}
```

**Contract / 协议**:
- ✅ 入力ダイアログを表示 / 显示输入对话框
- ✅ `validateInput` でリアルタイムバリデーション / 通过 `validateInput` 进行实时验证
- ✅ キャンセル時は `undefined` を返す / 取消时返回 `undefined`
- ✅ Enter キーで確定 / 按 Enter 键确认

---

## 4. Webview API

### 4.1 Webview Panel Creation / Webview 面板创建

**API**: `vscode.window.createWebviewPanel()`

**Usage / 用法**:
```typescript
const panel = vscode.window.createWebviewPanel(
  'cc-wf-studio',              // viewType
  'Workflow Studio',           // title
  vscode.ViewColumn.One,       // showOptions
  {
    enableScripts: true,       // スクリプト実行を許可 / 允许执行脚本
    retainContextWhenHidden: true, // 非表示時も状態を保持 / 隐藏时保持状态
    localResourceRoots: [      // ローカルリソースのルート / 本地资源根目录
      vscode.Uri.joinPath(extensionUri, 'dist', 'webview')
    ]
  }
);
```

**Contract / 协议**:
- ✅ `enableScripts: true` で React アプリケーションを実行可能 / 通过 `enableScripts: true` 可以运行 React 应用程序
- ✅ `retainContextWhenHidden: true` でタブ切り替え時も状態を保持 / 通过 `retainContextWhenHidden: true` 在切换标签时也保持状态
- ✅ `localResourceRoots` で読み込み可能なリソースパスを制限 / 通过 `localResourceRoots` 限制可读取的资源路径

---

### 4.2 Webview HTML Content / Webview HTML 内容

**API**: `panel.webview.html`

**Usage / 用法**:
```typescript
function getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri
): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'dist', 'webview', 'main.js')
  );

  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'dist', 'webview', 'style.css')
  );

  const nonce = getNonce(); // CSP nonce生成

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none';
                 style-src ${webview.cspSource} 'unsafe-inline';
                 script-src 'nonce-${nonce}';">
  <link href="${styleUri}" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}
```

**Contract / 协议**:
- ✅ CSP (Content Security Policy) を設定して XSS 攻撃を防止 / 设置 CSP 以防止 XSS 攻击
- ✅ `webview.asWebviewUri()` でリソース URI を変換 / 使用 `webview.asWebviewUri()` 转换资源 URI
- ✅ `nonce` を使用してインラインスクリプトを許可 / 使用 `nonce` 允许内联脚本

---

### 4.3 Webview Message Handling / Webview 消息处理

**API**: `panel.webview.onDidReceiveMessage()`

**Usage / 用法**:
```typescript
panel.webview.onDidReceiveMessage(
  async (message) => {
    switch (message.type) {
      case 'SAVE_WORKFLOW':
        await handleSaveWorkflow(message.payload);
        panel.webview.postMessage({
          type: 'SAVE_SUCCESS',
          requestId: message.requestId,
          payload: { filePath: '...', timestamp: new Date().toISOString() }
        });
        break;

      case 'EXPORT_WORKFLOW':
        await handleExportWorkflow(message.payload);
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  },
  undefined,
  context.subscriptions
);
```

**Contract / 协议**:
- ✅ Webview からのメッセージを受信 / 接收来自 Webview 的消息
- ✅ `context.subscriptions` に登録して自動クリーンアップ / 注册到 `context.subscriptions` 以自动清理
- ✅ 未知のメッセージタイプは無視（警告ログ出力） / 忽略未知消息类型（输出警告日志）

---

### 4.4 Posting Messages to Webview / 向 Webview 发送消息

**API**: `panel.webview.postMessage()`

**Usage / 用法**:
```typescript
panel.webview.postMessage({
  type: 'LOAD_WORKFLOW',
  payload: {
    workflow: loadedWorkflow
  }
});
```

**Contract / 协议**:
- ✅ Webview にメッセージを送信 / 向 Webview 发送消息
- ✅ JSON シリアライズ可能なオブジェクトのみ送信可能 / 仅能发送可 JSON 序列化的对象
- ✅ Webview 側で `window.addEventListener('message', ...)` で受信 / 在 Webview 端通过 `window.addEventListener('message', ...)` 接收

---

## 5. Configuration API / 配置 API

### 5.1 Get Configuration / 获取配置

**API**: `vscode.workspace.getConfiguration()`

**Usage / 用法**:
```typescript
const config = vscode.workspace.getConfiguration('cc-wf-studio');
const workflowsDir = config.get<string>('workflowsDirectory', '.vscode/workflows');
const exportDir = config.get<string>('exportDirectory', '.claude');
```

**Contract / 协议**:
- ✅ 設定値を取得 / 获取配置值
- ✅ デフォルト値を指定可能（第2引数） / 可指定默认值（第二个参数）
- ✅ `package.json` の `contributes.configuration` で定義された設定のみ取得可能 / 仅能获取 `package.json` 的 `contributes.configuration` 中定义的配置

---

### 5.2 Update Configuration / 更新配置

**API**: `config.update()`

**Usage / 用法**:
```typescript
const config = vscode.workspace.getConfiguration('cc-wf-studio');
await config.update(
  'workflowsDirectory',
  '.workflows',
  vscode.ConfigurationTarget.Workspace
);
```

**Contract / 协议**:
- ✅ 設定値を更新 / 更新配置值
- ✅ `ConfigurationTarget.Workspace` でワークスペース設定を更新 / 使用 `ConfigurationTarget.Workspace` 更新工作区设置
- ✅ `ConfigurationTarget.Global` でグローバル設定を更新 / 使用 `ConfigurationTarget.Global` 更新全局设置

---

## 6. Extension Context / 插件上下文

### 6.1 Extension URI

**API**: `context.extensionUri`

**Usage / 用法**:
```typescript
export function activate(context: vscode.ExtensionContext) {
  const extensionUri = context.extensionUri;

  // リソースパスの構築 / 构建资源路径
  const webviewPath = vscode.Uri.joinPath(
    extensionUri,
    'dist',
    'webview'
  );
}
```

**Contract / 协议**:
- ✅ 拡張機能のルートディレクトリ URI を取得 / 获取插件根目录 URI
- ✅ `vscode.Uri.joinPath()` でパスを安全に結合 / 使用 `vscode.Uri.joinPath()` 安全地结合路径

---

### 6.2 Subscriptions

**API**: `context.subscriptions`

**Usage / 用法**:
```typescript
context.subscriptions.push(
  vscode.commands.registerCommand('cc-wf-studio.openEditor', () => {
    // コマンド実装 / 命令实现
  })
);

context.subscriptions.push(
  panel.webview.onDidReceiveMessage(handleMessage)
);
```

**Contract / 协议**:
- ✅ `Disposable` オブジェクトを登録 / 注册 `Disposable` 对象
- ✅ 拡張機能の非アクティブ時に自動的にクリーンアップ / 插件停用时自动清理
- ✅ メモリリークを防止 / 防止内存泄漏

---

## 7. Contract Testing Checklist / 协议测试检查表

以下のテストケースで契約の準拠を検証します: / 通过以下测试用例验证协议的合规性：

### Commands / 命令:
- [x] `cc-wf-studio.openEditor` コマンドが Webview Panel を開く / `cc-wf-studio.openEditor` 命令打开 Webview Panel
- [x] `cc-wf-studio.saveWorkflow` コマンドがファイルに保存する / `cc-wf-studio.saveWorkflow` 命令保存到文件
- [x] `cc-wf-studio.exportWorkflow` コマンドが `.claude` 形式にエクスポートする / `cc-wf-studio.exportWorkflow` 命令导出为 `.claude` 格式

### File System / 文件系统:
- [x] `vscode.workspace.fs.readFile()` がファイルを読み込む / `vscode.workspace.fs.readFile()` 读取文件
- [x] `vscode.workspace.fs.writeFile()` がファイルを書き込む / `vscode.workspace.fs.writeFile()` 写入文件
- [x] `vscode.workspace.fs.createDirectory()` がディレクトリを作成する / `vscode.workspace.fs.createDirectory()` 创建目录
- [x] ファイルが存在しない場合、`FileNotFound` エラーをスロー / 如果文件不存在，抛出 `FileNotFound` 错误
- [x] JSON パースエラーの場合、適切なエラーメッセージを表示 / 如果 JSON 解析错误，显示适当的错误消息

### UI:
- [x] `showInformationMessage()` が成功メッセージを表示 / `showInformationMessage()` 显示成功消息
- [x] `showErrorMessage()` がエラーメッセージを表示 / `showErrorMessage()` 显示错误消息
- [x] `showWarningMessage()` が上書き確認ダイアログを表示 / `showWarningMessage()` 显示覆盖确认对话框
- [x] `showInputBox()` がワークフロー名入力ダイアログを表示 / `showInputBox()` 显示工作流名称输入对话框

### Webview:
- [x] Webview Panel が正しく作成される / Webview Panel 已正确创建
- [x] Webview にメッセージを送信できる / 可以向 Webview 发送消息
- [x] Webview からメッセージを受信できる / 可以从 Webview 接收消息
- [x] CSP が正しく設定されている / CSP 已正确设置
- [x] リソース URI が正しく変換される / 资源 URI 已正确转换

---

## 8. References / 参考

- VSCode Extension API: https://code.visualstudio.com/api/references/vscode-api
- Webview API Guide: https://code.visualstudio.com/api/extension-guides/webview
- Extension Guidelines: https://code.visualstudio.com/api/references/extension-guidelines
- Data Model: `/specs/001-cc-wf-studio/data-model.md`
- Extension-Webview API: `/specs/001-cc-wf-studio/contracts/extension-webview-api.md`
