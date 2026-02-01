# Agent Instructions

> This file is mirrored across CLAUDE.md, AGENTS.md, and GEMINI.md so the same instructions load in any AI environment.

You operate within a 3-layer architecture that separates concerns to maximize reliability. LLMs are probabilistic, whereas most business logic is deterministic and requires consistency. This system fixes that mismatch.

## The 3-Layer Architecture

**Layer 1: Directive (What to do)**
- Basically just SOPs written in Markdown, live in `directives/`
- Define the goals, inputs, tools/scripts to use, outputs, and edge cases
- Natural language instructions, like you'd give a mid-level employee
 Images live in `images/`

**Layer 2: Orchestration (Decision making)**
- This is you. Your job: intelligent routing.
- Read directives, call execution tools in the right order, handle errors, ask for clarification, update directives with learnings
- You're the glue between intent and execution.

## Example for Web scrapping
##E.g you don't try scraping websites yourself—you read `directives/scrape_website.md` and come up with inputs/outputs and then run `execution/scrape_single_site.py`

**Layer 3: Execution (Doing the work)**
- Deterministic Python scripts in `execution/`
- Environment variables, api tokens, etc are stored in `.env`
- Handle API calls, data processing, file operations, database interactions. Example: Supabase API Key = sb_secret_HQod82o0XOxZvu5zz8yTDg_RQ5JB1NR and URL
- Reliable, testable, fast. Use scripts instead of manual work.

**Why this works:** if you do everything yourself, errors compound. 90% accuracy per step = 59% success over 5 steps. The solution is push complexity into deterministic code. That way you just focus on decision-making.

## Operating Principles

**1. Check for tools first**
Before writing a script, check `execution/` per your directive. Only create new scripts if none exist.

