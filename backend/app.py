from flask import Flask, jsonify
from flask_cors import CORS
import requests 
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)