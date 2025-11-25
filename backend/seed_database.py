import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

# --- 1. 全新的、包含面額詳細資訊的資料 ---
denominations_details = [
    # 範例結構：
    # { "currency_code": "...", "value": "...", "front": "...", "back": "..." },
    
    # 台幣 (TWD)
    {
        "currency_code": "TWD",
        "value": "100",
        "front": "孫中山先生的肖像，以及他手書的「禮運大同篇」部分內容。",
        "back": "中山樓，位於陽明山，是國民大會的開會地點，也是台灣重要的歷史建築。"
    },
    {
        "currency_code": "TWD",
        "value": "200",
        "front": "蔣中正先生的肖像。",
        "back": "台灣總統府，是中華民國的最高行政機關所在地。"
    },
    {
        "currency_code": "TWD",
        "value": "500",
        "front": "少年棒球隊的圖案，象徵台灣的活力與希望。",
        "back": "台灣特有種的梅花鹿以及中央山脈的景象。"
    },
    {
        "currency_code": "TWD",
        "value": "1000",
        "front": "小學生的圖案，象徵教育與知識的傳承。",
        "back": "台灣特有種的帝雉以及玉山。"
    },
    {
        "currency_code": "TWD",
        "value": "2000",
        "front": "碟型人造衛星，代表台灣在高科技領域的發展。",
        "back": "台灣櫻花鉤吻鮭以及南湖大山。"
    },
    {
        "currency_code": "USD",
        "value": "1",
        "front": "美國第一任總統喬治·華盛頓的肖像。",
        "back": "美國國璽：左為未完成的金字塔與 Annuit Coeptis、Novus Ordo Seclorum；右為白頭海鵰。"
    },
    {
        "currency_code": "USD",
        "value": "5",
        "front": "美國第16任總統亞伯拉罕·林肯的肖像。",
        "back": "華盛頓特區的林肯紀念堂。"
    },
    {
        "currency_code": "USD",
        "value": "10",
        "front": "第一任財政部長亞歷山大·漢密爾頓的肖像。",
        "back": "美國財政部大樓。"
    },
    {
        "currency_code": "USD",
        "value": "20",
        "front": "美國第七任總統安德魯·傑克遜的肖像。",
        "back": "白宮，美國總統的官邸與主要辦公場所。"
    },
    {
        "currency_code": "USD",
        "value": "50",
        "front": "美國第18任總統尤利西斯·S·格蘭特的肖像。",
        "back": "美國國會大廈。"
    },
    {
        "currency_code": "USD",
        "value": "100",
        "front": "本傑明·富蘭克林的肖像。",
        "back": "費城的獨立廳。"
    },
    {
        "currency_code": "EUR",
        "value": "5",
        "front": "古典時代建築風格的窗戶與門。",
        "back": "古典時代建築風格的橋樑。"
    },
    {
        "currency_code": "EUR",
        "value": "10",
        "front": "羅馬式建築風格的窗戶與門。",
        "back": "羅馬式建築風格的橋樑。"
    },
    {
        "currency_code": "EUR",
        "value": "20",
        "front": "哥德式建築風格的窗戶與門。",
        "back": "哥德式建築風格的橋樑。"
    },
    {
        "currency_code": "EUR",
        "value": "50",
        "front": "文藝復興時期建築風格的窗戶與門。",
        "back": "文藝復興時期建築風格的橋樑。"
    },
    {
        "currency_code": "EUR",
        "value": "100",
        "front": "巴洛克與洛可可風格的窗戶與門。",
        "back": "巴洛克與洛可可風格的橋樑。"
    },
    {
        "currency_code": "EUR",
        "value": "200",
        "front": "鐵與玻璃的建築風格之窗戶與門。",
        "back": "鐵與玻璃建築風格的橋樑。"
    },
    {
        "currency_code": "EUR",
        "value": "500",
        "front": "現代建築風格的窗戶與門。",
        "back": "現代建築風格的橋樑。"
    },
    {
        "currency_code": "JPY",
        "value": "1000",
        "front": "野口英世的肖像。",
        "back": "富士山與櫻花。"
    },
    {
        "currency_code": "JPY",
        "value": "2000",
        "front": "沖繩守禮門。",
        "back": "源氏物語繪卷場景與紫式部畫像。"
    },
    {
        "currency_code": "JPY",
        "value": "5000",
        "front": "樋口一葉的肖像。",
        "back": "尾形光琳《燕子花圖屏風》中的燕子花。"
    },
    {
        "currency_code": "JPY",
        "value": "10000",
        "front": "福澤諭吉的肖像。",
        "back": "平等院鳳凰堂的鳳凰雕像。"
    },
    {
    "currency_code": "GBP",
        "value": "5",
        "front": "伊莉莎白二世女王的肖像。",
        "back": "溫斯頓·邱吉爾肖像，背景為國會大廈與大笨鐘。"
    },
    {
        "currency_code": "GBP",
        "value": "10",
        "front": "伊莉莎白二世女王的肖像。",
        "back": "簡·奧斯汀肖像，背景為寫作台與虛構宅邸。"
    },
    {
        "currency_code": "GBP",
        "value": "20",
        "front": "伊莉莎白二世女王的肖像。",
        "back": "J.M.W.特納肖像，背景為《戰艦泰梅萊爾號》與簽名。"
    },
    {
        "currency_code": "GBP",
        "value": "50",
        "front": "伊莉莎白二世女王的肖像。",
        "back": "艾倫·圖靈肖像，背景為數學公式與 Bombe 解密機器。"
    },
    {
        "currency_code": "CNY",
        "value": "1",
        "front": "毛澤東肖像。",
        "back": "杭州西湖三潭印月。"
    },
    {
        "currency_code": "CNY",
        "value": "5",
        "front": "毛澤東肖像。",
        "back": "泰山。"
    },
    {
        "currency_code": "CNY",
        "value": "10",
        "front": "毛澤東肖像。",
        "back": "長江三峽夔門。"
    },
    {
        "currency_code": "CNY",
        "value": "20",
        "front": "毛澤東肖像。",
        "back": "桂林山水。"
    },
    {
        "currency_code": "CNY",
        "value": "50",
        "front": "毛澤東肖像。",
        "back": "布達拉宮。"
    },
    {
        "currency_code": "CNY",
        "value": "100",
        "front": "毛澤東肖像。",
        "back": "人民大會堂。"
    },
    {
        "currency_code": "CAD",
        "value": "5",
        "front": "沃爾弗里德·勞雷爾的肖像。",
        "back": "加拿大太空臂 Canadarm2 與太空機器人，以及太空站工作場景。"
    },
    {
        "currency_code": "CAD",
        "value": "10",
        "front": "維奧拉·戴斯蒙德的肖像。",
        "back": "加拿大人權博物館內部與老鷹羽毛。"
    },
    {
        "currency_code": "CAD",
        "value": "20",
        "front": "伊莉莎白二世女王的肖像。",
        "back": "加拿大國家維米嶺紀念碑。"
    },
    {
        "currency_code": "CAD",
        "value": "50",
        "front": "威廉·萊昂·麥肯齊·金的肖像。",
        "back": "極地科考破冰船 Amundsen 號。"
    },
    {
        "currency_code": "CAD",
        "value": "100",
        "front": "羅伯特·博登的肖像。",
        "back": "醫學研究主題：顯微鏡、DNA 螺旋、胰島素瓶。"
    },
]

