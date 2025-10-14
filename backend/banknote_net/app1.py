# app.py
import io, os, glob
from typing import Dict, Any
from PIL import Image

import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder

# ===== 路徑設定（相對於本檔案所在資料夾）=====
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENC_PATH = os.path.join(BASE_DIR, "models", "banknote_net_encoder.h5")
FEATHER_PATH = os.path.join(BASE_DIR, "data", "banknote_net.feather")
MODELS_DIR = os.path.join(BASE_DIR, "outputs")

CURRENCY_MODEL_PATTERNS = [
    "{cur}_top_clf.h5",
    "{cur}_top_classifier.h5",
    "{cur}_classifier.h5",
    "{cur}.h5",
    "{cur}_top_clf.keras",
    "{cur}_top_classifier.keras",
]

# ===== 全域物件（啟動時載入）=====
app = Flask(__name__)
CORS(app)

encoder = None
knn = None
le_curr = None
df_all = None
v_cols = None
deno_le_cache: Dict[str, LabelEncoder] = {}
clf_cache: Dict[str, Any] = {}  # 幣別 -> keras model

def load_and_preprocess_pil(img: Image.Image, target_size=(224, 224)):
    img = img.convert("RGB").resize(target_size)
    x = np.array(img, dtype=np.float32)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)
    return x

def find_currency_model_path(currency: str) -> str | None:
    for pat in CURRENCY_MODEL_PATTERNS:
        cand = os.path.join(MODELS_DIR, pat.format(cur=currency))
        if os.path.exists(cand):
            return cand
    hits = []
    for ext in ("h5", "keras"):
        hits.extend(glob.glob(os.path.join(MODELS_DIR, f"*{currency}*.{ext}")))
    return hits[0] if hits else None

def init_models(k_neighbors: int = 5):
    global encoder, knn, le_curr, df_all, v_cols

    if not os.path.exists(ENC_PATH):
        raise FileNotFoundError(f"Encoder not found: {ENC_PATH}")
    if not os.path.exists(FEATHER_PATH):
        raise FileNotFoundError(f"Feather not found: {FEATHER_PATH}")

    # 1) 讀取資料庫 embeddings 與標籤
    df_all = pd.read_feather(FEATHER_PATH)
    v_cols = [c for c in df_all.columns if c.startswith("v_")]
    if len(v_cols) != 256:
        raise RuntimeError(f"Expected 256-dim embedding, got {len(v_cols)}.")

    if "Currency" not in df_all.columns or "Denomination" not in df_all.columns:
        raise RuntimeError("Feather 缺少 'Currency' 或 'Denomination' 欄位。")

    X_db = df_all[v_cols].values.astype(np.float32)
    y_curr = df_all["Currency"].astype(str).values
    le_curr = LabelEncoder().fit(y_curr)
    y_curr_idx = le_curr.transform(y_curr)

    # 2) 建立 KNN 幣別分類器
    knn_local = KNeighborsClassifier(n_neighbors=k_neighbors, weights="distance")
    knn_local.fit(X_db, y_curr_idx)

    # 3) 載入 encoder
    encoder_local = load_model(ENC_PATH, compile=False)

        # 將區域變數賦值給全域變數
    encoder = encoder_local
    knn = knn_local
    # 修正為:

    return encoder_local, knn_local, le_curr 

