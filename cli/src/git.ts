import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import pc from "picocolors";
import {
    SKILLS_DIR,
    REFERENCES_DIR,
    DEFAULT_REPO,
    CONFIG_FILENAME,
    type ProjectConfig,
    type SkillInfo,
    parseSkillFrontmatter,
} from "./config.js";

/**
 * Resolve the list of repo URLs to use.
 * Priority: --repo flag > .agent-skills.json > DEFAULT_REPO
 */
export function resolveRepos(repoFlag?: string): string[] {
    if (repoFlag) {
        return [repoFlag];
    }

    const configPath = path.resolve(process.cwd(), CONFIG_FILENAME);
    if (fs.existsSync(configPath)) {
        try {
            const raw = fs.readFileSync(configPath, "utf-8");
            const config: ProjectConfig = JSON.parse(raw);
            if (Array.isArray(config.repos) && config.repos.length > 0) {
                return config.repos;
            }
        } catch {
            // Ignore malformed config, fall through to default
        }
    }

    return [DEFAULT_REPO];
}

/**
 * Clone a repo into a temp directory (shallow, single-branch).
 * Returns the path to the cloned directory.
 */
export function cloneRepo(repoUrl: string): string {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-skills-"));
    try {
        execFileSync("git", ["clone", "--depth", "1", "--single-branch", repoUrl, tmpDir], {
            stdio: "pipe",
        });
    } catch (error) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        throw new Error(
            `Failed to clone repository: ${repoUrl}\n` +
            `Make sure the URL is correct and you have access (SSH key / token).`
        );
    }
    return tmpDir;
}

/**
 * Get the latest commit hash (HEAD) from a cloned local repository.
 */
export function getRepoCommitHash(clonedDir: string): string {
    try {
        return execFileSync("git", ["rev-parse", "HEAD"], {
            cwd: clonedDir,
            encoding: "utf-8",
        }).trim();
    } catch {
        return "unknown";
    }
}

/**
 * Scan a cloned repo's skills/ directory and return a list of SkillInfo.
 */
export function scanSkills(clonedDir: string, repoUrl: string): SkillInfo[] {
    const skillsRoot = path.join(clonedDir, SKILLS_DIR);
    if (!fs.existsSync(skillsRoot)) {
        return [];
    }

    const entries = fs.readdirSync(skillsRoot, { withFileTypes: true });
    const results: SkillInfo[] = [];

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const skillMdPath = path.join(skillsRoot, entry.name, "SKILL.md");
        if (!fs.existsSync(skillMdPath)) continue;

        const content = fs.readFileSync(skillMdPath, "utf-8");
        const meta = parseSkillFrontmatter(content);
        if (!meta) continue;

        results.push({
            name: meta.name,
            description: meta.description,
            dirName: entry.name,
            repo: repoUrl,
            trigger: meta.trigger,
        });
    }

    return results;
}

/**
 * Scan skills from all resolved repos.
 * Returns aggregated skills list and a map from repo URL to cloned directory.
 */
export function fetchAllSkills(repos: string[]): {
    skills: SkillInfo[];
    repoCloneMap: Map<string, string>;
} {
    const allSkills: SkillInfo[] = [];
    const repoCloneMap = new Map<string, string>();

    for (const repo of repos) {
        console.log(pc.gray(`  Fetching skills from ${repo}...`));
        const clonedDir = cloneRepo(repo);
        repoCloneMap.set(repo, clonedDir);
        const skills = scanSkills(clonedDir, repo);
        allSkills.push(...skills);
    }

    return { skills: allSkills, repoCloneMap };
}

/**
 * Copy a skill directory + references directory from a cloned repo into target.
 */
export function installSkill(
    clonedDir: string,
    skillDirName: string,
    targetBaseDir: string
): void {
    const skillSrc = path.join(clonedDir, SKILLS_DIR, skillDirName);
    const refSrc = path.join(clonedDir, REFERENCES_DIR);

    if (!fs.existsSync(skillSrc)) {
        throw new Error(
            `Skill directory "${skillDirName}" not found at expected path: ${skillSrc}\n` +
            `The repository may have an unexpected structure or the skill was removed.`
        );
    }

    // Ensure target skills directory exists
    const targetSkillsDir = path.join(targetBaseDir, skillDirName);
    fs.mkdirSync(targetSkillsDir, { recursive: true });
    copyDirRecursive(skillSrc, targetSkillsDir);

    // Copy references alongside skills (go up one level from skills/)
    const targetRefDir = path.resolve(targetBaseDir, "..", REFERENCES_DIR);
    if (fs.existsSync(refSrc)) {
        let needsReferences = false;
        const skillMdPath = path.join(skillSrc, "SKILL.md");
        if (fs.existsSync(skillMdPath)) {
            const content = fs.readFileSync(skillMdPath, "utf-8");
            if (content.includes("references/") || content.includes("references\\")) {
                needsReferences = true;
            }
        }

        if (needsReferences) {
            fs.mkdirSync(targetRefDir, { recursive: true });
            copyDirRecursive(refSrc, targetRefDir);
        }
    }
}

/**
 * Recursively copy contents of srcDir into destDir (overwrite existing files).
 */
export function copyDirRecursive(srcDir: string, destDir: string): void {
    fs.mkdirSync(destDir, { recursive: true });
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);

        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Get the resolved installation base directory for a given agent.
 */
export function getInstallDir(
    projectPath: string,
    globalPath: string,
    isGlobal: boolean
): string {
    if (isGlobal) {
        return path.join(os.homedir(), globalPath);
    }
    return path.resolve(process.cwd(), projectPath);
}

/**
 * Cleanup temporary cloned directories.
 */
export function cleanupDirs(dirs: string[]): void {
    for (const dir of dirs) {
        try {
            fs.rmSync(dir, { recursive: true, force: true });
        } catch {
            // Ignore cleanup errors
        }
    }
}

/**
 * Scan locally installed skills in a given directory.
 * Returns array of { name, description, dirName }.
 */
export function scanLocalSkills(
    skillsDir: string
): Array<{ name: string; description: string; dirName: string }> {
    if (!fs.existsSync(skillsDir)) {
        return [];
    }

    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    const results: Array<{ name: string; description: string; dirName: string }> =
        [];

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const skillMdPath = path.join(skillsDir, entry.name, "SKILL.md");
        if (!fs.existsSync(skillMdPath)) continue;

        const content = fs.readFileSync(skillMdPath, "utf-8");
        const meta = parseSkillFrontmatter(content);
        if (!meta) continue;

        results.push({
            name: meta.name,
            description: meta.description,
            dirName: entry.name,
        });
    }

    return results;
}
