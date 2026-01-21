# Extension ↔ Webview Communication API Contract / 插件 ↔ Webview 通信 API 协议

**Version / 版本**: 1.0.0
**Date / 日期**: 2025-11-01
**Protocol / 协议**: VSCode Webview postMessage API

## Overview / 概览

このドキュメントは、VSCode Extension Host と Webview 間の通信インターフェース（API契約）を定義します。すべての通信は `postMessage` API を通じて JSON 形式のメッセージで行われます。 / 本文档定义了 VSCode Extension Host 与 Webview 之间的通信接口（API 协议）。所有通信均通过 `postMessage` API 以 JSON 格式的消息进行。

---

## Message Format / 消息格式

すべてのメッセージは以下の基本構造に従います: / 所有消息都遵循以下基本结构：

```typescript
interface Message<T = unknown> {
  type: string;        // メッセージタイプ（アクション識別子） / 消息类型（动作标识符）
  payload?: T;         // ペイロード（タイプ固有のデータ） / 有效负载（类型特定数据）
  requestId?: string;  // リクエストID（レスポンスとの紐付け用） / 请求 ID（用于关联响应）
}
```

---

## 1. Extension → Webview Messages / 插件 → Webview 消息

Extension Host から Webview へ送信されるメッセージです。 / 从 Extension Host 发送到 Webview 的消息。

### 1.1 `LOAD_WORKFLOW`

ワークフロー定義を Webview に読み込ませます。 / 让 Webview 加载工作流定义。

**Type / 类型**: `LOAD_WORKFLOW`

**Payload / 有效负载**:
```typescript
interface LoadWorkflowPayload {
  workflow: Workflow;
}
```

**Example / 示例**:
```json
{
  "type": "LOAD_WORKFLOW",
  "payload": {
    "workflow": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "sample-workflow",
      "description": "サンプルワークフロー",
      "version": "1.0.0",
      "nodes": [...],
      "connections": [...],
      "createdAt": "2025-11-01T00:00:00.000Z",
      "updatedAt": "2025-11-01T12:00:00.000Z"
    }
  }
}
```

**Webview Response / Webview 响应**: `WORKFLOW_LOADED` (success) or `ERROR` (failure)

---

### 1.2 `SAVE_SUCCESS`

ワークフロー保存の成功を通知します。 / 通知工作流保存成功。

**Type / 类型**: `SAVE_SUCCESS`

**Payload / 有效负载**:
```typescript
interface SaveSuccessPayload {
  filePath: string;
  timestamp: string; // ISO 8601
}
```

**Example / 示例**:
```json
{
  "type": "SAVE_SUCCESS",
  "payload": {
    "filePath": "/workspace/.vscode/workflows/sample-workflow.json",
    "timestamp": "2025-11-01T12:30:00.000Z"
  }
}
```

---

### 1.3 `EXPORT_SUCCESS`

ワークフローエクスポートの成功を通知します。 / 通知工作流导出成功。

**Type / 类型**: `EXPORT_SUCCESS`

**Payload / 有效负载**:
```typescript
interface ExportSuccessPayload {
  exportedFiles: string[]; // エクスポートされたファイルパスのリスト / 已导出的文件路径列表
  timestamp: string;       // ISO 8601
}
```

**Example / 示例**:
```json
{
  "type": "EXPORT_SUCCESS",
  "payload": {
    "exportedFiles": [
      "/workspace/.claude/agents/data-analysis.md",
      "/workspace/.claude/agents/report-generation.md",
      "/workspace/.claude/commands/sample-workflow.md"
    ],
    "timestamp": "2025-11-01T12:35:00.000Z"
  }
}
```

---

### 1.4 `ERROR`

エラー発生を通知します。 / 通知发生错误。

**Type / 类型**: `ERROR`

**Payload / 有效负载**:
```typescript
interface ErrorPayload {
  code: string;      // エラーコード / 错误代码
  message: string;   // ユーザー向けエラーメッセージ / 面向用户的错误消息
  details?: unknown; // 詳細情報（オプション） / 详细信息（可选）
}
```

**Example / 示例**:
```json
{
  "type": "ERROR",
  "payload": {
    "code": "SAVE_FAILED",
    "message": "ワークフローの保存に失敗しました。ファイルシステムへの書き込み権限を確認してください。",
    "details": {
      "errno": -13,
      "syscall": "open",
      "path": "/workspace/.vscode/workflows/sample-workflow.json"
    }
  }
}
```

