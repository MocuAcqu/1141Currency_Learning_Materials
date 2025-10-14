import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

# 這是一個包含了所有貨幣資訊的列表，每個元素都是一個字典。
currencies_data = [
    {
        "currency_code": "USD",
        "name_zh": "美元",
        "name_en": "United States Dollar",
        "country_zh": "美國",
        "country_en": "United States",
        "symbol": "$",
        "description_zh": """美元的誕生可追溯至1792年，當時美國國會通過《鑄幣法案》，正式確立美元為國家官方貨幣。1863年，為了籌措南北戰爭的經費，財政部發行背面印成綠色的鈔票，這便是「綠背」(Greenback) 稱號的由來。其設計承載了深刻的國家信念，例如格言「In God We Trust」。透過1944年的《布雷頓森林協義》，美元正式成為世界最主要的儲備貨幣。"""
    },
    {
        "currency_code": "EUR",
        "name_zh": "歐元",
        "name_en": "Euro",
        "country_zh": "歐盟20國",
        "country_en": "European Union",
        "symbol": "€",
        "description_zh": """歐元的誕生是歐洲經濟一體化的重要里程碑。1999年以電子貨幣形式啟用，2002年全面流通。紙鈔設計統一，正面為窗戶與門，象徵「開放與合作」；背面是各式橋樑，象徵「連結與團結」。硬幣背面則由各成員國自行設計，體現了統一中的文化多樣性。歐元是全球第二大貨幣，僅次於美元。"""
    },
    {
        "currency_code": "JPY",
        "name_zh": "日圓",
        "name_en": "Japanese Yen",
        "country_zh": "日本",
        "country_en": "Japan",
        "symbol": "¥",
        "description_zh": """日圓制度確立於1871年明治維新時期。紙鈔上印有福澤諭吉、樋口一葉等思想家與文學家，展現對知識的尊重。其名稱「圓」取自「圓形的銀幣」。由於日本長期維持低利率，日圓成為國際市場上主要的「融資貨幣」，深刻影響全球資本流動。"""
    },
    {
        "currency_code": "GBP",
        "name_zh": "英鎊",
        "name_en": "Pound Sterling",
        "country_zh": "英國",
        "country_en": "United Kingdom",
        "symbol": "£",
        "description_zh": """英鎊是世界上現存最古老的貨幣之一，其現代化始於1694年英格蘭銀行的成立。最核心的設計元素是在紙鈔正面印上在位君主的肖像，從伊莉莎白二世到查理三世，是國家主權的象徵。其名稱「Pound」詞源來自於「一磅重的銀」。"""
    },
    {
        "currency_code": "CNY",
        "name_zh": "人民幣",
        "name_en": "Chinese Yuan",
        "country_zh": "中國",
        "country_en": "China",
        "symbol": "¥",
        "description_zh": """人民幣始於1948年，由中國人民銀行發行。2016年被納入IMF的SDR貨幣籃子，國際地位獲官方認可。紙鈔正面統一採用毛澤東肖像，背面則展示長江三峽、桂林山水等名勝古蹟，展現了中國的地理風貌與文化底蘊。"""
    },
    {
        "currency_code": "CAD",
        "name_zh": "加拿大元",
        "name_en": "Canadian Dollar",
        "country_zh": "加拿大",
        "country_en": "Canada",
        "symbol": "C$",
        "description_zh": """加拿大元始於1858年，以美元為基準。加拿大是世界上最早採用防水塑膠鈔票的國家之一，以鮮豔的顏色著稱。楓葉圖案是其最常見的設計元素。由於加拿大擁有豐富的石油等資源，加幣價值與全球大宗商品價格高度相關，被稱為「資源國貨幣」。"""
    },
    {
        "currency_code": "AUD",
        "name_zh": "澳大利亞元",
        "name_en": "Australian Dollar",
        "country_zh": "澳洲",
        "country_en": "Australia",
        "symbol": "A$",
        "description_zh": """澳元始於1966年，取代澳洲鎊。澳洲於1988年率先發行了世界上第一款聚合物（塑膠）鈔票。鈔票設計色彩亮麗，並有獨特的透明防偽窗戶。其價值與鐵礦石等原物料出口緊密相連，同時也深受其主要貿易夥伴中國的經濟狀況影響。"""
    },
    {
        "currency_code": "CHF", "name_zh": "瑞士法郎", "name_en": "Swiss Franc", "country_zh": "瑞士、列支敦斯登", "country_en": "Switzerland & Liechtenstein", "symbol": "CHF",
        "description_zh": "瑞士法郎於1850年確立，因國家長期政治中立而成為全球最穩定的貨幣之一。其設計極具藝術性，被譽為「最美的貨幣」，主題涵蓋藝術家及時間、光、風等抽象概念，反映瑞士對精準與美學的追求。在全球金融體系中，瑞郎扮演著無可替代的「避險貨幣」角色，被視為資金的「安全港灣」。"
    },
    {
        "currency_code": "TWD", "name_zh": "新台幣", "name_en": "New Taiwan Dollar", "country_zh": "台灣", "country_en": "Taiwan", "symbol": "NT$",
        "description_zh": "新台幣於1949年為抑制惡性通膨而發行，是穩定台灣戰後經濟的關鍵。設計主題並非政治人物，而是選擇如「小朋友讀書」、玉山、台北101等地標，傳達「勤奮教育、科技創新」的價值觀。其匯率走勢深受全球半導體產業景氣影響，是觀察全球科技產業鏈動向的重要指標。"
    },
    {
        "currency_code": "KRW", "name_zh": "韓元", "name_en": "South Korean Won", "country_zh": "韓國", "country_en": "South Korea", "symbol": "₩",
        "description_zh": "韓元制度基礎奠定於1962年的貨幣改革，伴隨「漢江奇蹟」經濟成長。紙鈔上印有世宗大王、李珥等歷史上的學者，彰顯對文化的重視。其最顯著特點是龐大的面額（1美元約兌1300韓元），因此學界曾多次提議進行「貨幣縮減」以簡化幣值，但至今未採行。"
    },
    {
        "currency_code": "SGD", "name_zh": "新加坡元", "name_en": "Singapore Dollar", "country_zh": "新加坡", "country_en": "Singapore", "symbol": "S$",
        "description_zh": "新加坡元於1967年獨立發行，是國家主權的重要象徵。鈔票印有國父李光耀的肖像，設計主題緊扣「教育」與「科技發展」，被視為新加坡成功的基石。憑藉新加坡作為國際金融中心的地位，新元是亞洲交易最活躍的貨幣之一，也是許多國家央行的儲備貨幣選項。"
    },
    {
        "currency_code": "HKD", "name_zh": "港元", "name_en": "Hong Kong Dollar", "country_zh": "香港", "country_en": "Hong Kong", "symbol": "HK$",
        "description_zh": "港元最獨特的制度是由三家商業銀行（匯豐、渣打、中銀香港）共同發行，這在全球極為罕見。發行銀行必須按1美元兌7.8港元的固定匯率向金管局繳納等值美元作為儲備。這種「聯繫匯率制度」保障了港元的穩定。市面上流通的多版本鈔票也象徵著香港自由開放的市場經濟。"
    },
    {
        "currency_code": "INR", "name_zh": "印度盧比", "name_en": "Indian Rupee", "country_zh": "印度", "country_en": "India", "symbol": "₹",
        "description_zh": "現代印度盧比體系在1947年印度獨立後建立。所有紙鈔正面統一印有國父「聖雄甘地」的肖像，傳達和平、獨立的立國精神。鈔票的語言欄上印有15種不同的印度官方語言，體現其多元民族特色。印度政府正致力於推動盧比成為「區域性貿易貨幣」。"
    },
    {
        "currency_code": "RUB", "name_zh": "俄羅斯盧布", "name_en": "Russian Ruble", "country_zh": "俄羅斯", "country_en": "Russia", "symbol": "₽",
        "description_zh": "盧布是擁有悠久歷史的貨幣之一，可追溯至13世紀。其設計展現了俄羅斯的歷史榮耀，紙鈔上印有克里姆林宮等著名地標，硬幣上則鐫刻著象徵帝國權威的雙頭鷹圖案，反映了強烈的民族自豪感。"
    },
    {
        "currency_code": "DEM", "name_zh": "德國馬克", "name_en": "Deutsche Mark", "country_zh": "德國(歷史)", "country_en": "Germany (historical)", "symbol": "DM",
        "description_zh": "德國馬克誕生於1948年，是西德戰後「經濟奇蹟」的象徵，以極低的通膨率聞名。在歐元誕生前，馬克是全球第二大儲備貨幣，被視為最穩定的「硬通貨」之一。最後一版紙鈔選擇了高斯、克拉拉·舒曼等科學家與藝術家，體現了對文化成就的尊崇。於2002年被歐元取代。"
    },
    {
        "currency_code": "FRF", "name_zh": "法國法郎", "name_en": "French Franc", "country_zh": "法國(歷史)", "country_en": "France (historical)", "symbol": "F",
        "description_zh": "法國法郎是歐洲歷史最悠久的貨幣之一，其名「Franc」意為「自由」。最後一版紙鈔印有《小王子》作者聖修伯里、居里夫婦、艾菲爾等傑出人物，展現了法國的文化與藝術成就。法郎透過非洲法郎區(CFA)對非洲有深遠影響。於2002年被歐元取代。"
    },
    {
        "currency_code": "ZAR", "name_zh": "南非蘭特", "name_en": "South African Rand", "country_zh": "南非", "country_en": "South Africa", "symbol": "R",
        "description_zh": "南非蘭特誕生於1961年。新版蘭特正面統一採用前總統納爾遜·曼德拉的肖像，象徵和解與自由。鈔票背面主題為「非洲五霸」野生動物。蘭特是非洲流動性最高的貨幣，因南非是黃金、鉑金出口國，其匯率與大宗商品價格高度相關，具有「商品貨幣」屬性。"
    },
]