def update_denominations():
    try:
        db_conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
        cursor = db_conn.cursor(dictionary=True)
        print("資料庫連線成功，準備更新面額資訊...")

        # 為了方便查詢，先獲取所有 currency_code 與 id 的對應關係
        cursor.execute("SELECT id, currency_code FROM currencies")
        currency_id_map = {row['currency_code']: row['id'] for row in cursor.fetchall()}

        for detail in denominations_details:
            currency_code = detail.get("currency_code")
            value = detail.get("value")
            
            currency_id = currency_id_map.get(currency_code)
            if not currency_id:
                print(f"警告：在 currencies 表中找不到 {currency_code}，已略過。")
                continue

            # 使用 UPDATE 指令來更新已存在的面額記錄
            query = """
                UPDATE denominations 
                SET description_front_zh = %s, description_back_zh = %s 
                WHERE currency_id = %s AND value = %s;
            """
            values = (
                detail.get("front"),
                detail.get("back"),
                currency_id,
                value
            )
            
            cursor.execute(query, values)
            if cursor.rowcount > 0:
                print(f"成功更新: {currency_code} {value}")
            else:
                print(f"提示：在 denominations 表中找不到 {currency_code} {value} 的記錄可供更新。")

        db_conn.commit()
        print("\n所有面額描述已成功更新到資料庫！")

    except mysql.connector.Error as err:
        print(f"\n發生錯誤: {err}")
    finally:
        if 'db_conn' in locals() and db_conn.is_connected():
            cursor.close()
            db_conn.close()
            print("資料庫連線已關閉。")

if __name__ == "__main__":
    update_denominations()