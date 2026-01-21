# CLI Provider Integration Guide

This document provides a step-by-step guide for integrating a new CLI provider (like Qoder, Trae, etc.) into cc-wf-studio. Use this as a template when adding support for new AI CLI tools.

## Overview

The extension supports multiple AI CLI providers through a provider abstraction layer. Each provider can have its own:
- Executable name
- CLI argument format
- Model options
- MCP command support

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Webview (React)                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │ RefinementStore  │  │ SettingsDropdown │  │ PropertyOverlay│ │
│  │ (selectedProvider│  │ (Model Selection)│  │ (Node Config) │ │
│  │  selectedModel)  │  │                  │  │               │ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘ │
└───────────┼─────────────────────┼────────────────────┼─────────┘
            │                     │                    │
            ▼                     ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Message Payloads                            │
│         (provider, model, qoderModel, traeModel, etc.)          │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Extension Host (Node.js)                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │cli-provider-config│  │   ai-provider    │  │ mcp-cli-service│ │
│  │ (getEffectiveModel│  │ (executeAi)      │  │ (listServers) │ │
│  │  buildCliArgs)   │  │                  │  │               │ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘ │
└───────────┼─────────────────────┼────────────────────┼─────────┘
            │                     │                    │
            ▼                     ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLI Execution Layer                          │
│  getCliSpawnCommand(executable, args) → spawn process           │
└─────────────────────────────────────────────────────────────────┘
```

## Integration Checklist

### Phase 1: Type Definitions

#### 1.1 Add Provider Type
**File:** `src/shared/types/messages.ts`

```typescript
// Add to AiCliProvider type
export type AiCliProvider = 'claude-code' | 'copilot' | 'qoder' | 'trae' | 'NEW_PROVIDER';

// Add model type for the new provider
export type NewProviderModel = 'model1' | 'model2' | 'model3';
```

#### 1.2 Update Message Payloads
**File:** `src/shared/types/messages.ts`

Add the new model field to all relevant payloads:
- `RefineWorkflowPayload`
- `GenerateWorkflowNamePayload`
- `ListMcpServersPayload`

```typescript
export interface RefineWorkflowPayload {
  // ... existing fields
  provider?: AiCliProvider;
  newProviderModel?: NewProviderModel;  // Add this
}
```

---

### Phase 2: CLI Provider Configuration

#### 2.1 Add Provider Config
**File:** `src/extension/services/cli-provider-config.ts`

```typescript
/**
 * New Provider CLI configuration
 */
const newProviderConfig: CliProviderConfig = {
  executable: 'newprovidercli',  // CLI executable name
  supportsStreaming: true,
  supportsSessionResume: true,
  supportsToolRestriction: true,
  defaultModels: ['model1', 'model2', 'model3'],
  buildArgs: (options) => {
    // Non-streaming arguments
    const args = ['-p', '-', '--model', options.model];
    if (options.workingDirectory) {
      args.push('-w', options.workingDirectory);
    }
    if (options.allowedTools && options.allowedTools.length > 0) {
      args.push('--allowed-tools', options.allowedTools.join(','));
    }
    return args;
  },
  buildStreamingArgs: (options) => {
    // Streaming arguments
    const args = ['-p', '-', '-f', 'stream-json', '--model', options.model];
    if (options.workingDirectory) {
      args.push('-w', options.workingDirectory);
    }
    if (options.resumeSessionId) {
      args.push('-r', options.resumeSessionId);
    }
    if (options.allowedTools && options.allowedTools.length > 0) {
      args.push('--allowed-tools', options.allowedTools.join(','));
    }
    return args;
  },
};

// Add to providerConfigs map
const providerConfigs: Record<string, CliProviderConfig> = {
  'claude-code': claudeCodeConfig,
  'qoder': qoderConfig,
  'trae': traeConfig,
  'NEW_PROVIDER': newProviderConfig,  // Add this
};
```

#### 2.2 Update getEffectiveModel
**File:** `src/extension/services/cli-provider-config.ts`

```typescript
export function getEffectiveModel(
  provider: AiCliProvider,
  claudeModel: ClaudeModel = 'sonnet',
  qoderModel: QoderModel = 'auto',
  newProviderModel: NewProviderModel = 'model1'  // Add parameter
): string {
  switch (provider) {
    case 'qoder':
      return qoderModel;
    case 'NEW_PROVIDER':           // Add case
      return newProviderModel;
    case 'copilot':
      return '';
    case 'claude-code':
    case 'trae':
    default:
      return claudeModel;
  }
}
```

---

### Phase 3: Webview State Management

#### 3.1 Add Model Storage
**File:** `src/webview/src/stores/refinement-store.ts`

```typescript
// Add localStorage key
const NEW_PROVIDER_MODEL_STORAGE_KEY = 'cc-wf-studio.refinement.selectedNewProviderModel';

