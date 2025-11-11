import os

# --- 1. 設定您的圖片資料夾路徑 ---
# 這個路徑是相對於您執行這個 Python 腳本的位置
# 假設您把腳本放在 backend/，那麼圖片資料夾的路徑就是 ../frontend/SmartCurrencyApp/assets/currency_images
image_folder_path = '../frontend/SmartCurrencyApp/assets/currency_images'

# --- 2. 獲取資料庫中 currency_code 與 id 的對應關係 ---
# ！！！非常重要！！！
# 這裡的 ID 必須與您資料庫 `currencies` 表格中的 ID 完全一致。
# 您可以在 MySQL Workbench 中執行 `SELECT id, currency_code FROM currencies;` 來確認。
currency_id_map = {
    'TWD': 1, 'USD': 2, 'JPY': 3, 'EUR': 5, 'GBP': 7, 'CNY': 8, 'CAD': 9, 'AUD': 10, 'CHF': 11, 'KRW': 13, 'SGD': 14, 'HKD': 15,
    'INR': 16, 'RUB': 17, 'DEM': 18, 'FRF': 19, 'ZAR': 20
    # 請根據您的實際資料庫情況調整上面的 ID
}

def generate_code_and_sql():
    # 獲取所有 .png 檔名
    try:
        filenames = [f for f in os.listdir(image_folder_path) if f.endswith('.png')]
        filenames.sort() # 排序以保持一致性
    except FileNotFoundError:
        print(f"錯誤：找不到圖片資料夾 '{image_folder_path}'。請確認路徑是否正確。")
        return

    # --- 3. 生成前端 React Native 的圖片對應表 ---
    print("="*30)
    print("✅ React Native 圖片對應表 (`currencyImages`):")
    print("="*30)
    
    js_object_lines = []
    # require 的相對路徑，是從 [code].tsx 檔案出發
    relative_path_prefix = '../../../assets/currency_images/'
    
    for filename in filenames:
        js_object_lines.append(f"  '{filename}': require('{relative_path_prefix}{filename}'),")
    
    # 移除最後一行的逗號
    if js_object_lines:
        js_object_lines[-1] = js_object_lines[-1].rstrip(',')
    
    print("const currencyImages: { [key: string]: any } = {")
    print("\n".join(js_object_lines))
    print("};")

    # --- 4. 生成後端資料庫的 SQL INSERT 指令 ---
    print("\n" * 2)
    print("="*30)
    print("✅ MySQL INSERT 指令 (`denominations`):")
    print("="*30)
    
    sql_values = []
    for filename in filenames:
        parts = filename.replace('.png', '').split('_')
        
        # 忽略那些不是面額的圖片 (例如 'aud.png')
        if len(parts) < 2:
            continue

        currency_code = parts[0].upper()
        value = parts[1]
        
        # 從對應表中查找 currency_id
        currency_id = currency_id_map.get(currency_code)
        
        if currency_id:
            # 產生 VALUES (id, 'value', 'filename') 格式
            sql_values.append(f"({currency_id}, '{value}', '{filename}')")
        else:
            print(f"-- 警告：在 currency_id_map 中找不到 '{currency_code}' 的 ID，已略過檔案 '{filename}'")

    if sql_values:
        # 將所有 VALUES 組合起來，每5個一組換行，方便閱讀
        print("INSERT INTO `denominations` (currency_id, value, image_filename) VALUES")
        for i in range(0, len(sql_values), 5):
            line_end = "," if i + 5 < len(sql_values) else ";"
            print("  " + ",\n  ".join(sql_values[i:i+5]) + line_end)

if __name__ == "__main__":
    generate_code_and_sql()