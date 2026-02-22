#!/usr/bin/env node

import { createRequire } from "node:module";
import { Command } from "commander";
import { addCommand } from "./commands/add.js";
import { listCommand } from "./commands/list.js";
import { removeCommand } from "./commands/remove.js";
import { searchCommand } from "./commands/search.js";
import { updateCommand } from "./commands/update.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

const program = new Command();

program
    .name("agent-skills")
    .description(
        "CLI tool to install, update, and manage Agent Skills across AI coding assistants"
    )
    .version(pkg.version);

program.addCommand(addCommand);
program.addCommand(listCommand);
program.addCommand(removeCommand);
program.addCommand(searchCommand);
program.addCommand(updateCommand);

program.parse();
