# Feature Specification: Claude Code Workflow Studio

# 功能规格说明：Claude Code Workflow Studio

**Feature Branch / 特性分支**: `001-cc-wf-studio`  
**Created / 创建时间**: 2025-11-01  
**Status / 状态**: Draft / 草案  
**Input / 输入**: User description: "ClaudeCodeのSlashCommands,Sub-Agentを用いたワークフローをユーザー端末にてClaudeCodeのワンショットモードによるコマンド実行で構築できる、VSCode拡張機能を作成したい。ワークフローはVSCode拡張機能で作成した専用画面にてAWS StepFunctionsのUI画面のような形で作成できるようにしたい。"

**中文概要：**  
本规格说明定义了「Claude Code Workflow Studio」这一 VS Code 扩展的目标和详细需求。扩展的核心目标是：

- 提供一个类似 AWS Step Functions 的可视化工作流编辑器，让用户在 VS Code 中通过拖拽节点的方式设计 Claude Code 工作流  
- 将工作流节点映射到 Claude Code 的 Sub-Agent、AskUserQuestion 等实体，并自动导出到 `.claude/agents/` 与 `.claude/commands/` 中  
- 支持从结构化文件（JSON/YAML）加载和保存工作流，并在画布上可视化展示与编辑  
- 明确 MVP 版本支持的功能、非功能性要求、成功指标以及暂时不覆盖的边界/例外情况  

文档后续章节主要包括：

- 用户场景与验收测试用例（User Scenarios & Testing）  
- 功能需求 / 非功能需求（FR / NFR）  
- 成功指标（Success Criteria）  
- 导出格式与数据模型（Export Format / Data Model）  
- 文件读写行为与边界情况（File Operations / Edge Cases）  

## User Scenarios & Testing *(mandatory)*

### User Story 1 - ワークフロービジュアルエディタでの作成 / 在可视化编辑器中创建工作流 (Priority: P1)

開発者がVSCode上でビジュアルエディタを開き、Claude Codeのワークフローをドラッグ&ドロップで設計できる。ワークフローはSub-Agentをノードとして配置、分岐をAskUserQuestionで配置し、AWS Step Functionsのような視覚的なフローチャート形式で構成する。出来上がったフローはSlashCommandsから実行できる。

（中文说明）
开发者可以在 VS Code 中打开一个专用的可视化编辑器，通过拖拽节点的方式来设计 Claude Code 的工作流：
- 将 Sub-Agent 作为节点放置在画布上
- 使用 AskUserQuestion 节点来表示分支
- 整体以类似 AWS Step Functions 的可视化流程图形式呈现
最终設計完成的工作流可以通过 Claude Code 的 SlashCommand 从命令面板或 CLI 中直接执行。

**Why this priority / 优先级说明**: ワークフローの視覚的な設計機能は本機能の中核であり、これがなければ他の機能も価値を持たない。ユーザーが最初に体験する主要機能として最も重要。

（为什么是最高优先级）
可视化工作流设计是整个扩展的核心能力。如果没有这部分，其他围绕导出、执行的功能都失去意义。
这也是用户第一次打开扩展时会直接接触到的功能，因此被设定为 P1。

**Independent Test / 独立测试方法**: VSCode拡張機能をインストール後、コマンドパレットから「Claude Code Workflow Studio」を開き、新規ワークフローを作成。Sub-Agentノードを1つ配置して保存できることを確認すれば、基本的なエディタ機能が動作していると検証できる。

（独立测试方法）
1. 安装 VS Code 扩展后，从命令面板中打开 “Claude Code Workflow Studio”
2. 在画布中新建一个工作流
3. 放置一个 Sub-Agent 节点并尝试保存
4. 只要能够成功放置节点并保存工作流文件，即可判定基础编辑能力工作正常。

**Acceptance Scenarios / 验收场景**:

（验收场景）

1. **Given** VSCodeが起動している状態で、**When** コマンドパレットから「Open Claude Code Workflow Studio」を実行する、**Then** ビジュアルエディタが新しいタブで開く
   （前提：VS Code 已启动；当：从命令面板执行 “Open Claude Code Workflow Studio”；则：可视化编辑器在新标签页中打开）
2. **Given** ビジュアルエディタが開いている状態で、**When** 左側のツールパレットから「Sub-Agent」ノードをキャンバスにドラッグ&ドロップする、**Then** キャンバス上にSub-Agentノードが配置される
   （前提：可视化编辑器已打开；当：从左侧工具栏拖拽一个 Sub-Agent 节点到画布；则：画布中出现一个 Sub-Agent 节点）
3. **Given** ビジュアルエディタが開いている状態で、**When** 左側のツールパレットから「AskUserQuestion」ノードをキャンバスにドラッグ&ドロップする、**Then** キャンバス上にAskUserQuestionノードが配置され、分岐ポートが表示される
   （前提：可视化编辑器已打开；当：从工具栏拖拽 AskUserQuestion 节点到画布；则：画布中出现该节点，并显示多个分支端口）
