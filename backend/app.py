from flask import Flask, jsonify, request
from flask_cors import CORS
import requests 
import os
from dotenv import load_dotenv
import mysql.connector
import mysql.connector.pooling
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager
from werkzeug.security import generate_password_hash, check_password_hash

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
        
        query = "SELECT id, currency_code, name_zh, country_zh, symbol, image_url FROM currencies ORDER BY currency_code ASC"
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)