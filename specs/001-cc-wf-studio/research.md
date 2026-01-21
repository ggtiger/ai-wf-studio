# Research Report: Claude Code Workflow Studio

# 调研报告：Claude Code Workflow Studio

**Date**: 2025-11-01
**Branch**: 001-cc-wf-studio
**Status**: Phase 0 Complete

## Overview

このドキュメントは、Technical Contextセクションで「NEEDS CLARIFICATION」とマークされた項目の調査結果をまとめています。各調査項目について、選定した技術、その理由、代替案の比較を記録します。

（概览的中文说明）  
本报告汇总了在 Technical Context 中标记为「NEEDS CLARIFICATION」的技术决策调研结果，逐项给出：  
- 选用的具体技术（如状态管理库、测试框架、代码格式化工具等）  
- 选择理由与权衡点  
- 主要备选方案的优劣对比与适用场景  
后续实现计划与数据模型都以本报告中的结论为前提。

## 1. 状態管理ライブラリの選定 / 状态管理库的选择

### Decision: **Zustand**

### Rationale: / 选择理由：
- **React Flow との統合**: React Flow は内部的に Zustand を使用しており、シームレスな統合が可能。同じ状態管理パターンを採用することで互換性の問題を回避できる。
  - **与 React Flow 集成**：React Flow 内部使用 Zustand，可实现无缝集成。采用相同的状态管理模式可以避免兼容性问题。
- **最小限のボイラープレート**: バンドルサイズ約3KB、Provider ラッパー不要。VSCode Webview 環境でのバンドルサイズとスタートアップパフォーマンスが重要。
  - **极简模板代码**：包体积约 3KB，无需 Provider 包裹。在 VS Code Webview 环境中，包体积和启动性能至关重要。
- **VSCode Webview との互換性**: 軽量な設計により制約のある Webview 環境で問題なく動作。VSCode の `acquireVsCodeApi().setState()` と組み合わせた永続化も容易。
  - **与 VS Code Webview 兼容**：轻量化设计使其在受限的 Webview 环境中运行良好。易于结合 VS Code 的 `acquireVsCodeApi().setState()` 进行持久化。
- **TypeScript サポート**: 型安全なストアとフックを提供。React 18 との組み合わせで優れた開発者体験。
  - **TypeScript 支持**：提供类型安全的 Store 和 Hook。与 React 18 结合提供出色的开发者体验。

（选择 Zustand 的中文说明）
选择 Zustand 的主要原因是：
- React Flow 内部也使用 Zustand，易于在同一模式下共享状态与心智模型
- 体积小、无需 Provider 包裹，适合对启动时间内包大小敏感的 Webview 场景
- 提供良好的 TypeScript 支持，能用极少的模板代码完成强类型 Store 定义
因此它比 Redux Toolkit 或 Context API 更符合本项目「轻量 + 高性能 + 简单集成」的目标。

### Alternatives Considered: / 备选方案：

| ライブラリ / 库 | 長所 / 优点 | 短所 / 缺点 | 推奨シーン / 推荐场景 |
|---------|------|------|------------|
| **Redux Toolkit** | 成熟、広範なミドルウェア、エンタープライズグレード / 成熟、丰富的中间件、企业级 | ~14KB、大量のボイラープレート、Provider必須、MVP には過剰 / 约 14KB、大量模板代码、必须 Provider、对于 MVP 过于沉重 | 大規模チーム、厳密なパターンが必要、包括的なロギング/デバッグツールが必要な場合 / 大型团队、需要严格模式、需要全面日志/调试工具的场景 |
| **Jotai** | 細粒度のパフォーマンス、アトミックステートモデル、~4KB / 细粒度性能、原子状态模型、约 4KB | atom 構成の学習曲線、フラットなステート構造（ワークフローノード/エッジ）には複雑 / 原子配置的学习曲线、对于扁平状态结构（如节点/边）较为复杂 | 複雑な相互依存ステートを持つパフォーマンス重視アプリ、再レンダリング最適化が重要な場合 / 具有复杂依赖关系的性能敏感型应用、重渲染优化至关重要的场景 |
| **Context API** | 組み込み、依存関係ゼロ / 内置、零依赖 | メモ化なし、不要な再レンダリングが発生しやすい、複雑なステート管理に冗長 / 缺乏记忆化、容易导致不必要的重渲染、对于复杂状态管理过于冗长 | 単一のグローバルステート値、または非常にシンプルなアプリケーション（ワークフローステートには非推奨） / 单个全局状态值或极简单的应用（不推荐用于工作流状态） |

