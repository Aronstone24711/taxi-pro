"""AI Tax Assistant using Claude Sonnet 4.5 via emergentintegrations."""
import os
import uuid
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

SYSTEM_PROMPT = """You are TaxQuest AI, a friendly expert tax assistant embedded inside \
TaxQuest — a global tax education app.

Rules:
- Give clear, practical answers about personal income tax, corporate tax, GST/VAT, deductions, \
tax-saving strategies, filing deadlines, and general concepts across countries.
- If a country is specified, tailor your answer to that country and its FY 2024-25 / 2026 rules.
- Never give legally binding advice. Always end complex answers with: \
"⚠️ This is educational only — consult a licensed tax professional for your situation."
- Keep answers concise (< 200 words) unless the user asks for depth.
- Format lists with markdown bullets. Format numbers with proper currency symbols.
- If a question is unrelated to taxes/finance, politely redirect to tax topics.
"""


def _build_chat(session_id: str, country: str | None = None) -> LlmChat:
    system = SYSTEM_PROMPT
    if country:
        system += f"\n\nThe user is currently viewing information about: {country}. Prioritize \
answering questions in the context of this country unless they explicitly ask about another."
    return LlmChat(
        api_key=os.environ["EMERGENT_LLM_KEY"],
        session_id=session_id,
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")


async def stream_reply(session_id: str, user_text: str, country: str | None = None):
    """Async generator yielding SSE-formatted string chunks."""
    chat = _build_chat(session_id, country)
    try:
        async for ev in chat.stream_message(UserMessage(text=user_text)):
            if isinstance(ev, TextDelta):
                # Escape newlines for SSE data field
                safe = ev.content.replace("\r", "").replace("\n", "\\n")
                yield f"data: {safe}\n\n"
            elif isinstance(ev, StreamDone):
                yield "data: [DONE]\n\n"
                break
    except Exception as e:  # noqa: BLE001
        yield f"data: [ERROR] {str(e)[:120]}\n\n"
        yield "data: [DONE]\n\n"


def new_session_id() -> str:
    return f"chat-{uuid.uuid4().hex[:12]}"
