import { Command } from "commander";
import pc from "picocolors";
import { findAgentByFlag, getAllAgentFlags } from "../agents.js";
import {
    resolveRepos,
    fetchAllSkills,
    installSkill,
    getInstallDir,
    cleanupDirs,
} from "../git.js";
import { promptSelectAgent, promptSelectSkills } from "../prompts.js";

export const addCommand = new Command("add")
    .description("Install skills into your project (or globally with -g)")
    .argument("[skills...]", "Skill names to install (omit for interactive mode)")
    .option("-t, --tool <agent>", `AI agent to install for (${getAllAgentFlags().slice(0, 5).join(", ")}...)`)
    .option("-g, --global", "Install to user-level global directory", false)
    .option("-r, --repo <url>", "Override the source repository URL")
    .action(async (skillNames: string[], opts: { tool?: string; global: boolean; repo?: string }) => {
        try {
            // 1. Resolve agent
            let agent = opts.tool ? findAgentByFlag(opts.tool) : undefined;
            if (opts.tool && !agent) {
                console.error(
                    pc.red(`Error: Unknown agent "${opts.tool}".`),
                    `\nValid agents: ${getAllAgentFlags().join(", ")}`
                );
                process.exit(1);
            }
            if (!agent) {
                agent = await promptSelectAgent();
            }

            console.log(
                pc.cyan(`\n🎯 Target agent: ${pc.bold(agent.name)}`) +
                (opts.global ? pc.yellow(" (global)") : "")
            );

            // 2. Resolve repos & fetch skills
            const repos = resolveRepos(opts.repo);
            console.log(pc.gray(`\n📡 Fetching available skills...`));
            const { skills, repoCloneMap } = fetchAllSkills(repos);
            const clonedDirs = [...repoCloneMap.values()];

            if (skills.length === 0) {
                console.log(pc.yellow("\n⚠️  No skills found in the repository."));
                cleanupDirs(clonedDirs);
                return;
            }

            // 3. Resolve which skills to install
            let selectedDirNames: string[];
            if (skillNames.length > 0) {
                // Non-interactive: validate provided skill names
                selectedDirNames = [];
                for (const name of skillNames) {
                    const found = skills.find(
                        (s) => s.dirName === name || s.name === name
                    );
                    if (!found) {
                        console.error(
                            pc.red(`Error: Skill "${name}" not found.`),
                            `\nAvailable: ${skills.map((s) => s.dirName).join(", ")}`
                        );
                        cleanupDirs(clonedDirs);
                        process.exit(1);
                    }
                    selectedDirNames.push(found.dirName);
                }
            } else {
                // Interactive: show multi-select
                selectedDirNames = await promptSelectSkills(skills);
                if (selectedDirNames.length === 0) {
                    console.log(pc.yellow("\nNo skills selected. Aborting."));
                    cleanupDirs(clonedDirs);
                    return;
                }
            }

            // 4. Install each selected skill
            const targetDir = getInstallDir(
                agent.projectPath,
                agent.globalPath,
                opts.global
            );
            console.log(pc.gray(`\n📁 Installing to: ${targetDir}\n`));

            for (const dirName of selectedDirNames) {
                const skill = skills.find((s) => s.dirName === dirName)!;
                const clonedDir = repoCloneMap.get(skill.repo);
                if (!clonedDir) continue;

                installSkill(clonedDir, dirName, targetDir);
                console.log(pc.green(`  ✅ ${skill.name}`));
                if (skill.trigger) {
                    console.log(pc.gray(`     Trigger: ${skill.trigger}`));
                }
            }

            console.log(
                pc.green(
                    `\n🎉 Successfully installed ${selectedDirNames.length} skill(s) to ${pc.bold(targetDir)}`
                )
            );

            // 5. Cleanup
            cleanupDirs(clonedDirs);
        } catch (error) {
            if (error instanceof Error) {
                console.error(pc.red(`\n❌ ${error.message}`));
            }
            process.exit(1);
        }
    });
