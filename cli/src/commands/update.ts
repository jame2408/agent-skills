import { Command } from "commander";
import pc from "picocolors";
import { AGENTS } from "../agents.js";
import {
    resolveRepos,
    fetchAllSkills,
    installSkill,
    scanLocalSkills,
    cleanupDirs,
    getInstallDir,
    getRepoCommitHash,
} from "../git.js";
import { readLockFile, writeLockFile } from "../config.js";

export const updateCommand = new Command("update")
    .description("Update installed skills to the latest version")
    .argument("[skills...]", "Specific skill names to update (omit to update all)")
    .option("-g, --global", "Update globally installed skills", false)
    .option("-r, --repo <url>", "Override the source repository URL")
    .action(async function (this: Command, skillNames: string[]) {
        const opts = this.optsWithGlobals();
        try {
            const repos = resolveRepos(opts.repo);
            console.log(pc.cyan("\n🔄 Checking for skill updates...\n"));

            // 1. Fetch latest skills from remote
            const { skills: remoteSkills, repoCloneMap } = fetchAllSkills(repos);
            const clonedDirs = [...repoCloneMap.values()];

            if (remoteSkills.length === 0) {
                console.log(pc.yellow("  No skills found in the remote repository."));
                cleanupDirs(clonedDirs);
                return;
            }

            // 2. Determine which agent directories to scan
            let updatedCount = 0;
            const processedDirs = new Set<string>();

            for (const agent of AGENTS) {
                const installDir = getInstallDir(
                    agent.projectPath,
                    agent.globalPath,
                    opts.global
                );

                // Deduplicate if multiple agents point to the same directory
                if (processedDirs.has(installDir)) {
                    continue;
                }
                processedDirs.add(installDir);

                const localSkills = scanLocalSkills(installDir);
                if (localSkills.length === 0) continue;

                // Filter to only updating specified skills (or all if none specified)
                const toUpdate = localSkills.filter((local) => {
                    if (skillNames.length === 0) return true;
                    return skillNames.some(
                        (name) => local.dirName === name || local.name === name
                    );
                });

                if (toUpdate.length === 0) continue;

                console.log(pc.bold(`  ${agent.name} (${opts.global ? agent.globalPath : agent.projectPath}/)`));

                const lock = readLockFile(installDir);
                let agentUpdated = false;

                for (const local of toUpdate) {
                    const remote = remoteSkills.find(
                        (r) => r.dirName === local.dirName || r.name === local.name
                    );
                    if (!remote) {
                        console.log(
                            pc.gray(
                                `    ⏭  ${local.name} — not found in remote, skipping`
                            )
                        );
                        continue;
                    }

                    const clonedDir = repoCloneMap.get(remote.repo);
                    if (!clonedDir) continue;

                    const remoteCommit = getRepoCommitHash(clonedDir);
                    const localLock = lock.skills[local.name];

                    if (localLock && localLock.version === remoteCommit) {
                        console.log(
                            pc.gray(
                                `    ⏭  ${local.name} — already up to date`
                            )
                        );
                        continue;
                    }

                    installSkill(clonedDir, remote.dirName, installDir);

                    lock.skills[local.name] = {
                        version: remoteCommit,
                        repo: remote.repo,
                        installedAt: new Date().toISOString(),
                    };

                    console.log(pc.green(`    ✅ ${local.name} — updated`));
                    updatedCount++;
                    agentUpdated = true;
                }

                if (agentUpdated) {
                    writeLockFile(installDir, lock);
                }
                console.log();
            }

            if (updatedCount === 0) {
                console.log(
                    pc.yellow(
                        "  No installed skills needed updating.\n" +
                        '  Run "agent-skills ls" to see installed skills.'
                    )
                );
            } else {
                console.log(
                    pc.green(`🎉 Updated ${updatedCount} skill(s) successfully.`)
                );
            }

            cleanupDirs(clonedDirs);
        } catch (error) {
            if (error instanceof Error) {
                console.error(pc.red(`\n❌ ${error.message}`));
            }
            process.exit(1);
        }
    }
    );
