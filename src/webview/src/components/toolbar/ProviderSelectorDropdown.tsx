/**
 * Provider Selector Dropdown Component
 *
 * Provides dropdown for selecting AI CLI provider for workflow execution:
 * - Claude Code (default)
 * - Qoder
 * - Trae
 */

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { AiCliProvider } from '@shared/types/messages';
import { Bot, Check, ChevronDown } from 'lucide-react';

// Fixed font sizes for dropdown menu (not responsive)
const FONT_SIZES = {
  small: 11,
} as const;

const PROVIDER_OPTIONS: {
  value: AiCliProvider;
  label: string;
}[] = [
  { value: 'claude-code', label: 'Claude Code' },
  { value: 'qoder', label: 'Qoder' },
  { value: 'trae', label: 'Trae' },
  { value: 'qwen', label: 'Qwen' },
  { value: 'opencode', label: 'OpenCode' },
];

interface ProviderSelectorDropdownProps {
  provider: AiCliProvider;
  onProviderChange: (provider: AiCliProvider) => void;
  disabled?: boolean;
}

export function ProviderSelectorDropdown({
  provider,
  onProviderChange,
  disabled = false,
}: ProviderSelectorDropdownProps) {
  const currentProviderLabel =
    PROVIDER_OPTIONS.find((opt) => opt.value === provider)?.label || 'Claude Code';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          style={{
            padding: '4px 8px',
            backgroundColor: 'var(--vscode-button-secondaryBackground)',
            color: 'var(--vscode-button-secondaryForeground)',
            border: 'none',
            borderRadius: '2px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            opacity: disabled ? 0.6 : 1,
          }}
          title="Select AI Provider"
        >
          <Bot size={14} />
          <span>{currentProviderLabel}</span>
          <ChevronDown size={12} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={4}
          align="start"
          style={{
            backgroundColor: 'var(--vscode-dropdown-background)',
            border: '1px solid var(--vscode-dropdown-border)',
            borderRadius: '4px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            zIndex: 9999,
            minWidth: '120px',
            padding: '4px',
          }}
        >
          <DropdownMenu.RadioGroup value={provider}>
            {PROVIDER_OPTIONS.map((option) => (
              <DropdownMenu.RadioItem
                key={option.value}
                value={option.value}
                onSelect={(event) => {
                  event.preventDefault();
                  onProviderChange(option.value);
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: `${FONT_SIZES.small}px`,
                  color: 'var(--vscode-foreground)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  outline: 'none',
                  borderRadius: '2px',
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DropdownMenu.ItemIndicator>
                    <Check size={12} />
                  </DropdownMenu.ItemIndicator>
                </div>
                <span>{option.label}</span>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
