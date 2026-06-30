"""
Intent Mirror — ML Model Training Pipeline
==========================================
Trains two XGBoost classifiers:
  1. Churn/Outcome Predictor  →  Churn | Withdraw | Upgrade | Renew
  2. Persona Classifier       →  Exiter | Anxious Saver | Optimizer | Protector

Also trains a risk score regressor using GradientBoosting.

Outputs:
  models/churn_model.pkl     — XGBoost outcome classifier
  models/persona_model.pkl   — XGBoost persona classifier
  models/risk_model.pkl      — Gradient boosting risk regressor
  models/feature_names.json  — Feature list for inference
  models/metrics.json        — All evaluation metrics for dashboard display
"""

import json, os, joblib, warnings
warnings.filterwarnings('ignore')

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing    import LabelEncoder
from sklearn.metrics          import (classification_report, confusion_matrix,
                                      accuracy_score, f1_score, roc_auc_score)
from sklearn.ensemble         import GradientBoostingRegressor
from xgboost                  import XGBClassifier

BASE   = os.path.dirname(__file__)
DATA   = os.path.join(BASE, 'data', 'fd_customers_5000.csv')
MODELS = os.path.join(BASE, 'models')

# ── Load data ──────────────────────────────────────────────────────────────
print("Loading data…")
df = pd.read_csv(DATA)
print(f"  {len(df)} rows, {df.shape[1]} columns")

# ── Feature engineering ────────────────────────────────────────────────────
df['city_tier']  = df['city_tier'].astype(int)
df['age_enc']    = LabelEncoder().fit_transform(df['age_group'])   # mid=0, senior=1, young=2
df['days_bucket']= pd.cut(df['days_left'],  bins=[0,3,7,14,21,30], labels=[4,3,2,1,0]).astype(int)
df['login_bucket']= pd.cut(df['last_login_days'], bins=[0,3,7,14,30,60], labels=[0,1,2,3,4]).astype(int)
df['churn_signal_count'] = (df['has_early_withdrawal'] + df['has_no_login'] + df['has_competitor_browse'])
df['upgrade_signal_count'] = (df['has_mf_browse'] + df['has_stocks_search'])
df['anxiety_signal_count'] = (df['has_safety_check'] + df['has_support_ticket'])
df['fd_amount_bin'] = pd.cut(df['fd_amount_l'], bins=[0, 1, 2, 5, 10, 100], labels=[0,1,2,3,4]).astype(int)

FEATURES = [
    'days_left', 'days_bucket', 'last_login_days', 'login_bucket',
    'fd_amount_l', 'fd_amount_bin', 'fd_count',
    'city_tier', 'age_enc',
    'n_signals', 'churn_signal_count', 'upgrade_signal_count', 'anxiety_signal_count',
    'has_early_withdrawal', 'has_no_login', 'has_competitor_browse',
    'has_safety_check', 'has_support_ticket', 'has_rate_compare',
    'has_mf_browse', 'has_stocks_search',
]

X = df[FEATURES]

# ── Encoders ───────────────────────────────────────────────────────────────
outcome_enc = LabelEncoder()
persona_enc = LabelEncoder()

y_outcome = outcome_enc.fit_transform(df['outcome'])    # Churn/Withdraw/Upgrade/Renew
y_persona = persona_enc.fit_transform(df['persona'])    # Exiter/Anxious/Optimizer/Protector
y_risk    = df['risk_score'].values

print(f"  Outcome classes: {list(outcome_enc.classes_)}")
print(f"  Persona classes: {list(persona_enc.classes_)}")

# ── Train/test split ───────────────────────────────────────────────────────
X_tr, X_te, yo_tr, yo_te, yp_tr, yp_te, yr_tr, yr_te = train_test_split(
    X, y_outcome, y_persona, y_risk,
    test_size=0.2, random_state=42, stratify=y_outcome
)

print(f"\nTrain: {len(X_tr)} | Test: {len(X_te)}")

# ── XGBoost hyperparams ────────────────────────────────────────────────────
XGB_PARAMS = dict(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.08,
    subsample=0.85,
    colsample_bytree=0.85,
    min_child_weight=3,
    gamma=0.1,
    use_label_encoder=False,
    eval_metric='mlogloss',
    random_state=42,
    n_jobs=-1,
)

