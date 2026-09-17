import os
from pathlib import Path
from typing import TypedDict

from dotenv import load_dotenv
from google import genai
from langgraph.graph import StateGraph, START, END

from .rules import apply_business_rules


load_dotenv(Path(__file__).resolve().parents[1] / ".env")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
USE_GEMINI = os.getenv("USE_GEMINI", "false").lower() == "true"
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


class WorkflowState(TypedDict, total=False):
    data: dict
    customer_id: str
    customer_message: str

    customer: dict
    messages: list
    job: dict

    issues: list
    review_required: bool
    proposed_response: str
    response_source: str


def retrieve_evidence(state: WorkflowState):

    data = state["data"]
    customer_id = state["customer_id"]
    customer_message = state["customer_message"]

    message = next(
        (
            m for m in data["messages"]
            if m["customer_id"] == customer_id
            and m["text"] == customer_message
        ),
        None
    )

    if not message:
        raise ValueError("Customer message not found.")

    job = next(
        (
            j for j in data["jobs"]
            if j["id"] == message["case_ref"]
        ),
        None
    )

    customer = next(
        (
            c for c in data["customers"]
            if c["id"] == customer_id
        ),
        None
    )

    messages = [
        m for m in data["messages"]
        if m["customer_id"] == customer_id
    ]

    return {
        "customer": customer,
        "messages": messages,
        "job": job
    }


def analyze_evidence(state: WorkflowState):

    result = apply_business_rules(
        state["job"],
        state["customer_message"]
    )

    return {
        "issues": result["issues"],
        "review_required": result["review_required"]
    }


def generate_local_response(state: WorkflowState):

    customer = state["customer"]
    customer_message = state["customer_message"].lower()
    job = state["job"]
    language = customer.get("preferred_language", "English")

    if "collect" in customer_message and state["review_required"]:
        if language == "French":
            return (
                "Votre véhicule est prêt pour la collecte selon le système, "
                "mais le contrôle qualité est encore en attente. "
                "Un conseiller doit confirmer la disponibilité avant la collecte."
            )

        return (
            "The system shows your vehicle is ready for collection, but the "
            "quality check is still pending. An adviser must confirm availability "
            "before collection."
        )

    if "booking" in customer_message or "appointment" in customer_message:
        if language == "French":
            return (
                "Votre demande de modification du rendez-vous a bien été reçue. "
                "Un conseiller vous contactera pour confirmer le nouveau créneau."
            )

        return (
            "Your request to change the service booking has been received. "
            "An adviser will contact you to confirm a new appointment slot."
        )

    if language == "French":
        return (
            f"Votre demande concernant le service ({job.get('id', 'votre dossier')}) "
            "a été reçue. Un conseiller vous répondra prochainement."
        )

    return (
        f"Your service request regarding {job.get('id', 'your case')} has been "
        "received. An adviser will respond shortly."
    )


def generate_response(state: WorkflowState):

    customer = state["customer"]
    selected_message = state["customer_message"]
    messages = state["messages"]
    job = state["job"]
    issues = state["issues"]

    if not USE_GEMINI or gemini_client is None:
        return {
            "proposed_response": generate_local_response(state),
            "response_source": "local"
        }

    prompt = f"""
You are a vehicle service customer-support adviser.
Generate the response to the selected customer question only.
Detect the language of the selected question and answer in that same language.
Use the customer profile language only if the selected question is ambiguous.

Selected customer question:
{selected_message}

Customer profile:
{customer}

Related customer messages:
{messages}

Related service job:
{job}

Business rule findings:
{issues}

Review required: {state["review_required"]}

Rules:
- Do not invent facts, dates, prices, or vehicle states.
- Do not promise collection while quality control is pending.
- If review is required, explain that an adviser must confirm availability.
- Return only the customer-facing response, with no analysis or heading.
"""

    try:
        result = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )
    except Exception as error:
        if "429" in str(error) or "RESOURCE_EXHAUSTED" in str(error):
            return {
                "proposed_response": generate_local_response(state),
                "response_source": "local"
            }
        raise

    return {
        "proposed_response": result.text,
        "response_source": "gemini"
    }


def build_workflow():

    graph = StateGraph(WorkflowState)

    graph.add_node(
        "retrieve_evidence",
        retrieve_evidence
    )

    graph.add_node(
        "analyze_evidence",
        analyze_evidence
    )

    graph.add_node(
        "generate_response",
        generate_response
    )

    graph.add_edge(
        START,
        "retrieve_evidence"
    )

    graph.add_edge(
        "retrieve_evidence",
        "analyze_evidence"
    )

    graph.add_edge(
        "analyze_evidence",
        "generate_response"
    )

    graph.add_edge(
        "generate_response",
        END
    )

    return graph.compile()