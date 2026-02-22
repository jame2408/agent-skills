import { select, checkbox, input, confirm } from "@inquirer/prompts";
import pc from "picocolors";
import { AGENTS, POPULAR_AGENT_FLAGS, type AgentConfig } from "./agents.js";

/**
 * Interactively prompt the user to select an AI agent (tool).
 * Popular agents are shown first with a separator.
 */
export async function promptSelectAgent(): Promise<AgentConfig> {
    const popularAgents = AGENTS.filter((a) =>
        POPULAR_AGENT_FLAGS.includes(a.flag)
    );
    const otherAgents = AGENTS.filter(
        (a) => !POPULAR_AGENT_FLAGS.includes(a.flag)
    );

    type SelectChoice = {
        name: string;
        value: string;
        description?: string;
    };

    const choices: Array<SelectChoice | { type: "separator"; }> = [
        ...popularAgents.map((a) => ({
            name: a.name,
            value: a.flag,
            description: `Project: ${a.projectPath}`,
        })),
        { type: "separator" as const },
        ...otherAgents.map((a) => ({
            name: a.name,
            value: a.flag,
            description: `Project: ${a.projectPath}`,
        })),
    ];

    const selected = await select<string>({
        message: "🛠️  Which AI coding agent are you using?",
        choices: choices as Array<{ name: string; value: string; description?: string }>,
    });

    const agent = AGENTS.find((a) => a.flag === selected);
    if (!agent) throw new Error(`Unknown agent: ${selected}`);
    return agent;
}

/**
 * Interactively prompt the user to select one or more skills.
 */
export async function promptSelectSkills(
    skills: Array<{ name: string; description: string; dirName: string }>
): Promise<string[]> {
    if (skills.length === 0) {
        return [];
    }

    const selected = await checkbox<string>({
        message:
            "📦  Select the skills to install (Space to toggle, Enter to confirm):",
        choices: skills.map((s) => ({
            name: `${pc.cyan(s.name)} ${pc.gray(`— ${s.description || "No description"}`)}`,
            value: s.dirName,
        })),
    });

    return selected;
}

/**
 * Interactively prompt the user to select skills to remove.
 */
export async function promptSelectSkillsToRemove(
    skills: Array<{ name: string; description: string; dirName: string }>
): Promise<string[]> {
    if (skills.length === 0) {
        return [];
    }

    const selected = await checkbox<string>({
        message:
            "🗑️  Select skills to remove (Space to toggle, Enter to confirm):",
        choices: skills.map((s) => ({
            name: `${pc.red(s.name)} ${pc.gray(`— ${s.description || "No description"}`)}`,
            value: s.dirName,
        })),
    });

    return selected;
}

/**
 * Interactively prompt the user to add custom repositories.
 */
export async function promptForRepos(defaultRepo: string): Promise<string[]> {
    const repos = [defaultRepo];

    let addMore = await confirm({
        message: "Do you want to add a custom/private skill repository?",
        default: false
    });

    while (addMore) {
        const url = await input({
            message: "Enter repository URL (e.g. git@github.com:my-org/my-skills.git):"
        });
        if (url.trim()) {
            repos.push(url.trim());
        }
        addMore = await confirm({
            message: "Add another repository?",
            default: false
        });
    }

    return repos;
}

/**
 * Interactively prompt the user to select optional technology stacks.
 */
export async function promptSelectTechs(availableTechs: string[]): Promise<string[]> {
    if (availableTechs.length === 0) return [];

    const selected = await checkbox<string>({
        message:
            "📚  Which technology stacks does your project use? (Space to select, Enter to confirm):",
        choices: availableTechs.map((t) => ({
            name: pc.cyan(t),
            value: t,
        })),
    });

    return selected;
}

/**
 * Interactively prompt the user to select an optional VCS platform.
 */
export async function promptSelectVcs(availableVcs: string[]): Promise<string | undefined> {
    if (availableVcs.length === 0) return undefined;

    const choices: Array<{ name: string; value: string | undefined }> = [
        ...availableVcs.map((v) => ({
            name: pc.cyan(v),
            value: v,
        })),
        { name: pc.gray("Skip / None"), value: undefined },
    ];

    const selected = await select<string | undefined>({
        message: "🐙  Which VCS platform do you use for code reviews?",
        choices: choices,
    });

    return selected;
}