4. **Given** キャンバス上にノードが配置されている状態で、**When** ノードをクリックする、**Then** 右側のプロパティパネルにノードの設定項目（名前、プロンプト）が表示される
   （前提：画布上已有节点；当：点击任一节点；则：右侧属性面板显示该节点的配置项（名称、Prompt 等））
5. **Given** 2つのノードがキャンバス上にある状態で、**When** ノードの出力ポートから別のノードの入力ポートへドラッグする、**Then** 2つのノードが矢印で接続される
   （前提：画布上至少有两个节点；当：从一个节点输出端拖拽连线到另一个节点输入端；则：两个节点通过箭头连线连接）
6. **Given** AskUserQuestionノードがキャンバス上にある状態で、**When** 各分岐ポートから異なるノードへ接続する、**Then** 条件分岐を持つワークフローが構成される
   （前提：画布上存在 AskUserQuestion 节点；当：从不同分支端口连接到不同的后续节点；则：形成带条件分支的工作流）
7. **Given** ワークフローを編集した状態で、**When** 「保存」ボタンをクリックする、**Then** ワークフロー定義ファイル（JSON/YAML形式）がプロジェクト内の指定ディレクトリに保存される
   （前提：工作流已被编辑；当：点击“保存”按钮；则：工作流定义以 JSON/YAML 形式保存到项目内约定目录）

---

### User Story 2 - ワークフローを.claude設定ファイルで保存 / 将工作流保存为 .claude 配置文件 (Priority: P2)

作成したワークフローを、Claude Codeの設定ファイル形式（`.claude`ディレクトリ配下）で保存できる。各Sub-AgentノードはクライアントのSub-Agent設定ファイルとして`.claude/agents/`配下に生成され、ワークフロー全体の流れはSlashCommandsとAskUserQuestionの組み合わせで表現される。これにより、ビジュアルエディタで設計したワークフローが実際のClaude Code環境で実行可能な形式として出力される。

（中文说明）
用户可以将设计好的工作流导出为 Claude Code 的配置文件格式，保存在项目的 `.claude` 目录下：
- 每一个 Sub-Agent 节点会在 `.claude/agents/` 下生成对应的 Sub-Agent 配置文件
- 整个工作流的执行顺序和分支逻辑会通过 SlashCommand + AskUserQuestion 的组合在 `.claude/commands/` 中表示
这样，用户在可视化编辑器中设计的流程就可以直接在 Claude Code 环境中以标准方式执行。

**Why this priority / 优先级说明**: ビジュアルエディタで設計したワークフローを実際に使用可能な形で保存できなければ、ツールとしての価値がない。P1のエディタ機能の次に重要な機能として、MVPに含める必要がある。

（为什么是 P2）
如果不能把在编辑器里设计的工作流导出成 Claude Code 能直接使用的文件格式，这个工具就只有“画图”的价值er没有“可执行”的价值。
因此，在 P1 完成编辑器本身之后，“导出为可执行 .claude 配置”是 MVP 中第二重要的能力。

**Independent Test / 独立测试方法**: シンプルなワークフロー（Sub-Agentノード1つとAskUserQuestionノード1つ）を作成し、「エクスポート」ボタンをクリック。`.claude/agents/`配下にSub-Agent設定ファイルが生成され、`.claude/commands/`配下にSlashCommand用のマークダウンファイルが生成されることを確認。生成されたファイルの内容が正しいフォーマットであることを検証すれば完了。

（独立测试方法）
1. 创建一个简单工作流，仅包含一个 Sub-Agent 节点和一个 AskUserQuestion 节点
2. 点击“导出”按钮
3. 确认 `.claude/agents/` 下生成了对应 Sub-Agent 配置文件
4. 确认 `.claude/commands/` 下生成了对应的 SlashCommand Markdown 文件
5. 检查生成文件的 frontmatter 和主体内容格式是否符合 Claude Code 官方规范
若以上均满足，即视为此功能通过。

**Acceptance Scenarios / 验收场景**:

（验收场景）

1. **Given** ワークフローにSub-Agentノードが配置されている状態で、**When** 「エクスポート」ボタンをクリックする、**Then** `.claude/agents/`ディレクトリ配下に各Sub-Agentノードに対応する設定ファイルが生成される
   （前提：工作流中包含至少一个 Sub-Agent 节点；当：点击“导出”；则：`.claude/agents/` 下为每个 Sub-Agent 生成对应配置文件）
2. **Given** ワークフローにAskUserQuestionノードが含まれている状態で、**When** エクスポートを実行する、**Then** SlashCommandファイル内にAskUserQuestionツールの呼び出しコードが適切に記述される
   （前提：工作流中包含 AskUserQuestion 节点；当：执行导出；则：生成的 SlashCommand 文件中包含正确的 AskUserQuestion 工具调用描述）
