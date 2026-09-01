# Design context

## Overview

The designed surface is a Markdown documentation library. Readers encounter it
through the root README, `VISION.md`, supporting documents, and each `SKILL.md`.

The user goal is to find the right skill, understand its boundaries, execute
its workflow, and verify the outcome without a second source of instructions.

Use these design principles:

- Task-shaped: one skill owns one named job.
- Decision-first: put the answer before background.
- Evidence-led: connect claims to runs, measurements, or primary sources.
- Scannable: headings, tables, lists, and code blocks reveal the path.
- Explicitly safe: approval gates and stopping points must be hard to miss.
- Composable: routers and related skills hand off without copying each other.

Primary sources are `README.md`, `VISION.md`, `docs/skill-naming.md`,
`design-context/references/contract.md`, and representative `SKILL.md` files.

## Colors

The repository owns no color tokens. GitHub, an editor, or an agent client
controls canvas, text, link, code, selection, and focus colors.

Never encode status or priority through color alone. Pair every warning,
success, failure, and stop state with explicit text.

Do not add a palette based on the optional directions under `brand/`. Their
colors belong to the assets produced by those skills, not this documentation.

When a skill documents a product palette, label every value and keep it inside
that skill's subject. Meet WCAG contrast requirements for any generated visual.

## Typography

Use the host's default reading typeface. Use the host's monospace typeface for
commands, paths, environment variables, code, and literal values.

Apply Markdown roles consistently:

- One level-one heading names the document or skill.
- Level-two headings divide major decisions or workflow stages.
- Level-three headings divide steps within a major stage.
- Bold text marks a decision, guard, or short lead-in.
- Inline code marks exact text a reader can type, find, or compare.
- Fenced blocks contain commands, code, structured data, or diagrams.

Use sentence case for headings. Keep prose paragraphs short. Prefer readable
source wrapping, but do not damage tables, links, or code to meet a column.

Do not use bold for whole paragraphs. Do not use heading levels for visual size
alone, and do not skip levels within one section.

## Layout

A standard skill lives at `<skill-name>/SKILL.md`. Its YAML frontmatter comes
first, followed by one level-one heading and the task instructions.

Arrange a skill in the order a reader needs it:

1. State when to use it and when not to use it.
2. Name prerequisites, authority limits, and safety rules.
3. Give the workflow in execution order.
4. Show verification and failure handling.
5. Hand off to related skills when another owner continues the work.

Use a table for exact mappings or comparisons. Use a numbered list for ordered
work. Use bullets for independent rules. Use a diagram only when branching or
state changes are materially clearer than prose.

Keep one canonical entry point for each domain. The root README indexes the
collection; domain routers narrow the choice; one skill owns the final task.

## Elevation & Depth

Visual elevation is not applicable to this text-only surface. Do not specify
shadows, overlays, translucency, or stacking tokens for repository documents.

Express information depth through semantic hierarchy:

- Headings establish containment.
- Tables group parallel facts.
- Code fences separate literal input and output.
- Block quotes isolate short approved copy or a critical external statement.
- Links move optional detail out of the main execution path.

Avoid deep heading trees and nested lists. If a reader must track several
levels at once, split the section or move detail into a referenced file.

## Shapes

The surface uses Markdown structures instead of visual control shapes.

- Hyphen bullets represent independent items.
- Numbered lists represent sequence or precedence.
- Checkboxes represent work that must be recorded as complete.
- Tables represent exact fields, routes, states, or comparisons.
- Backticks delimit literal tokens.
- Fenced blocks preserve commands and machine-readable examples.
- Horizontal rules separate major document modes only when headings cannot.

Do not use emoji as an icon system. A symbol may support text, but it must not
carry the only meaning.

## Components

Reuse these documentation components.

**Skill frontmatter.** Include `name` and a trigger-aware `description`. The
name must match its directory. Keep the description specific enough to route.

**Opening decision.** State the task, default choice, or diagnostic premise
before the detailed explanation.

**Routing table.** Map observed conditions to the one skill or action that owns
the next step. Do not offer several equivalent entry points.

**Workflow.** Use ordered steps with commands next to the step they support.
Name inputs, outputs, success conditions, and stop conditions.

**Safety gate.** Use direct language such as `Stop`, `Never`, or `Get approval`.
State what authority is missing and which action requires it.

**Evidence block.** Give a reproducible command, measurement, primary source,
or live-run result. Separate observed facts from recommendations.

**Failure note.** Describe the visible symptom, likely cause, and corrective
action. Do not hide known traps in a generic troubleshooting appendix.

**Cross-reference.** Link to the sibling that owns adjacent work. Use relative
repository links and descriptive labels. Do not duplicate the sibling's steps.

**Diagram.** Use text or DOT when sequence, branching, or state is otherwise
hard to follow. Repeat critical safety meaning in prose for accessibility.

All components must remain readable without custom CSS. Link text must describe
its destination. Tables need clear headers, and code examples need context.

## Do's and Don'ts

| Do                                                | Don't                                           |
| ------------------------------------------------- | ----------------------------------------------- |
| Lead with the decision or next action.            | Open with a long history of the problem.        |
| Keep one task in one skill.                       | Turn a skill into a catch-all framework.        |
| Use exact commands and observable results.        | Say "verify it works" without a check.          |
| Mark approval and submission boundaries.          | Let an example imply permission.                |
| Route to the existing domain owner.               | Add a second entry point for the same job.      |
| Link primary sources near the supported claim.    | Collect unexplained links at the end.           |
| Name failure symptoms and recovery steps.         | Hide known traps behind vague cautions.         |
| Use text labels for every state.                  | Depend on color, emoji, or formatting alone.    |
| Keep `.agents/brand.md` about identity and voice. | Put layout or component rules in brand context. |
| Keep this file about the documentation surface.   | Borrow a visual direction from `brand/`.        |
| Update a skill after a live run disproves it.     | Preserve contradicted advice for compatibility. |
| Stop when human authority is required.            | Automate an irreversible action by implication. |
