/**
 * CLI Provider Configuration Service
 *
 * Manages configuration for different AI CLI providers (Claude Code, Qoder, Trae, Qwen, OpenCode).
 * Each provider may have different command-line argument formats.
 */

import * as vscode from 'vscode';
import type {
  AiCliProvider,
  ClaudeModel,
  OpenCodeModel,
  QoderModel,
  QwenModel,
} from '../../shared/types/messages';
import { log } from '../extension';
import { getCliPath } from './claude-cli-path';

/**
 * nano-spawn type definitions (manually defined for compatibility)
 */
interface Result {
  stdout: string;
  stderr: string;
  output: string;
  command: string;
  durationMs: number;
}

type NanoSpawn = (
  file: string,
  args?: readonly string[],
  options?: Record<string, unknown>
) => Promise<Result>;

let nanoSpawnPromise: Promise<NanoSpawn> | null = null;

async function getNanoSpawn(): Promise<NanoSpawn> {
  if (!nanoSpawnPromise) {
    nanoSpawnPromise = import('nano-spawn').then((mod) => (mod.default ?? mod) as NanoSpawn);
  }
  return nanoSpawnPromise;
}

/**
 * CLI Provider configuration interface
 */
export interface CliProviderConfig {
  /** Executable name or command */
  executable: string;
  /** Whether this provider supports streaming output */
  supportsStreaming: boolean;
  /** Whether this provider supports session resumption */
  supportsSessionResume: boolean;
  /** Whether this provider supports tool restrictions */
  supportsToolRestriction: boolean;
  /** Default models available for this provider */
  defaultModels: string[];
  /** Build CLI arguments for non-streaming execution */
  buildArgs: (options: CliExecutionOptions) => string[];
  /** Build CLI arguments for streaming execution */
  buildStreamingArgs: (options: CliStreamingOptions) => string[];
}

export interface CliExecutionOptions {
  model: ClaudeModel;
  allowedTools?: string[];
  workingDirectory?: string;
}

export interface CliStreamingOptions extends CliExecutionOptions {
  resumeSessionId?: string;
}

/**
 * Claude Code CLI configuration
 */
const claudeCodeConfig: CliProviderConfig = {
  executable: 'claude',
  supportsStreaming: true,
  supportsSessionResume: true,
  supportsToolRestriction: true,
  defaultModels: ['sonnet', 'opus', 'haiku'],
  buildArgs: (options) => {
    const args = ['-p', '-', '--model', options.model];
    if (options.allowedTools && options.allowedTools.length > 0) {
      args.push('--allowed-tools', options.allowedTools.join(','));
    }
    return args;
  },
  buildStreamingArgs: (options) => {
    const args = [
      '-p',
      '-',
      '--output-format',
      'stream-json',
      '--verbose',
      '--model',
      options.model,
    ];
    if (options.resumeSessionId) {
      args.push('--resume', options.resumeSessionId);
    }
    if (options.allowedTools && options.allowedTools.length > 0) {
      args.push('--allowed-tools', options.allowedTools.join(','));
    }
    return args;
  },
};

/**
 * Qoder CLI configuration
 * Qoder CLI has different model names: auto, efficient, lite, performance, ultimate
 * Qoder requires -w flag for working directory
 */