3. **Given** 複数のノードが接続されたワークフローがある状態で、**When** エクスポートを実行する、**Then** `.claude/commands/`ディレクトリ配下にワークフロー全体を実行するSlashCommandファイルが生成され、ノードの実行順序が正しく反映される
   （前提：存在由多个节点和连线组成的工作流；当：执行导出；则：`.claude/commands/` 下生成一个可以驱动整个工作流的 SlashCommand 文件，且执行顺序与画布中的连接关系一致）
4. **Given** エクスポートが完了した状態で、**When** 生成されたSlashCommandをClaude Codeで実行する、**Then** ビジュアルエディタで設計した通りの順序でSub-Agentが呼び出され、AskUserQuestionによる分岐が機能する
   （前提：导出已完成；当：在 Claude Code 中执行生成的 SlashCommand；则：Sub-Agent 的调用顺序以及 AskUserQuestion 的分支行为与可视化编辑器中的设计一致）

---

## Edge Cases & Exception Handling / 边界与例外情况

**MVP Design Principles / MVP 设计方针**: 以下のエッジケースは初期バージョンでは**考慮しない**。ユーザーの適切な使用を前提とし、実装範囲を最小化する。

（MVP 方针）
以下列出的边界/异常情况，在首个版本（MVP）中**不会实现特殊处理**。
前提是用户在合理范围内使用功能，以此减小实现范围与复杂度。

#### Cases Not Handled in MVP / 不在 MVP 范围内处理的边界情况

1. **Loop Detection (Circular References) / 循环引用检测**
   - FR-013で警告表示を要件としているが、MVP版では検出ロジックを実装しない
   - ユーザーが循環参照を作成した場合、エクスポート時に不正なSlashCommandが生成される可能性がある
   - 将来のバージョンで対応を検討
   - （中文）
   - 循环引用（节点间形成环路）的检测逻辑在 FR-013 中被提出为需求，但在 MVP 中不会实现
   - 如果用户在画布中手动创建了循环连接，导出时可能生成逻辑上不正确的 SlashCommand
   - 未来版本中再考虑添加自动检测与提示

2. **Large Workflow Performance / 大规模工作流性能**
   - NFR-001で50ノードまでのサポートを明記
   - 100ノード以上の場合の動作は保証しない
   - （中文）
   - 在 NFR-001 中明确目标是保证 50 个节点以内时体验流畅
   - 对于超过 100 个节点的超大规模工作流，本版本不做性能保证

3. **Simultaneous Editing / 複数ウィンドウでの同時編集**
   - ファイルシステムベース of 競合は考慮しない
   - 最後に保存した方が優先される（通常のファイル上書き動作）
   - （中文）
   - 对于在多个 VS Code 窗口中同时编辑同一工作流文件的情形，不做额外冲突处理
   - 谁最后保存，磁盘上就以谁的版本为准（与普通文件覆盖行为一致）

4. **Invalid Definition Format / 手動編集されたワークフロー定義ファイルの不正形式**
   - FR-014でエラーメッセージ表示を要件としているが、MVP版では基本的なJSON/YAMLパースエラーのみ対応
   - 詳細なバリデーション（必須フィールドチェック、データ型検証など）は実装しない
   - （中文）
   - 用户如果手动编辑 JSON/YAML 工作流定义文件并写错格式，MVP 只处理“无法解析”这一层面的错误
   - 对于更细致的校验（必填字段、类型检查等）暂不实现

5. **File Conflicts during Export / エクスポート時のファイル衝突**
   - DD-005で確認ダイアログ表示を決定済み（対処方針あり）
   - これは考慮するエッジケース
   - （中文）
   - 导出时如果遇到同名文件已存在的情况，会按 DD-005 的设计弹出覆盖确认对话框
   - 这类文件冲突会在 MVP 中处理

6. **Unconnected Branch Ports / AskUserQuestionノードの未接続分岐ポート**
   - エクスポート時に検証せず、そのままSlashCommandを生成
   - 実行時にClaude Codeが適切に処理することを期待
   - （中文）
   - 对于 AskUserQuestion 节点中某些分支未连接到后续节点的情况，导出时不会阻止或报错
   - 生成的 SlashCommand 仍会包含这些分支，由 Claude Code 在运行时自行处理

#### Cases Handled in MVP / 在 MVP 中明确要处理的边界情况

- **Confirm Overwriting Existing Files / 既存ファイルの上書き確認**（DD-005に基づく）
  - 対処方法: 上書き確認ダイアログを表示
  - ユーザーの選択により、上書き or キャンセルを実行
  - （中文）
  - 当导出目标位置已经存在同名文件时，必须弹出覆盖确认对话框
  - 用户可以选择“覆盖已有文件”或“取消导出”，避免误覆盖手动修改过的配置

## Requirements / 需求规格

### Functional Requirements / 功能需求 (FR)

- **FR-001**: システムはVSCode拡張機能として動作し、VSCode Marketplaceまたは互換性のあるエディタ（Cursor, Windsurf, Trae, Qoderなど）のマーケットプレイスからインストール可能でなければならない
  （系统必须作为 VS Code 扩展运行，并可通过 VS Code Marketplace 或兼容编辑器（如 Cursor, Windsurf, Trae, Qoder 等）的应用商店安装）
