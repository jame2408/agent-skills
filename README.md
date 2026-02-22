# Agent Skills

> A CLI tool and curated repository for installing, updating, and managing **AI agent skills** across all major coding assistants — Cursor, Claude Code, GitHub Copilot, Gemini CLI, Codex, Windsurf, and [30+ more](#supported-agents).

## Quick Start

```bash
# Interactive mode — the CLI walks you through agent selection and skill picking
npx @james-jj-wang/agent-skills-cli add

# Non-interactive — install a specific skill for a specific agent
npx @james-jj-wang/agent-skills-cli add code-review --tool cursor
```

## Installation

```bash
# Run directly (no install needed)
npx @james-jj-wang/agent-skills-cli <command>

# Or install globally
npm install -g @james-jj-wang/agent-skills-cli
agent-skills <command>
```

**Requirements:** Node.js ≥ 18, Git

## CLI Commands

### `add [skills...]`

Install skills into your project or globally.

```bash
# Interactive — select agent and skills via prompts
agent-skills add

# Install specific skills for a specific agent
agent-skills add code-review doc-coauthoring --tool claude-code

# Install globally (user-level)
agent-skills add code-review --tool cursor --global
```

| Flag | Description |
|------|-------------|
| `-t, --tool <agent>` | Target AI agent (e.g. `cursor`, `claude-code`, `gemini-cli`) |
| `-g, --global` | Install to user-level global directory |
| `-r, --repo <url>` | Override the source repository URL |

### `info <skill>`

Show detailed information about a skill, including its full description, required references, and file listing.

```bash
agent-skills info code-review
```

| Flag | Description |
|------|-------------|
| `-r, --repo <url>` | Override the source repository URL |

### `init`

Initialize a project configuration file (`.agent-skills.json`) interactively. This sets up your default AI agent so you don't have to specify `--tool` every time, and allows you to configure custom skill repositories.

```bash
agent-skills init
```

### `list` (alias: `ls`)

List installed or available remote skills.

```bash
# List locally installed skills
agent-skills list

# List available skills from the remote repository
agent-skills list --remote
```

| Flag | Description |
|------|-------------|
| `--remote` | List available skills from the remote repository |
| `-r, --repo <url>` | Override the source repository URL |

### `remove [skills...]` (alias: `rm`)

Remove installed skills from your project or globally. If no skills are provided, opens an interactive prompt.

```bash
# Interactive removal
agent-skills rm

# Remove specific skills
agent-skills rm code-review --tool cursor
```

| Flag | Description |
|------|-------------|
| `-t, --tool <agent>` | Target AI agent |
| `-g, --global` | Remove from user-level global directory |

### `search <keyword>` (alias: `find`)

Search for skills by keyword in skill names and descriptions.

```bash
agent-skills search review
agent-skills search "code style"
```

| Flag | Description |
|------|-------------|
| `-r, --repo <url>` | Override the source repository URL |

### `update [skills...]`

Update installed skills to the latest version from the remote.

```bash
# Update all installed skills
agent-skills update

# Update specific skills only
agent-skills update code-review

# Update globally installed skills
agent-skills update --global
```

| Flag | Description |
|------|-------------|
| `-g, --global` | Update globally installed skills |
| `-r, --repo <url>` | Override the source repository URL |

## Configuration (`.agent-skills.json`)

To set a default AI agent (so you don't need to pass `--tool` every time) or to use private repositories instead of the default, you can generate a configuration file in your project root using `agent-skills init`.

The generated `.agent-skills.json` looks like this:

```json
{
  "defaultAgent": "claude-code",
  "repos": [
    "https://github.com/jame2408/agent-skills.git",
    "git@github.com:my-org/internal-skills.git"
  ]
}
```

The CLI will aggregate skills from all listed repositories. If `--tool` is not passed, it will use `defaultAgent`.

> **⚠️ Security Note:** The `--repo` flag and `.agent-skills.json` trigger `git clone` on the provided URLs. Only use repositories you trust.

## Supported Agents

### Popular

| Agent | CLI Flag | Project Path | Global Path |
|-------|----------|--------------|-------------|
| Cursor | `cursor` | `.agents/skills` | `~/.cursor/skills` |
| Claude Code | `claude-code` | `.claude/skills` | `~/.claude/skills` |
| GitHub Copilot | `github-copilot` | `.agents/skills` | `~/.copilot/skills` |
| Gemini CLI | `gemini-cli` | `.agents/skills` | `~/.gemini/skills` |
| Antigravity | `antigravity` | `.agent/skills` | `~/.gemini/antigravity/skills` |
| Codex | `codex` | `.agents/skills` | `~/.codex/skills` |
| Windsurf | `windsurf` | `.windsurf/skills` | `~/.codeium/windsurf/skills` |
| Roo Code | `roo` | `.roo/skills` | `~/.roo/skills` |
| Cline | `cline` | `.cline/skills` | `~/.cline/skills` |

<details>
<summary><strong>All Other Agents (25+)</strong></summary>

Amp, Augment, CodeBuddy, Command Code, Continue, Cortex Code, Crush, Droid, Goose, iFlow CLI, Junie, Kilo Code, Kimi Code CLI, Kiro CLI, Kode, MCPJam, Mistral Vibe, Mux, Neovate, OpenClaw, OpenCode, OpenHands, Pi, Pochi, Qoder, Qwen Code, Replit, Trae, Trae CN, Universal, Zencoder, AdaL

Use `--tool <flag>` with any of these. Run `agent-skills add` in interactive mode to see the full list with path details.

</details>

## Repository Structure

```
agent-skills/
├── skills/              # Skill packages (each has a SKILL.md)
│   ├── code-review/
│   ├── doc-coauthoring/
│   ├── simplify/
│   └── ...
├── references/          # Shared reference docs used by skills
│   ├── general/         # Cross-language rules
│   ├── dotnet/          # .NET / C# specific
│   ├── runtime/         # Agent runtime mappings
│   ├── shell/           # Shell compatibility notes
│   └── vcs/             # VCS platform commands (GitLab, GitHub)
└── cli/                 # The CLI tool source code
    └── src/
```

## Contributing a Skill

Each skill lives in its own directory under `skills/` and **must** contain a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: my-skill
description: |
  A concise description of what this skill does.
---

# My Skill

Full instructions for the AI agent...
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ | Unique skill identifier |
| `description` | ✅ | Short description shown in `list` and `search` |
| `metadata.trigger` | | Optional hint showing how to activate the skill (displayed after install) |

The body of `SKILL.md` contains the full instructions the AI agent will follow when the skill is activated.

## License

MIT
