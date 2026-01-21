# Task List: Claude Code Workflow Studio / 任务列表：Claude Code Workflow Studio

**Input / 输入**: `/specs/001-cc-wf-studio/` の設計ドキュメント / 设计文档
**Prerequisites / 前提条件**: plan.md, spec.md, research.md, data-model.md, contracts/

**Structure / 结构**: タスクはユーザーストーリーごとにグループ化され、各ストーリーを独立して実装・テストできるようにしています。 / 任务按用户故事分组，确保每个故事都可以独立实现和测试。

**⚠️ IMPORTANT: Task Completion / 重要：任务完成时的注意事项**
- タスクを完了したら、必ずこのファイル上でチェックボックスを `- [X]` にマークすること / 任务完成后，请务必在此文件中将复选框标记为 `- [X]`
- 各タスク完了後、進捗を記録し、次のタスクに進む前に確認すること / 每项任务完成后，请记录进度，并在继续下一项任务前进行确认

## Format: `[ID] [P?] [Story] Description` / 格式：`[ID] [P?] [故事] 描述`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし） / 可并行执行（不同文件，无依赖关系）
- **[Story]**: このタスクが属するユーザーストーリー（例: US1, US2） / 该任务所属的用户故事（例如：US1, US2）
- 説明に正確なファイルパスを含める / 描述中需包含准确的文件路径

---

## Phase 1: Setup (Common Infrastructure) / 第 1 阶段：环境搭建（公共基础）

**Objective / 目的**: プロジェクトの初期化と基本構造 / 项目初始化与基本结构

- [X] T001 プロジェクト構造を作成 (src/extension/, src/webview/, src/shared/, tests/ ディレクトリ) / 创建项目结构（src/extension/, src/webview/, src/shared/, tests/ 目录）
- [X] T002 Extension Host用のTypeScriptプロジェクトを初期化 (tsconfig.json) / 初始化扩展宿主（Extension Host）的 TypeScript 项目 (tsconfig.json)
- [X] T003 [P] src/webview/にReact + TypeScript + Viteプロジェクトを初期化 / 在 src/webview/ 中初始化 React + TypeScript + Vite 项目
- [X] T004 [P] Extension依存関係をインストール: package.jsonに@types/vscode, @types/nodeを追加 / 安装扩展依赖：在 package.json 中添加 @types/vscode, @types/node
- [X] T005 [P] Webview依存関係をインストール: src/webview/package.jsonにreact, react-dom, reactflow, zustand, @types/reactを追加 / 安装 Webview 依赖：在 src/webview/package.json 中添加 react, react-dom, reactflow, zustand, @types/react
- [X] T006 [P] biome.jsonでBiomeを設定（コードフォーマット・リンター） / 在 biome.json 中配置 Biome（代码格式化与 Linter）
- [X] T007 package.jsonに拡張機能メタデータを作成 (name: cc-wf-studio, displayName, publisher, activationEvents) / 在 package.json 中创建扩展元数据 (name: cc-wf-studio, displayName, publisher, activationEvents)
- [X] T008 Extension Development Hostデバッグ用に.vscode/launch.jsonを作成 / 为扩展开发宿主（Extension Development Host）调试创建 .vscode/launch.json
- [X] T009 コンパイルとウォッチタスク用に.vscode/tasks.jsonを作成 / 为编译和监听任务创建 .vscode/tasks.json

---

## Phase 2: Foundation (Blocking Prerequisites) / 第 2 阶段：基础构建（阻塞性前提条件）

**Objective / 目的**: すべてのユーザーストーリーの実装前に完了が必須なコアインフラ / 在实现所有用户故事之前必须完成的核心基础设施

**⚠️ IMPORTANT / 重要**: このフェーズが完了するまで、ユーザーストーリーの作業は開始できません / 在此阶段完成之前，无法开始用户故事的工作

- [X] T010 src/shared/types/workflow-definition.tsに共通型定義を作成 (data-model.mdのWorkflow, WorkflowNode, Connection, Sub-AgentNode, AskUserQuestionNode型) / 在 src/shared/types/workflow-definition.ts 中创建通用类型定义 (data-model.md 中的 Workflow, WorkflowNode, Connection, Sub-AgentNode, AskUserQuestionNode 类型)
- [X] T011 [P] src/shared/types/messages.tsに共通メッセージ型を作成 (extension-webview-api.mdのMessage, ExtensionMessage, WebviewMessage, すべてのpayload型) / 在 src/shared/types/messages.ts 中创建通用消息类型 (extension-webview-api.md 中的 Message, ExtensionMessage, WebviewMessage 以及所有 payload 类型)
- [X] T012 [P] src/extension/extension.tsに拡張機能のアクティベーションを実装 (activate, deactivate関数) / 在 src/extension/extension.ts 中实现扩展的激活 (activate, deactivate 函数)
- [X] T013 [P] src/webview/src/stores/workflow-store.tsにZustandストアを作成 (research.md section 3.4のnodes, edges, onNodesChange, onEdgesChange, onConnect) / 在 src/webview/src/stores/workflow-store.ts 中创建 Zustand Store (research.md 第 3.4 节中的 nodes, edges, onNodesChange, onEdgesChange, onConnect)
- [X] T014 src/extension/webview-content.tsにWebview HTMLジェネレーターを実装 (vscode-extension-api.md section 4.2のgetWebviewContent: CSP, nonce, resource URIs) / 在 src/extension/webview-content.ts 中实现 Webview HTML 生成器 (vscode-extension-api.md 第 4.2 节中的 getWebviewContent: CSP, nonce, resource URIs)
- [X] T015 src/webview/vite.config.tsでViteビルド設定をセットアップ (dist/webview/への出力、ライブラリモード無効、Reactプラグイン) / 在 src/webview/vite.config.ts 中设置 Vite 构建配置 (输出到 dist/webview/、禁用库模式、React 插件)
- [X] T016 src/webview/src/main.tsxに基本Reactコンポーネント構造を作成 (React 18ルート、VSCode API取得) / 在 src/webview/src/main.tsx 中创建基础 React 组件结构 (React 18 根节点、获取 VSCode API)

