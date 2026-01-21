/**
 * Cross-Platform Path Utilities for Skill Management
 *
 * Feature: 001-skill-node
 * Purpose: Handle Windows/Unix path differences for Skill directories
 *
 * Based on: specs/001-skill-node/research.md Section 3
 */

import os from 'node:os';
import path from 'node:path';
import * as vscode from 'vscode';
import type { AiCliProvider } from '../../shared/types/messages';
import { getCliDirectory } from '../services/cli-provider-config';

/**
 * Get the user-scope Skills directory path
 *
 * @param provider - The AI CLI provider (optional, defaults to 'claude-code')
 * @returns Absolute path to ~/.claude/skills/ or ~/.qoder/skills/
 *
 * @example
 * // Unix (Claude Code): /Users/username/.claude/skills
 * // Unix (Qoder): /Users/username/.qoder/skills
 * // Windows (Claude Code): C:\Users\username\.claude\skills
 * // Windows (Qoder): C:\Users\username\.qoder\skills
 */
export function getUserSkillsDir(provider?: AiCliProvider): string {
  const cliDir = getCliDirectory(provider || 'claude-code');
  return path.join(os.homedir(), cliDir, 'skills');
}

/**
 * @deprecated Use getUserSkillsDir() instead. Kept for backward compatibility.
 */
export function getPersonalSkillsDir(): string {
  return getUserSkillsDir();
}

/**
 * Get the current workspace root path
 *
 * @returns Absolute path to workspace root, or null if no workspace is open
 *
 * @example
 * // Unix: /workspace/myproject
 * // Windows: C:\workspace\myproject
 */
export function getWorkspaceRoot(): string | null {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? null;
}

/**
 * Get the project Skills directory path
 *
 * @param provider - The AI CLI provider (optional, defaults to 'claude-code')
 * @returns Absolute path to .claude/skills/ or .qoder/skills/ in workspace root, or null if no workspace
 *
 * @example
 * // Unix (Claude Code): /workspace/myproject/.claude/skills
 * // Unix (Qoder): /workspace/myproject/.qoder/skills
 * // Windows (Claude Code): C:\workspace\myproject\.claude\skills
 * // Windows (Qoder): C:\workspace\myproject\.qoder\skills
 */
export function getProjectSkillsDir(provider?: AiCliProvider): string | null {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return null;
  }
  const cliDir = getCliDirectory(provider || 'claude-code');
  return path.join(workspaceRoot, cliDir, 'skills');
}

/**
 * Get the installed plugins JSON path
 *
 * @param provider - The AI CLI provider (optional, defaults to 'claude-code')
 * @returns Absolute path to ~/.claude/plugins/installed_plugins.json or ~/.qoder/plugins/installed_plugins.json
 *
 * @example
 * // Unix (Claude Code): /Users/username/.claude/plugins/installed_plugins.json
 * // Unix (Qoder): /Users/username/.qoder/plugins/installed_plugins.json
 * // Windows (Claude Code): C:\Users\username\.claude\plugins\installed_plugins.json
 * // Windows (Qoder): C:\Users\username\.qoder\plugins\installed_plugins.json
 */
export function getInstalledPluginsJsonPath(provider?: AiCliProvider): string {
  const cliDir = getCliDirectory(provider || 'claude-code');
  return path.join(os.homedir(), cliDir, 'plugins', 'installed_plugins.json');
}

/**
 * Get the Claude settings JSON path
 *
 * @param provider - The AI CLI provider (optional, defaults to 'claude-code')
 * @returns Absolute path to ~/.claude/settings.json or ~/.qoder/settings.json
 *
 * @example
 * // Unix (Claude Code): /Users/username/.claude/settings.json
 * // Unix (Qoder): /Users/username/.qoder/settings.json
 * // Windows (Claude Code): C:\Users\username\.claude\settings.json
 * // Windows (Qoder): C:\Users\username\.qoder\settings.json
 */
export function getClaudeSettingsJsonPath(provider?: AiCliProvider): string {
  const cliDir = getCliDirectory(provider || 'claude-code');
  return path.join(os.homedir(), cliDir, 'settings.json');
}