### Implementation Example:

```typescript
import { create } from 'zustand';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (id: string | null) => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (selectedNodeId) => set({ selectedNodeId }),
}));
```

---

## 2. VSCode Extension テストフレームワーク / VS Code 扩展测试框架

### 2.1 Extension ユニットテスト / Extension 单元测试

#### Decision: **@vscode/test-cli + Mocha (Jest Mocks for VSCode API)**

#### Rationale: / 选择理由：
- **公式推奨**: VSCode 公式ドキュメントが `@vscode/test-cli` と `@vscode/test-electron` を推奨
  - **官方推荐**：VS Code 官方文档推荐使用 `@vscode/test-cli` 和 `@vscode/test-electron`。
- **VSCode API モック**: Jest Manual Mocks で vscode モジュールをモックするパターンが確立されている
  - **VS Code API 模拟**：使用 Jest Manual Mocks 模拟 `vscode` 模块的模式已经非常成熟。
- **内部実装**: Mocha を使用するが、任意のテストフレームワークに置き換え可能
  - **内部实现**：虽然默认使用 Mocha，但可以替换为任何测试框架。
- **セットアップの簡易性**: 低（3-5分）、`.vscode-test.js` 設定ファイルを作成するだけ
  - **设置简便性**：低（3-5 分钟），只需创建 `.vscode-test.js` 配置文件。

（Extension 单元测试方案的中文说明）  
这里选择 `@vscode/test-cli + Mocha` 作为扩展侧的单元测试方案：  
- 与官方推荐保持一致，长期维护风险更小  
- 通过 Jest Mock 可以对 `vscode` 模块做细粒度模拟  
- 配置简单，只需少量脚本与配置文件即可集成到现有项目

#### Vitest が非推奨な理由: / 不推荐使用 Vitest 的原因：
1. vscode 仮想モジュールのモッキングが困難（GitHub Issue #993 で報告）
   - `vscode` 虚拟模块的模拟非常困难（GitHub Issue #993 已报告）。
2. Extension Host でのテスト実行に適切でない
   - 不适合在 Extension Host 中执行测试。
3. vscode API は Node.js 環境でのみ利用可能（ブラウザ環境ではない）
   - `vscode` API 仅在 Node.js 环境中可用（非浏览器环境）。
4. Webview（React）テスト用には優秀だが、Extension Host 用には不適切
   - 虽然对于 Webview (React) 测试非常优秀，但不适合 Extension Host 测试。

#### Setup Example: / 设置示例：

```javascript
// .vscode-test.js
const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({
  files: 'out/test/**/*.test.js',
  workspaceFolder: './test-fixtures',
  mocha: {
    timeout: 10000,
    require: ['ts-node/register'],
    spec: ['out/test/**/*.test.js']
  }
});
```

---

### 2.2 E2E テスト / E2E 测试

#### Decision: **WebdriverIO + wdio-vscode-service**

#### Rationale: / 选择理由：
- **Webview 対応**: React Webview のテストに対応（プロジェクトの重要要件）
  - **支持 Webview**：支持对 React Webview 进行测试（项目的重要需求）。
- **複雑な UI 操作**: ドラッグ&ドロップ、複数ノードの操作をサポート
  - **复杂 UI 操作**：支持拖拽、多节点操作等。
- **Extension Host API アクセス**: UI 自動化と API 呼び出しの両方が可能
  - **访问 Extension Host API**：可以同时进行 UI 自动化和 API 调用。
- **クロスプラットフォーム**: Linux/macOS/Windows をネイティブサポート
  - **跨平台**：原生支持 Linux/macOS/Windows。
- **セットアップの複雑さ**: 中程度（15-30分）
  - **设置复杂度**：中等（15-30 分钟）。

#### Alternatives Considered: / 备选方案：

| フレームワーク / 框架 | Webview対応 / 支持 Webview | API利用 / 支持 API | セットアップ / 设置 | 推奨度 / 推荐度 |
|---|---|---|---|---|
| **WebdriverIO** | ✅ | ✅ | 中 | ⭐⭐⭐⭐⭐ |
| @vscode/test-electron | ❌ | ✅ | 低 | ⭐⭐ |
| Playwright | ✅ | ⚠️ | 低 | ⭐⭐ |
| vscode-extension-tester | ✅ | ✅ | 高 | ⭐⭐⭐ |

