"""
Intent Mirror — ML Microservice
================================
Flask API that serves:
  POST /predict        → churn + persona + risk score from ML models
  POST /ai/nudge       → Gen AI personalized nudge generation
  GET  /metrics        → model training metrics for dashboard
  GET  /health         → service status

Run:
  python service.py

Default port: 5001
"""

import os, sys, json, warnings
warnings.filterwarnings('ignore')

import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

BASE   = os.path.dirname(__file__)
MODELS = os.path.join(BASE, 'models')

# ── Load models ──────────────────────────────────────────────────────────
print("Loading ML models…")

try:
    churn_model   = joblib.load(os.path.join(MODELS, 'churn_model.pkl'))
    persona_model = joblib.load(os.path.join(MODELS, 'persona_model.pkl'))
    risk_model    = joblib.load(os.path.join(MODELS, 'risk_model.pkl'))
    outcome_enc   = joblib.load(os.path.join(MODELS, 'outcome_encoder.pkl'))
    persona_enc   = joblib.load(os.path.join(MODELS, 'persona_encoder.pkl'))
    with open(os.path.join(MODELS, 'feature_names.json')) as f:
        FEATURES = json.load(f)
    with open(os.path.join(MODELS, 'metrics.json')) as f:
        METRICS = json.load(f)
    MODELS_LOADED = True
    print(f"  ✅  All models loaded ({len(FEATURES)} features)")
except Exception as e:
    print(f"  ⚠️  Models not loaded: {e}")
    print("     Run ml/train.py first to generate models.")
    MODELS_LOADED = False

from nudge_engine import generate_nudge

# ── Helper: extract features from user profile ────────────────────────────
AGE_MAP = {'young': 2, 'mid': 0, 'senior': 1}
CITY_TIER_MAP = {
    'Mumbai':1,'Delhi':1,'Bengaluru':1,'Hyderabad':1,'Chennai':1,'Kolkata':1,'Pune':1,'Ahmedabad':1,
    'Jaipur':2,'Lucknow':2,'Kochi':2,'Chandigarh':2,'Indore':2,'Coimbatore':2,'Vadodara':2,'Nagpur':2,
    'Varanasi':3,'Patna':3,'Allahabad':3,'Bhopal':3,'Mysuru':3,'Trivandrum':3,'Surat':3,'Agra':3,
}

def parse_amount(fd_amount_str):
    """Parse '₹5.1L' → 5.1"""
    try:
        s = str(fd_amount_str).replace('₹', '').replace('L', '').replace(',', '').strip()
        return float(s)
    except:
        return 2.0

def profile_to_features(profile: dict) -> pd.DataFrame:
    """Convert a user profile dict into the ML feature vector."""
    signals = profile.get('signals', [])
    days    = int(profile.get('daysLeft', 15))
    lli     = int(profile.get('lastLogin', 5))
    amt     = parse_amount(profile.get('fdAmount', '₹2L'))
    city    = profile.get('city', 'Mumbai')
    tier    = CITY_TIER_MAP.get(city, 2)
    age_grp = profile.get('age_group', 'mid')
    age_enc = AGE_MAP.get(age_grp, 0)
    fd_cnt  = int(profile.get('fd_count', 1))

    has_ew = int('early_withdrawal' in signals)
    has_nl = int('no_login_30d' in signals)
    has_cb = int('competitor_browse' in signals)
    has_sc = int('safety_check' in signals)
    has_st = int('support_ticket' in signals)
    has_rc = int('rate_compare' in signals)
    has_mf = int('mf_browse' in signals)
    has_ss = int('stocks_search' in signals)

    n_signals = has_ew + has_nl + has_cb + has_sc + has_st + has_rc + has_mf + has_ss

    days_bucket  = 4 if days<=3 else 3 if days<=7 else 2 if days<=14 else 1 if days<=21 else 0
    login_bucket = 0 if lli<=3 else 1 if lli<=7 else 2 if lli<=14 else 3 if lli<=30 else 4
    amt_bin      = 0 if amt<1 else 1 if amt<2 else 2 if amt<5 else 3 if amt<10 else 4

    row = {
        'days_left':           days,
        'days_bucket':         days_bucket,
        'last_login_days':     lli,
        'login_bucket':        login_bucket,
        'fd_amount_l':         amt,
        'fd_amount_bin':       amt_bin,
        'fd_count':            fd_cnt,
        'city_tier':           tier,
        'age_enc':             age_enc,
        'n_signals':           n_signals,
        'churn_signal_count':  has_ew + has_nl + has_cb,
        'upgrade_signal_count':has_mf + has_ss,
        'anxiety_signal_count':has_sc + has_st,
        'has_early_withdrawal':has_ew,
        'has_no_login':        has_nl,
        'has_competitor_browse':has_cb,
        'has_safety_check':    has_sc,
        'has_support_ticket':  has_st,
        'has_rate_compare':    has_rc,
        'has_mf_browse':       has_mf,
        'has_stocks_search':   has_ss,
    }
    return pd.DataFrame([row])[FEATURES]

