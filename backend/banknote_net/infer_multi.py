# infer_multi.py
import os
import glob
import argparse
import numpy as np
import pandas as pd
from PIL import Image

import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder

# ---------- 配置 ----------
ENC_PATH = r".\models\banknote_net_encoder.h5"   # 共用 encoder
FEATHER_PATH = r".\data\banknote_net.feather"    # 含 v_0..v_255, Currency, Denomination
MODELS_DIR = r".\outputs"                        # 各幣別的面額分類器存放處
CURRENCY_MODEL_PATTERNS = [
    "{cur}_top_clf.h5",
    "{cur}_top_classifier.h5",
    "{cur}_classifier.h5",
    "{cur}.h5",
    "{cur}_top_clf.keras",
    "{cur}_top_classifier.keras",
]

def load_and_preprocess(img_path, target_size=(224, 224)):
    img = Image.open(img_path).convert("RGB").resize(target_size)
    x = np.array(img, dtype=np.float32)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)
    return x

def find_currency_model_path(currency: str) -> str | None:
    # 在 MODELS_DIR 內以常見命名找模型
    for pat in CURRENCY_MODEL_PATTERNS:
        cand = os.path.join(MODELS_DIR, pat.format(cur=currency))
        if os.path.exists(cand):
            return cand
    # 退而求其次：在 outputs/ 下模糊搜尋
    hits = []
    for ext in ("h5", "keras"):
        hits.extend(glob.glob(os.path.join(MODELS_DIR, f"*{currency}*.{ext}")))
    return hits[0] if hits else None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--image", required=True, help="path to image for inference")
    ap.add_argument("--k", type=int, default=5, help="K for KNN currency classifier")
    ap.add_argument("--show_topk", type=int, default=3, help="show top-K currencies")
    args = ap.parse_args()

    if not os.path.exists(ENC_PATH):
        raise FileNotFoundError(f"找不到 encoder: {ENC_PATH}")
    if not os.path.exists(FEATHER_PATH):
        raise FileNotFoundError(f"找不到 feather: {FEATHER_PATH}")
    if not os.path.exists(args.image):
        raise FileNotFoundError(f"找不到圖片: {args.image}")

    # 1) 讀取資料庫的 embeddings 與標籤
    df = pd.read_feather(FEATHER_PATH)
    # 取得 embedding 矩陣
    v_cols = [c for c in df.columns if c.startswith("v_")]
    if len(v_cols) != 256:
        raise RuntimeError(f"預期 256 維 embedding，實得 {len(v_cols)} 維。")
    X_db = df[v_cols].values.astype(np.float32)

    # 幣別與面額欄位（你的檔是 'Currency', 'Denomination'）
    if "Currency" not in df.columns:
        raise RuntimeError("feather 檔缺少 'Currency' 欄位。")
    if "Denomination" not in df.columns:
        raise RuntimeError("feather 檔缺少 'Denomination' 欄位。")

    y_curr = df["Currency"].astype(str).values
    le_curr = LabelEncoder().fit(y_curr)
    y_curr_idx = le_curr.transform(y_curr)

    # 2) 建立 KNN 幣別分類器（用資料庫 embeddings 當樣本庫）
    knn = KNeighborsClassifier(n_neighbors=args.k, weights="distance")
    knn.fit(X_db, y_curr_idx)

    # 3) 載入 encoder，將輸入圖片轉為 256 維 embedding
    print("[INFO] Loading encoder:", ENC_PATH)
    encoder = load_model(ENC_PATH, compile=False)
    x = load_and_preprocess(args.image)
    emb = encoder.predict(x)  # (1, 256)
    if emb.shape[-1] != 256:
        raise RuntimeError(f"Encoder 輸出維度 {emb.shape[-1]} ≠ 256，請檢查 encoder 是否正確。")

    # 4) 幣別預測（Step1）
    curr_proba = knn.predict_proba(emb)[0]
    # 有些 sklearn 版本 KNN 可能沒有 classes_ 的順序對應，保險起見：
    curr_classes = knn.classes_
    # 取 top-k 幣別
    order = np.argsort(curr_proba)[::-1]
    print("\n=== Currency prediction ===")
    for rank, idx in enumerate(order[:args.show_topk], 1):
        cname = le_curr.inverse_transform([curr_classes[idx]])[0]
        print(f"{rank}. {cname:>4s}  prob={curr_proba[idx]:.4f}")

    pred_curr_idx = order[0]
    pred_currency = le_curr.inverse_transform([curr_classes[pred_curr_idx]])[0]
    pred_curr_prob = float(curr_proba[pred_curr_idx])
    print(f"\n🎯 Predicted currency: {pred_currency}  (prob={pred_curr_prob:.4f})")

    # 5) 尋找對應幣別的面額分類器（Step2）
    clf_path = find_currency_model_path(pred_currency)
    if not clf_path:
        raise FileNotFoundError(
            f"在 {MODELS_DIR} 找不到 {pred_currency} 的面額分類器。\n"
            f"請先訓練：python src\\train_from_embedding.py --currency {pred_currency} --bsize 128 --epochs 25 --dpath .\\data\\banknote_net.feather\n"
            f"模型命名例如：outputs\\{pred_currency}_top_clf.h5"
        )
    print("[INFO] Loading denomination classifier:", clf_path)
    clf = load_model(clf_path, compile=False)

    # 6) 面額標籤對映（Step3）
    df_curr = df[df["Currency"] == pred_currency].copy()
    deno_le = LabelEncoder().fit(df_curr["Denomination"].astype(str).values)

    # 7) 面額預測
    probs = clf.predict(emb)[0]
    top_idx = int(np.argmax(probs))
    top_prob = float(probs[top_idx])
    top_name = deno_le.classes_[top_idx]

    # Top-5
    order_d = np.argsort(probs)[::-1]
    print("\n=== Denomination prediction ===")
    for rank, j in enumerate(order_d[:5], 1):
        print(f"{rank}. {deno_le.classes_[j]}  prob={float(probs[j]):.4f}")

    print(f"\n✅ Final result: currency={pred_currency}, denomination={top_name}  (prob={top_prob:.4f})")


if __name__ == "__main__":
    main()