- **FR-002**: システムは専用のビジュアルエディタ画面を提供し、ワークフローをグラフィカルに作成・編集できなければならない
  （系统必须提供专用的可视化编辑器界面，用于图形化创建和编辑工作流）
- **FR-003**: ユーザーはSub-Agentノードをワークフローに配置できなければならない
  （用户必须能够在工作流中放置 Sub-Agent 节点）
- **FR-004**: ユーザーはAskUserQuestionノードをワークフローに配置し、条件分岐を定義できなければならない
  （用户必须能够放置 AskUserQuestion 节点并定义条件分支）
- **FR-005**: ユーザーはノード間の接続（実行順序）をドラッグ&ドロップで定義できなければならない
  （用户必须能通过拖拽连线的方式，定义节点之间的执行顺序）
- **FR-006**: 各ノードのプロパティ（名前、プロンプト）をGUIで編集できなければならない
  （每个节点的属性（名称、Prompt 等）必须可以通过 GUI 编辑）
- **FR-007**: ワークフロー定義は構造化形式（JSONまたはYAML）でファイルとして保存できなければならない
  （工作流定义必须可以以结构化格式（JSON 或 YAML）保存为文件）
- **FR-008**: 保存されたワークフロー定義ファイルを読み込み、ビジュアルエディタで再編集できなければならない
  （系统必须能够加载已保存的工作流文件并在可视化编辑器中再次编辑）
- **FR-009**: ユーザーはワークフローをClaude Code設定ファイル形式（`.claude`ディレクトリ配下）にエクスポートできなければならない
  （用户必须能够将工作流导出为 Claude Code 配置文件，存放在 `.claude` 目录下）
- **FR-010**: エクスポート時、各Sub-Agentノードは`.claude/agents/`配下にSub-Agent設定ファイルとして生成されなければならない
  （导出时，每个 Sub-Agent 节点都必须在 `.claude/agents/` 下生成对应的配置文件）
- **FR-011**: エクスポート時、ワークフロー全体は`.claude/commands/`配下にSlashCommandファイルとして生成されなければならない
  （导出时，整个工作流必须在 `.claude/commands/` 下生成一个 SlashCommand 文件）
- **FR-012**: 生成されたSlashCommandファイルには、AskUserQuestionによる分岐ロジックが適切に記述されなければならない
  （生成的 SlashCommand 文件中必须包含正确的 AskUserQuestion 分支逻辑）
- **FR-013**: ~~ワークフローに循環参照が含まれる場合、保存時またはエクスポート前に警告を表示しなければならない~~（MVP版では実装しない - Edge Cases参照）
  （如果工作流中存在循环引用，本来应在保存或导出前给出警告；但在 MVP 中暂不实现，仅作为未来需求记录）
- **FR-014**: ワークフロー定義ファイルの形式エラー（JSON/YAMLパースエラー）を検出し、ユーザーに分かりやすいエラーメッセージを表示しなければならない（MVP版では基本的なパースエラーのみ対応 - Edge Cases参照）
  （系统必须能检测工作流定义文件的格式错误（JSON/YAML 解析失败），并给出易于理解的错误提示；MVP 仅覆盖基础解析错误）
- **FR-015**: システムは日本語と英語のUIをサポートしなければならない
  （系统必须支持日文和英文 UI；后续可以扩展到其他语言）

### Non-Functional Requirements / 非功能需求 (NFR)

- **NFR-001**: ワークフローエディタは50ノードまで快適に動作しなければならない（SC-002に対応）
  （在最多 50 个节点的工作流下，编辑器需要保持流畅使用体验，对应 SC-002）
- **NFR-002**: ワークフロー定義ファイルの読み込み処理は、ファイルサイズ10KB以下の場合に1秒以内で完了しなければならない（SC-004に対応）
  （当工作流定义文件大小不超过 10KB 时，加载时间需控制在 1 秒内，对应 SC-004）
- **NFR-003**: システムはローカル環境での使用を想定し、ユーザー入力値の検証は行わない（MVP版の制约）
  （系统假定在本地环境使用，MVP 中不做用户输入值的严格校验）
- **NFR-004**: エクスポート処理にタイムアウト制限は设けない（MVP版の制约）
  （导出过程暂不设置超时限制）
- **NFR-005**: システムは将来的なノードタイプ追加を考慮した拡張可能な設計は不要とする（MVP版の制约）
  （MVP 不要求为未来节点类型扩展预留插件式架构）
- **NFR-006**: 生成されるファイルはUTF-8エンコーディングでなければならない
  （所有生成的文件必须使用 UTF-8 编码）
- **NFR-007**: UIの操作レスポンスは500ms以内でなければならない（SC-002に対応）  
  （主要 UI 操作的响应时间应控制在 500ms 内，以保证交互流畅）

**MVP Constraints / MVP 版的约束事项**:
- Security: Local usage assumed; input validation and sanitization are not implemented in MVP.
- Performance: Large workflows (>100 nodes) are not guaranteed to be supported.
- Extensibility: Plugin architecture for adding new node types is not implemented in MVP.