def seed_data():
    """
    將貨幣資料寫入資料庫的函式。
    """
    try:
        db_conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
        if not db_conn.is_connected():
            print("資料庫連線失敗！")
            return

        cursor = db_conn.cursor()
        print("資料庫連線成功，準備寫入資料...")

        # --- 3. 遍歷資料列表，將每一筆資料插入或更新到表格中 ---
        for currency in currencies_data:
            # 如果 currency_code 已存在，就更新資料；如果不存在，就插入新資料。
            query = """
                INSERT INTO currencies (currency_code, name_zh, name_en, country_zh, country_en, symbol, description_zh)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    name_zh = VALUES(name_zh),
                    name_en = VALUES(name_en),
                    country_zh = VALUES(country_zh),
                    country_en = VALUES(country_en),
                    symbol = VALUES(symbol),
                    description_zh = VALUES(description_zh);
            """
            values = (
                currency.get("currency_code"),
                currency.get("name_zh"),
                currency.get("name_en"),
                currency.get("country_zh"),
                currency.get("country_en"),
                currency.get("symbol"),
                currency.get("description_zh")
            )
            
            cursor.execute(query, values)
            print(f"成功處理貨幣: {currency.get('currency_code')}")

        db_conn.commit()
        print("\n所有資料已成功寫入資料庫！")

    except mysql.connector.Error as err:
        print(f"\n發生錯誤: {err}")
    finally:
        if 'db_conn' in locals() and db_conn.is_connected():
            cursor.close()
            db_conn.close()
            print("資料庫連線已關閉。")

if __name__ == "__main__":
    seed_data()