/**
 * Get the known marketplaces JSON path
 *
 * @param provider - The AI CLI provider (optional, defaults to 'claude-code')
 * @returns Absolute path to ~/.claude/plugins/known_marketplaces.json or ~/.qoder/plugins/known_marketplaces.json
 *
 * @example
 * // Unix (Claude Code): /Users/username/.claude/plugins/known_marketplaces.json
 * // Unix (Qoder): /Users/username/.qoder/plugins/known_marketplaces.json
 * // Windows (Claude Code): C:\Users\username\.claude\plugins\known_marketplaces.json
 * // Windows (Qoder): C:\Users\username\.qoder\plugins\known_marketplaces.json
 */
export function getKnownMarketplacesJsonPath(provider?: AiCliProvider): string {
  const cliDir = getCliDirectory(provider || 'claude-code');
  return path.join(os.homedir(), cliDir, 'plugins', 'known_marketplaces.json');
}

/**
 * Resolve a Skill path to absolute path
 *
 * @param skillPath - Skill path (absolute for user/local, relative for project)
 * @param scope - Skill scope ('user', 'project', or 'local')
 * @param provider - The AI CLI provider (optional, defaults to 'claude-code')
 * @returns Absolute path to SKILL.md file
 * @throws Error if scope is 'project' but no workspace folder exists
 *
 * @example
 * // User Skill (already absolute)
 * resolveSkillPath('/Users/alice/.claude/skills/my-skill/SKILL.md', 'user');
 * // => '/Users/alice/.claude/skills/my-skill/SKILL.md'
 *
 * // Project Skill (relative → absolute)
 * resolveSkillPath('.claude/skills/team-skill/SKILL.md', 'project');
 * // => '/workspace/myproject/.claude/skills/team-skill/SKILL.md'
 *
 * // Local Skill (already absolute, from plugin)
 * resolveSkillPath('/path/to/plugin/skills/my-skill/SKILL.md', 'local');
 * // => '/path/to/plugin/skills/my-skill/SKILL.md'
 */
export function resolveSkillPath(
  skillPath: string,
  scope: 'user' | 'project' | 'local',
  provider?: AiCliProvider
): string {
  if (scope === 'user' || scope === 'local') {
    // User and Local Skills use absolute paths
    return skillPath;
  }

  // Project Skills: convert relative path to absolute
  const projectDir = getProjectSkillsDir(provider);
  if (!projectDir) {
    throw new Error('No workspace folder found for project Skill resolution');
  }

  // If skillPath is already absolute, return as-is (backward compatibility)
  if (path.isAbsolute(skillPath)) {
    return skillPath;
  }

  // Resolve relative path from workspace root
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    throw new Error('No workspace folder found for Skill path resolution');
  }
  return path.resolve(workspaceRoot, skillPath);
}

/**
 * Convert absolute Skill path to relative path (for project Skills)
 *
 * @param absolutePath - Absolute path to SKILL.md file
 * @param scope - Skill scope ('user', 'project', or 'local')
 * @returns Relative path for project Skills, absolute path for user/local Skills
 *
 * @example
 * // Project Skill (absolute → relative)
 * toRelativePath('/workspace/myproject/.claude/skills/team-skill/SKILL.md', 'project');
 * // => '.claude/skills/team-skill/SKILL.md'
 *
 * // User Skill (keep absolute)
 * toRelativePath('/Users/alice/.claude/skills/my-skill/SKILL.md', 'user');
 * // => '/Users/alice/.claude/skills/my-skill/SKILL.md'
 *
 * // Local Skill (keep absolute, from plugin)
 * toRelativePath('/path/to/plugin/skills/my-skill/SKILL.md', 'local');
 * // => '/path/to/plugin/skills/my-skill/SKILL.md'
 */
export function toRelativePath(absolutePath: string, scope: 'user' | 'project' | 'local'): string {
  if (scope === 'user' || scope === 'local') {
    // User and Local Skills always use absolute paths
    return absolutePath;
  }

  // Project Skills: convert to relative path from workspace root
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    // No workspace: keep absolute (edge case)
    return absolutePath;
  }

  return path.relative(workspaceRoot, absolutePath);
}