// Add load function
function loadNewProviderModelFromStorage(): NewProviderModel {
  try {
    const saved = localStorage.getItem(NEW_PROVIDER_MODEL_STORAGE_KEY);
    if (saved === 'model1' || saved === 'model2' || saved === 'model3') {
      return saved;
    }
  } catch {
    // localStorage may not be available
  }
  return 'model1'; // Default
}

// Add save function
function saveNewProviderModelToStorage(model: NewProviderModel): void {
  try {
    localStorage.setItem(NEW_PROVIDER_MODEL_STORAGE_KEY, model);
  } catch {
    // localStorage may not be available
  }
}

// Add to store interface
interface RefinementStore {
  // ... existing fields
  selectedNewProviderModel: NewProviderModel;
  setSelectedNewProviderModel: (model: NewProviderModel) => void;
}

// Add to store implementation
export const useRefinementStore = create<RefinementStore>((set, get) => ({
  // ... existing state
  selectedNewProviderModel: loadNewProviderModelFromStorage(),
  
  setSelectedNewProviderModel: (model: NewProviderModel) => {
    set({ selectedNewProviderModel: model });
    saveNewProviderModelToStorage(model);
  },
}));
```

#### 3.2 Update Provider Validation
**File:** `src/webview/src/stores/refinement-store.ts`

```typescript
function loadProviderFromStorage(): AiCliProvider {
  try {
    const saved = localStorage.getItem(PROVIDER_STORAGE_KEY);
    if (
      saved === 'claude-code' || 
      saved === 'copilot' || 
      saved === 'qoder' || 
      saved === 'trae' ||
      saved === 'NEW_PROVIDER'  // Add this
    ) {
      return saved;
    }
  } catch {
    // localStorage may not be available
  }
  return 'claude-code';
}
```

---

### Phase 4: UI Components

#### 4.1 Settings Dropdown (Model Selection)
**File:** `src/webview/src/components/chat/SettingsDropdown.tsx`

```typescript
// Add model presets
const NEW_PROVIDER_MODEL_PRESETS: { value: NewProviderModel; label: string }[] = [
  { value: 'model1', label: 'Model 1' },
  { value: 'model2', label: 'Model 2' },
  { value: 'model3', label: 'Model 3' },
];

// Update model selection logic
const modelPresets = selectedProvider === 'qoder' 
  ? QODER_MODEL_PRESETS 
  : selectedProvider === 'NEW_PROVIDER'
    ? NEW_PROVIDER_MODEL_PRESETS
    : MODEL_PRESETS;
