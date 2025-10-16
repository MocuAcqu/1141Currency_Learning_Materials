import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

currencies_data = [
    {
        "currency_code": "USD", "name_zh": "美元", "name_en": "United States Dollar", "country_zh": "美國", "country_en": "United States", "symbol": "$",
        "history_zh": "美元的誕生可追溯至1792年《鑄幣法案》，正式確立為國家官方貨幣。1863年因籌措南北戰爭經費而發行綠色鈔票，得名「綠背」(Greenback)。1913年建立聯邦儲備制度，並在1944年《布雷頓森林協義》後，成為世界最主要的儲備貨幣。",
        "design_zh": "美元設計承載深刻國家信念。鈔票上印有格言「In God We Trust」，象徵立國時期的宗教信念。其貨幣符號「$」，起源於西班牙殖民時期貨幣「披索」(Peso) 的手寫符號「Pˢ」的演變。",
        "mechanism_zh": "發行權屬於美國財政部，具體發行業務由聯邦儲備銀行（聯準會）負責。現行流通鈔票99%以上為聯邦儲備券。",
        "influence_zh": "美元是全球最具影響力的貨幣，約60%的國際貿易使用美元結算。聯準會若過度增加貨幣供應，可能導致全球性通貨膨脹和美元購買力貶值的風險。",
    },
    {
        "currency_code": "EUR", "name_zh": "歐元", "name_en": "Euro", "country_zh": "歐盟20國", "country_en": "European Union", "symbol": "€",
        "history_zh": "歐元是歐洲經濟一體化的里程碑。構想始於1969年，經1991年《馬斯特里赫特條約》確立條件，於1999年以電子貨幣形式啟用，並在2002年全面流通實體貨幣。",
        "design_zh": "歐元紙鈔設計在所有成員國中統一。正面為窗戶與門，象徵「開放與合作精神」；背面是各式橋樑，象徵「連結與團結」。硬幣的背面則由各成員國自行設計，體現了統一中的文化多樣性。",
        "mechanism_zh": "由歐洲中央銀行 (ECB) 負責獨立制定統一的貨幣政策。",
        "influence_zh": "全球第二大貨幣，約佔全球外匯儲備的20%。要進一步提升國際地位，歐洲需應對經濟增長疲軟、資本市場分散等結構性挑戰。",
    },
    {
        "currency_code": "JPY", "name_zh": "日圓", "name_en": "Japanese Yen", "country_zh": "日本", "country_en": "Japan", "symbol": "¥",
        "history_zh": "日圓制度確立於1871年明治維新時期的《新貨條例》。二戰後，憑藉龐大的出口貿易順差，日圓成為戰後升值最快的強勢貨幣之一。",
        "design_zh": "紙鈔上印有福澤諭吉、樋口一葉等思想家、文學家，展現對知識的尊重。其名稱「圓」取自「圓形的銀幣」。5圓與50圓硬幣中央的開孔，象徵「洞察未來」。紙鈔使用特有的「三椏皮漿」作為原料，堅韌且帶有特殊光澤。",
        "mechanism_zh": "紙鈔上的人物肖像由財務大臣依據《日本銀行法》決定。",
        "influence_zh": "由於日本長期維持低利率，日圓成為國際金融市場上主要的「融資貨幣」，投資者借入日圓投資於高收益資產的「套息交易」深刻影響全球資本流動。",
    },
    {
        "currency_code": "GBP", "name_zh": "英鎊", "name_en": "Pound Sterling", "country_zh": "英國", "country_en": "United Kingdom", "symbol": "£",
        "history_zh": "英鎊是世界上現存最古老的貨幣之一，可追溯至公元8世紀。1694年英格蘭銀行成立後逐步現代化。1992年因無法維持匯率而被迫退出歐洲匯率機制，史稱「黑色星期三」。自2024年起，印有查理三世國王肖像的紙幣開始流通。",
        "design_zh": "設計核心是在紙鈔正面印上在位君主的肖像，是國家主權的象徵。背面常展示對英國歷史有傑出貢獻的人物，如亞當·史密斯、珍·奧斯汀等。其貨幣名稱「Pound」（鎊）的詞源來自於「一磅重的銀」。",
        "mechanism_zh": "由英格蘭銀行發行，其發行權力在1844年《銀行特許法案》中被正式確立。",
        "influence_zh": "在19世紀至20世紀初曾是全球最主要的國際貨幣。雖然主導地位已被美元取代，但憑藉倫敦作為世界頂級金融中心的地位，英鎊至今仍是全球外匯市場上最重要的貨幣之一。",
    },
    {
        "currency_code": "CNY", "name_zh": "人民幣", "name_en": "Chinese Yuan", "country_zh": "中國", "country_en": "China", "symbol": "¥",
        "history_zh": "人民幣始於1948年，由中國人民銀行發行。2015年的「811匯改」結束了長期盯住美元的政策。2016年10月，人民幣被正式納入國際貨幣基金組織（IMF）的特別提款權（SDR）貨幣籃子，標誌其國際地位獲官方認可。",
        "design_zh": "紙鈔正面統一採用毛澤東肖像，象徵國家穩定。背面則展示中國各地名勝古蹟，如長江三峽、桂林山水、布達拉宮等，展現中國多元的地理風貌與文化底蘊。",
        "mechanism_zh": "由中國人民銀行主管，負責設計、印製和發行。目前實行「有管理的浮動匯率制度」。",
        "influence_zh": "在SDR貨幣籃子中權重位居第三。中國正透過「一帶一路」等策略推動人民幣國際化。未來隨著數字人民幣（e-CNY）的推行，其影響力預計將進一步擴大。",
    },
    {
        "currency_code": "CAD", "name_zh": "加拿大元", "name_en": "Canadian Dollar", "country_zh": "加拿大", "country_en": "Canada", "symbol": "C$",
        "history_zh": "加拿大元始於1858年，以美元為基準。1934年加拿大中央銀行成立後鞏固其體系。2011年推出「先鋒者系列」塑膠鈔票，提升了耐用性與防偽功能。",
        "design_zh": "作為最早採用防水塑膠鈔票的國家之一，其紙鈔以鮮豔顏色著稱。楓葉圖案是常見的設計元素，象徵國家精神。硬幣上的北極熊、海狸等動物圖案展現了豐富的生態。",
        "mechanism_zh": "由加拿大中央銀行 (Bank of Canada) 發行。自1970年起完全實施浮動匯率制度。",
        "influence_zh": "以「資源國貨幣」聞名。因加拿大擁有豐富的石油、天然氣等資源，其貨幣價值與全球大宗商品價格（特別是原油）高度正相關，是反映全球商品市場景氣度的重要指標。",
    },
    {
        "currency_code": "AUD", "name_zh": "澳大利亞元", "name_en": "Australian Dollar", "country_zh": "澳洲", "country_en": "Australia", "symbol": "A$",
        "history_zh": "澳元始於1966年，取代澳洲鎊並改採十進位制。澳洲是技術先驅，於1988年率先發行了世界上第一款聚合物（塑膠）鈔票，此經驗後被多國仿效。",
        "design_zh": "澳元鈔票以聚酯材料製成，耐磨、防水。設計上色彩亮麗，並有獨特的透明防偽窗戶。圖案涵蓋歷史人物及袋鼠、鴨嘴獸等特有動植物，展現澳洲的多元文化與自然景觀。",
        "mechanism_zh": "利率由澳大利亞儲備銀行（Reserve Bank of Australia）負責決定，其政策對國內外投資具有重要影響。",
        "influence_zh": "全球交易量第六的主要貨幣。其價值與鐵礦石、煤炭等原物料出口緊密相連。作為中國主要貿易夥伴之一，中國經濟狀況對澳元有舉足輕重的影響。擁有AAA頂級信用評級。",
    },
    {
        "currency_code": "CHF", "name_zh": "瑞士法郎", "name_en": "Swiss Franc", "country_zh": "瑞士、列支敦斯登", "country_en": "Switzerland & Liechtenstein", "symbol": "CHF",
        "history_zh": "瑞士法郎於1850年確立為全國統一貨幣。憑藉國家長期奉行的政治中立政策及穩健金融管理，逐步建立起全球最穩定貨幣之一的聲譽。",
        "design_zh": "被譽為「世界上最美的貨幣」，設計極具藝術性。主題並非政治領袖，而是藝術家、建築師，甚至採用時間、光、風等抽象概念，反映瑞士對精準、品質與美學的極致追求。",
        "mechanism_zh": "由瑞士國家銀行（Swiss National Bank）發行。",
        "influence_zh": "在全球金融體系中扮演無可替代的「避險貨幣」角色。當全球出現經濟或政治危機時，國際投資者會大量買入瑞士法郎以規避風險，使其被視為資金的「安全港灣」。",
    },
    {
        "currency_code": "TWD", "name_zh": "新台幣", "name_en": "New Taiwan Dollar", "country_zh": "台灣", "country_en": "Taiwan", "symbol": "NT$",
        "history_zh": "新台幣於1949年6月15日為抑制戰後惡性通膨而發行，取代舊臺幣，是穩定台灣經濟的關鍵一步。",
        "design_zh": "設計主題緊扣台灣核心價值。圖案並非政治人物，而是選擇如「小朋友讀書」場景，及「玉山」、「台北101」等地標，傳達「勤奮教育、科技創新」的價值觀，並展現對自然的珍視。",
        "mechanism_zh": "由中華民國中央銀行發行。",
        "influence_zh": "雖然國際流通性有限，但在亞洲地區扮演重要角色。其匯率穩定對台灣出口導向的經濟至關重要，走勢深受全球半導體產業景氣和國際資金流動的影響。",
    },
    {
        "currency_code": "KRW", "name_zh": "韓元", "name_en": "South Korean Won", "country_zh": "韓國", "country_en": "South Korea", "symbol": "₩",
        "history_zh": "韓元制度基礎奠定於1962年的貨幣改革，伴隨朴正熙總統的「經濟開發五年計畫」與「漢江奇蹟」經濟成長。因物價上升，政府逐步發行更高面額的紙鈔。",
        "design_zh": "紙鈔上印有的人物均為韓國歷史上備受敬仰的文學家（如李珥）與科學家（如世宗大王），彰顯對學術與文化的重視。設計風格在傳統與現代之間取得良好平衡。",
        "mechanism_zh": "由韓國銀行 (Bank of Korea) 發行。",
        "influence_zh": "最顯著特點是龐大的面額（1美元約兌換1300韓元以上）。因此，學界曾多次提議進行「貨幣縮減」（Redenomination）以簡化幣值，但因擔心引發市場混亂而暫未採行。",
    },
    {
        "currency_code": "SGD", "name_zh": "新加坡元", "name_en": "Singapore Dollar", "country_zh": "新加坡", "country_en": "Singapore", "symbol": "S$",
        "history_zh": "1967年，新加坡從馬來亞貨幣區分離，首次獨立發行新加坡元，是國家主權的重要象徵。憑藉穩健的貨幣政策與強勁經濟，建立了高度的國際信譽。",
        "design_zh": "設計深刻反映國家核心價值。鈔票印有國父李光耀的肖像，設計主題緊扣「教育」與「科技發展」，這兩者被視為新加坡成功的基石。",
        "mechanism_zh": "由新加坡金融管理局 (MAS) 獨家發行，該機構也是新加坡的中央銀行。",
        "influence_zh": "憑藉新加坡作為國際金融中心的地位，新元是亞洲交易最活躍的貨幣之一，也是許多國家央行的儲備貨幣選項。在東南亞的跨境貿易與投資中是廣泛使用的結算媒介。",
    },
    {
        "currency_code": "HKD", "name_zh": "港元", "name_en": "Hong Kong Dollar", "country_zh": "香港", "country_en": "Hong Kong", "symbol": "HK$",
        "history_zh": "港元於1935年正式成為香港法定貨幣。其制度深受英國殖民歷史影響，後與美元掛鉤，形成聯繫匯率制度。",
        "design_zh": "由三家銀行各自設計發行，市面上流通多個版本，色彩繽紛，象徵香港自由開放的市場經濟。常見元素包括獅子山、香港島天際線等，體現東西文化交融的魅力。",
        "mechanism_zh": "由匯豐銀行、渣打銀行和中國銀行（香港）三家商業銀行共同發行。發行前必須按1美元兌7.8港元的固定匯率向金管局繳納等值美元作為儲備。",
        "influence_zh": "其國際影響力根植於獨特的發鈔制度與穩定的聯繫匯率。1994年中銀香港成為發鈔行之一，被視為中國對維護香港金融穩定的承諾，起到了關鍵的「定心丸」作用。",
    },
    {
        "currency_code": "INR", "name_zh": "印度盧比", "name_en": "Indian Rupee", "country_zh": "印度", "country_en": "India", "symbol": "₹",
        "history_zh": "現代印度盧比體系在1947年印度獨立後建立，並於1957年改採十進制。2010年推出了全新的貨幣符號「₹」，融合天城文與羅馬字母，被視為印度文化自信的象徵。",
        "design_zh": "所有紙鈔正面統一印有國父「聖雄甘地」的肖像，傳達和平、獨立的立國精神。鈔票的語言欄上印有15種不同的印度官方語言，尊重國內各民族的文化認同。",
        "mechanism_zh": "由印度儲備銀行 (RBI) 獨家發行（1盧比紙鈔除外，由政府發行）。",
        "influence_zh": "作為世界第五大經濟體的貨幣，其穩定性對印度控制通膨至關重要。政府目標是推動盧比成為「區域性貿易貨幣」，但其國際化之路仍面臨挑戰。",
    },
    {
        "currency_code": "RUB", "name_zh": "俄羅斯盧布", "name_en": "Russian Ruble", "country_zh": "俄羅斯", "country_en": "Russia", "symbol": "₽",
        "history_zh": "盧布是擁有悠久歷史的貨幣之一，可追溯至13世紀。其演變見證了從沙皇俄國、蘇聯到現代俄羅斯聯邦的多次重大貨幣改革，承載了一部厚重的俄國史。",
        "design_zh": "設計展現國家榮耀與廣袤疆域。紙鈔上印有克里姆林宮等著名城市地標。硬幣上鐫刻的雙頭鷹圖案，源自拜占庭帝國，是象徵帝國權威與信仰的傳統標誌。",
        "mechanism_zh": "由俄羅斯聯邦中央銀行 (Bank of Russia) 獨家發行。",
        "influence_zh": "無詳細說明。",
    },
    {
        "currency_code": "DEM", "name_zh": "德國馬克", "name_en": "Deutsche Mark", "country_zh": "德國(歷史)", "country_en": "Germany (historical)", "symbol": "DM",
        "history_zh": "德國馬克誕生於1948年二戰後的西德，是德國「經濟奇蹟」的象徵。1990年兩德統一後成為法定貨幣。作為歐洲一體化的推動者，於2002年全面由歐元取代。",
        "design_zh": "設計體現了對穩定、理性和文化的尊崇。紙鈔選擇了科學家（高斯）、藝術家（克拉拉·舒曼）等為主題，而非政治領袖，傳達了新德國建立在文化與科學成就之上的形象。",
        "mechanism_zh": "由德意志聯邦銀行獨家發行，其獨立性受法律保障。此機制現已被歐洲中央銀行體系取代。",
        "influence_zh": "在歐元誕生前，馬克是全球公認的「硬通貨」，地位僅次於美元，是世界第二大儲備貨幣。因其穩定性，被視為國際投資者的首選避險資產，也是歐洲貨幣體系的「錨定貨幣」。",
    },
    {
        "currency_code": "FRF", "name_zh": "法國法郎", "name_en": "French Franc", "country_zh": "法國(歷史)", "country_en": "France (historical)", "symbol": "F",
        "history_zh": "法國法郎歷史悠久，其名「Franc」誕生於1360年，意為「自由」。1960年為重塑信譽發行「新法郎」（1新法郎=100舊法郎）。作為歐盟創始核心成員國，於2002年由歐元取代。",
        "design_zh": "設計展現了法國的文化與藝術成就。最後一版紙鈔上的人物包括《小王子》作者聖修伯里、居里夫婦、工程師艾菲爾及畫家塞尚，每張鈔票都在講述一個關於創造力的法國故事。",
        "mechanism_zh": "由法蘭西銀行發行。貨幣發行權現已移交給歐洲中央銀行 (ECB)。",
        "influence_zh": "在被歐元取代前是世界主要貨幣之一。其最大國際影響力體現在對非洲的深遠作用上，通過非洲法郎區(CFA Franc Zone)使法國在非洲保留了重要的經濟和政治影響力。",
    },
    {
        "currency_code": "ZAR", "name_zh": "南非蘭特", "name_en": "South African Rand", "country_zh": "南非", "country_en": "South Africa", "symbol": "R",
        "history_zh": "南非蘭特誕生於1961年南非成立共和國之際。其歷史與種族隔離政策緊密相連，曾設立「金融蘭特」的雙重匯率體系。直到1995年種族隔離結束後才恢復單一貨幣體系。",
        "design_zh": "設計講述了「彩虹之國」的驕傲。紙鈔一大主題是「非洲五霸」野生動物。新版蘭特正面統一採用首位民選總統納爾遜·曼德拉的肖像，象徵和解、自由與民主。",
        "mechanism_zh": "由南非儲備銀行 (SARB) 獨家發行，其首要職責是保護蘭特的價值。",
        "influence_zh": "是非洲大陸流動性最高的貨幣。因南非是黃金、鉑金等貴金屬出口國，具有典型的「商品貨幣」屬性。它也是「共同貨幣區(CMA)」的基礎貨幣，鞏固了南非的區域經濟引擎地位。",
    },
]

def seed_data():
    """
    將結構化的貨幣資料寫入資料庫的函式。
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

        for currency in currencies_data:
            # ✨ 更新後的 SQL 指令，包含所有新欄位 ✨
            query = """
                INSERT INTO currencies (currency_code, name_zh, name_en, country_zh, country_en, symbol, 
                                        history_zh, design_zh, mechanism_zh, influence_zh)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    name_zh = VALUES(name_zh),
                    name_en = VALUES(name_en),
                    country_zh = VALUES(country_zh),
                    country_en = VALUES(country_en),
                    symbol = VALUES(symbol),
                    history_zh = VALUES(history_zh),
                    design_zh = VALUES(design_zh),
                    mechanism_zh = VALUES(mechanism_zh),
                    influence_zh = VALUES(influence_zh);
            """
            values = (
                currency.get("currency_code"),
                currency.get("name_zh"),
                currency.get("name_en"),
                currency.get("country_zh"),
                currency.get("country_en"),
                currency.get("symbol"),
                currency.get("history_zh"),
                currency.get("design_zh"),
                currency.get("mechanism_zh"),
                currency.get("influence_zh", "無詳細說明。") # 為盧布提供一個預設值
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