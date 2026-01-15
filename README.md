
Unlike static ML notebooks that run on pre-saved CSVs, this platform is an **live, event-driven system**. It ingests transactions in real-time, processes features dynamically, scores them against complex fraud patterns, and provides instant "Allow/Deny/Review" decisions—everything secure, encrypted, and explained.

### ❓ The Problem
Digital payments are instant, but so is fraud.
- **Rule-based systems** (e.g., "deny if > $10k") are too rigid and generate massive false positives.
- **Traditional ML** is often too slow for real-time auth paths (needs to be < 200ms).
- **Black-box models** give no adaptability; if a model denies a transaction, analysts need to know *why* (Location? Device? Spend velocity?).

### ✅ The Solution
A hybrid **AI + Heuristic** engine that:
1.  **Ingests** transaction data via secure API.
2.  **Enriches** data directly from a high-speed Feature Store (Redis) to check velocity (e.g., "5th tx in 1 minute").
3.  **Evaluates** using an Ensemble Model:
    *   **Isolation Forest**: To catch "unknown unknowns" (Anomaly Detection).
    *   **XGBoost**: To catch known fraud patterns (Supervised Learning).
4.  **Explains** the decision using **SHAP values**, giving human analysts a clear reason for the block.

---

## 🏆 Why This Project Dominates (Competitive Analysis)

Why do recruiters care about this more than a "Smart Traffic Management" or "Stock Predictor" app?

| Feature | Standard ML Projects | **This Fraud Detection Platform** |
| :--- | :--- | :--- |
| **Stakes** | Error = "Bad prediction" | Error = **Financial Loss or Lawsuit** |
| **System Design** | Jupyter Notebook | **Microservices + Event-Driven** |
| **Latency** | Irrelevant (seconds/minutes) | **High Stakes (< 200ms required)** |
| **Data Handling** | Balanced, cleaned CSVs | **Imbalanced, Noisy, Real-world data** |
| **Security** | None | **JWT, Encryption, RBAC** |
| **Explainability** | Confusion Matrix only | **SHAP / LIME Real-time Explanations** |

**Recruiter Perception**: "This candidate understands that accuracy isn't the only metric. They built a system that is secure, fast, and debuggable."

---

## 🏗️ Technical Architecture & Stack Justification

We chose a "Modern FinTech" stack. Every tool has a specific industry justification.

### 1. Backend: **FastAPI** (Python)
*   **Why**: Flask/Django are blocking (sync). Fraud detection requires massive concurrency (handling 1000s of transactions simultaneously). FastAPI uses `async/await` (ASGI), making it fast enough to compete with Go/Node.js while keeping the Python ML ecosystem.

### 2. Database: **PostgreSQL** + **Redis**
*   **PostgreSQL**: Financial data *must* be ACID compliant. We cannot lose a transaction log.
*   **Redis**: We need to count "transactions in the last hour" for a user. Running a SQL `COUNT(*)` every time is too slow. Redis allows O(1) read/write for these real-time counters.

### 3. ML Engine: **XGBoost** + **Isolation Forest**
*   **Why Ensemble?**:
    *   **XGBoost**: Best-in-class for tabular data. It learns from past fraud.
    *   **Isolation Forest**: Unsupervised. It finds "weird" patterns even if we've never seen that specific new attack type before.
*   **Why Not Deep Learning?**: Neural Networks are often overkill for tabular data and harder to explain. In FinTech, **Explainability > 0.01% Accuracy**.

### 4. Frontend: **React** + **Tailwind CSS**
*   **Why**: Analysts need a dashboard that updates instantly. React's state management allows for a live "Command Center" view of incoming attacks.

### 5. Advanced DevOps: **Docker** & **GitHub Actions**
*   **Why**: "It runs on my machine" is not acceptable. Containerization ensures the ML environment matches Production exactly.

---

## 🚀 Key Features (The "Elite" List)

### Core System
- [ ] **Real-Time Transaction API**: `POST /analyze` endpoint returning sub-second risk scores.
- [ ] **Hybrid Scoring Engine**: Combines Rule Engine (hard limits) + ML Models.
- [ ] **Role-Based Dashboard**: Admin vs. Analyst views.

### 🛡️ Security First
- [ ] **JWT Authentication**: Secure API access.
- [ ] **Data Encryption**: AES-256 for PII (Personally Identifiable Information) storage.

### 🧠 Advanced AI Features (Top 1% Candidate Stats)
- [ ] **Explainable AI (XAI)**:
    *   The system tells you: "Risk Score 85% *BECAUSE* txn_amount is 5x user_avg AND location is 'Nigeria' (IP Mismatch)."
- [ ] **Model Drift Detection**:
    *   The system monitors the distribution of inputs. If valid users start behaving differently (e.g., holiday shopping spikes), the system alerts you that the model might be "drifting" and needs retraining.
- [ ] **Shadow Mode**:
    *   Ability to run a new model version alongside the old one without affecting live decisions, to compare performance safely.

---

## 📂 Project Structure

```text
fraud-platform/
├── backend/          # FastAPI High-Performance API
├── ml_engine/        # The Brain (Models, Training, Explainability)
├── frontend/         # React Admin Ops Dashboard
├── database/         # SQL Scripts & Redis Configs
└── deployment/       # Docker & K8s Manifests
```

---

## 🏁 Getting Started

### 1. Prerequisites
- Python 3.11+
- Node.js 18+
- VS Code (Recommended)

### 2. Run the Backend
Open a terminal in the root folder (`C:\PROJECT\AegisFlow`) and run:
```powershell
$env:PYTHONPATH = "C:\PROJECT\AegisFlow"; .\backend\venv\Scripts\python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
*API will run at: http://127.0.0.1:8000*

### 3. Run the Frontend
Open a new terminal in `frontend/` and run:
```bash
cd frontend
npm run dev
```
*Dashboard will run at: http://localhost:8080*

### 4. Login Credentials
- **Email**: `admin@aegisflow.com`
- **Password**: `admin123`
