/**
 * Claude Code Workflow Studio - File Service
 *
 * Handles file system operations using VSCode workspace.fs API
 * Based on: /specs/001-cc-wf-studio/contracts/vscode-extension-api.md section 2
 */

import * as path from 'node:path';
import * as vscode from 'vscode';
import type { AiCliProvider } from '../../shared/types/messages';
import { getConfigDirectory } from './cli-provider-config';

/**
 * File Service for managing workflow files
 */
export class FileService {
  private readonly workspacePath: string;
  private readonly workflowsDirectory: string;
  private readonly provider: AiCliProvider;

  constructor(provider?: AiCliProvider) {
    // Get workspace root path
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder is open');
    }

    this.workspacePath = workspaceFolders[0].uri.fsPath;
    this.provider = provider || 'claude-code';

    // Use provider-specific config directory
    const configDir = getConfigDirectory(this.provider);
    this.workflowsDirectory = path.join(this.workspacePath, configDir, 'workflows');
  }

  /**
   * Ensure the workflows directory exists
   */
  async ensureWorkflowsDirectory(): Promise<void> {
    const uri = vscode.Uri.file(this.workflowsDirectory);

    try {
      await vscode.workspace.fs.stat(uri);
      // Directory exists
    } catch {
      // Directory doesn't exist, create it
      await vscode.workspace.fs.createDirectory(uri);
      console.log(`Created workflows directory: ${this.workflowsDirectory}`);
    }
  }

  /**
   * Read a file from the file system
   *
   * @param filePath - Absolute file path
   * @returns File content as string
   */
  async readFile(filePath: string): Promise<string> {
    const uri = vscode.Uri.file(filePath);
    const bytes = await vscode.workspace.fs.readFile(uri);
    return Buffer.from(bytes).toString('utf-8');
  }

  /**
   * Write content to a file
   *
   * @param filePath - Absolute file path
   * @param content - File content to write
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    const uri = vscode.Uri.file(filePath);
    const bytes = Buffer.from(content, 'utf-8');
    await vscode.workspace.fs.writeFile(uri, bytes);
    console.log(`File written: ${filePath}`);
  }

  /**
   * Check if a file exists
   *
   * @param filePath - Absolute file path
   * @returns True if file exists, false otherwise
   */
  async fileExists(filePath: string): Promise<boolean> {
    const uri = vscode.Uri.file(filePath);
    try {
      await vscode.workspace.fs.stat(uri);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a directory
   *
   * @param dirPath - Absolute directory path
   */
  async createDirectory(dirPath: string): Promise<void> {
    const uri = vscode.Uri.file(dirPath);
    await vscode.workspace.fs.createDirectory(uri);
    console.log(`Directory created: ${dirPath}`);
  }

  /**
   * Get the workflows directory path
   */
  getWorkflowsDirectory(): string {
    return this.workflowsDirectory;
  }

  /**
   * Get the workspace root path
   */
  getWorkspacePath(): string {
    return this.workspacePath;
  }

  /**
   * Get the current provider
   */
  getProvider(): AiCliProvider {
    return this.provider;
  }

  /**
   * Get the full path for a workflow file
   *
   * @param workflowName - Workflow name (without .json extension)
   * @returns Full file path
   */
  getWorkflowFilePath(workflowName: string): string {
    return path.join(this.workflowsDirectory, `${workflowName}.json`);
  }

  /**
   * List all workflow files in the workflows directory
   *
   * @returns Array of workflow file names (without .json extension)
   */
  async listWorkflowFiles(): Promise<string[]> {
    const uri = vscode.Uri.file(this.workflowsDirectory);

    try {
      const entries = await vscode.workspace.fs.readDirectory(uri);
      return entries
        .filter(([name, type]) => type === vscode.FileType.File && name.endsWith('.json'))
        .map(([name]) => name.replace(/\.json$/, ''));
    } catch {
      // Directory doesn't exist yet
      return [];
    }
  }
}
