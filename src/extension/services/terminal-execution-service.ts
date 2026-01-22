/**
 * Claude Code Workflow Studio - Terminal Execution Service
 *
 * Handles execution of slash commands in VSCode integrated terminal
 */

import * as vscode from 'vscode';
import type { AiCliProvider } from '../../shared/types/messages';
import { getProviderExecutable } from './cli-provider-config';

/**
 * Options for executing a slash command in terminal
 */
export interface TerminalExecutionOptions {
  /** Workflow name (used for terminal tab name and slash command) */
  workflowName: string;
  /** Working directory for the terminal */
  workingDirectory: string;
  /** AI CLI provider to use (default: 'claude-code') */
  provider?: AiCliProvider;
}

/**
 * Result of terminal execution
 */
export interface TerminalExecutionResult {
  /** Name of the created terminal */
  terminalName: string;
  /** Reference to the VSCode terminal instance */
  terminal: vscode.Terminal;
}

/**
 * Execute a slash command in a new VSCode integrated terminal
 *
 * Creates a new terminal with the workflow name as the tab title,
 * sets the working directory to the workspace root, and executes
 * the AI CLI with the slash command.
 *
 * @param options - Terminal execution options
 * @returns Terminal execution result
 */
export function executeSlashCommandInTerminal(
  options: TerminalExecutionOptions
): TerminalExecutionResult {
  const provider = options.provider || 'claude-code';
  const executable = getProviderExecutable(provider);
  const terminalName = `Workflow: ${options.workflowName}`;

  // Create a new terminal with the workflow name
  const terminal = vscode.window.createTerminal({
    name: terminalName,
    cwd: options.workingDirectory,
  });

  // Show the terminal and focus on it
  terminal.show(true);

  // Execute the AI CLI with the slash command
  // Using double quotes to handle workflow names with spaces
  // Different CLIs have different syntax:
  // - claude/trae: claude "/workflow-name" (uses .claude/commands/)
  // - qoder: qodercli -w "dir" "/workflow-name"
  // - opencode: Does NOT support slash commands - use message directly
  // - qwen: Does NOT support slash commands
  if (provider === 'qoder') {
    terminal.sendText(`${executable} -w "${options.workingDirectory}" "/${options.workflowName}"`);
  } else if (provider === 'opencode' || provider === 'qwen') {
    // OpenCode and Qwen don't support Claude-style slash commands
    // Just send the workflow name as a message (user can type the actual content)
    terminal.sendText(
      `echo "Note: ${provider} does not support slash commands. Please use Claude Code or export as agent." && ${executable}`
    );
  } else {
    terminal.sendText(`${executable} "/${options.workflowName}"`);
  }

  return {
    terminalName,
    terminal,
  };
}

/**
 * Options for executing Copilot CLI skill command
 */
export interface CopilotCliExecutionOptions {
  /** Skill name (the workflow name as .github/skills/{name}/SKILL.md) */
  skillName: string;
  /** Working directory for the terminal */
  workingDirectory: string;
}

/**
 * Execute Copilot CLI with skill in a new VSCode integrated terminal
 *
 * Creates a new terminal and executes:
 *   copilot -i ":skill {skillName}" --allow-all-tools
 *
 * @param options - Copilot CLI execution options
 * @returns Terminal execution result
 */
export function executeCopilotCliInTerminal(
  options: CopilotCliExecutionOptions
): TerminalExecutionResult {
  const terminalName = `Copilot: ${options.skillName}`;

  // Create a new terminal
  const terminal = vscode.window.createTerminal({
    name: terminalName,
    cwd: options.workingDirectory,
  });

  // Show the terminal and focus on it
  terminal.show(true);

  // Execute: copilot -i ":skill {skillName}" --allow-all-tools
  terminal.sendText(`copilot -i ":skill ${options.skillName}" --allow-all-tools`);

  return {
    terminalName,
    terminal,
  };
}
