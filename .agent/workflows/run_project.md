---
description: Run the AegisFlow project (Backend + Frontend)
---

# Run Backend (Terminal 1)
Open a new terminal in `C:\PROJECT\AegisFlow`.

```powershell
$env:PYTHONPATH = "C:\PROJECT\AegisFlow"; .\backend\venv\Scripts\python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

# Run Frontend (Terminal 2)
Open a new terminal in `C:\PROJECT\AegisFlow\frontend`.

```powershell
npm run dev
```
