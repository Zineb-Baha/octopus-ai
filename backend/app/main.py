from pathlib import Path
import json
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .workflow import build_workflow


BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "initial.json"
CASE_NOT_FOUND = "Case not found"


with open(DATA_FILE, "r", encoding="utf-8") as file:
    DATA = json.load(file)


def normalize_cases(raw_data):
    if isinstance(raw_data, list):
        return raw_data

    if isinstance(raw_data, dict):
        if isinstance(raw_data.get("cases"), list):
            return raw_data["cases"]
        if raw_data.get("case_id"):
            return [raw_data]

    return []


CASES = normalize_cases(DATA)


app = FastAPI(
    title="ServiceFlow AI API"
)


allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_URL",
        "http://localhost:3000,http://localhost:3001"
    ).split(",")
    if origin.strip()
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


workflow = build_workflow()


class CustomerMessage(BaseModel):
    customer_id: str
    text: str


class AnalyzeRequest(BaseModel):
    message_id: str


@app.get("/health")
def health():

    return {
        "status": "ok"
    }


@app.get("/cases")
def get_cases():

    return CASES


@app.get("/cases/{case_id}")
def get_case(case_id: str):

    case = next(
        (item for item in CASES if item.get("case_id") == case_id),
        None
    )

    if case is None:
        raise HTTPException(
            status_code=404,
            detail=CASE_NOT_FOUND
        )

    return case


@app.post("/cases/{case_id}/messages")
def add_customer_message(case_id: str, message: CustomerMessage):

    case = next(
        (item for item in CASES if item.get("case_id") == case_id),
        None
    )

    if case is None:
        raise HTTPException(
            status_code=404,
            detail=CASE_NOT_FOUND
        )

    customer = next(
        (
            item for item in case.get("customers", [])
            if item.get("id") == message.customer_id
        ),
        None
    )

    if customer is None:
        raise HTTPException(
            status_code=403,
            detail="Customer is not assigned to this case"
        )

    text = message.text.strip()

    if not text:
        raise HTTPException(
            status_code=422,
            detail="Message cannot be empty"
        )

    existing_messages = case.setdefault("messages", [])
    message_id = f"MSG-{len(existing_messages) + 1}"
    new_message = {
        "id": message_id,
        "customer_id": message.customer_id,
        "channel": "customer-portal",
        "text": text,
        "case_ref": case.get("jobs", [{}])[0].get("id")
    }
    existing_messages.append(new_message)

    return new_message


@app.post("/cases/{case_id}/analyze")
def analyze_case(case_id: str, request: AnalyzeRequest):

    case = next(
        (item for item in CASES if item.get("case_id") == case_id),
        None
    )

    if case is None:
        raise HTTPException(
            status_code=404,
            detail=CASE_NOT_FOUND
        )

    message = next(
        (
            item for item in case.get("messages", [])
            if item.get("id") == request.message_id
        ),
        None
    )

    if message is None:
        raise HTTPException(
            status_code=404,
            detail="Message not found in this case"
        )

    state = {
        "data": case,
        "customer_id": message["customer_id"],
        "customer_message": message["text"]
    }

    try:
        result = workflow.invoke(state)
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=f"Gemini analysis failed: {error}"
        ) from error

    return {
        "case_id": case_id,
        "analyzed_message": message,
        "customer": result["customer"],
        "messages": result["messages"],
        "job": result["job"],
        "issues": result["issues"],
        "review_required": result["review_required"],
        "proposed_response": result["proposed_response"],
        "response_source": result.get("response_source", "gemini")
    }