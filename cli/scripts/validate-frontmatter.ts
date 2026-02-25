import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

type Frontmatter = {
    name?: unknown;
    description?: unknown;
    metadata?: unknown;
};

function findSkillMdFiles(skillsRoot: string): string[] {
    if (!fs.existsSync(skillsRoot)) return [];

    const entries = fs.readdirSync(skillsRoot, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name.startsWith(".")) continue;

        const skillMd = path.join(skillsRoot, entry.name, "SKILL.md");
        if (fs.existsSync(skillMd)) {
            files.push(skillMd);
        }
    }

    return files;
}

function extractFrontmatter(content: string): string | null {
    // Allow optional BOM and Windows line endings.
    const match = content.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---/);
    return match ? match[1] : null;
}

function validateSkillFrontmatter(filePath: string): string[] {
    const errors: string[] = [];
    const content = fs.readFileSync(filePath, "utf-8");

    const raw = extractFrontmatter(content);
    if (!raw) {
        errors.push("Missing or invalid YAML frontmatter block (expected --- ... --- at file start)");
        return errors;
    }

    let parsed: Frontmatter;
    try {
        parsed = parseYaml(raw) as Frontmatter;
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        errors.push(`YAML parse error: ${message}`);
        return errors;
    }

    if (typeof parsed.name !== "string" || parsed.name.trim().length === 0) {
        errors.push("Frontmatter field 'name' must be a non-empty string");
    }

    if (typeof parsed.description !== "string" || parsed.description.trim().length === 0) {
        errors.push("Frontmatter field 'description' must be a non-empty string");
    }

    if (
        parsed.metadata !== undefined &&
        typeof parsed.metadata !== "object"
    ) {
        errors.push("Frontmatter field 'metadata' must be an object when present");
    }

    if (parsed.metadata && typeof parsed.metadata === "object") {
        const meta = parsed.metadata as Record<string, unknown>;
        if (meta.trigger !== undefined && typeof meta.trigger !== "string") {
            errors.push("Frontmatter field 'metadata.trigger' must be a string when present");
        }
    }

    return errors;
}

function main() {
    const repoRoot = path.resolve(process.cwd(), "..");
    const skillsRoot = path.join(repoRoot, "skills");

    const skillMdFiles = findSkillMdFiles(skillsRoot);
    if (skillMdFiles.length === 0) {
        console.log("No skills found to validate.");
        return;
    }

    const failures: Array<{ file: string; errors: string[] }> = [];

    for (const file of skillMdFiles) {
        const errs = validateSkillFrontmatter(file);
        if (errs.length > 0) {
            failures.push({ file, errors: errs });
        }
    }

    if (failures.length > 0) {
        console.error("Invalid SKILL.md frontmatter detected:\n");
        for (const f of failures) {
            console.error(`- ${path.relative(repoRoot, f.file)}`);
            for (const msg of f.errors) {
                console.error(`  - ${msg}`);
            }
        }
        console.error(`\nTotal failures: ${failures.length}`);
        process.exit(1);
    }

    console.log(`Validated ${skillMdFiles.length} SKILL.md frontmatter file(s).`);
}

main();