**Playwright が非推奨な理由**: VSCode 拡張用の公式サポートなし、Webview 統合が限定的
- **不推荐 Playwright 的原因**：缺乏对 VS Code 扩展的官方支持，Webview 集成有限。

**vscode-extension-tester が次点の理由**: セットアップが複雑、保守性がやや低い
- **vscode-extension-tester 作为备选的原因**：设置复杂，维护性略低。

#### Setup Example:

```typescript
// wdio.conf.ts
import { wdioVscode } from 'wdio-vscode-service';

exports.config = {
  runner: 'local',
  port: 4444,
  specs: ['./e2e/**/*.test.ts'],
  services: [wdioVscode],
  framework: 'mocha',
  mochaOpts: {
    timeout: 30000
  }
};
```

---

### 2.3 推奨テストアーキテクチャ（テストピラミッド） / 推荐测试架构（测试金字塔）

```
         ┌─────────────────────────────────┐
         │  E2E テスト / E2E 测试           │
         │  (WebdriverIO + React)          │
         │  - Webview UI操作               │
         │  - ユーザーフロー全体 / 完整用户流 │
         │  テスト数: 少数 / 测试数量：少量    │
         ├─────────────────────────────────┤
         │  統合テスト / 集成测试            │
         │  (@vscode/test-cli + Mocha)    │
         │  - Extension Host機能           │
         │  - VS Code API統合 / 集成        │
         │  テスト数: 中程度 / 测试数量：中等  │
         ├─────────────────────────────────┤
         │  ユニットテスト / 单元测试         │
         │  (Vitest + React Testing Lib)  │
         │  - React Webviewコンポーネント   │
         │  - ビジネスロジック関数 / 业务逻辑函数│
         │  テスト数: 多数 / 测试数量：大量    │
         └─────────────────────────────────┘
```

**Test Scripts (package.json)**:

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:unit": "vitest --run",
    "test:integration": "vscode-test",
    "test:e2e": "wdio run wdio.conf.ts",
    "test:watch": "vitest watch"
  }
}
```

---

## 3. React Flow ベストプラクティス / React Flow 最佳实践

### 3.1 パフォーマンス最適化（50ノード目標） / 性能优化（50 节点目标）

#### 優先度順の重要テクニック: / 按优先级排序的重要技术：

| テクニック / 技术 | FPS 影響 / 影响 | 実装難易度 / 难度 | 説明 / 说明 |
|-----------|---------|-----------|------|
| **Memoization** | 10→60 FPS | 低 | `React.memo` でカスタムノード/エッジをラップ、`useCallback` で関数をメモ化 / 使用 `React.memo` 包装自定义节点/边，使用 `useCallback` 记忆化函数 |
| **State 分離** | 30→50 FPS | 低 | `selectedNodeIds` を別フィールドで管理、全 `nodes` 配列への不要なアクセスを回避 / 在独立字段中管理 `selectedNodeIds`，避免不必要地访问整个 `nodes` 数组 |
| **Props オブジェクト** | 45→55 FPS | 低 | `useMemo` で `defaultEdgeOptions`, `snapGrid` をメモ化 / 使用 `useMemo` 记忆化 `defaultEdgeOptions`, `snapGrid` |
| **Grid Snapping** | 50→55 FPS | 低 | `snapToGrid` 有効化でドラッグ中の更新頻度を削減 / 启用 `snapToGrid` 以减少拖拽过程中的更新频率 |
| **CSS 簡素化** | 55→60 FPS | 中 | アニメーション、影、グラデーションを削減 / 减少动画、阴影和渐变 |
| **Progressive Disclosure** | 55→60 FPS | 高 | `hidden` プロパティで動的に非表示、初期表示ノード数を削減 / 使用 `hidden` 属性动态隐藏，减少初始显示的节点数 |

#### 重要実装パターン: / 重要实现模式：

```typescript
// ❌ Bad: nodeTypes を毎レンダリングで再作成 / 每次渲染都重新创建 nodeTypes
<ReactFlow nodeTypes={{ subAgent: SubAgentNode }} />

// ✅ Good: コンポーネント外で定義 / 在组件外部定义
const nodeTypes: NodeTypes = {
  subAgent: SubAgentNode,
  askUserQuestion: AskUserQuestionNode
};