**Error Codes / 错误代码**:
- `SAVE_FAILED`: ワークフロー保存失敗 / 工作流保存失败
- `LOAD_FAILED`: ワークフロー読み込み失敗 / 工作流加载失败
- `EXPORT_FAILED`: エクスポート失敗 / 导出失败
- `VALIDATION_ERROR`: バリデーションエラー / 验证错误
- `FILE_EXISTS`: ファイル既存エラー（上書き確認必要） / 文件已存在错误（需要确认覆盖）
- `PARSE_ERROR`: JSON/YAMLパースエラー / JSON/YAML 解析错误

---

## 2. Webview → Extension Messages / Webview → 插件消息

Webview から Extension Host へ送信されるメッセージです。 / 从 Webview 发送到 Extension Host 的消息。

### 2.1 `SAVE_WORKFLOW`

ワークフロー定義を保存するようリクエストします。 / 请求保存工作流定义。

**Type / 类型**: `SAVE_WORKFLOW`

**Payload / 有效负载**:
```typescript
interface SaveWorkflowPayload {
  workflow: Workflow;
}
```

**Example / 示例**:
```json
{
  "type": "SAVE_WORKFLOW",
  "requestId": "req-001",
  "payload": {
    "workflow": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "sample-workflow",
      "description": "サンプルワークフロー",
      "version": "1.0.0",
      "nodes": [...],
      "connections": [...]
    }
  }
}
```

**Extension Response / 插件响应**: `SAVE_SUCCESS` or `ERROR`

---

### 2.2 `EXPORT_WORKFLOW`

ワークフローを `.claude` 形式にエクスポートするようリクエストします。 / 请求将工作流导出为 `.claude` 格式。

**Type / 类型**: `EXPORT_WORKFLOW`

**Payload / 有效负载**:
```typescript
interface ExportWorkflowPayload {
  workflow: Workflow;
  overwriteExisting?: boolean; // 既存ファイルを上書きするか（デフォルト: false） / 是否覆盖现有文件（默认：false）
}
```

**Example / 示例**:
```json
{
  "type": "EXPORT_WORKFLOW",
  "requestId": "req-002",
  "payload": {
    "workflow": {...},
    "overwriteExisting": false
  }
}
```

**Extension Response / 插件响应**: `EXPORT_SUCCESS` or `ERROR` (code: `FILE_EXISTS`) or `ERROR` (other)

---

### 2.3 `CONFIRM_OVERWRITE`

ファイル上書き確認ダイアログの結果を通知します。 / 通知文件覆盖确认对话框的结果。

**Type / 类型**: `CONFIRM_OVERWRITE`

**Payload / 有效负载**:
```typescript
interface ConfirmOverwritePayload {
  confirmed: boolean;  // true: 上書き許可, false: キャンセル / true: 允许覆盖, false: 取消
  filePath: string;    // 対象ファイルパス / 目标文件路径
}
```

**Example / 示例**:
```json
{
  "type": "CONFIRM_OVERWRITE",
  "requestId": "req-002-confirm",
  "payload": {
    "confirmed": true,
    "filePath": "/workspace/.claude/agents/data-analysis.md"
  }
}
```

**Extension Response / 插件响应**: エクスポート処理を継続または中止 / 继续或中止导出处理

---

### 2.4 `LOAD_WORKFLOW_LIST`

利用可能なワークフローリストをリクエストします。 / 请求可用工作流列表。

**Type / 类型**: `LOAD_WORKFLOW_LIST`

**Payload / 有效负载**: なし / 无

**Example / 示例**:
```json
{
  "type": "LOAD_WORKFLOW_LIST",
  "requestId": "req-003"
}
```

**Extension Response / 插件响应**:
```json
{
  "type": "WORKFLOW_LIST_LOADED",
  "requestId": "req-003",
  "payload": {
    "workflows": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "sample-workflow",
        "description": "サンプルワークフロー",
        "updatedAt": "2025-11-01T12:00:00.000Z"
      }
    ]
  }
}
```

---

### 2.5 `STATE_UPDATE`

Webview の状態変更を Extension に通知します（永続化用）。 / 向插件通知 Webview 状态更改（用于持久化）。

**Type / 类型**: `STATE_UPDATE`

