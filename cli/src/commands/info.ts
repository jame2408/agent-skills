import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import pc from "picocolors";
import { parse as parseYaml } from "yaml";
import { getAllAgentFlags } from "../agents.js";
import {
    resolveRepos,
    fetchAllSkills,
    cleanupDirs,
} from "../git.js";
import { SKILLS_DIR, REFERENCES_DIR } from "../config.js";

export const infoCommand = new Command("info")
    .description("Show detailed information about a skill")
    .argument("<skill>", "Skill name or directory name to inspect")
    .option("-r, --repo <url>", "Override the source repository URL")
    .action(async (skillName: string, opts: { repo?: string }) => {
        try {
            const repos = resolveRepos(opts.repo);
            console.log(pc.gray("\n📡 Fetching skill details...\n"));

            const { skills, repoCloneMap } = fetchAllSkills(repos);
            const clonedDirs = [...repoCloneMap.values()];

            // Find the skill
            const skill = skills.find(
                (s) => s.dirName === skillName || s.name === skillName
            );

            if (!skill) {
                console.error(
                    pc.red(`Error: Skill "${skillName}" not found.`),
                    `\nAvailable: ${skills.map((s) => s.dirName).join(", ")}`
                );
                cleanupDirs(clonedDirs);
                process.exit(1);
            }

            // Read full SKILL.md content
            const clonedDir = repoCloneMap.get(skill.repo);
            if (!clonedDir) {
                cleanupDirs(clonedDirs);
                return;
            }

            const skillDir = path.join(clonedDir, SKILLS_DIR, skill.dirName);
            const skillMdPath = path.join(skillDir, "SKILL.md");
            const skillMdContent = fs.readFileSync(skillMdPath, "utf-8");

            // Extract full description from frontmatter
            const fullDescription = extractFullDescription(skillMdContent);

            // Check if it uses references
            const usesReferences = skillMdContent.includes("references/") || skillMdContent.includes("references\\");

            // List files in skill directory
            const skillFiles = listFilesRecursive(skillDir, skillDir);

            // Count lines in SKILL.md
            const lineCount = skillMdContent.split("\n").length;

            // Output
            console.log(pc.cyan(pc.bold(`  📦 ${skill.name}`)));
            console.log(pc.gray("  ─".repeat(30)));
            console.log();
            console.log(pc.bold("  Description:"));
            if (fullDescription) {
                for (const line of fullDescription.split("\n")) {
                    console.log(`    ${pc.white(line.trim())}`);
                }
            } else {
                console.log(`    ${pc.gray("No description")}`);
            }
            console.log();
            console.log(pc.bold("  Details:"));
            console.log(`    Source:       ${pc.gray(skill.repo)}`);
            console.log(`    Directory:    ${pc.green(skill.dirName)}`);
            console.log(`    SKILL.md:     ${pc.gray(`${lineCount} lines`)}`);
            console.log(`    References:   ${usesReferences ? pc.yellow("Yes (will install references/ directory)") : pc.gray("No")}`);
            console.log();
            console.log(pc.bold("  Files:"));
            for (const file of skillFiles) {
                console.log(`    ${pc.gray(file)}`);
            }
            console.log();

            cleanupDirs(clonedDirs);
        } catch (error) {
            if (error instanceof Error) {
                console.error(pc.red(`\n❌ ${error.message}`));
            }
            process.exit(1);
        }
    });

/**
 * Extract the full multi-line description from SKILL.md frontmatter.
 */
function extractFullDescription(content: string): string {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return "";

    try {
        const parsed = parseYaml(match[1]) as Record<string, unknown>;
        if (typeof parsed.description === "string") {
            return parsed.description.trim();
        }
        return "";
    } catch {
        return "";
    }
}

/**
 * List all files in a directory recursively, returning paths relative to baseDir.
 */
function listFilesRecursive(dir: string, baseDir: string): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);
        if (entry.isDirectory()) {
            results.push(...listFilesRecursive(fullPath, baseDir));
        } else {
            results.push(relativePath);
        }
    }

    return results;
}
