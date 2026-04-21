# Intent Mirror — ML + Gen AI Engine

## Setup

```bash
cd ml/
pip install -r requirements.txt

# Step 1: Generate synthetic dataset (5,000 customers)
python generate_data.py

# Step 2: Train models (XGBoost + GradientBoosting)
python train.py

# Step 3: Start ML microservice (port 5001)
python service.py
```

## What's trained

| Model | Algorithm | Task | Accuracy |
|-------|-----------|------|----------|
| Churn/Outcome | XGBoost | 4-class classification | 59% / ROC-AUC 0.79 |
| Persona | XGBoost | 4-class classification | **87.3%** / ROC-AUC 0.98 |
| Risk Score | GradientBoosting | Regression | MAE 3.3 pts / R² 0.97 |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/predict` | ML prediction for a user profile |
| POST | `/ai/nudge` | Gen AI personalized nudge |
| GET | `/metrics` | Model training metrics |
| GET | `/health` | Service status |

## Gen AI Architecture

The nudge engine uses **prompt engineering** — no API key required for demo.
To wire up real LLM:
1. `pip install anthropic`
2. In `nudge_engine.py`, replace the template section with:
```python
import anthropic
client = anthropic.Anthropic(api_key="YOUR_KEY")
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=256,
    messages=[{"role": "user", "content": prompt}]
)
message = response.content[0].text
```