**Checkpoint / 检查点**: 基盤完成 - ユーザーストーリーの実装を並列で開始可能 / 基础构建完成 - 可以并行开始用户故事的实现

---

## Phase 3: User Story 1 - Visual Workflow Editor (Priority: P1) 🎯 MVP / 第 3 阶段：用户故事 1 - 可视化工作流编辑器 (优先级: P1) 🎯 MVP

**Goal / 目标**: VSCode上でビジュアルエディタを開き、Sub-AgentノードとAskUserQuestionノードをドラッグ&ドロップで配置・接続し、ワークフローを作成できる / 在 VSCode 中打开可视化编辑器，通过拖放方式放置并连接子智能体节点和用户提问节点，从而创建工作流

**Independent Testing / 独立测试**: VSCode拡張機能をインストール後、コマンドパレットから「Claude Code Workflow Studio」を開き、新規ワークフローを作成。Sub-Agentノードを1つ配置して保存できることを確認すれば、基本的なエディタ機能が動作していると検証できる。 / 安装 VSCode 扩展后，从命令面板打开 "Claude Code Workflow Studio" 并创建新工作流。确认可以放置一个子智能体节点并保存，即可验证基础编辑器功能是否正常运行。

### User Story 1 Implementation / 用户故事 1 的实现

#### Commands & Extension Host Core / 命令与扩展宿主核心

- [X] T017 [P] [US1] src/extension/commands/open-editor.tsにopenEditorコマンドを登録 (vscode-extension-api.md section 1.1のvscode.commands.registerCommandとcreateWebviewPanel) / 在 src/extension/commands/open-editor.ts 中注册 openEditor 命令 (vscode-extension-api.md 第 1.1 节中的 vscode.commands.registerCommand 和 createWebviewPanel)
- [X] T018 [P] [US1] src/extension/commands/save-workflow.tsにsaveWorkflowコマンドを登録 (SAVE_WORKFLOWメッセージ処理、.vscode/workflows/への書き込み) / 在 src/extension/commands/save-workflow.ts 中注册 saveWorkflow 命令 (处理 SAVE_WORKFLOW 消息、写入 .vscode/workflows/)
- [X] T019 [P] [US1] src/extension/services/file-service.tsにファイルサービスを実装 (vscode-extension-api.md section 2のvscode.workspace.fs APIを使用したreadFile, writeFile, createDirectory, ensureWorkflowsDirectory) / 在 src/extension/services/file-service.ts 中实现文件服务 (使用 vscode-extension-api.md 第 2 节中的 vscode.workspace.fs API 进行 readFile, writeFile, createDirectory, ensureWorkflowsDirectory)

#### Webview UI - React Flow Canvas / Webview UI - React Flow 画布

- [X] T020 [US1] src/webview/src/components/WorkflowEditor.tsxにWorkflowEditorコンポーネントを作成 (research.md section 3.4のnodeTypes, edgeTypes, ストア統合を持つReactFlowコンポーネント) / 在 src/webview/src/components/WorkflowEditor.tsx 中创建 WorkflowEditor 组件 (具有 research.md 第 3.4 节中的 nodeTypes, edgeTypes 及 Store 集成的 ReactFlow 组件)
- [X] T021 [P] [US1] src/webview/src/components/nodes/Sub-AgentNode.tsxにSub-AgentNodeコンポーネントを作成 (NodeProps<Sub-AgentNode>, 入出力用Handle, research.md section 3.2) / 在 src/webview/src/components/nodes/Sub-AgentNode.tsx 中创建 Sub-AgentNode 组件 (NodeProps<Sub-AgentNode>、输入输出 Handle、research.md 第 3.2 节)
- [X] T022 [P] [US1] src/webview/src/components/nodes/AskUserQuestionNode.tsxにAskUserQuestionNodeコンポーネントを作成 (動的2-4分岐ポート、research.md section 3.3のuseUpdateNodeInternals) / 在 src/webview/src/components/nodes/AskUserQuestionNode.tsx 中创建 AskUserQuestionNode 组件 (动态 2-4 分支端口、research.md 第 3.3 节中的 useUpdateNodeInternals)
- [X] T023 [US1] src/webview/src/components/WorkflowEditor.tsxでノードタイプを登録 (research.md section 3.1のagentSkillとaskUserQuestionを持つnodeTypesオブジェクト、コンポーネント外でメモ化) / 在 src/webview/src/components/WorkflowEditor.tsx 中注册节点类型 (包含 research.md 第 3.1 节中的 agentSkill 和 askUserQuestion 的 nodeTypes 对象，在组件外进行 Memoization)