<ReactFlow nodeTypes={nodeTypes} />

// ❌ Bad: インライン関数 / 内联函数
<ReactFlow onConnect={(connection) => addEdge(connection)} />

// ✅ Good: useCallback でメモ化 / 使用 useCallback 记忆化
const onConnect = useCallback((connection) => addEdge(connection), []);
<ReactFlow onConnect={onConnect} />
```

**目標**: すべてのテクニックを組み合わせることで、50ノードで滑らかな 60 FPS を達成可能。
- **目标**：通过结合所有这些技术，可以在 50 个节点的情况下实现流畅的 60 FPS。

（性能优化部分的中文说明）  
通过对节点组件进行 memo 化、拆分状态、减少不必要的重渲染，以及合理使用 React Flow 的配置选项，可以在 50 个节点规模下保持接近 60 FPS 的交互体验。

---

### 3.2 カスタムノード実装パターン / 自定义节点实现模式

#### TypeScript 型定義 / 类型定义:

```typescript
import { Node, NodeProps } from 'reactflow';

type SubAgentData = {
  description: string;  // Sub-Agentの目的説明 / Sub-Agent 目的说明
  prompt: string;       // システムプロンプト / 系统提示词
  tools?: string;       // カンマ区切りツールリスト / 逗号分隔的工具列表
  model?: 'sonnet' | 'opus' | 'haiku';  // 実行モデル / 执行模型
  outputPorts: number;  // 1 (通常は単一出力) / 1 (通常为单个输出)
};

type AskUserQuestionData = {
  questionText: string;
  variableOptions: string[];
  outputPorts: number; // 2-4 branches / 2-4 分支
};

type SubAgentNode = Node<SubAgentData, 'subAgent'>;
type AskUserQuestionNode = Node<AskUserQuestionData, 'askUserQuestion'>;
type WorkflowNode = SubAgentNode | AskUserQuestionNode;
```

#### Component 実装 / 组件实现:

```typescript
export const SubAgentNode: React.FC<NodeProps<SubAgentNode>> = ({
  data,
  id,
  selected
}) => {
  return (
    <div className={`node ${selected ? 'selected' : ''}`}>
      <div className="node-header">Sub-Agent</div>
      <div className="node-description">{data.description}</div>
      <Handle type="target" position={Position.Top} id="input" />
      <Handle type="source" position={Position.Bottom} id="output" />
    </div>
  );
};
```

#### ベストプラクティス / 最佳实践:

1. **ドラッグ競合の防止 / 防止拖拽冲突**: インタラクティブ要素に `nodrag` クラスを追加
   - 在交互元素上添加 `nodrag` 类。
   ```jsx
   <input className="nodrag" onChange={handleChange} />
   ```

2. **Handle による接続 / 通过 Handle 连接**: 接続ポイントに Handle を使用
   - 在连接点使用 Handle。
   ```jsx
   <Handle type="target" position={Position.Top} id="input" />
   <Handle type="source" position={Position.Bottom} id="output-0" />
   ```

3. **ノードタイプ登録 / 节点类型注册**:
   ```typescript
   const nodeTypes: NodeTypes = {
     subAgent: SubAgentNode,
     askUserQuestion: AskUserQuestionNode
   };
   ```

---

### 3.3 動的ポート処理（可変 2-4 分岐） / 动态端口处理（2–4 可变分支）

#### `useUpdateNodeInternals` を使用した実装 / 使用 `useUpdateNodeInternals` 的实现:

```typescript
import { useUpdateNodeInternals } from 'reactflow';

