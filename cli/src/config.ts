import { parse as parseYaml } from "yaml";

/** Default public repository for open-source skills */
export const DEFAULT_REPO = "https://github.com/jame2408/agent-skills.git";

/** Name of the local project config file for multi-repo support */
export const CONFIG_FILENAME = ".agent-skills.json";

/** Expected directory names inside the skills repo */
export const SKILLS_DIR = "skills";
export const REFERENCES_DIR = "references";

/**
 * Parsed SKILL.md frontmatter.
 */
export interface SkillMeta {
    name: string;
    description: string;
    /** Optional short trigger/usage hint for post-install display */
    trigger?: string;
}

/**
 * Represents a skill discovered from a repo.
 */
export interface SkillInfo {
    /** Skill name from SKILL.md frontmatter */
    name: string;
    /** Description from SKILL.md frontmatter */
    description: string;
    /** Directory name inside skills/ */
    dirName: string;
    /** Source repo URL */
    repo: string;
    /** Optional trigger/usage hint */
    trigger?: string;
}

/**
 * Project-level config file shape (.agent-skills.json).
 */
export interface ProjectConfig {
    repos: string[];
}

/**
 * Parse YAML frontmatter from a SKILL.md content string.
 */
export function parseSkillFrontmatter(content: string): SkillMeta | null {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return null;

    try {
        const parsed = parseYaml(match[1]) as Record<string, unknown>;
        const name = typeof parsed.name === "string" ? parsed.name : "";
        let description = "";
        if (typeof parsed.description === "string") {
            // Take only the first non-empty line for display in list/search
            const firstLine = parsed.description
                .split("\n")
                .map((line) => line.trim())
                .find((line) => line.length > 0);
            description = firstLine ?? "";
        }
        if (!name) return null;

        let trigger: string | undefined = undefined;
        if (parsed.metadata && typeof parsed.metadata === "object") {
            const metaObj = parsed.metadata as Record<string, unknown>;
            if (typeof metaObj.trigger === "string") {
                trigger = metaObj.trigger.trim();
            }
        }

        return { name, description, trigger };
    } catch {
        return null;
    }
}