# ── Flask App ─────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins=['http://localhost:5173','http://localhost:5174',
                   'http://localhost:5175','http://localhost:5180',
                   'http://localhost:3001'])

@app.route('/health')
def health():
    return jsonify({
        'status':       'ok',
        'models_loaded': MODELS_LOADED,
        'version':      '1.0.0',
        'endpoints':    ['/predict', '/ai/nudge', '/metrics', '/health']
    })

@app.route('/metrics')
def metrics():
    if not MODELS_LOADED:
        return jsonify({'error': 'Models not loaded. Run train.py first.'}), 503
    return jsonify(METRICS)

@app.route('/predict', methods=['POST'])
def predict():
    """
    POST /predict
    Body: user profile dict (same shape as dashboard user objects)
    Returns: {
        prediction, prediction_proba,
        persona, persona_proba,
        risk_score, confidence, model_used
    }
    """
    if not MODELS_LOADED:
        return jsonify({'error': 'Models not loaded'}), 503

    try:
        profile = request.get_json()
        X = profile_to_features(profile)

        # Outcome prediction
        outcome_idx   = churn_model.predict(X)[0]
        outcome_proba = churn_model.predict_proba(X)[0]
        outcome_label = outcome_enc.inverse_transform([outcome_idx])[0]
        outcome_conf  = float(outcome_proba[outcome_idx])

        outcome_dist = {
            cls: round(float(p), 4)
            for cls, p in zip(outcome_enc.classes_, outcome_proba)
        }

        # Persona prediction
        persona_idx   = persona_model.predict(X)[0]
        persona_proba = persona_model.predict_proba(X)[0]
        persona_label = persona_enc.inverse_transform([persona_idx])[0]
        persona_conf  = float(persona_proba[persona_idx])

        persona_dist = {
            cls: round(float(p), 4)
            for cls, p in zip(persona_enc.classes_, persona_proba)
        }

        # Risk score
        risk_score = int(np.clip(risk_model.predict(X)[0], 0, 100))
        urgency    = int(np.clip(risk_score + np.random.normal(0, 2), 0, 100))

        return jsonify({
            'prediction':        outcome_label,
            'prediction_proba':  outcome_dist,
            'prediction_confidence': round(outcome_conf * 100, 1),
            'persona':           persona_label,
            'persona_proba':     persona_dist,
            'persona_confidence':round(persona_conf * 100, 1),
            'risk_score':        risk_score,
            'urgency':           urgency,
            'model_used':        'XGBoost v2.0 + GradientBoosting',
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/ai/nudge', methods=['POST'])
def ai_nudge():
    """
    POST /ai/nudge
    Body: { user: {...}, channel: 'sms'|'in_app'|'email', lang: 'en'|'hi' }
    Returns: nudge engine output with prompt, message, reasoning
    """
    try:
        body    = request.get_json()
        user    = body.get('user', {})
        channel = body.get('channel', 'in_app')
        lang    = body.get('lang', 'en')

        result = generate_nudge(user, channel=channel, lang=lang)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    PORT = int(os.environ.get('ML_PORT', 5001))
    print(f"""
╔═══════════════════════════════════════╗
║  Intent Mirror  ML Service  v1.0      ║
║  http://localhost:{PORT}                ║
║                                       ║
║  POST  /predict    → ML prediction    ║
║  POST  /ai/nudge   → Gen AI nudge     ║
║  GET   /metrics    → Model metrics    ║
║  GET   /health     → Status           ║
╚═══════════════════════════════════════╝
    """)
    app.run(port=PORT, debug=False)
