---
name: skill-manager
description: Create, manage, and debug Claude Code Agent Skills. Use when creating new skills, debugging skill activation issues, writing SKILL.md files, managing skill structure, or learning about Claude Code skills. Helps with personal skills, project skills, YAML frontmatter, descriptions, and troubleshooting.
metadata:
  internal: true
---

# Skill Manager

Create and manage Agent Skills for Claude Code. Skills are modular capabilities that extend Claude's functionality through organized folders containing instructions, scripts, and resources.

## What are Agent Skills?

**Skills are model-invoked**: Claude autonomously decides when to use them based on the user's request and the Skill's description. This is different from slash commands, which are user-invoked (explicitly typing `/command`).

**Benefits**:
- Extend Claude's capabilities for specific workflows
- Share expertise across teams via git
- Reduce repetitive prompting
- Compose multiple Skills for complex tasks

**What Skills Provide**:

Skills act as "onboarding guides" that transform Claude from a general-purpose agent into a specialized agent equipped with procedural knowledge that no model can fully possess. They provide:

1. **Specialized workflows** - Multi-step procedures for specific domains
2. **Tool integrations** - Instructions for working with specific file formats or APIs
3. **Domain expertise** - Project-specific knowledge, schemas, business logic
4. **Bundled resources** - Scripts, references, and assets for complex and repetitive tasks

## Progressive Disclosure

Skills use a three-level loading system to manage context efficiently:

1. **Metadata (name + description)** - Always in context (~100 words)
   - Claude sees this for every skill to decide if it's relevant
   - Critical for skill discovery

2. **SKILL.md body** - Loaded when skill triggers (<5k words recommended)
   - Contains core instructions and workflow guidance
   - Loaded into context only when Claude activates the skill

3. **Bundled resources** - Loaded or executed as needed
   - `scripts/` may execute without loading into context (token efficient, deterministic)
   - `references/` loaded into context when Claude determines needed
   - `assets/` used in output, never loaded into context

This design keeps Claude's context lean while providing access to unlimited specialized knowledge when needed.

## Skill Types and Locations

### Personal Skills
Location: `~/.claude/skills/`

**Use for**:
- Individual workflows and preferences
- Experimental Skills under development
- Personal productivity tools

Create a personal skill:
```bash
mkdir -p ~/.claude/skills/my-skill-name
```

### Project Skills
Location: `.claude/skills/` (within your project)

**Use for**:
- Team workflows and conventions
- Project-specific expertise
- Shared utilities and scripts

Create a project skill:
```bash
mkdir -p .claude/skills/my-skill-name
```

Project Skills are checked into git and automatically available to team members.

### Plugin Skills
Skills can also come from Claude Code plugins. These work the same way as personal and project Skills.

## Example Usage Scenarios

The skill-manager skill activates automatically when working with skills. Here are concrete examples of using this skill:

### Example 1: Create a PDF Processing Skill

**User request**:
```
I frequently work with PDF files and need to extract text, rotate pages, and merge documents. Can you help me create a skill for this?
```

**What happens**:
1. The skill-manager activates based on "create a skill" trigger
2. Claude asks clarifying questions about the workflow
3. Identifies that PDF rotation needs a deterministic script
4. Creates the skill structure with `scripts/rotate_pdf.py`
5. Writes SKILL.md with clear instructions and examples
6. Tests the skill with a sample PDF task

**Result**: A new `.claude/skills/pdf-processor/` directory with SKILL.md and scripts that can be used immediately.

### Example 2: Debug Skill Activation Issues

**User request**:
```
I created a code review skill but Claude isn't using it when I ask for code reviews. Can you help debug this?
```

**What happens**:
1. The skill-manager activates based on "debug" and "skill" triggers
2. Claude checks the SKILL.md file location and YAML syntax
3. Reviews the description for specificity and trigger words
4. Discovers the description lacks "code review" as a trigger phrase
5. Updates the description with better trigger words
6. Tests with a code review request

**Result**: The code review skill now activates correctly when requested.

### Example 3: Convert Workflow into Reusable Skill

**User request**:
```
Every time I deploy, I run the same 5 commands and checks. Can we turn this into a skill?
```

**What happens**:
1. The skill-manager activates based on "turn this into a skill" trigger
2. Claude analyzes the deployment workflow
3. Identifies commands that could be automated via scripts
4. Creates `.claude/skills/deployment/` with clear pre-deployment checklist
5. Adds a `scripts/preflight-check.sh` for automated checks
6. Writes deployment instructions in SKILL.md