**Payload / 有效负载**:
```typescript
interface StateUpdatePayload {
  nodes: WorkflowNode[];
  edges: Connection[];
  selectedNodeId?: string | null;
}
```

**Example / 示例**:
```json
{
  "type": "STATE_UPDATE",
  "payload": {
    "nodes": [...],
    "edges": [...],
    "selectedNodeId": "node-1"
  }
}
```

**Extension Response / 插件响应**: なし（一方向通知） / 无（单向通知）

---

## 3. Request-Response Pattern / 请求-响应模式

リクエスト-レスポンス型の通信には `requestId` を使用します。 / 对于请求-响应型通信，使用 `requestId`。

### Flow / 流程:

```
Webview                     Extension
  │                              │
  ├─── SAVE_WORKFLOW ────────────>
  │    { requestId: "req-001" }  │
  │                              │
  <──── SAVE_SUCCESS ────────────┤
       { requestId: "req-001" }  │
```

### Implementation Example (Webview) / 实现示例 (Webview):

```typescript
// Webview側 / Webview 端
const vscode = acquireVsCodeApi();

function saveWorkflow(workflow: Workflow): Promise<void> {
  return new Promise((resolve, reject) => {
    const requestId = `req-${Date.now()}`;

    // レスポンスハンドラを登録 / 注册响应处理器
    const handler = (event: MessageEvent) => {
      const message = event.data;
      if (message.requestId === requestId) {
        window.removeEventListener('message', handler);

        if (message.type === 'SAVE_SUCCESS') {
          resolve();
        } else if (message.type === 'ERROR') {
          reject(new Error(message.payload.message));
        }
      }
    };

    window.addEventListener('message', handler);

    // リクエスト送信 / 发送请求
    vscode.postMessage({
      type: 'SAVE_WORKFLOW',
      requestId,
      payload: { workflow }
    });
  });
}
```

---

## 4. Error Handling / 错误处理

### 4.1 Validation Errors / 验证错误

バリデーションエラーは `ERROR` メッセージで通知され、`code: "VALIDATION_ERROR"` を含みます。 / 验证错误通过 `ERROR` 消息通知，并包含 `code: "VALIDATION_ERROR"`。

**Example / 示例**:
```json
{
  "type": "ERROR",
  "requestId": "req-001",
  "payload": {
    "code": "VALIDATION_ERROR",
    "message": "ワークフロー名が無効です。英数字とハイフン、アンダースコアのみ使用できます。",
    "details": {
      "field": "name",
      "value": "サンプル@ワークフロー",
      "rule": "alphanumeric-hyphen-underscore"
    }
  }
}
```

---

### 4.2 File System Errors / 文件系统错误

ファイルシステムエラーは `ERROR` メッセージで通知され、システムエラー情報を含みます。 / 文件系统错误通过 `ERROR` 消息通知，并包含系统错误信息。

**Example / 示例**:
```json
{
  "type": "ERROR",
  "requestId": "req-002",
  "payload": {
    "code": "SAVE_FAILED",
    "message": "ファイルの書き込みに失敗しました。",
    "details": {
      "errno": -13,
      "syscall": "open",
      "path": "/workspace/.vscode/workflows/sample-workflow.json"
    }
  }
}
```

---

### 4.3 File Exists (Overwrite Confirmation) / 文件已存在（覆盖确认）

既存ファイルが存在する場合、`FILE_EXISTS` エラーで通知されます。 / 如果现有文件已存在，则通过 `FILE_EXISTS` 错误进行通知。

**Flow / 流程**:
```
Webview                     Extension
  │                              │
  ├─── EXPORT_WORKFLOW ──────────>
  │                              │
  <──── ERROR ───────────────────┤
       { code: "FILE_EXISTS" }   │
  │                              │
  ├─── [User confirms]           │
  │                              │
  ├─── CONFIRM_OVERWRITE ────────>
  │    { confirmed: true }       │
  │                              │
  <──── EXPORT_SUCCESS ──────────┤
```

---

## 5. TypeScript Type Definitions / TypeScript 类型定义

以下は、Extension と Webview の両側で共有する型定義です（`/src/shared/types/` に配置）。 / 以下是插件和 Webview 双方共享的类型定义（放置在 `/src/shared/types/` 中）。