export const BranchingNode: React.FC<NodeProps<WorkflowNode>> = ({
  data,
  id
}) => {
  const [portCount, setPortCount] = useState(data.outputPorts || 2);
  const updateNodeInternals = useUpdateNodeInternals();

  // ポート数変更時に React Flow の内部計算を更新 / 端口数变化时更新 React Flow 内部计算
  useEffect(() => {
    updateNodeInternals(id);
  }, [portCount, id, updateNodeInternals]);

  const addPort = () => {
    if (portCount < 4) setPortCount(prev => prev + 1);
  };

  const removePort = () => {
    if (portCount > 2) setPortCount(prev => prev - 1);
  };

  return (
    <div className="branching-node">
      <div className="node-header">{data.questionText}</div>

      {/* 動的な出力ハンドルの描画 / 渲染动态输出端口 */}
      <div className="output-ports">
        {Array.from({ length: portCount }).map((_, i) => (
          <Handle
            key={`port-${i}`}
            id={`branch-${i}`}
            type="source"
            position={Position.Right}
            style={{ top: `${30 + i * 40}px` }}
          />
        ))}
      </div>

      <div className="port-controls">
        <button onClick={addPort} disabled={portCount >= 4}>+</button>
        <button onClick={removePort} disabled={portCount <= 2}>-</button>
      </div>

      <Handle type="target" position={Position.Top} id="input" />
    </div>
  );
};
```

#### 条件分岐の重要パターン / 条件分支的重要模式:

1. **複数のソースハンドル / 多个源端口**: 各分岐/出力ポートに1つのハンドル
   - 每个分支/输出端口对应一个 Handle。
2. **ハンドル ID によるデータ分離 / 通过端口 ID 分离数据**:
   - 使用 Handle ID 来区分不同路径的数据。
   ```typescript
   {
     id: 'node-1',
     data: {
       values: {
         'branch-0': dataForPath1,
         'branch-1': dataForPath2,
         'branch-2': null, // 未使用分岐は null / 未使用的分支为 null
         'branch-3': null
       }
     }
   }
   ```
3. **Null を停止信号として使用 / 使用 Null 作为停止信号**: null/undefined を受信した下流ノードは処理を行わない
   - 收到 null/undefined 的下游节点不进行处理。
4. **ユニークなハンドル ID / 唯一的端口 ID**: 各ハンドルは一意な ID を持つ（`branch-0`, `branch-1` など）
   - 每个 Handle 都有唯一的 ID（如 `branch-0`, `branch-1`）。

---

### 3.4 Zustand との状態管理統合 / 与 Zustand 的状态管理集成

#### Store アーキテクチャ / Store 架构:

```typescript
import { create } from 'zustand';
import {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge
} from 'reactflow';

type WorkflowStore = {
  // State / 状态
  nodes: WorkflowNode[];
  edges: Edge[];

  // Change handlers / 变更处理程序
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  // Setters / 设置器
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: Edge[]) => void;

  // Custom domain actions / 自定义领域动作
  updateNodeData: (nodeId: string, data: Partial<any>) => void;
  updateNodePorts: (nodeId: string, portCount: number) => void;
};

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [],
  edges: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (connection) =>
    set({ edges: addEdge(connection, get().edges) }),

  updateNodeData: (nodeId: string, data: Partial<any>) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    });
  },

  updateNodePorts: (nodeId: string, portCount: number) => {
    get().updateNodeData(nodeId, { outputPorts: portCount });
  }
}));
```

#### Component での使用 / 在组件中使用:

```typescript
// メイン ReactFlow コンポーネント / 主 ReactFlow 组件
export const WorkflowEditor = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useWorkflowStore();

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
    />
  );
};

// カスタムノード内 / 在自定义节点内
export const SubAgentNode: React.FC<NodeProps<SubAgentNode>> = (props) => {
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);

  const handleDescriptionChange = (newDescription: string) => {
    updateNodeData(props.id, { description: newDescription });
  };

  return <div>{/* Node content */}</div>;
};
```

---

## 4. コードフォーマット・リンター / 代码格式化与 Lint

### Decision: **Biome**

### Rationale: / 选择理由：
- **統合ツール**: ESLint + Prettier の機能を1つのツールで実現（設定ファイルの簡素化）
  - **一体化工具**：在一个工具中实现 ESLint + Prettier 的功能（简化配置文件）。
- **高速パフォーマンス**: Rustで実装され、ESLint + Prettierの組み合わせより約35倍高速
  - **高性能**：使用 Rust 实现，比 ESLint + Prettier 的组合快约 35 倍。
- **ゼロコンフィグ**: デフォルト設定で即座に使用可能、追加設定は `biome.json` 1ファイル
  - **零配置**：默认设置即可开箱即用，额外配置只需一个 `biome.json` 文件。
- **VSCode統合**: 公式VSCode拡張機能でシームレスな統合
  - **VS Code 集成**：通过官方 VS Code 扩展实现无缝集成。
- **TypeScript対応**: ネイティブTypeScriptサポート、追加プラグイン不要
  - **TypeScript 支持**：原生支持 TypeScript，无需额外插件。

（选择 Biome 的中文说明）
Biome 作为 ESLint + Prettier 的一体化替代方案，能用单一配置文件覆盖格式化与 Lint 需求，同时在性能上远优于传统组合，非常适合需要频繁保存与重格式化的前端项目。

### Alternatives Considered: / 备选方案：

| ツール / 工具 | 長所 / 优点 | 短所 / 缺点 |
|---------|------|------|
| **ESLint + Prettier** | 成熟、豊富なプラグイン、コミュニティサポート / 成熟、插件丰富、社区支持广泛 | 2つのツールの設定・管理、遅い、設定の複雑さ / 需要管理两个工具、速度慢、配置复杂 |
| **dprint** | 高速（Rust製）、複数言語対応 / 极速（Rust 实现）、支持多种语言 | ESLintのようなリンティング機能なし、コミュニティ小さい / 缺乏类似 ESLint 的 Lint 功能、社区较小 |
| **Rome (archived)** | 高速、統合ツール / 高速、一体化工具 | プロジェクト終了（Biomeに移行） / 项目已停止（已迁移至 Biome） |

### Setup: / 安装设置：

```bash
# インストール
npm install --save-dev --save-exact @biomejs/biome