```

#### 4.2 Provider Selector Dropdown
**File:** `src/webview/src/components/toolbar/ProviderSelectorDropdown.tsx`

Add the new provider option to the dropdown.

#### 4.3 Slash Command Options
**File:** `src/webview/src/components/toolbar/SlashCommandOptionsDropdown.tsx`

Update to show provider-specific models.

#### 4.4 Property Overlay (Node Config)
**File:** `src/webview/src/components/PropertyOverlay.tsx`

Update `SubAgentProperties` and `SubAgentFlowProperties` to show provider-specific models.

#### 4.5 Node Palette (Default Model)
**File:** `src/webview/src/components/NodePalette.tsx`

Update default model when creating new SubAgent nodes.

---

### Phase 5: Service Layer Updates

#### 5.1 Refinement Service
**File:** `src/extension/services/refinement-service.ts`

Update `refineWorkflow` and `refineSubAgentFlow` to:
1. Accept the new model parameter
2. Use `getEffectiveModel()` with all model parameters

#### 5.2 MCP CLI Service
**File:** `src/extension/services/mcp-cli-service.ts`

The MCP service already supports multiple providers via `executeMcpCommand(args, timeout, cwd, provider)`.

#### 5.3 Workflow Name Generation
**File:** `src/extension/commands/workflow-name-generation.ts`

Update to use the provider and model from payload.

#### 5.4 Terminal Execution Service
**File:** `src/extension/services/terminal-execution-service.ts`

Update to use `getProviderExecutable(provider)` and handle provider-specific flags.

---

### Phase 6: Webview Service Updates

#### 6.1 Refinement Service
**File:** `src/webview/src/services/refinement-service.ts`

Add the new model parameter to:
- `refineWorkflow()`
- `refineSubAgentFlow()`

#### 6.2 AI Generation Service
**File:** `src/webview/src/services/ai-generation-service.ts`

Add the new model parameter to `generateWorkflowName()`.

#### 6.3 MCP Service
**File:** `src/webview/src/services/mcp-service.ts`

Pass provider in `listMcpServers()` payload.

---

### Phase 7: Component Updates (Pass Provider)

Update all components that call AI services to pass the provider and model:

| Component | Service Call | Update Needed |
|-----------|--------------|---------------|
| `RefinementChatPanel.tsx` | `refineWorkflow()` | Pass newProviderModel |
| `Toolbar.tsx` | `generateWorkflowName()` | Pass newProviderModel |
| `SubAgentFlowDialog.tsx` | `generateWorkflowName()` | Pass newProviderModel |
| `McpNodeDialog.tsx` | `listMcpServers()` | Pass provider |
| `McpServerList.tsx` | `listMcpServers()` | Pass provider |

---

## File Modification Summary

| Category | File | Changes |
|----------|------|---------|
| **Types** | `src/shared/types/messages.ts` | Add provider type, model type, update payloads |
| **CLI Config** | `src/extension/services/cli-provider-config.ts` | Add provider config, update getEffectiveModel |
| **State** | `src/webview/src/stores/refinement-store.ts` | Add model state, load/save functions |
| **UI** | `src/webview/src/components/chat/SettingsDropdown.tsx` | Add model presets |
| **UI** | `src/webview/src/components/PropertyOverlay.tsx` | Update node model selection |
| **UI** | `src/webview/src/components/NodePalette.tsx` | Update default model |
| **Service** | `src/extension/services/refinement-service.ts` | Use getEffectiveModel |
| **Service** | `src/extension/commands/workflow-name-generation.ts` | Support provider routing |
| **Webview Service** | `src/webview/src/services/refinement-service.ts` | Add model parameter |
| **Webview Service** | `src/webview/src/services/ai-generation-service.ts` | Add model parameter |

---

## Testing Checklist

After integration, verify the following:

- [ ] Provider appears in the provider selector dropdown
- [ ] Selecting the provider shows correct model options in Settings
- [ ] Refinement chat uses the correct CLI and model
- [ ] MCP server listing uses the correct CLI
- [ ] Sub-Agent node model selector shows correct options
- [ ] SubAgentFlow node model selector shows correct options
- [ ] New SubAgent nodes have correct default model
- [ ] Workflow name generation uses the correct CLI
- [ ] Terminal execution uses the correct CLI
- [ ] Logs show correct provider and executable

---

## Example: Qoder Integration Reference

For a complete working example, refer to these commits/changes:

1. **Type definitions:** Added `QoderModel` type and updated payloads
2. **CLI config:** Added `qoderConfig` with `-w` flag requirement
3. **Store:** Added `selectedQoderModel` state
4. **UI:** Added `QODER_MODEL_PRESETS` (auto, efficient, lite, performance, ultimate)
5. **Services:** Updated all AI execution paths to use `getEffectiveModel()`

Key differences from Claude:
- Qoder requires `-w` flag for working directory
- Qoder uses `-f stream-json` instead of `--output-format stream-json`
- Qoder uses `-r` instead of `--resume` for session resume
- Qoder model names: auto, efficient, lite, performance, ultimate

---

## Troubleshooting

### Common Issues

1. **"CLI not found" error**
   - Ensure the CLI is installed and in PATH
   - Check `getCliSpawnCommand()` is using correct executable

2. **Model not switching**
   - Verify `getEffectiveModel()` has the new provider case
   - Check localStorage key is unique

3. **MCP not working**
   - Verify provider supports MCP commands
   - Check `executeMcpCommand()` receives correct provider

4. **UI shows wrong models**
   - Check `selectedProvider` is being passed to components
   - Verify conditional rendering in model selectors

### Debug Logging

Enable logging in Output Channel "Claude Code Workflow Studio":
```typescript
log('INFO', 'Executing AI command', {
  provider,
  executable,
  model,
  args,
});
```