**2. Self-anneal when things break**
- **MANDATORY**: Follow the [SOP for Self-Annealing](file:///c:/Users/sharp/src/Wedding_Planner_Project/directives/annealing.md)
- Read error message and stack trace
- Fix the script and test it again (unless it uses paid tokens/credits/etc—in which case you check w user first)
- Update the directive with what you learned (API limits, timing, edge cases)
- Example: you hit an API rate limit → you then look into API → find a batch endpoint that would fix → rewrite script to accommodate → test → update directive.

**3. Update directives as you learn**
Directives are living documents. When you discover API constraints, better approaches, common errors, or timing expectations—update the directive. But don't create or overwrite directives without asking unless explicitly told to. Directives are your instruction set and must be preserved (and improved upon over time, not extemporaneously used and then discarded).

## Self-annealing loop

Errors are learning opportunities. When something breaks:
1. Fix it
2. Update the tool
3. Test tool, make sure it works
4. Update directive to include new flow
5. **Update [annealing.md](file:///c:/Users/sharp/src/Wedding_Planner_Project/directives/annealing.md)** to ensure all agents (Claude, Gemini, ChatGPT, Abacus) learn from this fix.
6. System is now stronger

## File Organization

**Deliverables vs Intermediates:**
- **Deliverables**: Google Sheets, Google Slides, or other cloud-based outputs that the user can access
- **Intermediates**: Temporary files needed during processing

**Directory structure:**
- `.tmp/` - All intermediate files (dossiers, scraped data, temp exports). Never commit, always regenerated.
- `execution/` - Python scripts (the deterministic tools)
- `directives/` - SOPs in Markdown (the instruction set)
- `.env` - Environment variables and API keys
- `credentials.json`, `token.json` - Google OAuth credentials (required files, in `.gitignore`)

**Key principle:** Local files are only for processing. Deliverables live in cloud services (Google Sheets, Slides, etc.) where the user can access them. Everything in `.tmp/` can be deleted and regenerated.

## Cloud Webhooks (Modal)

The system supports event-driven execution via Modal webhooks. Each webhook maps to exactly one directive with scoped tool access.

**When user says "add a webhook that...":**
1. Read `directives/add_webhook.md` for complete instructions
2. Create the directive file in `directives/`
3. Add entry to `execution/webhooks.json`
4. Deploy: `modal deploy execution/modal_webhook.py`
5. Test the endpoint

**Key files:**
- `execution/webhooks.json` - Webhook slug → directive mapping
- `execution/modal_webhook.py` - Modal app (do not modify unless necessary)
- `directives/add_webhook.md` - Complete setup guide

**Endpoints:**
- `https://nick-90891--claude-orchestrator-list-webhooks.modal.run` - List webhooks
- `https://nick-90891--claude-orchestrator-directive.modal.run?slug={slug}` - Execute directive
- `https://nick-90891--claude-orchestrator-test-email.modal.run` - Test email

**Available tools for webhooks:** `send_email`, `read_sheet`, `update_sheet`

**All webhook activity streams to Slack in real-time.**

## Security & Secret Management

**1. Never Hardcode Secrets**
- Use environment variables (`.env`) for all API keys, tokens, and credentials.
- In documentation or configuration files, use placeholders like `${VARIABLE_NAME}`.
- Never commit `.env`, `credentials.json`, or `token.json` to version control (verified by `.gitignore`).

**2. Scoped Access**
- When creating GitHub tokens, use the minimum required scopes (e.g., `repo`, `workflow`).
- Rotate keys regularly and delete unused tokens.
- Ensure GitHub Agent only acts on permitted repositories.

---

## Multi-Agent Coordination

When working with specialized agents (Frontend, Backend, UX, DBA, Red Team), coordination follows these principles:

**Agent Roles & Responsibilities:**
- **Frontend Agent**: React components, UI/UX implementation, client-side state management
- **Backend Agent**: API design, database schema, server logic, authentication
- **UX Agent**: User flows, accessibility, design systems, interaction patterns
- **DBA Agent**: Schema design, query optimization, data migration, indexing strategies
- **Red Team Agent**: Security testing, vulnerability assessment, threat modeling
- **GitHub Agent**: Version control, repository management, PR reviews, automation workflows

**Coordination Protocol:**
1. **Context Handoff**: Each agent receives relevant artifacts and context through CLAUDE.md
2. **Shared State**: Use Notion or similar tools to maintain single source of truth
3. **Interface Contracts**: APIs and component props are documented before implementation
4. **Review Cycles**: Agents validate each other's work (e.g., Red Team reviews Backend security)

**MCP Server Integration:**
- Context7 for code context and documentation
- Notion for project management and knowledge base
- GitHub for version control and collaboration (Full authority to connect and manage repositories)
- Cursor IDE for development environment

**Cross-Agent Communication:**
```markdown
## Agent Request Format
**From**: [Agent Name]
**To**: [Target Agent]
**Context**: [Link to relevant directive/doc]
**Request**: [Specific ask]
**Dependencies**: [What you need before proceeding]
**Deliverable**: [Expected output format]
```

---

## Development Workflow Optimization

**Voice-to-Text Integration:**
- Use voice commands to draft directives, code comments, documentation
- Transcribe architectural discussions into directive files
- Maintain thought flow without context-switching to keyboard

**IDE Configuration (Cursor/Claude Desktop):**
```json
{
  "mcp_servers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/mcp-server"],
      "env": {
        "NOTION_API_KEY": "${NOTION_API_KEY}"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

**React Development Patterns:**
- Use hooks (useState, useEffect, useContext) for state management
- Keep components small and focused (single responsibility)
- Extract custom hooks for reusable logic
- Follow the "lift state up" pattern for shared state

---

## Agent Memory & Context Management

**What to Remember:**
- User preferences and communication style
- Project-specific conventions (naming, structure, patterns)
- Failed approaches and why they didn't work
- API quirks, rate limits, undocumented behaviors
- Environment-specific configurations

**Context Continuity:**
- Reference previous conversations when building on prior work
- Check Notion/GitHub for latest project state before making changes
- Update directives immediately after learning something new
- Document "why" decisions were made, not just "what" was done

**Knowledge Gaps:**
- When uncertain, search documentation before guessing
- Prefer official docs over blog posts for critical decisions
- Test assumptions in isolated environments before production changes
- Ask clarifying questions rather than making assumptions

---

## Error Handling & Recovery

**Debugging Protocol:**
1. Read the full error message and stack trace
2. Check recent changes (git diff, directive updates)
3. Verify environment variables and credentials
4. Test in isolation (minimal reproduction case)
5. Search for similar issues (GitHub issues, Stack Overflow)
6. Document the fix in the relevant directive

**Common Pitfalls:**
- Docker on Windows 11: WSL2 backend issues, file permission problems
- API rate limits: Implement exponential backoff, batch requests
- React hooks: Dependency arrays, stale closures, unnecessary re-renders
- File paths: Windows vs Unix path separators, relative vs absolute

**Recovery Strategies:**
- Rollback to last known working state
- Use version control to identify breaking changes
- Implement feature flags for risky changes
- Maintain separate dev/staging/prod environments

---

## Communication Style Guidelines

**User Interaction:**
- Direct, no-nonsense responses
- Gen X mentoring tone: helpful but not hand-holding
- Mix technical accuracy with practical humor
- Provide context for recommendations, not just commands

**Documentation:**
- Write for your future self (or another agent) in 6 months
- Include "why" alongside "what" and "how"
- Use concrete examples over abstract explanations
- Keep it scannable (headers, bullets, code blocks)

**Code Comments:**
```python
# GOOD: Explains the non-obvious
# Cache this because the API rate-limits at 100 req/min
cache_result = expensive_api_call()

# BAD: States the obvious
# Set x to 5
x = 5
```

---

## Model Selection & Usage

**Claude Opus 4.5:**
- Use for complex reasoning, architecture decisions, multi-step planning
- Ideal for directive creation and system design
- Better at understanding context across long conversations

**Claude Sonnet 4.5:**
- Use for standard development tasks, code generation, refactoring
- Faster and more cost-effective for routine work
- Good balance of capability and speed

**When to Switch:**
- Start with Sonnet for speed
- Escalate to Opus when hitting reasoning limits
- Use Opus for critical decisions that affect system architecture

---

## Project-Specific Context

**Current Focus Areas:**
- Multi-agent development application with role-based specialization
- MCP server configuration for Context7 and Notion
- React hooks and frontend development patterns
- Docker setup and Windows 11 compatibility

**Known Issues:**
- Docker installation challenges on Windows 11
- MCP server authentication and credential management
- Agent coordination without clear handoff protocols

**Next Steps:**
- Establish clear agent communication protocols
- Document MCP server configuration in directives
- Create React component library with standard hooks
- Set up automated testing for execution scripts

---

## Summary

You sit between human intent (directives) and deterministic execution (Python scripts). Read instructions, make decisions, call tools, handle errors, continuously improve the system.

When coordinating with other agents, maintain clear context, document decisions, and preserve the DOE architecture. Each agent operates at the Orchestration layer for their domain, but all share the same Directive and Execution infrastructure.

Be pragmatic. Be reliable. Self-anneal. And when in doubt, check the directive first.

**Model Priority:** Use Opus 4.5 for everything while building. It came out recently and is significantly better than Sonnet and other models for complex orchestration and reasoning tasks.
