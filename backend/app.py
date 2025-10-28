import io, os, glob
from typing import Dict, Any

# Flask 和相關擴充
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager

# 輔助工具
import requests
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

# 資料庫
import mysql.connector
import mysql.connector.pooling

# 影像辨識與機器學習
from PIL import Image
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key-for-dev")
jwt = JWTManager(app)

db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

try:
    db_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="my_pool", pool_size=5, **db_config)
    print("資料庫連線池建立成功！")
except mysql.connector.Error as err:
    print(f"資料庫連線錯誤: {err}")
    db_pool = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BANKNOTE_NET_DIR = os.path.join(BASE_DIR, "banknote_net")
ENC_PATH = os.path.join(BANKNOTE_NET_DIR, "models", "banknote_net_encoder.h5")
FEATHER_PATH = os.path.join(BANKNOTE_NET_DIR, "data", "banknote_net.feather")
MODELS_DIR = os.path.join(BANKNOTE_NET_DIR, "outputs")

CURRENCY_MODEL_PATTERNS = [
    "{cur}_top_clf.h5",
    "{cur}_top_classifier.h5",
    "{cur}_classifier.h5",
    "{cur}.h5",
    "{cur}_top_clf.keras",
    "{cur}_top_classifier.keras",
]

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
    
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    if not email or not username or not password:
        return jsonify({"error": "缺少必要資訊"}), 400

    hashed_password = generate_password_hash(password)

    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "此電子郵件已被註冊"}), 409

        cursor.execute("INSERT INTO users (email, username, password) VALUES (%s, %s, %s)",
                       (email, username, hashed_password))
        conn.commit()
        return jsonify({"message": "註冊成功！"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": f"資料庫錯誤: {err}"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "缺少電子郵件或密碼"}), 400

    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user and check_password_hash(user['password'], password):
            additional_claims = {"username": user['username']}
            access_token = create_access_token(identity=user['id'], additional_claims=additional_claims)

            return jsonify(
                access_token=access_token,
                user={
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email']
                }
            )
        else:
            return jsonify({"error": "電子郵件或密碼錯誤"}), 401
    except mysql.connector.Error as err:
        return jsonify({"error": f"資料庫錯誤: {err}"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/me/collections', methods=['GET'])
@jwt_required()
def get_my_collections():
    current_user_id = get_jwt_identity()

    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor()
        query = """
            SELECT c.currency_code 
            FROM user_collections uc
            JOIN currencies c ON uc.currency_id = c.id
            WHERE uc.user_id = %s
        """
        cursor.execute(query, (current_user_id,))
        collections = [row[0] for row in cursor.fetchall()]
        return jsonify(collections=collections)
    except mysql.connector.Error as err:
        return jsonify({"error": f"資料庫錯誤: {err}"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/rates', methods=['GET'])
def get_latest_rates():
    """
    從 ExchangeRate-API 獲取以新台幣(TWD)為基準的最新匯率資料。
    """
    api_key = os.getenv('EXCHANGERATE_API_KEY')

    if not api_key:
        print("致命錯誤：環境變數 EXCHANGERATE_API_KEY 未設定！")
        return jsonify({"error": "伺服器設定不正確，缺少 API 金鑰"}), 500

    base_currency = 'TWD'
    url = f"https://v6.exchangerate-api.com/v6/{api_key}/latest/{base_currency}"

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        if data.get("result") == "success":
            formatted_data = {
                "base": data.get("base_code"),
                "rates": data.get("conversion_rates")
            }
            return jsonify(formatted_data)
        else:
            error_type = data.get("error-type", "未知 API 錯誤")
            print(f"ExchangeRate-API 錯誤: {error_type}")
            return jsonify({"error": f"匯率服務出錯: {error_type}"}), 500

    except requests.exceptions.RequestException as e:
        print(f"網路請求失敗: {e}")
        return jsonify({"error": "無法連線至外部匯率服務"}), 502

@app.route('/api/currencies', methods=['GET'])
def get_all_currencies():
    if not db_pool:
        return jsonify({"error": "資料庫未連線"}), 500
    
    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = "SELECT id, currency_code, name_zh, country_zh, country_en, symbol, image_url FROM currencies ORDER BY currency_code ASC"
        cursor.execute(query)
        currencies = cursor.fetchall()
        
        return jsonify(currencies)
    except mysql.connector.Error as err:
        print(f"查詢錯誤: {err}")
        return jsonify({"error": "伺服器查詢錯誤"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/currencies/<string:currency_code>', methods=['GET'])
def get_currency_by_code(currency_code):
    if not db_pool:
        return jsonify({"error": "資料庫未連線"}), 500

    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = "SELECT * FROM currencies WHERE currency_code = %s"
        cursor.execute(query, (currency_code.upper(),)) 
        currency = cursor.fetchone() 
        
        if currency:
            return jsonify(currency)
        else:
            return jsonify({"error": "找不到指定的貨幣"}), 404
    
    except mysql.connector.Error as err:
        print(f"查詢錯誤: {err}")
        return jsonify({"error": "伺服器查詢錯誤"}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    print("正在初始化辨識模型...")
    init_models_and_set_globals(k_neighbors=5)
    print("辨識模型初始化完成！")
    print("啟動 Flask 伺服器...")
    app.run(host="0.0.0.0", port=5000, debug=True)