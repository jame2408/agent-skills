import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import pc from "picocolors";
import { AGENTS, findAgentByFlag, getAllAgentFlags } from "../agents.js";
import { scanLocalSkills, getInstallDir } from "../git.js";
import { REFERENCES_DIR, loadProjectConfig, readLockFile, writeLockFile } from "../config.js";
import { promptSelectAgent, promptSelectSkillsToRemove } from "../prompts.js";

export const removeCommand = new Command("remove")
    .alias("rm")
    .description("Remove installed skills from your project (or globally with -g)")
    .argument("[skills...]", "Skill names to remove (omit for interactive mode)")
    .option("-t, --tool <agent>", `AI agent to remove from (${getAllAgentFlags().slice(0, 5).join(", ")}...)`)
    .option("-g, --global", "Remove from user-level global directory", false)
    .action(async function (this: Command, skillNames: string[]) {
        const opts = this.optsWithGlobals();
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
                const config = loadProjectConfig();
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

            // 2. Scan locally installed skills
            const installDir = getInstallDir(
                agent.projectPath,
                agent.globalPath,
                opts.global
            );
            const localSkills = scanLocalSkills(installDir);

            if (localSkills.length === 0) {
                console.log(
                    pc.yellow(
                        "\n⚠️  No skills installed for this agent.\n" +
                        '  Run "agent-skills add" to install skills.'
                    )
                );
                return;
            }

            // 3. Resolve which skills to remove
            let selectedDirNames: string[];
            if (skillNames.length > 0) {
                // Non-interactive: validate provided skill names
                selectedDirNames = [];
                for (const name of skillNames) {
                    const found = localSkills.find(
                        (s) => s.dirName === name || s.name === name
                    );
                    if (!found) {
                        console.error(
                            pc.red(`Error: Skill "${name}" is not installed.`),
                            `\nInstalled: ${localSkills.map((s) => s.dirName).join(", ")}`
                        );
                        process.exit(1);
                    }
                    selectedDirNames.push(found.dirName);
                }
            } else {
                // Interactive: show multi-select
                selectedDirNames = await promptSelectSkillsToRemove(localSkills);
                if (selectedDirNames.length === 0) {
                    console.log(pc.yellow("\nNo skills selected. Aborting."));
                    return;
                }
            }

            // 4. Remove each selected skill
            console.log(pc.gray(`\n🗑️  Removing from: ${installDir}\n`));

            const lock = readLockFile(installDir);

            for (const dirName of selectedDirNames) {
                const skill = localSkills.find((s) => s.dirName === dirName)!;
                const skillPath = path.join(installDir, dirName);
                fs.rmSync(skillPath, { recursive: true, force: true });

                if (lock.skills[skill.name]) {
                    delete lock.skills[skill.name];
                }

                console.log(pc.red(`  ✖ ${skill.name} — removed`));
            }

            writeLockFile(installDir, lock);

            // 5. Cleanup orphaned references
            const remainingSkills = scanLocalSkills(installDir);
            const referencesDir = path.resolve(installDir, "..", REFERENCES_DIR);

            if (fs.existsSync(referencesDir)) {
                const anySkillNeedsRefs = remainingSkills.some((skill) => {
                    const skillMdPath = path.join(installDir, skill.dirName, "SKILL.md");
                    if (!fs.existsSync(skillMdPath)) return false;
                    const content = fs.readFileSync(skillMdPath, "utf-8");
                    return content.includes("references/") || content.includes("references\\");
                });

                if (!anySkillNeedsRefs) {
                    fs.rmSync(referencesDir, { recursive: true, force: true });
                    console.log(pc.gray("\n  🧹 Cleaned up unused references directory."));
                }
            }

            console.log(
                pc.green(
                    `\n🎉 Successfully removed ${selectedDirNames.length} skill(s).`
                )
            );
        } catch (error) {
            if (error instanceof Error) {
                console.error(pc.red(`\n❌ ${error.message}`));
            }
            process.exit(1);
        }
    });