# 修正 init_models 函式，確保全域變數被正確賦值
def init_models_and_set_globals(k_neighbors: int = 5):
    global encoder, knn, le_curr, df_all, v_cols

    if not os.path.exists(ENC_PATH):
        raise FileNotFoundError(f"Encoder not found: {ENC_PATH}")
    if not os.path.exists(FEATHER_PATH):
        raise FileNotFoundError(f"Feather not found: {FEATHER_PATH}")

    df_all = pd.read_feather(FEATHER_PATH)
    v_cols = [c for c in df_all.columns if c.startswith("v_")]
    if len(v_cols) != 256:
        raise RuntimeError(f"Expected 256-dim embedding, got {len(v_cols)}.")

    if "Currency" not in df_all.columns or "Denomination" not in df_all.columns:
        raise RuntimeError("Feather 缺少 'Currency' 或 'Denomination' 欄位。")

    X_db = df_all[v_cols].values.astype(np.float32)
    y_curr = df_all["Currency"].astype(str).values
    le_curr = LabelEncoder().fit(y_curr)
    y_curr_idx = le_curr.transform(y_curr)

    knn = KNeighborsClassifier(n_neighbors=k_neighbors, weights="distance")
    knn.fit(X_db, y_curr_idx)

    encoder = load_model(ENC_PATH, compile=False)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify(ok=True)

@app.route("/api/predict", methods=["POST"])
def predict():
    """
    multipart/form-data:
      - image: 檔案
      - k: (可選) 幣別 KNN 的 K，預設 5
      - show_topk: (可選) 要列出幣別 Top K，預設 3
    """
    try:
        if "image" not in request.files:
            return jsonify(ok=False, error="missing_field:image"), 400
        file = request.files["image"]
        k = int(request.form.get("k", 5))
        show_topk = int(request.form.get("show_topk", 3))

        # 讀影像並前處理
        img = Image.open(io.BytesIO(file.read()))
        x = load_and_preprocess_pil(img)

        # 產生 embedding
        emb = encoder.predict(x)
        if emb.shape[-1] != 256:
            return jsonify(ok=False, error=f"encoder_output_dim={emb.shape[-1]}"), 500

        # 幣別預測（Step 1）
        curr_proba = knn.predict_proba(emb)[0]
        curr_classes = knn.classes_
        order = np.argsort(curr_proba)[::-1]

        top_currencies = []
        for idx in order[:show_topk]:
            cname = le_curr.inverse_transform([curr_classes[idx]])[0]
            top_currencies.append({
                "currency": cname,
                "prob": float(curr_proba[idx])
            })

        pred_idx = order[0]
        pred_currency = le_curr.inverse_transform([curr_classes[pred_idx]])[0]
        pred_curr_prob = float(curr_proba[pred_idx])

        # 面額分類器（Step 2）: 快取
        if pred_currency in clf_cache:
            clf = clf_cache[pred_currency]
        else:
            clf_path = find_currency_model_path(pred_currency)
            if not clf_path:
                return jsonify(
                    ok=False,
                    error=f"denomination_model_not_found:{pred_currency}",
                    hint=f"請先訓練並放到 outputs/ ，例如 {pred_currency}_top_clf.h5"
                ), 404
            clf = load_model(clf_path, compile=False)
            clf_cache[pred_currency] = clf

        # 面額 LabelEncoder（Step 3）: 快取
        if pred_currency in deno_le_cache:
            deno_le = deno_le_cache[pred_currency]
        else:
            df_curr = df_all[df_all["Currency"] == pred_currency].copy()
            deno_le = LabelEncoder().fit(df_curr["Denomination"].astype(str).values)
            deno_le_cache[pred_currency] = deno_le

        # 面額預測（Step 4）
        probs = clf.predict(emb)[0]
        order_d = np.argsort(probs)[::-1]
        denominations = [{
            "denomination": str(deno_le.classes_[j]),
            "prob": float(probs[j])
        } for j in order_d[:5]]

        result = {
            "ok": True,
            "currency": {
                "pred": pred_currency,
                "prob": pred_curr_prob,
                "top_k": top_currencies
            },
            "denomination": {
                "pred": denominations[0]["denomination"],
                "prob": denominations[0]["prob"],
                "top_5": denominations
            }
        }
        return jsonify(result), 200

    except Exception as e:
        return jsonify(ok=False, error=str(e)), 500

if __name__ == "__main__":
    # 啟動時載入
    init_models_and_set_globals(k_neighbors=5)
    # 對外服務（若要給手機/Android 模擬器連，請用 0.0.0.0）
    app.run(host="0.0.0.0", port=5000, debug=True)