（MVP 版本的统一约束）
- 安全性：假定在本地环境个人使用，不实现复杂的输入校验和清洗
- 性能：对超过 100 个节点的超大工作流不做性能保障
- 扩展性：暂不实现插件式架构来支持动态新增节点类型

### Key Entities / 核心实体

- **Workflow (ワークフロー / 工作流)**: 複数のノードとその接続関係で構成される実行可能な定義。名前、説明、作成日時、最終更新日時、バージョンを持つ。
  （工作流：由多个节点及其连接关系构成的可执行定义，包含名称、描述、创建时间、最后更新时间和版本号等元数据）
- **Node (ノード / 节点)**: ワークフロー内の1つの処理単位。種類（Sub-Agent、AskUserQuestion）、名前、設定（プロンプト）、入出力ポートを持つ。
  （节点：工作流中的单个处理单元，具有类型（如 Sub-Agent / AskUserQuestion）、名称、配置（Prompt 等）以及输入输出端口）
- **Connection (接続 / 连接)**: 2つのノード間の実行順序を表す。開始ノード、終了ノード、条件（オプション）を持つ。
  （连接：表示两个节点之间的执行顺序，可选地带有条件信息）

## Success Criteria / 成功指标

### Measurable Outcomes / 可衡量指标

- **SC-001**: ユーザーは5分以内に初めてのワークフローを作成し、保存できる
  （新用户应能在 5 分钟内完成第一个工作流的创建与保存）
- **SC-002**: ワークフローエディタは50ノードまで滑らかに動作する（操作レスポンス500ms以内）
  （在最多 50 个节点时编辑器仍然流畅，关键操作响应时间不超过 500ms）
- **SC-003**: 90%のユーザーがドキュメントやチュートリアルなしで基本的なワークフロー作成ができる
  （90% 的用户无需阅读文档或教程即可完成基础工作流的创建）
- **SC-004**: ワークフロー定義ファイルのサイズが10KB以下の場合、読み込み時間が1秒以内である
  （当工作流定义文件小于 10KB 时，加载时间控制在 1 秒内）
- **SC-005**: エクスポート機能により生成された`.claude`設定ファイルが正しいフォーマットである（YAML frontmatterとMarkdown形式）
  （导出生成的 `.claude` 配置文件必须符合 YAML frontmatter + Markdown 的正确格式）

## Technical Specifications / 技术规范

### Export Format Details / 导出格式细节

#### Sub-Agent Configuration File Format / Sub-Agent 配置文件格式

各Sub-Agentノードは以下のフォーマットで`.claude/agents/<node-name>.md`として生成される:

（每个 Sub-Agent 节点会被导出为 `.claude/agents/<node-name>.md`，格式如下）

```markdown
---
name: <ノードの名前>
description: <Sub-Agentの目的の説明>
tools: <ツールリスト（カンマ区切り、オプション）>
model: sonnet
---

<Sub-Agentのシステムプロンプト内容>
```

**Naming Conventions / 命名規則**:
- ファイル名: ノード名を小文字化し、スペースをハイフンに置換（例: "Data Analysis" → "data-analysis.md"）
- `name`フィールド: 小文字とハイフンを使用した一意の識別子（ノード名を変換）
- `description`フィールド: Sub-Agentの目的を説明する自然言語テキスト
- `tools`フィールド（オプション）: カンマ区切りのツールリスト。省略時は全ツールにアクセス可能
- `model`フィールド（オプション）: `sonnet`, `opus`, `haiku` のいずれか。デフォルトは `sonnet`

（命名与字段说明——中文）
- 文件名：将节点名称转为小写，并把空格替换为连字符，如 `"Data Analysis" → "data-analysis.md"`
- `name` 字段：使用小写 + 连字符的唯一标识（由节点名称转换而来）
- `description` 字段：用自然语言简要说明该 Sub-Agent 的用途
- `tools` 字段（可选）：逗号分隔的工具列表，省略时视为可以使用所有工具
- `model` 字段（可选）：可选值为 `sonnet` / `opus` / `haiku`，默认使用 `sonnet`

#### SlashCommand Format / SlashCommand 格式

ワークフロー全体は以下のフォーマットで`.claude/commands/<workflow-name>.md`として生成される:

（整个工作流会导出为 `.claude/commands/<workflow-name>.md`，格式如下）

```markdown
---
description: <ワークフローの説明>
allowed-tools: Task,AskUserQuestion
---

<ワークフローの実行ロジック>
```

**Writing Logic / 実行ロジックの記述方法**:
- Task toolを使用してSub-Agentを順次呼び出し
- AskUserQuestion toolを使用して分岐制御
- 技術的記述ベース（ツール呼び出しを明示的に指示）

（执行逻辑书写方式——中文）
- 使用 Task 工具按顺序调用各个 Sub-Agent
- 使用 AskUserQuestion 工具实现用户交互与条件分支
- 整个描述偏向“技术化指令”，显式指定要调用的工具和顺序，而不是仅靠自然语言让 Claude 自行推断