**Result**: A deployment skill that activates with "deploy" or "deployment" triggers, automating repetitive tasks.

## Creating a Skill

### Writing Style Guidelines

Follow these style rules when writing skills for consistency and clarity:

**Use imperative/infinitive form (verb-first instructions), not second person**:
- ✅ Correct: "To accomplish X, do Y" or "Run the command"
- ❌ Wrong: "You should do X" or "You need to run the command"

**Use imperative form in descriptions without redundant "this skill"**:
- ✅ Correct: "Use when..." or "Use for..."
- ❌ Wrong: "Use this skill when..." or "This skill should be used when..."

**Use objective, instructional language**:
- Focus on clear, actionable steps
- Avoid conversational or persuasive language
- Maintain consistency throughout the skill

**Example of proper style**:

```markdown
## Instructions

1. Read the target file to understand its structure
2. Identify the sections requiring updates
3. Apply the transformation using the script
4. Validate the output meets requirements

For detailed schema information, refer to [references/schema.md](references/schema.md).
```

### Basic Structure

Every skill requires a `SKILL.md` file with YAML frontmatter:

```yaml
---
name: Skill Name
description: Brief description of what this Skill does and when to use it
---

# Skill Name

## Instructions
Provide clear, step-by-step guidance for Claude.

## Examples
Show concrete examples of using this Skill.
```

### Required Fields

**name**: The skill's display name
- Keep it concise and descriptive
- Use kebab-case
- Needs to be EXACTLY the same as the skill folder name

**description**: Critical for Claude to discover when to use the Skill
- Include **what** the Skill does
- Include **when** Claude should use it
- Include **trigger words** users would mention
- Be specific, not vague

### Optional Fields

**allowed-tools**: Restrict which tools Claude can use when the Skill is active
- Comma-separated list of tool names
- Useful for read-only skills or limited-scope operations
- If not specified, Claude asks for permission normally

Example:
```yaml
---
name: Safe File Reader
description: Read files without making changes. Use when you need read-only file access.
allowed-tools: Read, Grep, Glob
---
```

**metadata.internal**: Hide skill from remote discovery via `npx skills add`
- Set to `true` to prevent the skill from being offered when external users install skills from the repo
- Internal skills still work locally — agents discover them from the filesystem as usual
- Only the `vertical` skill in this project should be publicly discoverable; all other project skills must have `metadata.internal: true`

Example:
```yaml
---
name: my-internal-skill
description: An internal skill not shown by default.
metadata:
  internal: true
---
```

## Writing Effective Descriptions

The description is the most critical part of skill discovery.

### Good Descriptions

✅ **Specific with triggers**:
```yaml
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

✅ **Clear use case**:
```yaml
description: Analyze Excel spreadsheets, create pivot tables, and generate charts. Use when working with Excel files, spreadsheets, or analyzing tabular data in .xlsx format.
```

✅ **Action-oriented**:
```yaml
description: Generates clear commit messages from git diffs. Use when writing commit messages or reviewing staged changes.
```

### Bad Descriptions

❌ **Too vague**:
```yaml
description: Helps with documents
```

❌ **Too generic**:
```yaml
description: For data
```

❌ **Missing triggers**:
```yaml
description: Document processing tool
```

### Description Formula

Use this formula for effective descriptions:

**[What it does] + [Specific actions] + "Use when" + [Trigger scenarios/keywords]**

Example:
```yaml
description: Review code for best practices, security issues, and performance problems. Use when reviewing code, checking PRs, analyzing code quality, or when user mentions code review or security audit.
```

## File Structure Options

### Single-File Skill (Simple)

```
my-skill/
└── SKILL.md
```

Best for:
- Simple, focused tasks
- Skills with minimal instructions
- Quick utilities

### Multi-File Skill (Complex)

```
my-skill/
├── SKILL.md (required)
├── references/
│   └── detailed-guide.md
├── scripts/
│   └── helper.py
└── assets/
    └── template.txt
