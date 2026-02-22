import { select, checkbox } from "@inquirer/prompts";
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