#### Webview UI - Side Panel / Webview UI - 侧边栏面板

- [X] T024 [P] [US1] src/webview/src/components/NodePalette.tsxにNodePaletteコンポーネントを作成 (Sub-AgentとAskUserQuestionのドラッグ可能なノードテンプレート) / 在 src/webview/src/components/NodePalette.tsx 中创建 NodePalette 组件 (包含子智能体和用户提问的可拖拽节点模板)
- [X] T025 [P] [US1] src/webview/src/components/PropertyPanel.tsxにPropertyPanelコンポーネントを作成 (選択されたノードのプロパティ表示、nameとprompt/questionTextの編集、変更時にストア更新) / 在 src/webview/src/components/PropertyPanel.tsx 中创建 PropertyPanel 组件 (显示选中节点的属性、编辑名称和提示词/问题文本、变更时更新 Store)
- [X] T026 [US1] src/webview/src/App.tsxにレイアウトを実装 (3カラムレイアウト: NodePalette, WorkflowEditor, PropertyPanel) / 在 src/webview/src/App.tsx 中实现布局 (三栏布局：NodePalette, WorkflowEditor, PropertyPanel)

#### Extension-Webview Communication / 扩展与 Webview 间通信

- [X] T027 [US1] src/extension/extension.tsにメッセージハンドラを実装 (extension-webview-api.md section 2のSAVE_WORKFLOW, STATE_UPDATE用panel.webview.onDidReceiveMessage) / 在 src/extension/extension.ts 中实现消息处理器 (处理 extension-webview-api.md 第 2 节中的 SAVE_WORKFLOW, STATE_UPDATE 的 panel.webview.onDidReceiveMessage)
- [X] T028 [P] [US1] src/webview/src/services/vscode-bridge.tsにVSCodeブリッジサービスを作成 (extension-webview-api.md section 3のpostMessageラッパー、requestIdパターンを持つsaveWorkflow関数) / 在 src/webview/src/services/vscode-bridge.ts 中创建 VSCode 桥接服务 (extension-webview-api.md 第 3 节中的 postMessage 封装、具有 requestId 模式的 saveWorkflow 函数)

#### Workflow Persistence / 工作流持久化

- [X] T029 [US1] src/webview/src/services/workflow-service.tsにワークフローシリアライゼーションを実装 (React Flow状態をWorkflow定義に変換、data-model.md section 1に対するバリデーション) / 在 src/webview/src/services/workflow-service.ts 中实现工作流序列化 (将 React Flow 状态转换为工作流定义、针对 data-model.md 第 1 节进行验证)
- [X] T030 [US1] src/webview/src/services/workflow-service.tsにワークフローデシリアライゼーションを実装 (JSONからWorkflowを読み込み、React Flow状態に変換) / 在 src/webview/src/services/workflow-service.ts 中实现工作流反序列化 (从 JSON 读取工作流并转换为 React Flow 状态)
- [X] T031 [US1] src/extension/commands/save-workflow.tsに保存ロジックを追加 (ワークフロー名のバリデーション、ディレクトリの存在確認、data-model.md section 3.1の2スペースインデントでJSON書き込み) / 在 src/extension/commands/save-workflow.ts 中添加保存逻辑 (验证工作流名称、确认目录存在、按照 data-model.md 第 3.1 节以 2 空格缩进写入 JSON)

#### UI Refinement & Performance / UI 精细化与性能优化

- [X] T032 [P] [US1] src/webview/src/components/WorkflowEditor.tsxにReact Flowパフォーマンス最適化を適用 (research.md section 3.1のカスタムノード用React.memo、ハンドラ用useCallback、nodeTypes/edgeTypes用useMemo) / 在 src/webview/src/components/WorkflowEditor.tsx 中应用 React Flow 性能优化 (research.md 第 3.1 节中用于自定义节点的 React.memo、用于处理程序的 useCallback、用于 nodeTypes/edgeTypes 的 useMemo)
- [X] T033 [P] [US1] src/webview/src/styles/main.cssにCSSスタイリングを追加 (plan.md Constitution Check IIIのVSCode Webview UI Toolkitスタイル、ノードビジュアルデザイン) / 在 src/webview/src/styles/main.css 中添加 CSS 样式 (plan.md Constitution Check III 中的 VSCode Webview UI Toolkit 样式、节点视觉设计)
- [ ] T034 [US1] src/webview/src/components/WorkflowEditor.tsxにキーボードショートカットを実装 (plan.md UX一貫性のノード選択用Tab/Enter/Arrowキー) - **MVPでは不要と判断** / 在 src/webview/src/components/WorkflowEditor.tsx 中实现键盘快捷键 (plan.md UX 一致性中的用于节点选择的 Tab/Enter/方向键) - **判定为 MVP 不需要**