**Example (2 Nodes + 1 Branch) / 示例 (2个节点 + 1个分支)**:

（示例：包含 2 个节点 + 1 个分支的工作流）

```markdown
---
description: サンプルワークフロー
allowed-tools: Task,AskUserQuestion
---

まず、Taskツールを使用して「data-analysis」Sub-Agentを実行してください。

次に、AskUserQuestionツールを使用して以下の質問をユーザーに行ってください:
- 質問: "次のステップを選択してください"
- 選択肢:
  - "レポート作成" → Taskツールで「report-generation」Sub-Agentを実行
  - "データ可視化" → Taskツールで「data-visualization」Sub-Agentを実行

ユーザーの選択に応じて、対応するSub-Agentを実行してください。

（中文翻译）
首先，请使用 Task 工具执行 "data-analysis" 子智能体（Sub-Agent）。

接下来，请使用 AskUserQuestion 工具向用户提出以下问题：
- 问题："请选择下一步"
- 选项：
  - "生成报告" -> 使用 Task 工具执行 "report-generation" 子智能体
  - "数据可视化" -> 使用 Task 工具执行 "data-visualization" 子智能体

根据用户的选择，执行相应的子智能体。
```

#### AskUserQuestion Node Specification / AskUserQuestion 节点规范

**Attributes / 属性**:
- **Question Text / 问题文本**: ユーザーに表示する質問テキスト / 展示给用户的问题内容
- **Options List / 选项列表**: 2個から4個の選択肢（各選択肢にラベルと説明） / 2～4 个可选项（每个包含标签与说明）
- **Output Ports / 分岐ポート**: 各選択肢に対応する出力ポート（可変: 2-4個） / 每个选项对应一个输出端口（2～4 个，可变）

**Node Properties / 节点属性面板字段**:
- **Name / 名称**: ノードの識別名 / 节点在画布中的标识名称
- **Question Text / 问题文本**: 必須テキストフィールド / 必填字段，用于展示给用户的提问内容
- **Options 1-4 / 选项 1～4**: 各選択肢のラベルと説明 / 每个选项的显示标签与说明文案

### Data Model / 数据模型

#### Workflow Definition (JSON/YAML Format) / 工作流定义 (JSON/YAML 格式)

内部保存用のワークフロー定義フォーマット。JSON/YAML 形式でワークフローの構造を保持します。
用于内部持久化的工作流定义格式。以 JSON/YAML 形式保存工作流结构。

```json
{
  "name": "ワークフロー名",
  "description": "ワークフローの説明",
  "version": "1.0.0",
  "nodes": [
    {
      "id": "node-1",
      "type": "SubAgent",
      "name": "ノード名",
      "prompt": "プロンプト内容",
      "position": {"x": 100, "y": 100}
    },
    {
      "id": "node-2",
      "type": "AskUserQuestion",
      "name": "分岐ノード",
      "question": "質問文",
      "options": [
        {"label": "選択肢A", "description": "説明A"},
        {"label": "選択肢B", "description": "説明B"}
      ],
      "position": {"x": 300, "y": 100}
    }
  ],
  "connections": [
    {
      "from": "node-1",
      "to": "node-2",
      "fromPort": "output",
      "toPort": "input"
    },
    {
      "from": "node-2",
      "to": "node-3",
      "fromPort": "option-0",
      "toPort": "input",
      "condition": "選択肢A"
    }
  ]
}
```

### File Operations / 文件操作

#### Save Operation / 保存操作
- **Target / 对象**: ワークフロー定義ファイル（JSON/YAML） / 工作流定义文件 (JSON/YAML)
- **Destination / 保存路径**: `.vscode/workflows/<workflow-name>.json`
- **Purpose / 目的**: ビジュアルエディタでの再編集を可能にする / 允许在可视化编辑器中再次编辑

#### Export Operation / 导出操作
- **Target / 对象**: `.claude`設定ファイル群（Sub-Agent設定ファイル + SlashCommand） / `.claude` 配置文件集 (子智能体配置文件 + 斜杠命令)
- **Destination / 保存路径**: `.claude/agents/` および / 以及 `.claude/commands/`
- **Conflict Handling / 冲突处理**: 既存ファイルがある場合、上書き確認ダイアログを表示 / 若存在现有文件，则显示覆盖确认对话框
- **Purpose / 目的**: Claude Codeで実行可能な形式として出力 / 以 Claude Code 可执行的形式输出

## Design Decisions / 设计决策

このセクションでは、仕様策定時に行った重要な設計判断とその理由を記録します。
本章节记录了在制定规范时做出的重要设计决策及其理由。

### DD-001: ワークフロー定義とエクスポートの分離 / 工作流定义与导出的分离

**Decision / 决定**: 「保存」と「エクスポート」を別操作として実装する / 将“保存”和“导出”作为独立操作实现

