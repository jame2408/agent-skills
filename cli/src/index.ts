#!/usr/bin/env node

import { createRequire } from "node:module";
import { Command } from "commander";
import { addCommand } from "./commands/add.js";
import { infoCommand } from "./commands/info.js";
import { listCommand } from "./commands/list.js";
import { removeCommand } from "./commands/remove.js";
import { searchCommand } from "./commands/search.js";
import { updateCommand } from "./commands/update.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

const program = new Command();

program
    .name("agent-skills")
    .description("CLI tool to install, update, and manage Agent Skills across AI coding assistants")
    .version(pkg.version)
    // Define global options so they appear in the top-level --help
    .option("-t, --tool <agent>", "Target AI agent (cursor, claude-code, etc.)")
    .option("-g, --global", "Operate on user-level global directory instead of project")
    .option("-r, --repo <url>", "Override the source repository URL");

program.addCommand(addCommand);
program.addCommand(infoCommand);
program.addCommand(listCommand);
program.addCommand(removeCommand);
program.addCommand(searchCommand);
program.addCommand(updateCommand);

program.parse();