```

Best for:
- Complex workflows requiring detailed documentation
- Skills needing executable scripts for deterministic operations
- Skills that produce output from templates or boilerplate

### Resource Types

**IMPORTANT: Avoid Duplication** - Information should live in either SKILL.md or resource files, not both. Keep SKILL.md lean with essential procedural instructions; move detailed reference material, schemas, and examples to resource files.

#### Scripts (`scripts/`)

Executable code (Python/Bash/etc.) for tasks requiring deterministic reliability.

**When to include**:
- The same code is being rewritten repeatedly
- Deterministic reliability is needed
- Complex operations better handled by dedicated code

**Examples**: `scripts/rotate_pdf.py` for PDF rotation, `scripts/analyze_data.py` for data processing

**Benefits**:
- Token efficient (may execute without loading into context)
- Deterministic execution
- Reusable across tasks

**Note**: Scripts may still need to be read by Claude for patching or environment-specific adjustments

#### References (`references/`)

Documentation and reference material loaded INTO context as needed to inform Claude's process.

**When to include**:
- Detailed documentation Claude should reference while working
- Information too detailed for SKILL.md body
- Database schemas, API specifications, domain knowledge
- Company policies, detailed workflow guides

**Examples**: `references/schema.md` for database schemas, `references/api-docs.md` for API specifications, `references/policies.md` for company guidelines

**Benefits**:
- Keeps SKILL.md lean and focused
- Loaded only when Claude determines it's needed
- Allows unlimited detailed documentation

**Best practice**: For large files (>10k words), include grep search patterns in SKILL.md to help Claude find specific information efficiently

#### Assets (`assets/`)

Files used IN the output Claude produces, never loaded into context.

**When to include**:
- Templates that get copied or modified in the output
- Images, icons, fonts, or other media files
- Boilerplate code or starter projects
- Sample documents

**Examples**: `assets/logo.png` for brand assets, `assets/template.html` for HTML templates, `assets/boilerplate/` for project starters

**Benefits**:
- Separates output resources from documentation
- Claude can use files without consuming context window
- Enables consistent output formatting

**Reference files from SKILL.md**:
````markdown
For advanced usage, see [references/detailed-guide.md](references/detailed-guide.md).

Run the helper script:
```bash
python scripts/helper.py input.txt
```

Use the template:
```bash
cp assets/template.html output.html
```
````

## Tool Restrictions with allowed-tools

Use `allowed-tools` to limit capabilities for safety or scope:

**Read-only skill**:
```yaml
---
name: Code Analyzer
description: Analyze code without making changes. Use for code analysis and review.
allowed-tools: Read, Grep, Glob
---
```

**Limited scope skill**:
```yaml
---
name: Data Inspector
description: Inspect data files and generate reports. Use for data analysis.
allowed-tools: Read, Bash
---
```

**When to use allowed-tools**:
- Read-only Skills that shouldn't modify files
- Skills with limited scope (only analysis, no writing)
- Security-sensitive workflows

**When to skip allowed-tools**:
- Skills that need full capabilities
- Most general-purpose skills
- Let Claude ask for permission normally

## Skill Creation Process

Follow this process when creating a new skill from scratch:

### Step 1: Understand with Concrete Examples

Clearly understand how the skill will be used before implementing it. Gather concrete examples through:

- Direct user examples of intended usage
- Generated examples validated with user feedback
- Questions about functionality and triggers

**Example questions**:
- "What functionality should this skill support?"
- "Can you give examples of how this skill would be used?"
- "What would a user say that should trigger this skill?"

Conclude when there is a clear sense of the functionality the skill should support.

### Step 2: Plan Reusable Contents

Analyze each concrete example to identify reusable resources:

1. Consider how to execute each example from scratch
2. Identify what scripts, references, and assets would be helpful

**Example analysis**:
- "Rotating a PDF requires rewriting code each time → Create `scripts/rotate_pdf.py`"
- "Building webapps needs same boilerplate → Create `assets/boilerplate/` template"
- "Querying database requires schema knowledge → Create `references/schema.md`"

Create a list of reusable resources to include: scripts, references, and assets.

### Step 3: Create Skill Structure

Create the skill directory and initial structure:

```bash
# Personal skill
mkdir -p ~/.claude/skills/skill-name

# Project skill
mkdir -p .claude/skills/skill-name

