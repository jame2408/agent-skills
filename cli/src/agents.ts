/**
 * Supported AI Agent definitions.
 * Maps agent CLI flags to their project-level and global skill directories.
 * Based on: https://github.com/vercel-labs/skills (2026-02)
 */

export interface AgentConfig {
    /** Display name shown in interactive prompts */
    name: string;
    /** CLI flag value for --tool */
    flag: string;
    /** Project-level skills directory (relative to project root) */
    projectPath: string;
    /** Global skills directory (relative to user home ~) */
    globalPath: string;
}

export const AGENTS: AgentConfig[] = [
    // --- Popular / Mainstream ---
    { name: "Cursor", flag: "cursor", projectPath: ".agents/skills", globalPath: ".cursor/skills" },
    { name: "Claude Code", flag: "claude-code", projectPath: ".claude/skills", globalPath: ".claude/skills" },
    { name: "GitHub Copilot", flag: "github-copilot", projectPath: ".agents/skills", globalPath: ".copilot/skills" },
    { name: "Gemini CLI", flag: "gemini-cli", projectPath: ".agents/skills", globalPath: ".gemini/skills" },
    { name: "Antigravity", flag: "antigravity", projectPath: ".agent/skills", globalPath: ".gemini/antigravity/skills" },
    { name: "Codex", flag: "codex", projectPath: ".agents/skills", globalPath: ".codex/skills" },
    { name: "Windsurf", flag: "windsurf", projectPath: ".windsurf/skills", globalPath: ".codeium/windsurf/skills" },
    { name: "Roo Code", flag: "roo", projectPath: ".roo/skills", globalPath: ".roo/skills" },
    { name: "Cline", flag: "cline", projectPath: ".cline/skills", globalPath: ".cline/skills" },

    // --- Others (alphabetical) ---
    { name: "Amp", flag: "amp", projectPath: ".agents/skills", globalPath: ".config/agents/skills" },
    { name: "Augment", flag: "augment", projectPath: ".augment/skills", globalPath: ".augment/skills" },
    { name: "CodeBuddy", flag: "codebuddy", projectPath: ".codebuddy/skills", globalPath: ".codebuddy/skills" },
    { name: "Command Code", flag: "command-code", projectPath: ".commandcode/skills", globalPath: ".commandcode/skills" },
    { name: "Continue", flag: "continue", projectPath: ".continue/skills", globalPath: ".continue/skills" },
    { name: "Cortex Code", flag: "cortex", projectPath: ".cortex/skills", globalPath: ".snowflake/cortex/skills" },
    { name: "Crush", flag: "crush", projectPath: ".crush/skills", globalPath: ".config/crush/skills" },
    { name: "Droid", flag: "droid", projectPath: ".factory/skills", globalPath: ".factory/skills" },
    { name: "Goose", flag: "goose", projectPath: ".goose/skills", globalPath: ".config/goose/skills" },
    { name: "iFlow CLI", flag: "iflow-cli", projectPath: ".iflow/skills", globalPath: ".iflow/skills" },
    { name: "Junie", flag: "junie", projectPath: ".junie/skills", globalPath: ".junie/skills" },
    { name: "Kilo Code", flag: "kilo", projectPath: ".kilocode/skills", globalPath: ".kilocode/skills" },
    { name: "Kimi Code CLI", flag: "kimi-cli", projectPath: ".agents/skills", globalPath: ".config/agents/skills" },
    { name: "Kiro CLI", flag: "kiro-cli", projectPath: ".kiro/skills", globalPath: ".kiro/skills" },
    { name: "Kode", flag: "kode", projectPath: ".kode/skills", globalPath: ".kode/skills" },
    { name: "MCPJam", flag: "mcpjam", projectPath: ".mcpjam/skills", globalPath: ".mcpjam/skills" },
    { name: "Mistral Vibe", flag: "mistral-vibe", projectPath: ".vibe/skills", globalPath: ".vibe/skills" },
    { name: "Mux", flag: "mux", projectPath: ".mux/skills", globalPath: ".mux/skills" },
    { name: "Neovate", flag: "neovate", projectPath: ".neovate/skills", globalPath: ".neovate/skills" },
    { name: "OpenClaw", flag: "openclaw", projectPath: "skills", globalPath: ".openclaw/skills" },
    { name: "OpenCode", flag: "opencode", projectPath: ".agents/skills", globalPath: ".config/opencode/skills" },
    { name: "OpenHands", flag: "openhands", projectPath: ".openhands/skills", globalPath: ".openhands/skills" },
    { name: "Pi", flag: "pi", projectPath: ".pi/skills", globalPath: ".pi/agent/skills" },
    { name: "Pochi", flag: "pochi", projectPath: ".pochi/skills", globalPath: ".pochi/skills" },
    { name: "Qoder", flag: "qoder", projectPath: ".qoder/skills", globalPath: ".qoder/skills" },
    { name: "Qwen Code", flag: "qwen-code", projectPath: ".qwen/skills", globalPath: ".qwen/skills" },
    { name: "Replit", flag: "replit", projectPath: ".agents/skills", globalPath: ".config/agents/skills" },
    { name: "Trae", flag: "trae", projectPath: ".trae/skills", globalPath: ".trae/skills" },
    { name: "Trae CN", flag: "trae-cn", projectPath: ".trae/skills", globalPath: ".trae-cn/skills" },
    { name: "Universal", flag: "universal", projectPath: ".agents/skills", globalPath: ".config/agents/skills" },
    { name: "Zencoder", flag: "zencoder", projectPath: ".zencoder/skills", globalPath: ".zencoder/skills" },
    { name: "AdaL", flag: "adal", projectPath: ".adal/skills", globalPath: ".adal/skills" },
];

/** The popular agents shown at the top of the interactive selection list */
export const POPULAR_AGENT_FLAGS = [
    "cursor",
    "claude-code",
    "github-copilot",
    "gemini-cli",
    "antigravity",
    "codex",
    "windsurf",
    "roo",
    "cline",
];

/**
 * Find an agent config by its CLI flag value.
 */
export function findAgentByFlag(flag: string): AgentConfig | undefined {
    return AGENTS.find((a) => a.flag === flag);
}

/**
 * Get the list of all valid agent flag values.
 */
export function getAllAgentFlags(): string[] {
    return AGENTS.map((a) => a.flag);
}
