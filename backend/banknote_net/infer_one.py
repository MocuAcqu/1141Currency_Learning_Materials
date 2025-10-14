# infer_one.py
import os
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# === 1) 路徑設定：改成你實際的檔案 ===
ENC_PATH   = r".\models\banknote_net_encoder.h5"     # BankNote-Net encoder（輸出 256 維）
CLF_PATH   = r".\outputs\EUR_top_classifier.h5"      # 你訓練好的分類器 .h5（請替換）
IMAGE_PATH = r".\test_images\my_euro.jpg"            # 要辨識的圖片

# === 2) 讀圖並做與訓練一致的前處理 ===
def load_and_preprocess(img_path, target_size=(224, 224)):
    img = Image.open(img_path).convert("RGB").resize(target_size)
    x = np.array(img, dtype=np.float32)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)  # 與 MobileNetV2/encoder 相容的前處理
    return x

# === 3) 載入 encoder（得到 256 維 embedding）與淺層分類器 ===
print("[INFO] Loading encoder:", ENC_PATH)
encoder = load_model(ENC_PATH, compile=False)  # 輸出 shape 應為 (None, 256)

print("[INFO] Loading classifier:", CLF_PATH)
clf = load_model(CLF_PATH, compile=False)      # 輸入 shape 應為 (None, 256)

# === 4) 產生 embedding 並做推論 ===
x = load_and_preprocess(IMAGE_PATH)
emb = encoder.predict(x)           # emb.shape -> (1, 256)
print("[INFO] Embedding shape:", emb.shape)
if emb.shape[-1] != 256:
    raise RuntimeError(f"Encoder output dim = {emb.shape[-1]}, 需為 256。請確認你用的是 BankNote-Net encoder。")

probs = clf.predict(emb)[0]        # softmax 機率
top_idx = int(np.argmax(probs))
top_prob = float(probs[top_idx])

# === 5) 友善輸出（若沒 class 名稱，先顯示 index） ===
print("\n=== Prediction ===")
print(f"Top class index: {top_idx} (prob = {top_prob:.4f})")
print("Top-5:")
for i in np.argsort(probs)[::-1][:5]:
    print(f"  idx={int(i):2d}  prob={float(probs[i]):.4f}")


# === 將索引對回人類可讀的類別名稱 ===
import pandas as pd
from sklearn.preprocessing import LabelEncoder

FEATHER_PATH = r".\data\banknote_net.feather"
CURRENCY = "EUR"

df = pd.read_feather(FEATHER_PATH)
# 注意欄位名稱大小寫！
df = df[df["Currency"] == CURRENCY].copy()

# 嘗試使用現有欄位或組合新標籤
label_col = None
for cand in ["label", "class", "y", "target"]:
    if cand in df.columns:
        label_col = cand
        break

if label_col is None:
    # 用 Denomination 欄位建立標籤
    deno = "Denomination" if "Denomination" in df.columns else None
    if deno:
        df["__label__"] = df[deno].astype(str)
        label_col = "__label__"
    else:
        raise RuntimeError("找不到標籤欄位，請確認 feather 內的欄位名稱。")

le = LabelEncoder()
le.fit(df[label_col].astype(str).values)

top_name = le.classes_[top_idx]
print(f"\n>>> 預測類別名稱：{top_name} (prob={top_prob:.4f})")
print(f"🎯 最終預測結果：{top_name}")