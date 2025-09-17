from flask import Flask, jsonify
from flask_cors import CORS

# 初始化 Flask 應用
app = Flask(__name__)
CORS(app) # 允許所有來源的跨域請求

# 建立一個測試用的 API Endpoint
@app.route('/api/test', methods=['GET'])
def test_connection():
    # jsonify 會將 Python 字典轉換成 JSON 格式
    return jsonify({"message": "成功從 Python 後端連線！"})

# 讓程式可以直接被執行
if __name__ == '__main__':
    # 0.0.0.0 讓你的手機可以連到這台電腦的 IP
    app.run(host='0.0.0.0', port=5000, debug=True)