# 初期化
npx @biomejs/biome init
```

### Configuration (`biome.json`):

```json
{
  "$schema": "https://biomejs.dev/schemas/1.4.1/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noExtraBooleanCast": "error",
        "noMultipleSpacesInRegularExpressionLiterals": "error",
        "noUselessCatch": "error",
        "noUselessConstructor": "error",
        "noUselessLoneBlockStatements": "error",
        "noUselessRename": "error",
        "noWith": "error"
      },
      "correctness": {
        "noUnusedVariables": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingComma": "es5",
      "semicolons": "always"
    }
  }
}
```

### VSCode Integration:

`.vscode/settings.json`:
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

### NPM Scripts:

```json
{
  "scripts": {
    "lint": "biome lint .",
    "format": "biome format --write .",
    "check": "biome check --apply ."
  }
}
```

---

## 5. 主要な参考リソース / 主要参考资源

### VSCode Extension Testing:
- 公式 VSCode API: https://code.visualstudio.com/api/working-with-extensions/testing-extension
- @vscode/test-cli: https://github.com/microsoft/vscode-test
- WebdriverIO VSCode Service: https://webdriver.io/docs/wdio-vscode-service/

### React Flow:
- 公式ドキュメント: https://reactflow.dev/
- カスタムノード: https://reactflow.dev/learn/customization/custom-nodes
- パフォーマンス最適化: https://reactflow.dev/learn/advanced-use/performance

### Zustand:
- 公式ドキュメント: https://zustand-demo.pmnd.rs/
- TypeScript ガイド: https://docs.pmnd.rs/zustand/guides/typescript

### VSCode Webview:
- Webview API: https://code.visualstudio.com/api/extension-guides/webview
- Webview UI Toolkit: https://microsoft.github.io/vscode-webview-ui-toolkit/

### Biome:
- 公式ドキュメント: https://biomejs.dev/
- VSCode拡張機能: https://marketplace.visualstudio.com/items?itemName=biomejs.biome
- 設定リファレンス: https://biomejs.dev/reference/configuration/

---

## 6. 実装チェックリスト

## 6. 实现检查清单

### Phase 0 完了項目:
- [x] 状態管理ライブラリ選定（Zustand）
- [x] Extension テストフレームワーク選定（@vscode/test-cli + Mocha）
- [x] E2E テストフレームワーク選定（WebdriverIO）
- [x] コードフォーマット・リンター選定（Biome）
- [x] React Flow パフォーマンス最適化手法の調査
- [x] 動的ポート実装パターンの調査

### 次のステップ (Phase 1):
- [ ] data-model.md の作成（エンティティ定義）
- [ ] contracts/ の作成（API 契約定義）
- [ ] quickstart.md の作成（開発環境セットアップ手順）
- [ ] agent-specific context の更新

---

## 6. Technical Context の更新

以下の「NEEDS CLARIFICATION」項目が解決されました:

| 項目 | 決定内容 |
|------|---------|
| 状態管理ライブラリ | **Zustand** |
| Extension テスト | **@vscode/test-cli + Mocha** (Jest Mocks for VSCode API) |
| E2E テスト | **WebdriverIO + wdio-vscode-service** |

これらの調査結果は plan.md の Technical Context セクションに反映されます。