# Create SKILL.md
touch .claude/skills/skill-name/SKILL.md
```

Add resource directories as needed:
```bash
mkdir -p .claude/skills/skill-name/{scripts,references,assets}
```

### Step 4: Implement SKILL.md and Resources

**Start with reusable resources**:
- Implement scripts, references, and assets identified in Step 2
- This may require user input (e.g., brand assets, documentation)

**Write SKILL.md**:
Answer these questions in the skill:
1. What is the purpose of the skill? (a few sentences)
2. When should the skill be used?
3. How should Claude use the skill in practice?

Reference all reusable contents so Claude knows how to use them.

**Remember**:
- Use imperative/infinitive form throughout
- Use third-person in the description
- Keep SKILL.md lean; move details to references
- Avoid duplicating information

### Step 5: Test and Iterate

Test the skill with realistic scenarios:

```
# Test with questions matching your description
Can you [trigger phrase from description]?
```

**Iteration workflow**:
1. Use the skill on real tasks
2. Notice struggles or inefficiencies
3. Identify how SKILL.md or resources should be updated
4. Implement changes and test again

Continue iterating until the skill performs effectively.

## Testing Your Skill

After creating a Skill, test it by asking questions that match the description.

**If the description mentions "PDF files"**:
```
Can you help me extract text from this PDF?
```

**If the description mentions "commit messages"**:
```
Help me write a commit message for my changes
```

Claude should autonomously discover and use the Skill based on context.

## Debugging Skills

### Troubleshoot Skill Activation Issues

**Check 1: Verify Description Specificity**

Run this mental test:
- Does the description include trigger words users would say?
- Does it explain both what and when?
- Is it distinguishable from other skills?

**Check 2: Verify File Location**

```bash
# Personal Skills
ls ~/.claude/skills/*/SKILL.md

# Project Skills
ls .claude/skills/*/SKILL.md
```

**Check 3: Validate YAML Syntax**

```bash
# View frontmatter
cat .claude/skills/my-skill/SKILL.md | head -n 15
```

Common YAML errors:
- Missing opening `---` on line 1
- Missing closing `---` before Markdown content
- Tabs instead of spaces
- Unquoted strings with special characters

**Check 4: Run in Debug Mode**

```bash
claude --debug
```

### Skill activates but doesn't work

**Check dependencies**:
Claude will automatically install required dependencies when needed. List required packages in the description:

```yaml
description: Extract text from PDF files using pdfplumber. Use when working with PDFs. Requires pdfplumber package.
```

**Check script permissions**:
```bash
chmod +x .claude/skills/my-skill/scripts/*.py
```

**Check file paths**:
Use forward slashes (Unix style) in all paths:
- ✅ Correct: `scripts/helper.py`
- ❌ Wrong: `scripts\helper.py`

### Multiple Skills conflict

**Make descriptions distinct**: Use specific trigger terms that differentiate skills.

Instead of:
```yaml
# Skill 1
description: For data analysis

# Skill 2
description: For analyzing data
```

Use:
```yaml
# Skill 1
description: Analyze sales data in Excel files and CRM exports. Use for sales reports, pipeline analysis, and revenue tracking.

# Skill 2
description: Analyze log files and system metrics data. Use for performance monitoring, debugging, and system diagnostics.
```

## Best Practices

### 1. Keep Skills Focused

One Skill = One capability

**✅ Focused**:
- "PDF form filling"
- "Excel data analysis"
- "Git commit messages"

**❌ Too broad**:
- "Document processing" (split into separate Skills)
- "Data tools" (split by data type or operation)

### 2. Write Clear, Actionable Instructions

```markdown
## Instructions

1. Run `git diff --staged` to see changes
2. Analyze the changes for:
   - New features (use "Add")
   - Bug fixes (use "Fix")
   - Refactoring (use "Refactor")
3. Generate a commit message with:
   - Summary under 50 characters
   - Detailed description explaining why
```

### 3. Include Concrete Examples

Show real usage patterns:
```markdown
## Examples

Extract text from page 1:
```python
import pdfplumber
with pdfplumber.open("doc.pdf") as pdf:
    text = pdf.pages[0].extract_text()
    print(text)
```
```

### 4. Test with the Team

Have teammates:
- Test if the Skill activates when expected
- Verify instructions are clear
- Identify missing examples or edge cases

## Skill Templates

### Template 1: Simple Single-File Skill

```yaml
---
name: [Skill Name]
description: [What it does]. [Specific actions]. Use when [trigger scenarios and keywords].
---

# [Skill Name]

## Instructions

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Examples

[Concrete example showing usage]

## Best Practices

- [Best practice 1]
- [Best practice 2]
```

### Template 2: Read-Only Skill with Tool Restrictions

```yaml
---
name: [Skill Name]
description: [What it does] without making changes. Use for [read-only scenarios].
allowed-tools: Read, Grep, Glob
---

# [Skill Name]

## Instructions

1. Use Read to view file contents
2. Use Grep to search within files
3. Use Glob to find files by pattern
4. [Additional read-only operations]

## Analysis Checklist

- [ ] [Check item 1]
- [ ] [Check item 2]
- [ ] [Check item 3]
```

### Template 3: Multi-File Skill with Scripts

**Directory structure**:
```
skill-name/
├── SKILL.md
├── REFERENCE.md
└── scripts/
    └── helper.py
```

**SKILL.md**:
````yaml
---
name: [Skill Name]
description: [What it does]. [Specific actions]. Use when [triggers]. Requires [dependencies].
---

# [Skill Name]

## Quick Start

[Basic usage example]

## Instructions

1. [Step 1]
2. Run helper script:
```bash
python scripts/helper.py input.txt
```
3. [Step 3]

For detailed reference, see [REFERENCE.md](REFERENCE.md).

## Requirements

```bash
pip install [package1] [package2]
```
````

### Template 4: Code Review Skill

```yaml
---
name: Code Reviewer
description: Review code for best practices, security issues, performance problems, and test coverage. Use when reviewing code, checking PRs, analyzing code quality, security audit, or code feedback.
allowed-tools: Read, Grep, Glob
---

# Code Reviewer

## Review Checklist

### Code Organization
- [ ] Clear module structure
- [ ] Logical separation of concerns
- [ ] Consistent naming conventions

### Error Handling
- [ ] Proper error catching
- [ ] Meaningful error messages
- [ ] Graceful failure modes

### Performance
- [ ] No obvious bottlenecks
- [ ] Efficient algorithms
- [ ] Resource management

### Security
- [ ] Input validation
- [ ] No hardcoded secrets
- [ ] Proper authentication/authorization

### Testing
- [ ] Test coverage adequate
- [ ] Edge cases covered
- [ ] Tests are maintainable

## Instructions

1. Read the target files using Read tool
2. Search for patterns using Grep
3. Find related files using Glob
4. Review against checklist
5. Provide specific, actionable feedback
```

## Troubleshooting Checklist

When a skill doesn't work, check in this order:

### ✅ Step 1: Verify file location
```bash
# Personal
ls ~/.claude/skills/skill-name/SKILL.md

# Project
ls .claude/skills/skill-name/SKILL.md
```

### ✅ Step 2: Validate YAML syntax
```bash
cat .claude/skills/skill-name/SKILL.md | head -n 10
```

Check for:
- [ ] Opening `---` on line 1
- [ ] Closing `---` before content
- [ ] No tabs in YAML (use spaces)
- [ ] Required fields: `name`, `description`

### ✅ Step 3: Review description specificity

Review these criteria:
- [ ] Does it include what the skill does?
- [ ] Does it include when to use it?
- [ ] Does it include trigger words users would say?
- [ ] Is it distinct from other skills?

### ✅ Step 4: Test with explicit questions

Ask Claude questions that directly match the description triggers.

### ✅ Step 5: Check debug output
```bash
claude --debug
```

Look for skill loading errors.

## Sharing Skills

### Via Project Repository

1. Create project skill:
```bash
mkdir -p .claude/skills/team-skill
# Create SKILL.md
```

2. Commit to git:
```bash
git add .claude/skills/
git commit -m "Add team skill for [purpose]"
git push
```

3. Team members get it automatically:
```bash
git pull
claude  # Skills are now available
```

### Via Plugin

For wider distribution, create a plugin with Skills. See Claude Code plugin documentation.

## Managing Skills

### View all available Skills
Ask Claude:
```
What Skills are available?
```

or:
```
List all available Skills
```

### Update a Skill
Edit SKILL.md directly:
```bash
# Personal
code ~/.claude/skills/my-skill/SKILL.md

# Project
code .claude/skills/my-skill/SKILL.md
```

Restart Claude Code to load changes.

### Remove a Skill
```bash
# Personal
rm -rf ~/.claude/skills/my-skill

# Project
rm -rf .claude/skills/my-skill
git commit -m "Remove unused Skill"
```

## Common Patterns

### Pattern: Feature Flag Skill
For project-specific feature development workflows.

### Pattern: Testing Skill
For running project-specific test suites with custom configurations.

### Pattern: Deployment Skill
For project-specific deployment procedures and checks.

### Pattern: Documentation Skill
For generating or updating project-specific documentation formats.

### Pattern: Review Skill
For project-specific code review checklists and standards.

## Summary

**To create a skill**:
1. Choose location: `~/.claude/skills/` (personal) or `.claude/skills/` (project)
2. Create directory: `mkdir -p [location]/skill-name`
3. Create `SKILL.md` with YAML frontmatter (name + description)
4. Write clear, specific instructions
5. Test with questions matching your description

**For effective discovery**:
- Write specific descriptions with trigger words
- Include both what and when in descriptions
- Use focused, single-purpose skills
- Test with realistic user questions

**For debugging**:
- Verify file location and YAML syntax
- Make descriptions more specific
- Check with `claude --debug`
- Ensure trigger words match user questions
