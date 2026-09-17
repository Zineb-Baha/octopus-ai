# ServiceFlow AI

**Octopus AI Lab — Challenge C01**

ServiceFlow AI is a prototype customer-service assistant for automotive service teams.

It helps a service adviser review a customer request against available workshop and CRM evidence, identify conflicting or incomplete information, and prepare a safe response for human review.

> **Important:** This prototype uses synthetic exercise data. No real customer data or real customer communication is used.

---

## Problem

Customer-service advisers may need to check information across different sources before answering a customer.

For example, a customer may ask:

> "Can I collect my car this afternoon?"

The CRM may say that the vehicle is ready for collection, while the workshop status may still show that the quality check is pending.

ServiceFlow AI helps the adviser identify this conflict before responding.

The system does **not** make the final decision. The service adviser remains responsible for approving the response.

---

## Core Workflow

```text
Customer request
       ↓
Retrieve case evidence
       ↓
Check workshop / CRM states
       ↓
Identify conflicts or uncertainty
       ↓
Generate a proposed response
       ↓
Human review and editing
       ↓
Approve / simulate response
       ↓
Update case evidence
```

The prototype focuses on one important principle:

**AI proposes, the human decides.**

---

## Example Case

### Customer

```text
Customer ID: CUS-A
Language: French
```

### Customer request

```text
Can I collect my car this afternoon?
```

### Available evidence

```text
Workshop state: Work finished
Quality check: Pending
CRM state: Ready for collection
```

These states conflict.

The system therefore identifies the case as requiring review and avoids promising a collection time.

### Proposed response

```text
Bonjour, votre véhicule est actuellement en cours de finalisation.
Le contrôle qualité est encore en attente. Nous devons confirmer
sa disponibilité avant de vous donner une heure de collecte.
```

The response can then be reviewed and edited by the service adviser.

---

## Architecture

```text
                    Service Adviser
                          │
                          ▼
                 Next.js Frontend
                          │
                     HTTP / REST
                          │
                          ▼
                   FastAPI Backend
                          │
                          ▼
                    LangGraph
                  Workflow Engine
                    /         \
                   /           \
          Evidence             Rules
          Retrieval          Validation
                   \           /
                    \         /
                     ▼       ▼
                  Response Proposal
                          │
                          ▼
                    Human Review
```

### Frontend

* Next.js
* JavaScript
* CSS

The frontend provides:

* Dashboard
* Case list
* Case details
* Customer messages
* Evidence/status information
* AI-generated response
* Reviewer actions

### Backend

* Python
* FastAPI
* LangGraph

The backend handles:

* Case retrieval
* Evidence retrieval
* Business-rule validation
* Workflow orchestration
* Response generation
* API endpoints

### Data

The prototype currently uses synthetic data stored in:

```text
backend/app/data/initial.json
```

---

## Business Rules

The AI is not the final authority for business decisions.

Deterministic rules are used to identify important conflicts.

For example:

```text
IF
CRM = "ready for collection"
AND
quality check = "pending"

THEN
review is required
AND
the system must not promise collection.
```

This separation allows the application to distinguish between:

* Confirmed information
* Conflicting information
* Missing information
* Proposed AI response
* Human decision

---

## Simulated Event

The prototype includes a simulated workshop event.

Example:

```text
SIMULATED EVENT
Quality check completed
```

This changes the case evidence from:

```text
Quality check: Pending
```

to:

```text
Quality check: Completed
```

The relevant next action can then change accordingly.

This event is clearly marked as **SIMULATED**.

No real workshop system is updated.

---

## Mocked Integrations

The following integrations are currently mocked:

* Workshop management system
* CRM data
* Customer communication
* Case updates

The prototype does not connect to real client systems.

Any simulated send or update is only for demonstration purposes.

---

## Human-in-the-Loop

ServiceFlow AI does not automatically make customer-service commitments.

The workflow is:

```text
AI analyzes evidence
        ↓
AI proposes a response
        ↓
Service adviser reviews
        ↓
Service adviser edits if necessary
        ↓
Service adviser approves
```

The human reviewer remains responsible for the final decision.

---

## Project Structure

```text
octopus-ai/
│
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── cases/
│   │   ├── customer/
│   │   ├── dashboard/
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── globals.css
│   │
│   ├── lib/
│   │   └── api.js
│   │
│   └── .env.example
│
├── backend/
│   ├── api/
│   │   └── index.py
│   │
│   ├── app/
│   │   ├── data/
│   │   │   └── initial.json
│   │   ├── main.py
│   │   ├── rules.py
│   │   └── workflow.py
│   │
│   ├── requirements.txt
│   ├── vercel.json
│   └── .env.example
│
└── README.md
```

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Zineb-Baha/octopus-ai.git
cd octopus-ai
```

### 2. Start the backend

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/health
```

---

### 3. Start the frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start Next.js:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

---

## Environment Variables

### Frontend

Create:

```text
frontend/.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, replace the value with the deployed backend URL.

---

### Backend

Create:

```text
backend/.env
```

Use the provided `.env.example` as a reference.

Do not commit real API keys or secrets to GitHub.

---

## Deployment

The project can be deployed using Vercel.

Because the frontend and backend are located in separate directories, they can be deployed as separate Vercel projects while using the same GitHub repository.

### Frontend

Vercel configuration:

```text
Repository: Zineb-Baha/octopus-ai
Root Directory: frontend
Framework: Next.js
```

### Backend

Vercel configuration:

```text
Repository: Zineb-Baha/octopus-ai
Root Directory: backend
```

The backend contains:

```text
backend/api/index.py
backend/vercel.json
```

The frontend should use the deployed backend URL through:

```env
NEXT_PUBLIC_API_URL=YOUR_BACKEND_URL
```

---

## Current Limitations

This is an Octopus prototype and not a production system.

Current limitations include:

* Synthetic data only
* No real CRM integration
* No real workshop integration
* No real customer messaging
* Simulated events
* Simulated sends
* No production authentication
* Prototype-level persistence
* Human approval remains required
* AI output must be reviewed before use

---

## What Is Demonstrable

The current prototype demonstrates:

1. A customer-service case
2. Customer messages
3. Workshop and CRM evidence
4. Detection of conflicting information
5. A proposed response
6. Human review
7. A simulated status update
8. Updated evidence and next action
9. Clear separation between confirmed information and simulated information

---

## What Is Still a Hypothesis

The prototype does not yet prove:

* Integration with real workshop systems
* Integration with real CRM systems
* Accuracy on real customer conversations
* Reduction in service-adviser handling time
* Production reliability at scale

These should be validated with the client using real workflows and agreed success criteria.

---

## Next Validation

The next validation step is to review the workflow with a service adviser and test whether the prototype helps them answer cases where:

* Customer information is incomplete
* Workshop and CRM states conflict
* A response requires human approval
* The next action is unclear

A useful measurable outcome would be:

> Can a service adviser identify the correct next action and prepare a safe customer response faster than with the current manual workflow?

---

## Handoff to Wolf

Potential next integration work:

```text
Octopus prototype
      ↓
Validate workflow with client
      ↓
Define required integrations
      ↓
Connect CRM / workshop systems
      ↓
Add production authentication
      ↓
Add persistent data storage
      ↓
Implement monitored customer communication
```

### Access required for production integration

* CRM API access
* Workshop-management API access
* Authentication credentials
* Data contracts
* Customer communication provider/API
* Security and privacy requirements

### Main unresolved risk

The prototype currently relies on synthetic evidence. Production deployment requires validating that the real source systems provide sufficiently reliable and consistent status information.

---

## Disclaimer

**This project is an AI Lab prototype created for the Octopus C01 exercise.**

All customer, case, workshop, and CRM information shown in the prototype is synthetic exercise data.

No real customer communication or real business-system update is performed.