**Rationale / 理由**:
- **Maintain Re-editability / 维持可再编辑性**: JSON/YAML形式でワークフローの完全な構造情報（ノード位置、接続情報）を保持 / 以 JSON/YAML 格式保留工作流的完整结构信息（节点位置、连接信息）
- **Claude Code Independence / Claude Code 配置独立性**: `.claude`ディレクトリは実行専用とし、編集用データと分離 / `.claude` 目录仅用于运行，并与编辑用数据分离
- **Clarify User Intent / 明确用户意图**: 編集中の保存と、実行可能形式への変換を明示的に区別 / 明确区分编辑过程中的保存与转换为可执行格式的操作

**Impact / 影响**:
- ユーザーは2段階の操作が必要（保存 → エクスポート） / 用户需要两步操作（保存 -> 导出）
- 実装が若干複雑になるが、データの整合性が保たれる / 虽然实现略显复杂，但能保持数据一致性
- エクスポート後も元のワークフロー定義を編集可能 / 导出后仍可编辑原始工作流定义

**Alternatives / 代替案**:
- 統合操作（保存時に自動エクスポート）も検討したが、ユーザーが編集途中でも保存したい場合に不要なエクスポートが発生する問題があった / 也曾考虑过整合操作（保存时自动导出），但存在用户在编辑中途只想保存时却产生不必要导出的问题

### DD-002: Sub-Agent設定ファイルの公式仕様準拠 / Sub-Agent 配置文件遵循官方规范

**Decision / 决定**: Sub-Agentノードから生成する設定ファイルはClaude Code公式仕様に準拠（name, description, tools, model, プロンプト） / 从子智能体节点生成的配置文件遵循 Claude Code 官方规范（名称、描述、工具、模型、提示词）

**Rationale / 理由**:
- **Guarantee Compatibility / 保证兼容性**: Claude Codeの公式Sub-Agent仕様に完全準拠することで互換性を保証 / 通过完全遵循 Claude Code 的官方子智能体规范来保证兼容性
- **Optional Tools / 可选工具**: `tools`フィールドは省略可能で、省略時は全ツールにアクセス可能 / `tools` 字段是可选的，省略时可访问所有工具
- **Model Specification / 指定模型**: `model`フィールドで実行モデルを指定可能（sonnet/opus/haiku） / 可以在 `model` 字段中指定执行模型（sonnet/opus/haiku）

**Impact / 影响**:
- 生成されるSub-Agentは公式仕様通りに動作 / 生成的子智能体将按照官方规范运行
- ツール制限が必要な場合はUIで`tools`フィールドを設定可能 / 若需要限制工具，可在 UI 中设置 `tools` 字段
- 将来的なClaude Codeアップデートに追従しやすい / 易于跟进未来的 Claude Code 更新

**Alternatives / 代替案**:
- 独自形式も検討したが、公式仕様準拠が最適と判断 / 也曾考虑过自定义格式，但认为遵循官方规范是最优选

### DD-003: SlashCommandの技術的記述ベース採用 / SlashCommand 采用技术化描述方式

**Decision / 决定**: SlashCommandファイルは技術的記述ベース（Task tool、AskUserQuestion toolの呼び出しを明示） / 斜杠命令（SlashCommand）文件采用技术化描述方式（明确调用 Task 工具、AskUserQuestion 工具）

**Rationale / 理由**:
- **Execution Rigor / 执行严密性**: 実行の厳密性と予測可能性を重視 / 重视执行的严密性和可预测性
- **Accurate Communication / 准确传达**: ワークフロー構造を正確にClaude Codeに伝達 / 将工作流结构准确传达给 Claude Code
- **Debuggability / 可调试性**: デバッグ時に生成されたコマンドの動作を理解しやすい / 调试时易于理解生成的命令行为

**Impact / 影响**:
- 生成されるSlashCommandの記述がやや技術的になる / 生成的斜杠命令描述会略显技术化
- Claude Codeの内部実装（Task toolの仕様）に依存する / 依赖于 Claude Code 的内部实现（Task 工具规范）
- 自然言語ベースよりも厳格な実行フローが期待できる / 相比基于自然语言的方式，可以期待更严格的执行流程

**Alternatives / 代替案**:
- 自然言語ベースも検討したが、実行の曖昧性が懸念された / 也曾考虑过基于自然语言的方式，但担心执行的模糊性

### DD-004: AskUserQuestionの可変分岐ポート（2-4個） / AskUserQuestion 的可变分支端口 (2-4个)

**Decision / 决定**: AskUserQuestionノードの分岐ポート数は2-4個の可変とする / AskUserQuestion 节点的分支端口数量设为 2-4 个可变

**Rationale / 理由**:
- **Official Spec Alignment / 符合官方规范**: Claude CodeのAskUserQuestionツールの仕様（2-4個の選択肢）に合わせる / 符合 Claude Code 的 AskUserQuestion 工具规范（2-4 个选项）
- **Balance / 平衡**: 柔軟性とシンプルさのバランスを取る / 在灵活性与简洁性之间取得平衡
- **Practical Use Cases / 实际用例**: 実際のユースケースでは2-4個の選択肢で十分 / 在实际用例中，2-4 个选项已足够