# ── Train Outcome Model ────────────────────────────────────────────────────
print("\n── Training Outcome (Churn) Classifier ──")
churn_model = XGBClassifier(**XGB_PARAMS, num_class=len(outcome_enc.classes_))
churn_model.fit(X_tr, yo_tr,
                eval_set=[(X_te, yo_te)],
                verbose=False)

yo_pred  = churn_model.predict(X_te)
yo_proba = churn_model.predict_proba(X_te)

outcome_acc  = accuracy_score(yo_te, yo_pred)
outcome_f1   = f1_score(yo_te, yo_pred, average='weighted')
outcome_auc  = roc_auc_score(yo_te, yo_proba, multi_class='ovr', average='weighted')
outcome_cv   = cross_val_score(churn_model, X, y_outcome, cv=StratifiedKFold(5), scoring='accuracy').mean()

print(f"  Accuracy : {outcome_acc:.4f}  ({outcome_acc*100:.1f}%)")
print(f"  F1-score : {outcome_f1:.4f}")
print(f"  ROC-AUC  : {outcome_auc:.4f}")
print(f"  CV Acc   : {outcome_cv:.4f}")
print(f"\n  Per-class report:")
print(classification_report(yo_te, yo_pred, target_names=outcome_enc.classes_))

outcome_cm = confusion_matrix(yo_te, yo_pred).tolist()

# Feature importance
outcome_fi = dict(zip(FEATURES, churn_model.feature_importances_.tolist()))

# ── Train Persona Model ────────────────────────────────────────────────────
print("── Training Persona Classifier ──")
persona_model = XGBClassifier(**XGB_PARAMS, num_class=len(persona_enc.classes_))
persona_model.fit(X_tr, yp_tr,
                  eval_set=[(X_te, yp_te)],
                  verbose=False)

yp_pred  = persona_model.predict(X_te)
yp_proba = persona_model.predict_proba(X_te)

persona_acc = accuracy_score(yp_te, yp_pred)
persona_f1  = f1_score(yp_te, yp_pred, average='weighted')
persona_auc = roc_auc_score(yp_te, yp_proba, multi_class='ovr', average='weighted')
persona_cv  = cross_val_score(persona_model, X, y_persona, cv=StratifiedKFold(5), scoring='accuracy').mean()

print(f"  Accuracy : {persona_acc:.4f}  ({persona_acc*100:.1f}%)")
print(f"  F1-score : {persona_f1:.4f}")
print(f"  ROC-AUC  : {persona_auc:.4f}")
print(f"  CV Acc   : {persona_cv:.4f}")
print(f"\n  Per-class report:")
print(classification_report(yp_te, yp_pred, target_names=persona_enc.classes_))

persona_cm = confusion_matrix(yp_te, yp_pred).tolist()
persona_fi = dict(zip(FEATURES, persona_model.feature_importances_.tolist()))

# ── Train Risk Regressor ───────────────────────────────────────────────────
print("── Training Risk Score Regressor ──")
risk_model = GradientBoostingRegressor(
    n_estimators=200, max_depth=5, learning_rate=0.1,
    subsample=0.85, random_state=42
)
risk_model.fit(X_tr, yr_tr)
yr_pred = risk_model.predict(X_te)
from sklearn.metrics import mean_absolute_error, r2_score
risk_mae = mean_absolute_error(yr_te, yr_pred)
risk_r2  = r2_score(yr_te, yr_pred)
print(f"  MAE : {risk_mae:.2f} pts  |  R² : {risk_r2:.4f}")

# ── Save models ────────────────────────────────────────────────────────────
print("\n── Saving models ──")
joblib.dump(churn_model,   os.path.join(MODELS, 'churn_model.pkl'))
joblib.dump(persona_model, os.path.join(MODELS, 'persona_model.pkl'))
joblib.dump(risk_model,    os.path.join(MODELS, 'risk_model.pkl'))
joblib.dump(outcome_enc,   os.path.join(MODELS, 'outcome_encoder.pkl'))
joblib.dump(persona_enc,   os.path.join(MODELS, 'persona_encoder.pkl'))
print("  ✅  churn_model.pkl")
print("  ✅  persona_model.pkl")
print("  ✅  risk_model.pkl")
print("  ✅  outcome_encoder.pkl")
print("  ✅  persona_encoder.pkl")

