import path from "node:path";
import { Command } from "commander";
import pc from "picocolors";
import { AGENTS } from "../agents.js";
import { resolveRepos, fetchAllSkills, scanLocalSkills, cleanupDirs } from "../git.js";

export const listCommand = new Command("list")
    .alias("ls")
    .description("List installed skills or available remote skills")
    .option("--remote", "List available skills from the remote repository")
    .option("-r, --repo <url>", "Override the source repository URL")
    .action(async function (this: Command) {
        const opts = this.optsWithGlobals();
        try {
            if (opts.remote) {
                // List remote skills
                const repos = resolveRepos(opts.repo);
                console.log(pc.cyan("\n📡 Fetching available skills from remote...\n"));
                const { skills, repoCloneMap } = fetchAllSkills(repos);
                const clonedDirs = [...repoCloneMap.values()];

                if (skills.length === 0) {
                    console.log(pc.yellow("  No skills found in the repository."));
                } else {
                    const maxNameLen = Math.max(...skills.map((s) => s.name.length));
                    for (const skill of skills) {
                        const paddedName = skill.name.padEnd(maxNameLen);
                        console.log(
                            `  ${pc.green(paddedName)}  ${pc.gray(skill.description || "No description")}`
                        );
                    }
                    console.log(
                        pc.gray(`\n  Total: ${skills.length} skill(s) available`)
                    );
                }
                cleanupDirs(clonedDirs);
            } else {
                // List locally installed skills across all agent directories
                console.log(pc.cyan("\n📦 Scanning locally installed skills...\n"));
                let totalFound = 0;

                for (const agent of AGENTS) {
                    const skillsDir = path.resolve(process.cwd(), agent.projectPath);
                    const localSkills = scanLocalSkills(skillsDir);
                    if (localSkills.length === 0) continue;

                    console.log(pc.bold(`  ${agent.name} (${agent.projectPath}/)`));
                    for (const skill of localSkills) {
                        console.log(
                            `    ${pc.green(skill.name)}  ${pc.gray(skill.description || "")}`
                        );
                    }
                    console.log();
                    totalFound += localSkills.length;
                }

                if (totalFound === 0) {
                    console.log(
                        pc.yellow(
                            "  No skills found in the current project.\n" +
                            '  Run "agent-skills add" to install skills.'
                        )
                    );
                } else {
                    console.log(
                        pc.gray(`  Total: ${totalFound} skill(s) installed locally`)
                    );
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(pc.red(`\n❌ ${error.message}`));
            }
            process.exit(1);
        }
    });