**Impact / 影响**:
- UIで選択肢数を動的に変更する機能が必要 / UI 需要具备动态更改选项数量的功能
- 分岐ポートの描画ロジックが可変に対応する必要がある / 分支端口的绘制逻辑需要支持可变数量

**Alternatives / 代替案**:
- 固定2分岐も検討したが、柔軟性に欠けると判断 / 也曾考虑过固定 2 分支，但认为缺乏灵活性

### DD-005: ファイル衝突時の確認ダイアログ表示 / 文件冲突时的确认对话框显示

**Decision / 决定**: エクスポート時に既存ファイルがある場合、上書き確認ダイアログを表示 / 导出时若存在现有文件，则显示覆盖确认对话框

**Rationale / 理由**:
- **Risk Mitigation / 降低风险**: ユーザーが手動で編集した`.claude`設定ファイルを誤って上書きするリスクを回避 / 避免误覆盖用户手动编辑的 `.claude` 配置文件的风险
- **Data Loss Prevention / 防止数据丢失**: 意図しないデータ損失を防ぐ / 防止意外的数据丢失
- **Standard UX / 标准 UX**: VSCodeの標準的なUXパターンに準拠 / 遵循 VSCode 的标准 UX 模式

**Impact / 影响**:
- 複数ファイルがある場合、複数回の確認が必要になる可能性 / 若有多个文件，可能需要多次确认
- エクスポート処理が若干遅くなる / 导出处理会略微变慢

**Alternatives / 代替案**:
- 自動上書き: スムーズだがリスクが高い / 自动覆盖：虽然流畅但风险高
- バックアップ作成: 安全だがファイルが増える / 创建备份：虽然安全但文件会增多

### DD-006: MVP版の制約事項（セキュリティ、拡張性） / MVP 版本的局限性 (安全性、扩展性)

**Decision / 决定**: MVP版では入力検証、拡張性設計を実装しない / MVP 版本不实现输入验证和扩展性设计

**Rationale / 理由**:
- **Limited Context / 有限的场景**: ローカル環境での個人使用を想定し、セキュリティリスクは限定的 / 考虑到是本地环境下的个人使用，安全风险有限
- **Priority / 优先级**: 早期リリースを優先し、実装範囲を最小化 / 优先考虑早期发布，最小化实现范围
- **Feedback Loop / 反馈循环**: 実際のユーザーフィードバックを得てから拡張機能を検討 / 在获得实际用户反馈后再考虑扩展功能

**Impact / 影响**:
- 悪意ある入力に対する脆弱性が存在（ローカル環境のため許容） / 存在针对恶意输入的脆弱性（因是本地环境故可接受）
- 将来的な機能追加時にリファクタリングが必要になる可能性 / 未来添加功能时可能需要重构
- 初期開発コストとリリース時期を大幅に短縮 / 大幅缩短初期开发成本和发布时间

**Alternatives / 代替案**:
- 完全な入力検証とプラグインアーキテクチャも検討したが、MVP版の目的に反すると判断 / 也曾考虑过完整的输入验证和插件架构，但认为违背了 MVP 版本的目的

## Assumptions / 假设前提

- **Claude Code Environment / Claude Code 环境**: ユーザーのローカル環境にClaude Codeがインストールされ、認証済みである / 用户本地环境已安装 Claude Code 并已通过认证
- **VSCode Version / VSCode 版本**: ユーザーはVSCode（バージョン1.80以上）を使用している / 用户正在使用 VSCode（1.80 或更高版本）
- **Workflow Storage / 工作流存储**: ワークフロー定義ファイルはプロジェクトのルートディレクトリまたは `.vscode/workflows/` ディレクトリに保存される / 工作流定义文件保存在项目的根目录或 `.vscode/workflows/` 目录中
- **CLI Execution / CLI 执行**: Claude Codeのワンショットモード実行はコマンドラインから `claude <prompt>` または `claude -p "<prompt>"` のような形式で実行可能である（実際のCLI仕様に依存） / Claude Code 的单次（one-shot）模式可以通过命令行以 `claude <prompt>` 或 `claude -p "<prompt>"` 等形式执行（取决于实际的 CLI 规范）
- **Sequential Execution / 顺序执行**: 初期バージョンでは、AskUserQuestionによる条件分岐をサポートするが、並列実行はサポートしない（順次実行のみ） / 初始版本支持通过 AskUserQuestion 进行条件分支，但不支持并行执行（仅支持顺序执行）
- **Automatic Recognition / 自动识别**: エクスポートされた`.claude`設定ファイル（Sub-Agent設定ファイルとSlashCommand）は、プロジェクトの`.claude/agents/`および`.claude/commands/`ディレクトリに配置され、Claude Codeによって自動的に認識される / 导出的 `.claude` 配置文件（子智能体配置文件和斜杠命令）放置在项目的 `.claude/agents/` 和 `.claude/commands/` 目录中，并由 Claude Code 自动识别
