---
name: my-workflow
description: Execute the "my-workflow" workflow. This skill guides through a structured workflow with defined steps and decision points.
---

# my-workflow

## Workflow Diagram

```mermaid
flowchart TD
    start_node_default([Start])
    end_node_default([End])
    agent_1768915114196[agent-1768915114196]

```

## Execution Instructions

## Workflow Execution Guide

Follow the Mermaid flowchart above to execute the workflow. Each node type has specific execution methods as described below.

### Execution Methods by Node Type

- **Rectangle nodes**: Execute Sub-Agents using the Task tool
- **Diamond nodes (AskUserQuestion:...)**: Use the AskUserQuestion tool to prompt the user and branch based on their response
- **Diamond nodes (Branch/Switch:...)**: Automatically branch based on the results of previous processing (see details section)
- **Rectangle nodes (Prompt nodes)**: Execute the prompts described in the details section below
