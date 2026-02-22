import { parse as parseYaml } from "yaml";

/** Default public repository for open-source skills */
export const DEFAULT_REPO = "https://github.com/jame2408/agent-skills.git";

/** Name of the local project config file for multi-repo support */
export const CONFIG_FILENAME = ".agent-skills.json";

/** Name of the lock file used for version tracking */
export const LOCK_FILENAME = ".agent-skills-lock.json";

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

export interface ProjectConfig {
    /** Default AI agent flag (e.g. "cursor", "claude-code") */
    defaultAgent?: string;
    /** Array of repository URLs to fetch skills from */
    repos?: string[];
}

/** Lock data for a specific skill */
export interface SkillLockData {
    /** The commit hash of the git repository when installed */
    version: string;
    /** The source repository URL */
    repo: string;
    /** ISO timestamp of when it was installed */
    installedAt: string;
}

/** The structure of the .agent-skills-lock.json file */
export interface LockFile {
    skills: Record<string, SkillLockData>;
}

/**
 * Load the project config if it exists.
 */
import fs from "node:fs";
import path from "node:path";
export function loadProjectConfig(): ProjectConfig | null {
    const configPath = path.resolve(process.cwd(), CONFIG_FILENAME);
    if (fs.existsSync(configPath)) {
        try {
            const raw = fs.readFileSync(configPath, "utf-8");
            return JSON.parse(raw) as ProjectConfig;
        } catch {
            return null;
        }
    }
    return null;
}

/**
 * Read the lock file from a target directory
 */
export function readLockFile(targetDir: string): LockFile {
    const lockPath = path.join(targetDir, LOCK_FILENAME);
    if (fs.existsSync(lockPath)) {
        try {
            return JSON.parse(fs.readFileSync(lockPath, "utf-8")) as LockFile;
        } catch {
            return { skills: {} };
        }
    }
    return { skills: {} };
}

/**
 * Write the lock file to a target directory
 */
export function writeLockFile(targetDir: string, lock: LockFile): void {
    const lockPath = path.join(targetDir, LOCK_FILENAME);
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + "\n");
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