const qoderConfig: CliProviderConfig = {
  executable: 'qodercli',
  supportsStreaming: true,
  supportsSessionResume: true,
  supportsToolRestriction: true,
  defaultModels: ['auto', 'efficient', 'lite', 'performance', 'ultimate'],
  buildArgs: (options) => {
    const args = ['-p', '-', '--model', options.model];
    // Qoder requires -w for working directory
    if (options.workingDirectory) {
      args.push('-w', options.workingDirectory);
    }
    if (options.allowedTools && options.allowedTools.length > 0) {
      // Qoder only has --allowed-tools, no --tools
      args.push('--allowed-tools', options.allowedTools.join(','));
    }
    return args;
  },
  buildStreamingArgs: (options) => {
    // Qoder uses -f for output format and doesn't have --verbose
    const args = ['-p', '-', '-f', 'stream-json', '--model', options.model];
    // Qoder requires -w for working directory
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

/**
 * Trae CLI configuration
 * Trae CLI is compatible with Claude Code CLI arguments
 */
const traeConfig: CliProviderConfig = {
  executable: 'trae',
  supportsStreaming: true,
  supportsSessionResume: true,
  supportsToolRestriction: true,
  defaultModels: ['sonnet', 'opus', 'haiku'],
  buildArgs: (options) => {
    const args = ['-p', '-', '--model', options.model];
    if (options.allowedTools && options.allowedTools.length > 0) {
      args.push('--allowed-tools', options.allowedTools.join(','));
    }
    return args;
  },
  buildStreamingArgs: (options) => {
    const args = [
      '-p',
      '-',
      '--output-format',
      'stream-json',
      '--verbose',
      '--model',
      options.model,
    ];
    if (options.resumeSessionId) {
      args.push('--resume', options.resumeSessionId);
    }
    if (options.allowedTools && options.allowedTools.length > 0) {
      args.push('--allowed-tools', options.allowedTools.join(','));
    }
    return args;
  },
};

/**
 * Qwen CLI configuration
 * Qwen CLI uses similar arguments to Claude Code CLI:
 * - Uses -p for prompt (deprecated, but still functional)
 * - Uses -m/--model for model selection
 * - Uses -o/--output-format with stream-json for streaming
 * - Uses -r/--resume for session resume
 * - Uses --allowed-tools for tool restrictions
 */
const qwenConfig: CliProviderConfig = {
  executable: 'qwen',
  supportsStreaming: true,
  supportsSessionResume: true,
  supportsToolRestriction: true,
  defaultModels: [], // Models are dynamically discovered
  buildArgs: (options) => {
    const args: string[] = ['-p', '-'];
    // Only add model if specified (Qwen uses dynamic models)
    if (options.model) {
      args.push('--model', options.model);
    }
    if (options.allowedTools && options.allowedTools.length > 0) {
      args.push('--allowed-tools', options.allowedTools.join(','));
    }
    return args;
  },
  buildStreamingArgs: (options) => {
    const args: string[] = ['-p', '-', '--output-format', 'stream-json'];
    // Only add model if specified
    if (options.model) {
      args.push('--model', options.model);
    }
    if (options.resumeSessionId) {
      args.push('--resume', options.resumeSessionId);
    }
    if (options.allowedTools && options.allowedTools.length > 0) {
      args.push('--allowed-tools', options.allowedTools.join(','));
    }
    return args;
  },
};

/**
 * OpenCode CLI configuration
 * OpenCode CLI uses `opencode run` for non-interactive execution:
 * - Uses --format json for JSON output
 * - Uses -m for model selection (format: provider/model)
 * - Uses -s for session resume
 * - Uses -c for continue last session
 * - Message is passed via stdin
 */
const openCodeConfig: CliProviderConfig = {
  executable: 'opencode',
  supportsStreaming: true,
  supportsSessionResume: true,
  supportsToolRestriction: false, // OpenCode doesn't have --allowed-tools
  defaultModels: [], // Models are dynamically discovered
  buildArgs: (options) => {
    const args: string[] = ['run'];
    // Only add model if specified (format: provider/model)
    if (options.model) {
      args.push('-m', options.model);
    }
    // OpenCode uses --format json for structured output
    args.push('--format', 'json');
    return args;
  },
  buildStreamingArgs: (options) => {
    const args: string[] = ['run', '--format', 'json'];
    // Only add model if specified
    if (options.model) {
      args.push('-m', options.model);
    }
    if (options.resumeSessionId) {
      args.push('-s', options.resumeSessionId);
    }
    return args;
  },
};

/**
 * Provider configurations map
 */
const providerConfigs: Record<Exclude<AiCliProvider, 'copilot'>, CliProviderConfig> = {
  'claude-code': claudeCodeConfig,
  qoder: qoderConfig,
  trae: traeConfig,
  qwen: qwenConfig,
  opencode: openCodeConfig,
};

/**
 * Get CLI provider configuration
 *
 * @param provider - The AI CLI provider
 * @returns Provider configuration or null for copilot
 */
export function getProviderConfig(provider: AiCliProvider): CliProviderConfig | null {
  if (provider === 'copilot') {
    return null; // Copilot uses VS Code Language Model API, not CLI
  }
  return providerConfigs[provider] || null;
}

/**
 * Get executable name for a provider
 *
 * @param provider - The AI CLI provider
 * @returns Executable name
 */
export function getProviderExecutable(provider: AiCliProvider): string {
  if (provider === 'copilot') {
    return ''; // Copilot doesn't use CLI
  }
  const config = providerConfigs[provider];
  return config?.executable || provider;
}

/**
 * Detect which CLI provider is currently running this extension
 *
 * Detection logic:
 * 1. Check VSCode product name (most reliable)
 * 2. Check environment variables
 * 3. Check which CLI executables are available
 * 4. Fall back to user setting
 * 5. Default to claude-code
 *
 * @returns Detected AI CLI provider
 */
export async function detectCurrentProvider(): Promise<AiCliProvider> {
  // Method 1: Check VSCode product name (most reliable)
  try {
    const vscodeEnv = vscode.env;
    if (vscodeEnv?.appName) {
      const productName = vscodeEnv.appName.toLowerCase();
      if (productName.includes('qoder')) {
        log('INFO', 'Detected Qoder from VSCode appName', { appName: vscodeEnv.appName });
        return 'qoder';
      }
      if (productName.includes('trae')) {
        log('INFO', 'Detected Trae from VSCode appName', { appName: vscodeEnv.appName });
        return 'trae';
      }
      if (productName.includes('qwen')) {
        log('INFO', 'Detected Qwen from VSCode appName', { appName: vscodeEnv.appName });
        return 'qwen';
      }
      if (productName.includes('opencode')) {
        log('INFO', 'Detected OpenCode from VSCode appName', { appName: vscodeEnv.appName });
        return 'opencode';
      }
      if (productName.includes('cursor')) {
        log('INFO', 'Detected Cursor from VSCode appName', { appName: vscodeEnv.appName });
        return 'claude-code'; // Cursor uses Claude Code CLI
      }
    }
  } catch (error) {
    log('WARN', 'Failed to check VSCode appName', { error });
  }

  // Method 2: Check environment variables
  const appName = process.env.VSCODE_CWD || process.env.TERM_PROGRAM || '';
  if (appName.toLowerCase().includes('qoder')) {
    log('INFO', 'Detected Qoder from environment');
    return 'qoder';
  }
  if (appName.toLowerCase().includes('trae')) {
    log('INFO', 'Detected Trae from environment');
    return 'trae';
  }
  if (appName.toLowerCase().includes('qwen')) {
    log('INFO', 'Detected Qwen from environment');
    return 'qwen';
  }
  if (appName.toLowerCase().includes('opencode')) {
    log('INFO', 'Detected OpenCode from environment');
    return 'opencode';
  }

  // Method 3: Check which CLI executables are available
  const [qoderAvailable, traeAvailable, claudeAvailable, qwenAvailable, openCodeAvailable] =
    await Promise.all([
      isCliProviderAvailable('qoder'),
      isCliProviderAvailable('trae'),
      isCliProviderAvailable('claude-code'),
      isCliProviderAvailable('qwen'),
      isCliProviderAvailable('opencode'),
    ]);

  // If only one CLI is available, use it
  const availableCount = [
    qoderAvailable,
    traeAvailable,
    claudeAvailable,
    qwenAvailable,
    openCodeAvailable,
  ].filter(Boolean).length;
  if (availableCount === 1) {
    if (qoderAvailable) {
      log('INFO', 'Auto-detected Qoder (only available CLI)');
      return 'qoder';
    }
    if (traeAvailable) {
      log('INFO', 'Auto-detected Trae (only available CLI)');
      return 'trae';
    }
    if (claudeAvailable) {
      log('INFO', 'Auto-detected Claude Code (only available CLI)');
      return 'claude-code';
    }
    if (qwenAvailable) {
      log('INFO', 'Auto-detected Qwen (only available CLI)');
      return 'qwen';
    }
    if (openCodeAvailable) {
      log('INFO', 'Auto-detected OpenCode (only available CLI)');
      return 'opencode';
    }
  }

  // Method 4: Fall back to user setting
  const config = vscode.workspace.getConfiguration('cc-wf-studio.ai');
  const provider = config.get<AiCliProvider>('defaultProvider');

  if (provider && isValidProvider(provider)) {
    log('INFO', 'Using provider from settings', { provider });
    return provider;
  }

  // Method 5: Default to claude-code
  log('INFO', 'Using default provider: claude-code');
  return 'claude-code';
}

/**
 * Get default provider from auto-detection or VSCode settings
 *
 * @returns Default AI CLI provider
 */
export function getDefaultProvider(): AiCliProvider {
  // For synchronous contexts, we need a cached value
  // This will be set during extension activation
  if (cachedProvider) {
    return cachedProvider;
  }

  // Fallback: try to detect synchronously (limited detection)
  try {
    const vscodeEnv = vscode.env;
    if (vscodeEnv?.appName) {
      const productName = vscodeEnv.appName.toLowerCase();
      if (productName.includes('qoder')) {
        return 'qoder';
      }
      if (productName.includes('trae')) {
        return 'trae';
      }
      if (productName.includes('qwen')) {
        return 'qwen';
      }
      if (productName.includes('opencode')) {
        return 'opencode';
      }
    }
  } catch {
    // Ignore
  }

  // Check user setting
  const config = vscode.workspace.getConfiguration('cc-wf-studio.ai');
  const provider = config.get<AiCliProvider>('defaultProvider');
  if (provider && isValidProvider(provider)) {
    return provider;
  }

  return 'claude-code';
}

// Cache for detected provider
let cachedProvider: AiCliProvider | null = null;

/**
 * Initialize provider detection (call during extension activation)
 */
export async function initializeProviderDetection(): Promise<void> {
  cachedProvider = await detectCurrentProvider();
  log('INFO', 'Provider detection initialized', { provider: cachedProvider });

  // Pre-load models for all available providers
  const providers: AiCliProvider[] = ['claude-code', 'qoder', 'trae', 'qwen', 'opencode'];
  await Promise.all(
    providers.map(async (provider) => {
      try {
        const models = await detectProviderModels(provider);
        if (models.length > 0) {
          log('INFO', `Models detected for ${provider}`, {
            count: models.length,
            models: models.map((m) => m.id),
          });
        }
      } catch (error) {
        log('WARN', `Failed to detect models for ${provider}`, { error });
      }
    })
  );
}

/**
 * Get default model from VSCode settings
 *
 * @returns Default model
 */
export function getDefaultModel(): ClaudeModel {
  const config = vscode.workspace.getConfiguration('cc-wf-studio.ai');
  const model = config.get<ClaudeModel>('defaultModel');

  if (model && isValidModel(model)) {
    log('INFO', 'Using default model from settings', { model });
    return model;
  }

  return 'sonnet';
}

/**
 * Get default Qoder model from VSCode settings
 *
 * @returns Default Qoder model
 */
export function getDefaultQoderModel(): QoderModel {
  const config = vscode.workspace.getConfiguration('cc-wf-studio.ai');
  const model = config.get<QoderModel>('defaultQoderModel');

  if (model && isValidQoderModel(model)) {
    log('INFO', 'Using default Qoder model from settings', { model });
    return model;
  }

  return 'auto';
}

/**
 * Get default Qwen model from VSCode settings
 *
 * @returns Default Qwen model (empty string means use CLI default)
 */
export function getDefaultQwenModel(): QwenModel {
  const config = vscode.workspace.getConfiguration('cc-wf-studio.ai');
  const model = config.get<QwenModel>('defaultQwenModel');

  if (model) {
    log('INFO', 'Using default Qwen model from settings', { model });
    return model;
  }

  return ''; // Empty string means use CLI default
}

/**
 * Get default OpenCode model from VSCode settings
 *
 * @returns Default OpenCode model (empty string means use CLI default)
 */
export function getDefaultOpenCodeModel(): OpenCodeModel {
  const config = vscode.workspace.getConfiguration('cc-wf-studio.ai');
  const model = config.get<OpenCodeModel>('defaultOpenCodeModel');

  if (model) {
    log('INFO', 'Using default OpenCode model from settings', { model });
    return model;
  }

  return ''; // Empty string means use CLI default
}

/**
 * Check if provider is valid
 */
function isValidProvider(provider: string): provider is AiCliProvider {
  return ['claude-code', 'qoder', 'trae', 'copilot', 'qwen', 'opencode'].includes(provider);
}

/**
 * Check if model is valid
 */
function isValidModel(model: string): model is ClaudeModel {
  return ['sonnet', 'opus', 'haiku'].includes(model);
}

/**
 * Check if Qoder model is valid
 */
function isValidQoderModel(model: string): model is QoderModel {
  return ['auto', 'efficient', 'lite', 'performance', 'ultimate'].includes(model);
}

/**
 * Get the effective model based on the provider
 *
 * This is the single source of truth for model selection:
 * - For 'qoder' provider: uses qoderModel
 * - For 'qwen' provider: uses qwenModel
 * - For 'opencode' provider: uses openCodeModel
 * - For 'claude-code' or 'trae': uses claudeModel
 * - For 'copilot': returns empty string (handled by vscode-lm-service)
 *
 * @param provider - The AI CLI provider
 * @param claudeModel - Claude/Trae model (default: 'sonnet')
 * @param qoderModel - Qoder model (default: 'auto')
 * @param qwenModel - Qwen model (optional, uses CLI default if empty)
 * @param openCodeModel - OpenCode model (optional, format: provider/model)
 * @returns The effective model string to use
 */
export function getEffectiveModel(
  provider: AiCliProvider,
  claudeModel: ClaudeModel = 'sonnet',
  qoderModel: QoderModel = 'auto',
  qwenModel: QwenModel = '',
  openCodeModel: OpenCodeModel = ''
): string {
  if (provider === 'qoder') {
    return qoderModel;
  }
  if (provider === 'qwen') {
    return qwenModel; // May be empty, which means use CLI default
  }
  if (provider === 'opencode') {
    return openCodeModel; // May be empty, which means use CLI default
  }
  if (provider === 'copilot') {
    return ''; // Copilot uses vscode-lm-service with its own model handling
  }
  // claude-code and trae use claudeModel
  return claudeModel;
}

/**
 * Build CLI arguments for non-streaming execution
 *
 * @param provider - The AI CLI provider
 * @param options - Execution options
 * @returns CLI arguments array
 */
export function buildCliArgs(provider: AiCliProvider, options: CliExecutionOptions): string[] {
  const config = getProviderConfig(provider);
  if (!config) {
    log('WARN', 'No CLI config for provider, using default args', { provider });
    return ['-p', '-', '--model', options.model];
  }
  return config.buildArgs(options);
}

/**
 * Build CLI arguments for streaming execution
 *
 * @param provider - The AI CLI provider
 * @param options - Streaming options
 * @returns CLI arguments array
 */
export function buildStreamingCliArgs(
  provider: AiCliProvider,
  options: CliStreamingOptions
): string[] {
  const config = getProviderConfig(provider);
  if (!config) {
    log('WARN', 'No CLI config for provider, using default streaming args', { provider });
    return ['-p', '-', '--output-format', 'stream-json', '--verbose', '--model', options.model];
  }
  return config.buildStreamingArgs(options);
}

/**
 * Model info returned from detection
 */
export interface CliModelInfo {
  id: string;
  name: string;
  available: boolean;
}

/**
 * Cached models per provider
 */
const cachedModels = new Map<AiCliProvider, CliModelInfo[]>();

/**
 * Detect available models for a CLI provider
 *
 * Attempts to detect models by:
 * 1. Checking if the CLI exists
 * 2. Using default models from provider config
 *
 * @param provider - The AI CLI provider
 * @returns Array of available models
 */
export async function detectProviderModels(provider: AiCliProvider): Promise<CliModelInfo[]> {
  if (provider === 'copilot') {
    return []; // Copilot models are handled by vscode-lm-service
  }

  // Return cached models if available
  const cached = cachedModels.get(provider);
  if (cached) {
    return cached;
  }

  const config = getProviderConfig(provider);
  if (!config) {
    return [];
  }

  // Check if CLI is available
  const cliPath = await getCliPath(config.executable);
  if (!cliPath) {
    log('INFO', `CLI not found for provider: ${provider}`);
    return [];
  }

  // Try to get models from CLI --help or similar command
  const detectedModels = await tryDetectModelsFromCli(cliPath, provider);
  if (detectedModels.length > 0) {
    cachedModels.set(provider, detectedModels);
    return detectedModels;
  }

  // Fall back to default models
  const defaultModels: CliModelInfo[] = config.defaultModels.map((model) => ({
    id: model,
    name: model.charAt(0).toUpperCase() + model.slice(1),
    available: true,
  }));

  cachedModels.set(provider, defaultModels);
  return defaultModels;
}

/**
 * Try to detect models from CLI help output or dedicated commands
 */
async function tryDetectModelsFromCli(
  cliPath: string,
  provider: AiCliProvider
): Promise<CliModelInfo[]> {
  try {
    // For Claude Code and Trae: these CLIs don't have a 'models' command
    // They use hardcoded model aliases (sonnet, opus, haiku) that map to the latest versions
    // We'll use the default models from config instead of trying to detect them
    if (provider === 'claude-code' || provider === 'trae') {
      log('INFO', `Using default models for ${provider} (CLI does not support model listing)`);
      return []; // Return empty to use default models from config
    }

    // For Qoder, try 'qodercli --help' and parse model information
    if (provider === 'qoder') {
      try {
        const spawn = await getNanoSpawn();
        const result = await spawn(cliPath, ['--help'], { timeout: 5000 });
        const output = result.stdout + result.stderr;

        // Parse Qoder model list from help output
        const models: CliModelInfo[] = [];
        const lines = output.split('\n');

        for (const line of lines) {
          const trimmed = line.trim().toLowerCase();
          // Look for Qoder model names
          if (trimmed.includes('auto') && !models.find((m) => m.id === 'auto')) {
            models.push({ id: 'auto', name: 'Auto', available: true });
          }
          if (trimmed.includes('efficient') && !models.find((m) => m.id === 'efficient')) {
            models.push({ id: 'efficient', name: 'Efficient', available: true });
          }
          if (trimmed.includes('lite') && !models.find((m) => m.id === 'lite')) {
            models.push({ id: 'lite', name: 'Lite', available: true });
          }
          if (trimmed.includes('performance') && !models.find((m) => m.id === 'performance')) {
            models.push({ id: 'performance', name: 'Performance', available: true });
          }
          if (trimmed.includes('ultimate') && !models.find((m) => m.id === 'ultimate')) {
            models.push({ id: 'ultimate', name: 'Ultimate', available: true });
          }
        }

        if (models.length > 0) {
          log('INFO', `Detected models from ${provider} CLI`, {
            models: models.map((m) => m.id),
          });
          return models;
        }
      } catch (error) {
        log('INFO', `Could not parse models from ${provider} --help`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // For OpenCode, use 'opencode models' command
    if (provider === 'opencode') {
      try {
        const spawn = await getNanoSpawn();
        const result = await spawn(cliPath, ['models'], { timeout: 10000 });
        const output = result.stdout;

        // Parse OpenCode model list - each line is a model ID (e.g., "openrouter/anthropic/claude-sonnet-4")
        const models: CliModelInfo[] = [];
        const lines = output.split('\n');

        for (const line of lines) {
          const modelId = line.trim();
          if (modelId && !modelId.startsWith('[') && modelId.includes('/')) {
            // Create readable name from model ID
            const parts = modelId.split('/');
            const modelName = parts[parts.length - 1]; // Last part is the model name
            const providerName = parts.length > 1 ? parts[parts.length - 2] : parts[0];
            const displayName = `${providerName}/${modelName}`;

            models.push({
              id: modelId,
              name: displayName,
              available: true,
            });
          }
        }

        if (models.length > 0) {
          log('INFO', `Detected models from OpenCode CLI`, {
            count: models.length,
            sample: models.slice(0, 5).map((m) => m.id),
          });
          return models;
        }
      } catch (error) {
        log('INFO', `Could not get models from opencode models command`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Generic fallback: try --help to see if it contains model information
    const spawn = await getNanoSpawn();
    const result = await spawn(cliPath, ['--help'], { timeout: 5000 });
    const output = result.stdout + result.stderr;

    // Parse model names from help output if present
    // This is a best-effort detection - different CLIs may have different formats
    const modelMatch = output.match(/models?[:\s]+(\w+(?:[,\s]+\w+)*)/i);
    if (modelMatch) {
      const models = modelMatch[1].split(/[,\s]+/).filter((m: string) => m.length > 0);
      log('INFO', `Detected models from ${provider} CLI help`, { models });
      return models.map((model: string) => ({
        id: model.toLowerCase(),
        name: model.charAt(0).toUpperCase() + model.slice(1).toLowerCase(),
        available: true,
      }));
    }
  } catch (error) {
    log('INFO', `Could not detect models from ${provider} CLI`, {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return [];
}

/**
 * Clear cached models (useful when CLI installation changes)
 */
export function clearCachedModels(): void {
  cachedModels.clear();
}

/**
 * Check if a provider CLI is available
 *
 * @param provider - The AI CLI provider
 * @returns True if CLI is available
 */
export async function isCliProviderAvailable(provider: AiCliProvider): Promise<boolean> {
  if (provider === 'copilot') {
    return true; // Copilot availability is handled separately
  }

  const config = getProviderConfig(provider);
  if (!config) {
    return false;
  }

  const cliPath = await getCliPath(config.executable);
  return cliPath !== null;
}

/**
 * Get the configuration directory name for a provider
 *
 * Different IDEs/CLIs use different configuration directories:
 * - Claude Code / Trae / Copilot: .vscode and .claude
 * - Qoder: .qoder (lowercase)
 *
 * @param provider - The AI CLI provider
 * @returns Configuration directory name (e.g., '.vscode', '.qoder')
 */
export function getConfigDirectory(provider: AiCliProvider): string {
  if (provider === 'qoder') {
    return '.qoder';
  }
  if (provider === 'qwen') {
    return '.qwen';
  }
  if (provider === 'opencode') {
    return '.opencode';
  }
  // claude-code, trae, copilot all use .vscode
  return '.vscode';
}

/**
 * Get the CLI-specific directory name for commands/agents/skills
 *
 * Different CLIs use different directory names:
 * - Claude Code / Trae: .claude
 * - Qoder: .qoder (lowercase)
 * - Qwen: .qwen
 * - OpenCode: .opencode
 * - Copilot: .vscode (uses VS Code)
 *
 * @param provider - The AI CLI provider
 * @returns CLI directory name (e.g., '.claude', '.qoder', '.qwen', '.opencode')
 */
export function getCliDirectory(provider: AiCliProvider): string {
  if (provider === 'qoder') {
    return '.qoder';
  }
  if (provider === 'qwen') {
    return '.qwen';
  }
  if (provider === 'opencode') {
    return '.opencode';
  }
  if (provider === 'claude-code' || provider === 'trae') {
    return '.claude';
  }
  // copilot uses .vscode
  return '.vscode';
}
