# AGENT.md — Developer Guide for AI Agents

> This file is intended for AI coding assistants working on this codebase.
> It covers architecture, conventions, and extension guides.

## Project Overview

**agent-skills** is a CLI tool + curated skill repository that lets developers install AI agent skills (instruction files) into their projects. The CLI clones a source repo, discovers skills via `SKILL.md` frontmatter, and copies them to the correct agent-specific directory.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript 5.7+ (strict mode) |
| Runtime | Node.js ≥ 18 |
| Module System | ES Modules (`"type": "module"` in package.json) |
| Module Resolution | `Node16` (tsconfig `module` + `moduleResolution`) |
| CLI Framework | [Commander.js](https://github.com/tj/commander.js) |
| Interactive Prompts | [@inquirer/prompts](https://github.com/SBoudrias/Inquirer.js) |
| Terminal Colors | [picocolors](https://github.com/alexeyraspopov/picocolors) |
| YAML Parsing | [yaml](https://github.com/eemeli/yaml) |
| Dev Runner | [tsx](https://github.com/privatenumber/tsx) |

## Directory Structure

```
agent-skills/
├── README.md              # User-facing usage manual
├── AGENT.md               # This file (AI agent dev guide)
├── skills/                # Skill packages (each has SKILL.md)
│   ├── code-review/       # Example: code review workflow
│   ├── doc-coauthoring/   # Example: document co-authoring
│   ├── simplify/          # Example: code simplification
│   └── ...
├── references/            # Shared reference docs used by skills
│   ├── general/           # Cross-language review rules (*.rule.md)
│   ├── dotnet/            # .NET specific rules & guides
│   ├── runtime/           # Agent runtime tool mappings
│   ├── shell/             # Shell compatibility (bash/zsh, PowerShell)
│   └── vcs/               # VCS platform commands (GitLab, GitHub)
└── cli/                   # CLI tool
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts       # Entry point — registers all commands
        ├── agents.ts      # Agent definitions (names, flags, paths)
        ├── config.ts      # Constants, interfaces, SKILL.md parser
        ├── git.ts         # Git operations (clone, scan, install, copy)
        ├── prompts.ts     # Interactive prompt helpers
        └── commands/
            ├── add.ts     # `agent-skills add` command
            ├── list.ts    # `agent-skills list` command
            ├── search.ts  # `agent-skills search` command
            └── update.ts  # `agent-skills update` command
```

## Core Modules

### `agents.ts`
- Defines `AgentConfig` interface and the `AGENTS` array listing all supported AI agents.
- Each agent has: `name`, `flag` (CLI identifier), `projectPath`, and `globalPath`.
- `POPULAR_AGENT_FLAGS` controls which agents appear first in interactive selection.
- To **add a new agent**: append to the `AGENTS` array. If popular, also add the flag to `POPULAR_AGENT_FLAGS`.

### `config.ts`
- Exports constants: `DEFAULT_REPO`, `CONFIG_FILENAME`, `SKILLS_DIR`, `REFERENCES_DIR`.
- Defines `SkillInfo`, `SkillMeta`, `ProjectConfig` interfaces.
- `parseSkillFrontmatter()` extracts `name` and `description` from SKILL.md YAML frontmatter (`---\n...\n---`).

### `git.ts`
- `resolveRepos()` — resolves repo URLs: `--repo` flag > `.agent-skills.json` > `DEFAULT_REPO`.
- `cloneRepo()` — shallow clones a repo to a temp directory.
- `scanSkills()` — walks `skills/` in a cloned repo, reads each `SKILL.md`.
- `fetchAllSkills()` — aggregates skills from multiple repos.
- `installSkill()` — copies a skill directory + `references/` to the target agent directory.
- `scanLocalSkills()` — scans locally installed skills by checking for `SKILL.md` in subdirectories.
- `cleanupDirs()` — removes temporary clone directories.

### `prompts.ts`
- `promptSelectAgent()` — interactive agent picker with popular/other separator.
- `promptSelectSkills()` — multi-select checkbox for skill selection.

### `commands/*.ts`
- Each file exports a single `Command` instance registered in `index.ts`.
- Commands follow a consistent pattern: resolve inputs → fetch remote → perform action → cleanup.

## Development Conventions

### Import Paths Must Use `.js` Extension

Because the project uses `"moduleResolution": "Node16"`, all relative imports **must** use the `.js` extension, even though source files are `.ts`:

```typescript
// ✅ Correct
import { resolveRepos } from "./git.js";
import { AGENTS } from "../agents.js";

// ❌ Wrong — will fail at runtime
import { resolveRepos } from "./git";
import { AGENTS } from "../agents";
```

### Error Handling

- Wrap command action bodies in `try/catch`.
- Check `error instanceof Error` before accessing `.message`.
- Call `process.exit(1)` on fatal errors.
- Use `cleanupDirs()` in both success and error paths to remove temp directories.

### Console Output Style

- Use `picocolors` (`pc`) for all colored output.
- Prefix messages with emoji for visual scanning: `📡`, `📦`, `🔍`, `🔄`, `✅`, `❌`, `🎉`.
- Use `pc.cyan()` for info headers, `pc.green()` for success, `pc.yellow()` for warnings, `pc.red()` for errors, `pc.gray()` for secondary info.

### Naming Conventions

- Files: `kebab-case.ts`
- Exported functions: `camelCase`
- Interfaces/Types: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- CLI flags: `kebab-case`

## Build & Development

```bash
cd cli

# Install dependencies
npm install

# Development (runs TypeScript directly via tsx)
npm run dev -- <command> [args]

# Build (compiles to dist/)
npm run build

# Run compiled output
npm start -- <command> [args]
```

## Security Considerations

- The `--repo` flag and `.agent-skills.json` trigger `git clone` on the provided URLs. Only use repositories you trust.
- `cloneRepo()` uses `execFileSync` (not shell) to avoid command injection from user-supplied URLs.
- `installSkill()` validates the skill source directory exists before copying, providing clear error messages for malformed repos.

## How to Extend

### Adding a New Command

1. Create `cli/src/commands/<name>.ts` exporting a `Command` instance.
2. Import and register it in `cli/src/index.ts` via `program.addCommand()`.

### Adding a New Agent

1. Add an entry to the `AGENTS` array in `cli/src/agents.ts`.
2. If it should appear in the "Popular" section, add its flag to `POPULAR_AGENT_FLAGS`.

### Adding a New Skill to the Repository

1. Create a directory under `skills/<skill-name>/`.
2. Add a `SKILL.md` with YAML frontmatter:
   ```yaml
   ---
   name: skill-name
   description: |
     Short description of the skill.
   ---
   ```
3. The body of `SKILL.md` contains the full AI agent instructions.
4. Optionally add subdirectories for templates, scripts, or examples.

### Adding a New Reference Category

1. Create a directory under `references/<category>/`.
2. Use the naming convention:
   - `*.rule.md` — auto-loaded review rules
   - `*.guide.md` — development guides (not auto-loaded)
   - `*.ref.md` — pure reference (loaded only when explicitly referenced by a skill)

## SKILL.md Format

```yaml
---
name: my-skill          # Required. Unique identifier.
description: |          # Required. Shown in `list` and `search`.
  What this skill does.
---
```

The CLI uses `parseSkillFrontmatter()` in `config.ts` to extract these fields. The regex pattern is:

```
/^---\r?\n([\s\S]*?)\r?\n---/
```

Both `name` and `description` must be strings. A skill without a valid `name` field is silently skipped.
