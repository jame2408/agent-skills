import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import pc from "picocolors";
import { CONFIG_FILENAME, DEFAULT_REPO, type ProjectConfig } from "../config.js";
import { cloneRepo, cleanupDirs, scanAvailableReferences } from "../git.js";
import { promptSelectAgent, promptForRepos, promptSelectTechs, promptSelectVcs } from "../prompts.js";

export const initCommand = new Command("init")
    .description(`Initialize a ${CONFIG_FILENAME} configuration file`)
    .action(async () => {
        const configPath = path.resolve(process.cwd(), CONFIG_FILENAME);
        if (fs.existsSync(configPath)) {
            const overwrite = await confirm({
                message: `${CONFIG_FILENAME} already exists. Overwrite?`,
                default: false,
            });
            if (!overwrite) {
                console.log(pc.yellow("Aborted."));
                return;
            }
        }

        console.log(pc.cyan(`\nLet's set up your ${CONFIG_FILENAME}!\n`));

        // 1. Default Agent
        console.log(pc.bold("1. Default Agent"));
        console.log(pc.gray("Which AI agent do you use most often in this project?"));
        const agent = await promptSelectAgent();

        // 2. Custom Repositories
        console.log(pc.bold("\n2. Repositories"));
        console.log(pc.gray(`Default repository: ${DEFAULT_REPO}`));
        const repos = await promptForRepos(DEFAULT_REPO);

        // 3. Optional References
        console.log(pc.bold("\n3. References Defaults"));
        console.log(pc.gray("Scanning remote repositories for available references..."));

        const finalRepos = (repos.length > 1 || repos[0] !== DEFAULT_REPO) ? repos : [DEFAULT_REPO];
        const clonedDirs: string[] = [];
        try {
            for (const repo of finalRepos) {
                clonedDirs.push(cloneRepo(repo));
            }
            const { techs, vcs } = scanAvailableReferences(clonedDirs);

            let selectedTechs: string[] = [];
            if (techs.length > 0) {
                selectedTechs = await promptSelectTechs(techs);
            }

            let selectedVcs: string | undefined;
            if (vcs.length > 0) {
                selectedVcs = await promptSelectVcs(vcs);
            }

            // 4. Write Config
            const config: ProjectConfig = {
                defaultAgent: agent.flag,
            };
            if (repos.length > 1 || repos[0] !== DEFAULT_REPO) {
                config.repos = repos;
            }
            if (selectedTechs.length > 0) {
                config.techs = selectedTechs;
            }
            if (selectedVcs) {
                config.vcs = selectedVcs;
            }

            fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
        } finally {
            cleanupDirs(clonedDirs);
        }
        console.log(pc.green(`\n🎉 Successfully created ${CONFIG_FILENAME}`));
        console.log(pc.gray("Run \`agent-skills add\` and we'll use these defaults automatically.\n"));
    });
