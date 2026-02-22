import { Command } from "commander";
import pc from "picocolors";
import { findAgentByFlag, getAllAgentFlags } from "../agents.js";
import {
    resolveRepos,
    fetchAllSkills,
    installSkill,
    getInstallDir,
    cleanupDirs,
    getRepoCommitHash,
} from "../git.js";
import { loadProjectConfig, readLockFile, writeLockFile, type ProjectConfig } from "../config.js";
import { promptSelectAgent, promptSelectSkills, promptSelectTechs, promptSelectVcs } from "../prompts.js";
import fs from "node:fs";
import path from "node:path";

export const addCommand = new Command("add")
    .description("Install skills into your project (or globally with -g)")
    .argument("[skills...]", "Skill names to install (omit for interactive mode)")
    .option("-t, --tool <agent>", `AI agent to install for (${getAllAgentFlags().slice(0, 5).join(", ")}...)`)
    .option("-g, --global", "Install to user-level global directory", false)
    .option("-r, --repo <url>", "Override the source repository URL")
    .action(async function (this: Command, skillNames: string[]) {
        const opts = this.optsWithGlobals();
        try {
            const config = loadProjectConfig();

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
                if (config?.defaultAgent) {
                    const defaultAgentObj = findAgentByFlag(config.defaultAgent);
                    if (defaultAgentObj) agent = defaultAgentObj;
                }
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

            // 4. Check if any selected skill requires references
            let needsReferences = false;
            for (const dirName of selectedDirNames) {
                const skill = skills.find((s) => s.dirName === dirName)!;
                const clonedDir = repoCloneMap.get(skill.repo);
                if (!clonedDir) continue;

                const skillMdPath = path.join(clonedDir, "skills", dirName, "SKILL.md");
                if (fs.existsSync(skillMdPath)) {
                    const content = fs.readFileSync(skillMdPath, "utf-8");
                    if (content.includes("references/") || content.includes("references\\")) {
                        needsReferences = true;
                        break;
                    }
                }
            }

            // 5. Determine Techs and VCS if needed
            let selectedTechs: string[] | undefined = config?.techs;
            let selectedVcs: string | undefined = config?.vcs;

            if (needsReferences) {
                const { techs, vcs } = await import("../git.js").then(m => m.scanAvailableReferences(clonedDirs));

                if (!selectedTechs && techs.length > 0) {
                    console.log();
                    selectedTechs = await promptSelectTechs(techs);
                }

                if (!selectedVcs && vcs.length > 0) {
                    console.log();
                    selectedVcs = await promptSelectVcs(vcs);
                }
            }

            // 6. Install each selected skill
            const targetDir = getInstallDir(
                agent.projectPath,
                agent.globalPath,
                opts.global
            );
            console.log(pc.gray(`\n📁 Installing to: ${targetDir}\n`));

            const lock = readLockFile(targetDir);

            for (const dirName of selectedDirNames) {
                const skill = skills.find((s) => s.dirName === dirName)!;
                const clonedDir = repoCloneMap.get(skill.repo);
                if (!clonedDir) continue;

                installSkill(clonedDir, dirName, targetDir, selectedTechs, selectedVcs);

                // Record in lockfile
                lock.skills[skill.name] = {
                    version: getRepoCommitHash(clonedDir),
                    repo: skill.repo,
                    installedAt: new Date().toISOString(),
                };

                console.log(pc.green(`  ✅ ${skill.name}`));
                if (skill.trigger) {
                    console.log(pc.gray(`     Trigger: ${skill.trigger}`));
                }
            }

            writeLockFile(targetDir, lock);

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