#### Error Handling & Validation / 错误处理与验证

- [X] T035 [US1] src/extension/services/workflow-service.tsにワークフローバリデーションを追加 (data-model.md section 5の名前フォーマット、最大50ノード、接続の妥当性) - **完了: ロジック実装済み、UIからの呼び出しも実装済み** / 在 src/extension/services/workflow-service.ts 中添加工作流验证 (data-model.md 第 5 节中的名称格式、最大 50 个节点、连接的有效性) - **已完成：逻辑已实现，UI 调用也已实现**
- [X] T036 [US1] src/webview/src/components/ErrorNotification.tsxにエラーメッセージ表示を実装 (extension-webview-api.md section 1.4のextensionからのERRORメッセージ表示、コード固有のスタイリング) / 在 src/webview/src/components/ErrorNotification.tsx 中实现错误消息显示 (显示来自 extension-webview-api.md 第 1.4 节中扩展端的 ERROR 消息、代码特定样式)

**Checkpoint / 检查点**: この時点でユーザーストーリー1は完全に機能し、独立してテスト可能 - ユーザーはノードを持つワークフローを作成し、接続し、.vscode/workflows/*.jsonに保存できる / 此时用户故事 1 已完全可用且可独立测试 - 用户可以创建带有节点的工作流，进行连接，并保存到 .vscode/workflows/*.json 中

---

## Phase 4: User Story 2 - Export Workflow as .claude Configurations (Priority: P2) / 第 4 阶段：用户故事 2 - 将工作流导出为 .claude 配置 (优先级: P2)

**Goal / 目标**: 作成したワークフローを、Claude Codeの設定ファイル形式（.claude/agents/*.md と .claude/commands/*.md）でエクスポートできる / 可以将创建的工作流导出为 Claude Code 的配置文件格式（.claude/agents/*.md 和 .claude/commands/*.md）

**Independent Testing / 独立测试**: シンプルなワークフロー（Sub-Agentノード1つとAskUserQuestionノード1つ）を作成し、「エクスポート」ボタンをクリック。.claude/agents/配下にSub-Agent設定ファイルが生成され、.claude/commands/配下にSlashCommand用のマークダウンファイルが生成されることを確認。生成されたファイルの内容が正しいフォーマットであることを検証すれば完了。 / 创建一个简单的工作流（1 个子智能体节点和 1 个用户提问节点），点击“导出”按钮。确认在 .claude/agents/ 下生成了子智能体配置文件，在 .claude/commands/ 下生成了用于斜杠命令的 Markdown 文件。验证生成的文件内容格式正确即可完成。

### User Story 2 Implementation / 用户故事 2 的实现

#### Export Command & Service / 导出命令与服务

- [X] T037 [P] [US2] src/extension/commands/export-workflow.tsにexportWorkflowコマンドを登録 (EXPORT_WORKFLOWメッセージ処理、ファイル存在チェック、エクスポートサービス呼び出し) / 在 src/extension/commands/export-workflow.ts 中注册 exportWorkflow 命令 (处理 EXPORT_WORKFLOW 消息、文件存在检查、调用导出服务)
- [X] T038 [US2] src/extension/services/export-service.tsにエクスポートサービスを作成 (spec.md Technical SpecificationsのexportWorkflow関数、Workflowを.claude形式に変換) / 在 src/extension/services/export-service.ts 中创建导出服务 (spec.md 技术规范中的 exportWorkflow 函数、将工作流转换为 .claude 格式)

#### Sub-Agent Configuration File Generation / 子智能体配置文件生成

- [X] T039 [P] [US2] src/extension/services/export-service.tsにSubAgentNodeからSub-Agent設定ファイルへのコンバーターを実装 (spec.md section Export Format DetailsのgenerateSubAgentFile関数: name, description, tools, model, promptボディ) / 在 src/extension/services/export-service.ts 中实现从 SubAgentNode 到子智能体配置文件的转换器 (spec.md 导出格式详情节中的 generateSubAgentFile 函数：名称、描述、工具、模型、提示词正文)
- [X] T040 [P] [US2] src/extension/services/export-service.tsにノード名からファイル名へのコンバーターを実装 (spec.mdのtoLowerCase、スペースをハイフンに、例: "Data Analysis" → "data-analysis.md") / 在 src/extension/services/export-service.ts 中实现从节点名到文件名的转换器 (spec.md 中的 toLowerCase、将空格替换为连字符，例如："Data Analysis" -> "data-analysis.md")

#### SlashCommand Generation / 斜杠命令生成

- [X] T041 [US2] src/extension/services/export-service.tsにSlashCommandファイルジェネレーターを実装 (spec.mdのgenerateSlashCommandFile関数: YAML frontmatter, allowed-tools: Task,AskUserQuestion) / 在 src/extension/services/export-service.ts 中实现斜杠命令文件生成器 (spec.md 中的 generateSlashCommandFile 函数：YAML frontmatter, allowed-tools: Task,AskUserQuestion)
- [X] T042 [US2] src/extension/services/export-service.tsにワークフロー実行ロジックジェネレーターを実装 (spec.md section DD-003のTaskツール呼び出しとAskUserQuestion分岐の技術的指示を生成) / 在 src/extension/services/export-service.ts 中实现工作流执行逻辑生成器 (生成 spec.md 第 DD-003 节中关于 Task 工具调用和 AskUserQuestion 分支的技术指令)
- [X] T043 [US2] src/extension/services/export-service.tsにAskUserQuestion分岐ロジックを実装 (data-model.md section 1.4のオプションラベルを下流ノードにマッピング、条件付き実行指示を生成) / 在 src/extension/services/export-service.ts 中实现 AskUserQuestion 分支逻辑 (将 data-model.md 第 1.4 节中的选项标签映射到下游节点、生成条件执行指令)

#### File Conflict Handling / 文件冲突处理

- [X] T044 [US2] src/extension/services/export-service.tsにファイル存在チェックを実装 (vscode-extension-api.md section 2.5のvscode.workspace.fs.statを使用して.claude/agents/*.mdと.claude/commands/*.mdの存在をチェック) / 在 src/extension/services/export-service.ts 中实现文件存在检查 (使用 vscode-extension-api.md 第 2.5 节中的 vscode.workspace.fs.stat 检查 .claude/agents/*.md 和 .claude/commands/*.md 的存在)
- [X] T045 [US2] src/extension/commands/export-workflow.tsに上書き確認ダイアログを追加 (vscode-extension-api.md section 3.3とDD-005の「上書き」と「キャンセル」ボタンを持つvscode.window.showWarningMessage) / 在 src/extension/commands/export-workflow.ts 中添加覆盖确认对话框 (具有 vscode-extension-api.md 第 3.3 节和 DD-005 中提到的“覆盖”和“取消”按钮的 vscode.window.showWarningMessage)
- [X] T046 [US2] src/extension/extension.tsでCONFIRM_OVERWRITEメッセージを処理 (extension-webview-api.md section 2.3のユーザー確認に基づいてエクスポートを継続または中止) - **MVPでは不要と判断（Extension側で直接ダイアログ表示を実装）** / 在 src/extension/extension.ts 中处理 CONFIRM_OVERWRITE 消息 (根据 extension-webview-api.md 第 2.3 节中的用户确认决定继续或中止导出) - **判定为 MVP 不需要（已在扩展端直接实现对话框显示）**

#### Export Webview UI / 导出相关的 Webview UI

- [X] T047 [P] [US2] src/webview/src/components/Toolbar.tsxにエクスポートボタンを追加 (extensionへのEXPORT_WORKFLOWメッセージをトリガー) / 在 src/webview/src/components/Toolbar.tsx 中添加导出按钮 (触发向扩展发送 EXPORT_WORKFLOW 消息)
- [ ] T048 [P] [US2] src/webview/src/components/ExportProgress.tsxにエクスポート進捗インジケーターを作成 (エクスポート状態表示、EXPORT_SUCCESSペイロードからエクスポートされたファイルリストを表示) - **MVPでは不要と判断（Toolbar.tsxで簡易的な進捗表示を実装済み）** / 在 src/webview/src/components/ExportProgress.tsx 中创建导出进度指示器 (显示导出状态、显示来自 EXPORT_SUCCESS payload 的已导出文件列表) - **判定为 MVP 不需要（已在 Toolbar.tsx 中实现简易进度显示）**
- [X] T049 [US2] src/webview/src/services/vscode-bridge.tsにエクスポートワークフロー関数を実装 (extension-webview-api.md section 2.2のrequestIdを持つexportWorkflow、EXPORT_SUCCESSとERRORレスポンスを処理) / 在 src/webview/src/services/vscode-bridge.ts 中实现导出工作流函数 (处理具有 extension-webview-api.md 第 2.2 节中 requestId 的 exportWorkflow、处理 EXPORT_SUCCESS 和 ERROR 响应)

#### Export Validation / 导出验证

- [X] T050 [US2] src/extension/services/export-service.tsに.claudeファイルフォーマットバリデーションを追加 (spec.md NFR-006のYAML frontmatterフォーマット、UTF-8エンコーディングを確保) / 在 src/extension/services/export-service.ts 中添加 .claude 文件格式验证 (确保符合 spec.md NFR-006 中的 YAML frontmatter 格式、UTF-8 编码)
- [X] T051 [US2] src/extension/commands/export-workflow.tsにエクスポート後の検証を追加 (生成されたファイルを読み込み、構造を検証、ファイルリストを含むEXPORT_SUCCESSを送信) / 在 src/extension/commands/export-workflow.ts 中添加导出后验证 (读取生成的文件、验证结构、发送包含文件列表的 EXPORT_SUCCESS)

**Checkpoint / 检查点**: この時点でユーザーストーリー1と2の両方が独立して機能 - ユーザーはビジュアルエディタでワークフローを作成でき、かつClaude Code実行用の.claude形式にエクスポートできる / 此时用户故事 1 和 2 均可独立运行 - 用户既可以在可视化编辑器中创建工作流，也可以将其导出为用于 Claude Code 执行的 .claude 格式

---

## Phase 5: Refinement & Cross-Cutting Concerns / 第 5 阶段：完善与横向关注点

**Objective / 目的**: 複数のユーザーストーリーに影響する改善 / 影响多个用户故事的改进措施

- [ ] T052 [P] src/extension/services/logger.tsに包括的なロギングを追加 (拡張機能ログ用vscode.window.createOutputChannel) / 在 src/extension/services/logger.ts 中添加全面的日志记录 (用于扩展日志的 vscode.window.createOutputChannel)
- [ ] T053 [P] src/extension/services/telemetry.tsにテレメトリーを実装 (ワークフロー作成、保存、エクスポートイベントの追跡 - オプション、プライバシー対応) / 在 src/extension/services/telemetry.ts 中实现遥测 (跟踪工作流创建、保存、导出事件 - 可选，需符合隐私合规)
- [ ] T054 [P] src/extension/services/config-service.tsに設定サポートを追加 (vscode-extension-api.md section 5のvscode.workspace.getConfigurationからcc-wf-studio.workflowsDirectory, cc-wf-studio.exportDirectoryを読み取り) / 在 src/extension/services/config-service.ts 中添加配置支持 (从 vscode-extension-api.md 第 5 节中的 vscode.workspace.getConfiguration 读取 cc-wf-studio.workflowsDirectory, cc-wf-studio.exportDirectory)
- [ ] T055 package.jsonにcontributes.configurationを作成 (vscode-extension-api.md section 5.2のworkflowsDirectory, exportDirectory設定を定義) / 在 package.json 中创建 contributes.configuration (定义 vscode-extension-api.md 第 5.2 节中的 workflowsDirectory, exportDirectory 设置)
- [ ] T056 拡張機能アイコンとREADME.mdを追加 (マーケットプレイスアセット、使用方法) / 添加扩展图标和 README.md (应用商店资产、使用方法)
- [ ] T057 [P] quickstart.mdの検証を実行 (すべてのセットアップ手順が機能することを確認、クリーン環境でテスト) / 执行 quickstart.md 的验证 (确认所有安装步骤均正常工作，在干净环境下测试)
- [X] T058 [P] コードクリーンアップとリファクタリング (Biomeフォーマット適用、デッドコード削除、命名改善) - **完了: lint/formatエラー212個→0個、non-null assertion削除、型安全性向上、アクセシビリティ改善** / 代码清理与重构 (应用 Biome 格式化、删除冗余代码、改进命名) - **已完成：lint/format 错误从 212 个减少到 0 个，删除了非空断言，提高了类型安全性，改善了可访问性**
- [ ] T059 すべてのストーリーでパフォーマンス最適化 (plan.md NFR-001の50ノードパフォーマンス目標を検証、research.md section 3.1の残りの最適化を適用) / 在所有故事中进行性能优化 (验证 plan.md NFR-001 中 50 个节点的性能目标，应用 research.md 第 3.1 节中剩余的优化)
- [ ] T060 アクセシビリティ監査 (plan.md Constitution Check IIIのキーボードナビゲーション、ARIAラベル、スクリーンリーダーサポート) / 可访问性审计 (plan.md Constitution Check III 中的键盘导航、ARIA 标签、屏幕阅读器支持)

---

## Dependencies & Execution Order / 依赖关系与执行顺序

### Phase Dependencies / 阶段依赖关系

- **Setup (Phase 1) / 环境搭建 (第 1 阶段)**: 依存関係なし - すぐに開始可能 / 无依赖关系 - 可立即开始
- **Foundation (Phase 2) / 基础构建 (第 2 阶段)**: セットアップ完了に依存 - すべてのユーザーストーリーをブロック / 依赖于环境搭建的完成 - 阻塞所有用户故事的进展
- **User Story 1 (Phase 3) / 用户故事 1 (第 3 阶段)**: 基盤構築フェーズ完了に依存 / 依赖于基础构建阶段的完成
- **User Story 2 (Phase 4) / 用户故事 2 (第 4 阶段)**: 基盤構築フェーズ完了に依存（チーム能力があればUS1と並列実行可能だが、意味のあるテストにはUS1のワークフロー作成が必要） / 依赖于基础构建阶段的完成（若团队能力允许可与 US1 并行执行，但为了进行有意义的测试，需要先通过 US1 创建工作流）
- **Refinement (Phase 5) / 完善 (第 5 阶段)**: すべての望ましいユーザーストーリーの完了に依存 / 依赖于所有目标用户故事的完成

### User Story Dependencies / 用户故事依赖关系

- **User Story 1 (P1)**: 基盤構築 (Phase 2) 後に開始可能 - 他のストーリーへの依存関係なし / 基础构建 (第 2 阶段) 后可开始 - 对其他故事无依赖关系
- **User Story 2 (P2)**: 基盤構築 (Phase 2) 後に開始可能 - 機能的には独立だが、エンドツーエンドテストにはUS1の恩恵あり（US1でワークフロー作成、US2でエクスポート） / 基础构建 (第 2 阶段) 后可开始 - 功能上独立，但端到端测试受益于 US1（在 US1 中创建工作流，在 US2 中导出）

### Within Each User Story / 各用户故事内部

#### User Story 1:
1. コマンド & Extension Hostコア (T017-T019) を最初に / 首先进行命令与扩展宿主核心 (T017-T019)
2. Webview UIコンポーネントはT016後に並列で進行可能 / Webview UI 组件可在 T016 后并行进行
3. Extension-Webview間通信 (T027-T028) はコマンド後に / 扩展与 Webview 间通信 (T027-T028) 在命令之后进行
4. ワークフロー永続化 (T029-T031) はファイルサービス (T019) 後に / 工作流持久化 (T029-T031) 在文件服务 (T019) 之后进行
5. UI洗練 (T032-T034) はコアコンポーネント後に / UI 精细化 (T032-T034) 在核心组件之后进行
6. エラーハンドリング (T035-T036) を最後に / 最后进行错误处理 (T035-T036)

#### User Story 2:
1. エクスポートサービス基盤 (T037-T038) を最初に / 首先进行导出服务基础 (T037-T038)
2. Sub-Agent設定ファイル生成 (T039-T040) とSlashCommand生成 (T041-T043) を並列実行可能 / 子智能体配置文件生成 (T039-T040) 与斜杠命令生成 (T041-T043) 可并行执行
3. ファイル競合ハンドリング (T044-T046) はエクスポートサービス基盤後に / 文件冲突处理 (T044-T046) 在导出服务基础之后进行
4. Webview UI (T047-T049) はエクスポートサービスと並列実行可能 / Webview UI (T047-T049) 可与导出服务并行执行
5. エクスポートバリデーション (T050-T051) を最後に / 最后进行导出验证 (T050-T051)

### Parallel Opportunities / 并行执行机会

- [P]マークのすべてのセットアップタスクは並列実行可能 (T003-T006) / 带有 [P] 标记的所有环境搭建任务均可并行执行 (T003-T006)
- 基盤構築タスクの[P]マーク (T011, T012, T013) は並列実行可能 / 基础构建任务中带有 [P] 标记的任务 (T011, T012, T013) 可并行执行
- 基盤構築フェーズ完了後、US1とUS2は並列開始可能（US2はテストにUS1の恩恵ありという注意点あり） / 基础构建阶段完成后，US1 和 US2 可并行开始（注意：US2 的测试受益于 US1）
- US1内: T021-T022（ノードコンポーネント）、T024-T025（サイドパネル）、T028、T032-T033は並列実行可能 / US1 内部：T021-T022（节点组件）、T024-T025（侧边栏面板）、T028、T032-T033 可并行执行
- US2内: T039-T040とT041-T043は並列実行可能、T047-T048は並列実行可能 / US2 内部：T039-T040 和 T041-T043 可并行执行，T047-T048 可并行执行

---

## Parallel Execution Example: User Story 1 / 并行执行示例：用户故事 1

```bash
# ノードコンポーネントを一緒に起動: / 同时启动节点组件：
Task: "src/webview/src/components/nodes/Sub-AgentNode.tsxにSub-AgentNodeコンポーネントを作成"
Task: "src/webview/src/components/nodes/AskUserQuestionNode.tsxにAskUserQuestionNodeコンポーネントを作成"

# サイドパネルを一緒に起動: / 同时启动侧边栏面板：
Task: "src/webview/src/components/NodePalette.tsxにNodePaletteコンポーネントを作成"
Task: "src/webview/src/components/PropertyPanel.tsxにPropertyPanelコンポーネントを作成"

# UI洗練を一緒に起動: / 同时启动 UI 精细化：
Task: "src/webview/src/components/WorkflowEditor.tsxにReact Flowパフォーマンス最適化を適用"
Task: "src/webview/src/styles/main.cssにCSSスタイリングを追加"
```

---

## Parallel Execution Example: User Story 2 / 并行执行示例：用户故事 2

```bash
# Sub-Agent設定ファイルとSlashCommand生成を一緒に起動: / 同时启动子智能体配置文件和斜杠命令生成：
Task: "src/extension/services/export-service.tsにSubAgentNodeからSub-Agent設定ファイルへのコンバーターを実装"
Task: "src/extension/services/export-service.tsにSlashCommandファイルジェネレーターを実装"

# エクスポート用Webview UIを一緒に起動: / 同时启动导出相关的 Webview UI：
Task: "src/webview/src/components/Toolbar.tsxにエクスポートボタンを追加"
Task: "src/webview/src/components/ExportProgress.tsxにエクスポート進捗インジケーターを作成"
```

---

## Implementation Strategy / 实现策略

### MVP First (User Story 1 Only) / MVP 优先（仅限用户故事 1）

1. Phase 1: セットアップ完了 / 第 1 阶段：环境搭建完成
2. Phase 2: 基盤構築完了（重要 - すべてのストーリーをブロック） / 第 2 阶段：基础构建完成（重要 - 阻塞所有故事）
3. Phase 3: ユーザーストーリー1完了 / 第 3 阶段：用户故事 1 完成
4. **Stop & Verify / 停止并验证**: ユーザーストーリー1を独立してテスト / 独立测试用户故事 1
   - エディタを開き、2-3ノードのワークフローを作成 / 打开编辑器，创建包含 2-3 个节点的工作流
   - .vscode/workflows/に保存 / 保存到 .vscode/workflows/
   - リロードして永続性を検証 / 重新加载以验证持久性
5. 準備ができたらデプロイ/デモ / 准备就绪后进行部署/演示

### Incremental Delivery / 增量交付

1. セットアップ + 基盤構築完了 → 基盤準備完了 / 环境搭建 + 基础构建完成 -> 基础就绪
2. ユーザーストーリー1追加 → 独立テスト → デプロイ/デモ（MVP!） / 添加用户故事 1 -> 独立测试 -> 部署/演示（MVP!）
   - ユーザーはワークフローを視覚的に作成・保存可能 / 用户可以直观地创建和保存工作流
3. ユーザーストーリー2追加 → 独立テスト → デプロイ/デモ / 添加用户故事 2 -> 独立测试 -> 部署/演示
   - ユーザーは実行用の.claude形式にワークフローをエクスポート可能 / 用户可以将工作流导出为用于执行的 .claude 格式
4. 各ストーリーが既存のストーリーを壊さずに価値を追加 / 每个故事都在不破坏现有故事的前提下增加价值

### Parallel Team Strategy / 并行团队策略

複数の開発者がいる場合: / 存在多名开发人员时：

1. チームで一緒にセットアップ + 基盤構築を完了 / 团队共同完成环境搭建 + 基础构建
2. 基盤構築完了後: / 基础构建完成后：
   - 開発者A: ユーザーストーリー1（ビジュアルエディタ） / 开发人员 A：用户故事 1（可视化编辑器）
   - 開発者B: ユーザーストーリー2（エクスポート機能） / 开发人员 B：用户故事 2（导出功能）
3. ストーリーが独立して完了し統合 / 故事独立完成并进行集成
4. 統合テスト: US1エディタでワークフローを作成、US2機能でエクスポート / 集成测试：使用 US1 编辑器创建工作流，使用 US2 功能导出

---

## Task Summary / 任务数摘要

- **Phase 1 (Setup / 环境搭建)**: 9タスク (T001-T009) / 9 项任务 (T001-T009)
- **Phase 2 (Foundation / 基础构建)**: 7タスク (T010-T016) / 7 项任务 (T010-T016)
- **Phase 3 (User Story 1 / 用户故事 1)**: 20タスク (T017-T036) / 20 项任务 (T017-T036)
- **Phase 4 (User Story 2 / 用户故事 2)**: 15タスク (T037-T051) / 15 项任务 (T037-T051)
- **Phase 5 (Refinement / 完善)**: 9タスク (T052-T060) / 9 项任务 (T052-T060)

**Total Tasks / 总任务数**: 60

**MVP Scope (User Story 1 Only) / MVP 范围（仅限用户故事 1）**: 36タスク (Phase 1 + Phase 2 + Phase 3) / 36 项任务 (第 1 阶段 + 第 2 阶段 + 第 3 阶段)

---

## Notes / 注意事项

- [P]タスク = 異なるファイル、依存関係なし / [P] 任务 = 不同文件，无依赖关系
- [Story]ラベルはタスクを特定のユーザーストーリーにマッピングしてトレーサビリティを確保 / [Story] 标签将任务映射到特定用户故事，确保可追溯性
- 各ユーザーストーリーは独立して完了・テスト可能であるべき / 每个用户故事应能独立完成并测试
- 各タスクまたは論理グループ後にコミット / 在每项任务或逻辑组之后进行提交
- 任意のチェックポイントで停止してストーリーを独立して検証 / 在任意检查点停止并独立验证故事
- すべてのファイルパスはリポジトリルートからの絶対パス / 所有文件路径均为相对于项目根目录的路径
- Extension Hostコード変更後にTypeScriptコンパイルが必要 / 修改扩展宿主代码后需要进行 TypeScript 编译
- Webviewコード変更後にViteビルドが必要 / 修改 Webview 代码后需要进行 Vite 构建
- このタスクリストにはテストが含まれていません（spec.mdはMVP用のTDDアプローチを明示的に要求していません） / 此任务列表不包含测试（spec.md 未明确要求 MVP 采用 TDD 方法）
