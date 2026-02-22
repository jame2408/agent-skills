import { Command } from "commander";
import pc from "picocolors";
import { resolveRepos, fetchAllSkills, cleanupDirs } from "../git.js";

export const searchCommand = new Command("search")
    .alias("find")
    .description("Search for skills by keyword in the remote repository")
    .argument("<keyword>", "Keyword to search for in skill names and descriptions")
    .option("-r, --repo <url>", "Override the source repository URL")
    .action(async (keyword: string, opts: { repo?: string }) => {
        try {
            const repos = resolveRepos(opts.repo);
            console.log(pc.cyan(`\n🔍 Searching for "${keyword}"...\n`));
            const { skills, repoCloneMap } = fetchAllSkills(repos);
            const clonedDirs = [...repoCloneMap.values()];

            const lowerKeyword = keyword.toLowerCase();
            const matched = skills.filter(
                (s) =>
                    s.name.toLowerCase().includes(lowerKeyword) ||
                    s.description.toLowerCase().includes(lowerKeyword) ||
                    s.dirName.toLowerCase().includes(lowerKeyword)
            );

            if (matched.length === 0) {
                console.log(
                    pc.yellow(`  No skills found matching "${keyword}".`)
                );
                console.log(
                    pc.gray(
                        `  Run ${pc.white("agent-skills list --remote")} to browse all available skills.`
                    )
                );
            } else {
                const maxNameLen = Math.max(...matched.map((s) => s.name.length));
                for (const skill of matched) {
                    const paddedName = skill.name.padEnd(maxNameLen);
                    console.log(
                        `  ${pc.green(paddedName)}  ${pc.gray(skill.description || "No description")}`
                    );
                }
                console.log(
                    pc.gray(`\n  Found ${matched.length} skill(s) matching "${keyword}"`)
                );
                console.log(
                    pc.gray(
                        `  Install with: ${pc.white(`agent-skills add <skill-name> --tool <agent>`)}`
                    )
                );
            }

            cleanupDirs(clonedDirs);
        } catch (error) {
            if (error instanceof Error) {
                console.error(pc.red(`\n❌ ${error.message}`));
            }
            process.exit(1);
        }
    });