# ── Save feature names ─────────────────────────────────────────────────────
with open(os.path.join(MODELS, 'feature_names.json'), 'w') as f:
    json.dump(FEATURES, f, indent=2)

# ── Save metrics for dashboard ─────────────────────────────────────────────
# Top-10 features by importance (sorted)
top_outcome_fi = sorted(outcome_fi.items(), key=lambda x: x[1], reverse=True)[:10]
top_persona_fi = sorted(persona_fi.items(), key=lambda x: x[1], reverse=True)[:10]

# Human-readable feature labels
FEATURE_LABELS = {
    'has_early_withdrawal':   'Early Withdrawal Search',
    'has_no_login':           'Inactivity (30d+)',
    'has_competitor_browse':  'Competitor Browsing',
    'has_safety_check':       'Safety Check Queries',
    'has_support_ticket':     'Support Ticket Raised',
    'has_rate_compare':       'Rate Comparison',
    'has_mf_browse':          'MF/Fund Browsing',
    'has_stocks_search':      'Stock Market Search',
    'days_left':              'Days to Maturity',
    'days_bucket':            'Maturity Urgency Bucket',
    'last_login_days':        'Days Since Last Login',
    'login_bucket':           'Login Recency Bucket',
    'fd_amount_l':            'FD Amount (₹ Lakhs)',
    'fd_amount_bin':          'FD Amount Category',
    'fd_count':               'Number of FDs',
    'city_tier':              'City Tier',
    'age_enc':                'Age Group',
    'n_signals':              'Total Signal Count',
    'churn_signal_count':     'Churn Signals',
    'upgrade_signal_count':   'Upgrade Signals',
    'anxiety_signal_count':   'Anxiety Signals',
}

metrics = {
    "generated_at": pd.Timestamp.now().isoformat(),
    "dataset": {
        "total_customers": len(df),
        "train_size": len(X_tr),
        "test_size": len(X_te),
        "n_features": len(FEATURES),
        "outcome_distribution": df['outcome'].value_counts().to_dict(),
        "persona_distribution": df['persona'].value_counts().to_dict(),
    },
    "churn_model": {
        "name": "XGBoost Outcome Classifier",
        "accuracy": round(outcome_acc * 100, 1),
        "f1_weighted": round(outcome_f1, 4),
        "roc_auc": round(outcome_auc, 4),
        "cv_accuracy": round(outcome_cv * 100, 1),
        "classes": list(outcome_enc.classes_),
        "confusion_matrix": outcome_cm,
        "feature_importance": [
            {"feature": FEATURE_LABELS.get(k, k), "importance": round(v * 100, 2)}
            for k, v in top_outcome_fi
        ],
        "params": {
            "n_estimators": 300,
            "max_depth": 6,
            "learning_rate": 0.08,
            "algorithm": "XGBoost"
        }
    },
    "persona_model": {
        "name": "XGBoost Persona Classifier",
        "accuracy": round(persona_acc * 100, 1),
        "f1_weighted": round(persona_f1, 4),
        "roc_auc": round(persona_auc, 4),
        "cv_accuracy": round(persona_cv * 100, 1),
        "classes": list(persona_enc.classes_),
        "confusion_matrix": persona_cm,
        "feature_importance": [
            {"feature": FEATURE_LABELS.get(k, k), "importance": round(v * 100, 2)}
            for k, v in top_persona_fi
        ],
    },
    "risk_model": {
        "name": "GradientBoosting Risk Regressor",
        "mae_pts": round(risk_mae, 2),
        "r2_score": round(risk_r2, 4),
    }
}

METRICS_FILE = os.path.join(MODELS, 'metrics.json')
with open(METRICS_FILE, 'w') as f:
    json.dump(metrics, f, indent=2)

print(f"  ✅  metrics.json")
print(f"\n{'='*50}")
print(f"  TRAINING COMPLETE")
print(f"  Churn Model Accuracy  : {outcome_acc*100:.1f}%")
print(f"  Persona Model Accuracy: {persona_acc*100:.1f}%")
print(f"  Risk Regressor MAE    : {risk_mae:.1f} pts")
print(f"{'='*50}")
