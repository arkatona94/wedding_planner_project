# Directive: Cross-Platform Self-Annealing Loop

This directive defines the standard operating procedure (SOP) for the **Self-Annealing Loop** across a multi-AI ecosystem including **Claude**, **ChatGPT**, **Abacus**, and any other AI tools used for online collaboration. This ensures that the system becomes smarter by persisting knowledge in a way that is accessible and actionable for any AI agent interacting with this codebase.

## 1. Multi-AI Collaboration Pillars

### Phase 1: Diagnosing (Cross-Platform Root Cause Analysis)
When an execution tool or orchestration step fails:
- **Do not guess**: Read the full error message, stack trace, and logs.
- **Cross-Agent Knowledge Check**: 
    - **Claude**: Check for sophisticated logic or architectural constraints.
    - **ChatGPT**: Check for Python-specific execution or creative coding workarounds.
    - **Abacus**: Check for data pipeline or ML-specific integration notes.
- **Identify the failure mode**: Logic, Environmental, API Constraint, or Orchestration.

### Phase 2: Fixing (Deterministic Solutions)
- **Localize the fix**: Change the code in the `execution/` script or the configuration in `.env`.
- **Cross-Platform Compatibility**: Ensure the fix works regardless of which AI platform is running the script. Avoid platform-specific hacks unless documented as such.

### Phase 3: Updating (The Global Knowledge Sync)
Knowledge must be shared immediately to prevent redundant effort:
- **Update Directives**: Add a "Troubleshooting" or "Common Issues" section to the relevant directive.
- **Update the Annealing Log**: (Optional) Maintain a record of failed approaches and successful fixes.
- **Sync Instructions**: Update `CLAUDE.md`, `GEMINI.md`, and `AGENTS.md` to reflect new global constraints or best practices.

### Phase 4: Retrying (Verification)
- **Isolated Testing**: Run the fixed script in isolation.
- **Verify**: Use verification tools (ping, curl, database queries) to prove the fix works.
- **Loop Reset**: Mark the task as complete and resume the user objective.

---

## 2. Decision Logic for Fixes

| Failure Type | AI-Specific Note | Learning Mechanism |
|--------------|------------------|--------------------|
| API 401/403 | Mirror credentials across platforms | Update `.env` and instructions for all agents |
| Rate Limits | Share usage quotas between platforms | Document throttle limits in `directives/` |
| Syntax/Lint | Standardize on universal linting | Update common `execution/` scripts |
| Logic Error | Peer-review logic via other agents | Refine directives with edge cases |

---

## 3. The "Sync-Once, Know-Always" Protocol

If you encounter an error that has been seen by *any* agent (Claude, Gemini, etc.):
1.  **Search**: Check `directives/` for existing notes on this error.
2.  **Refer**: Point to the directive that contains the fix.
3.  **Execute**: Apply the known fix immediately.
4.  **Audit**: If the fix wasn't easy to find for a different AI platform, reorganize the documentation.

> [!IMPORTANT]
> Self-annealing is your primary mechanism for "long-term memory." Every time you fix a bug, you are teaching future versions of Claude, Gemini, ChatGPT, and Abacus how to work better.

---

## 4. Execution Examples

### Example: Supabase 401 (Cross-Platform)
- **Diagnose**: `401 Unauthorized`.
- **Fix**: Input missing `VITE_SUPABASE_ANON_KEY`.
- **Update**: Update `CLAUDE.md`, `GEMINI.md`, and `AGENTS.md` with a "Mandatory Setup" checklist.
- **Retry**: Re-run connectivity test from any AI platform.
