# ServiceFlow AI

ServiceFlow AI is a Next.js frontend with a FastAPI backend and Gemini-powered case analysis.

## Local development

Backend:

```bash
cd backend
python -m pip install -r requirements.txt
copy .env.example .env
python -m uvicorn app.main:app --reload --port 8000
```

Set `USE_GEMINI=false` for local rule-based answers. Set `USE_GEMINI=true` and add
`GEMINI_API_KEY` in `backend/.env` to enable Gemini-generated answers.

Frontend:

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Vercel deployment

Deploy the frontend and backend as two separate Vercel projects from the same repository.

### Backend project

1. Import the repository into Vercel.
2. Set the project root directory to `backend`.
3. Add `GEMINI_API_KEY` as an environment variable for Preview and Production.
4. Add `FRONTEND_URL` with the deployed frontend URL, for example `https://serviceflow-ai.vercel.app`.
5. Deploy. The backend exposes `/health`, `/cases`, and the case message/analyze endpoints.

The `backend/vercel.json` file routes all paths to the FastAPI function in `backend/api/index.py`.

### Frontend project

1. Create a second Vercel project for the same repository.
2. Set the project root directory to `frontend`.
3. Add `NEXT_PUBLIC_API_URL` with the deployed backend URL, for example `https://serviceflow-ai-api.vercel.app`.
4. Deploy.

The frontend uses `NEXT_PUBLIC_API_URL` in every API call and falls back to `http://localhost:8000` for local development.

## Important production note

The current demo data is loaded from `backend/app/data/initial.json` and message updates are held in process memory. Vercel functions are ephemeral, so persistent customer messages require a database before using this beyond a demo.