```typescript
// shared/types/messages.ts

// Base message
export interface Message<T = unknown> {
  type: string;
  payload?: T;
  requestId?: string;
}

// Extension → Webview
export type ExtensionMessage =
  | Message<LoadWorkflowPayload, 'LOAD_WORKFLOW'>
  | Message<SaveSuccessPayload, 'SAVE_SUCCESS'>
  | Message<ExportSuccessPayload, 'EXPORT_SUCCESS'>
  | Message<ErrorPayload, 'ERROR'>
  | Message<WorkflowListPayload, 'WORKFLOW_LIST_LOADED'>;

// Webview → Extension
export type WebviewMessage =
  | Message<SaveWorkflowPayload, 'SAVE_WORKFLOW'>
  | Message<ExportWorkflowPayload, 'EXPORT_WORKFLOW'>
  | Message<ConfirmOverwritePayload, 'CONFIRM_OVERWRITE'>
  | Message<void, 'LOAD_WORKFLOW_LIST'>
  | Message<StateUpdatePayload, 'STATE_UPDATE'>;

// Payloads
export interface LoadWorkflowPayload {
  workflow: Workflow;
}

export interface SaveSuccessPayload {
  filePath: string;
  timestamp: string;
}

export interface ExportSuccessPayload {
  exportedFiles: string[];
  timestamp: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface SaveWorkflowPayload {
  workflow: Workflow;
}

export interface ExportWorkflowPayload {
  workflow: Workflow;
  overwriteExisting?: boolean;
}

export interface ConfirmOverwritePayload {
  confirmed: boolean;
  filePath: string;
}

export interface WorkflowListPayload {
  workflows: Array<{
    id: string;
    name: string;
    description?: string;
    updatedAt: string;
  }>;
}

export interface StateUpdatePayload {
  nodes: WorkflowNode[];
  edges: Connection[];
  selectedNodeId?: string | null;
}
```

---

## 6. Contract Testing / 协议测试

以下のテストケースで契約の準拠を検証します: / 通过以下测试用例验证协议的合规性：

### 6.1 Extension → Webview / 插件 → Webview

- [x] `LOAD_WORKFLOW` メッセージの受信と Workflow オブジェクトのパース / `LOAD_WORKFLOW` 消息的接收和 Workflow 对象的解析
- [x] `SAVE_SUCCESS` メッセージの受信とUI更新 / `SAVE_SUCCESS` 消息的接收和 UI 更新
- [x] `EXPORT_SUCCESS` メッセージの受信とUI更新 / `EXPORT_SUCCESS` 消息的接收和 UI 更新
- [x] `ERROR` メッセージの受信とエラー表示 / `ERROR` 消息的接收和错误显示

### 6.2 Webview → Extension / Webview → 插件

- [x] `SAVE_WORKFLOW` メッセージの送信と `SAVE_SUCCESS` レスポンスの受信 / `SAVE_WORKFLOW` 消息的发送和 `SAVE_SUCCESS` 响应的接收
- [x] `EXPORT_WORKFLOW` メッセージの送信と `EXPORT_SUCCESS` レスポンスの受信 / `EXPORT_WORKFLOW` 消息的发送和 `EXPORT_SUCCESS` 响应的接收
- [x] `EXPORT_WORKFLOW` → `FILE_EXISTS` → `CONFIRM_OVERWRITE` フローの実行 / `EXPORT_WORKFLOW` → `FILE_EXISTS` → `CONFIRM_OVERWRITE` 流程的执行
- [x] `LOAD_WORKFLOW_LIST` メッセージの送信と `WORKFLOW_LIST_LOADED` レスポンスの受信 / `LOAD_WORKFLOW_LIST` 消息的发送和 `WORKFLOW_LIST_LOADED` 响应的接收

### 6.3 Error Scenarios / 错误场景

- [x] 不正な JSON 形式のメッセージ受信時のエラーハンドリング / 接收到无效 JSON 格式消息时的错误处理
- [x] 未知のメッセージタイプ受信時の無視 / 接收到未知消息类型时的忽略处理
- [x] タイムアウト（レスポンスが一定時間返らない場合）のハンドリング / 超时（在一定时间内未返回响应）的处理

---

## 7. References / 参考

- VSCode Webview API: https://code.visualstudio.com/api/extension-guides/webview
- Data Model: `/specs/001-cc-wf-studio/data-model.md`
- Implementation Plan: `/specs/001-cc-wf-studio/plan.md`
