/**
 * CLI Provider Configuration Service
 *
 * Manages configuration for different AI CLI providers (Claude Code, Qoder, Trae).
 * Each provider may have different command-line argument formats.
 */

import nanoSpawn from 'nano-spawn';
import * as vscode from 'vscode';
import type { AiCliProvider, ClaudeModel, QoderModel } from '../../shared/types/messages';
import { log } from '../extension';
import { getCliPath } from './claude-cli-path';

interface Result {
  stdout: string;
  stderr: string;
  output: string;
  command: string;
  durationMs: number;
}

const spawn =
  nanoSpawn.default ||
  (nanoSpawn as (
    file: string,
    args?: readonly string[],
    options?: Record<string, unknown>
  ) => Promise<Result>);

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
      args.push('--tools', options.allowedTools.join(','));
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
      args.push('--tools', options.allowedTools.join(','));
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
      args.push('--tools', options.allowedTools.join(','));
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
      args.push('--tools', options.allowedTools.join(','));
      args.push('--allowed-tools', options.allowedTools.join(','));
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
 * Get default provider from VSCode settings
 *
 * @returns Default AI CLI provider
 */
export function getDefaultProvider(): AiCliProvider {
  const config = vscode.workspace.getConfiguration('cc-wf-studio.ai');
  const provider = config.get<AiCliProvider>('defaultProvider');

  if (provider && isValidProvider(provider)) {
    log('INFO', 'Using default provider from settings', { provider });
    return provider;
  }

  return 'claude-code';
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
 * Check if provider is valid
 */
function isValidProvider(provider: string): provider is AiCliProvider {
  return ['claude-code', 'qoder', 'trae', 'copilot'].includes(provider);
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
 * - For 'claude-code' or 'trae': uses claudeModel
 * - For 'copilot': returns empty string (handled by vscode-lm-service)
 *
 * @param provider - The AI CLI provider
 * @param claudeModel - Claude/Trae model (default: 'sonnet')
 * @param qoderModel - Qoder model (default: 'auto')
 * @returns The effective model string to use
 */
export function getEffectiveModel(
  provider: AiCliProvider,
  claudeModel: ClaudeModel = 'sonnet',
  qoderModel: QoderModel = 'auto'
): string {
  switch (provider) {
    case 'qoder':
      return qoderModel;
    case 'copilot':
      return ''; // Copilot uses vscode-lm-service with its own model handling
    case 'claude-code':
    case 'trae':
    default:
      return claudeModel;
  }
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
 * Try to detect models from CLI help output
 */
async function tryDetectModelsFromCli(
  cliPath: string,
  provider: AiCliProvider
): Promise<CliModelInfo[]> {
  try {
    // Try --help to see if it contains model information
    const result = await spawn(cliPath, ['--help'], { timeout: 5000 });
    const output = result.stdout + result.stderr;

    // Parse model names from help output if present
    // This is a best-effort detection - different CLIs may have different formats
    const modelMatch = output.match(/models?[:\s]+(\w+(?:[,\s]+\w+)*)/i);
    if (modelMatch) {
      const models = modelMatch[1].split(/[,\s]+/).filter((m) => m.length > 0);
      log('INFO', `Detected models from ${provider} CLI help`, { models });
      return models.map((model) => ({
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
