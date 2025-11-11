export interface CultureQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export const cultureQuestions: CultureQuestion[] = [
  { question: "美元的「綠背」(Greenback) 稱號由來，是因為財政部發行了什麼顏色的鈔票？", options: ["藍色", "綠色", "紅色", "黃色"], correctAnswer: "綠色" },
  { question: "美元鈔票上印有的格言「In God We Trust」象徵著什麼？", options: ["經濟繁榮", "宗教信念與國家精神", "戰爭勝利", "國際合作"], correctAnswer: "宗教信念與國家精神" },
  { question: "歐元紙鈔正面圖案象徵著歐洲的「開放與合作精神」，這些圖案是什麼？", options: ["人物肖像", "動物", "窗戶與門", "自然風景"], correctAnswer: "窗戶與門" },
  { question: "歐元硬幣的背面設計有何特色？", options: ["所有成員國統一設計", "由各成員國自行設計", "僅有歐盟總部設計", "每年更換設計"], correctAnswer: "由各成員國自行設計" },
  { question: "日圓紙鈔呈現出日本傳統的什麼美學？", options: ["華麗美學", "抽象美學", "簡約美學", "現代美學"], correctAnswer: "簡約美學" },
  { question: "哪兩種日圓硬幣中央有開孔，象徵「洞察未來」？", options: ["1圓與10圓", "5圓與50圓", "100圓與500圓", "1000圓與5000圓"], correctAnswer: "5圓與50圓" },
  { question: "英鎊紙鈔最核心的設計元素是在正面印上什麼？", options: ["著名建築", "在位君主的肖像", "動物圖案", "抽象藝術"], correctAnswer: "在位君主的肖像" },
  { question: "英鎊的貨幣名稱「Pound」（鎊）的詞源來自於什麼？", options: ["一盎司重的黃金", "一磅重的銀", "一便士", "一枚銅幣"], correctAnswer: "一磅重的銀" },
  { question: "人民幣紙鈔的正面統一採用了誰的肖像？", options: ["鄧小平", "周恩來", "毛澤東", "習近平"], correctAnswer: "毛澤東" },
  { question: "人民幣紙鈔的背面展示了什麼？", options: ["著名人物", "神話故事", "各地名勝古蹟", "傳統工藝"], correctAnswer: "各地名勝古蹟" },
  { question: "加拿大元是世界上最早採用哪種材質鈔票的國家之一？", options: ["紙張", "金屬", "防水塑膠（聚合物）", "棉質"], correctAnswer: "防水塑膠（聚合物）" },
  { question: "加拿大元紙鈔上最常見的象徵國家精神的元素是什麼？", options: ["楓葉圖案", "北極熊", "海狸", "洛磯山脈"], correctAnswer: "楓葉圖案" },
  { question: "澳大利亞元鈔票的材質是什麼？", options: ["紙張", "聚酯材料", "棉麻混合", "金屬"], correctAnswer: "聚酯材料" },
  { question: "澳大利亞元鈔票的設計主題涵蓋歷史人物以及什麼？", options: ["著名建築", "城市景觀", "袋鼠、鴨嘴獸等特有動植物", "抽象圖案"], correctAnswer: "袋鼠、鴨嘴獸等特有動植物" },
  { question: "瑞士法郎在設計上被廣泛譽為什麼？", options: ["最穩定的貨幣", "世界上最美的貨幣", "最複雜的貨幣", "最具歷史的貨幣"], correctAnswer: "世界上最美的貨幣" },
  { question: "瑞士法郎選擇以誰作為鈔票主題？", options: ["國家元首", "動物", "藝術家、建築師等文化人物", "歷史事件"], correctAnswer: "藝術家、建築師等文化人物" },
  { question: "新台幣紙鈔象徵基礎教育的場景是什麼？", options: ["學生畢業典禮", "老師上課", "小朋友讀書", "學校運動會"], correctAnswer: "小朋友讀書" },
  { question: "新台幣紙鈔上代表科技與地景的地標是什麼？", options: ["總統府和中正紀念堂", "玉山和台北101", "國立故宮博物院和日月潭", "阿里山和高雄85大樓"], correctAnswer: "玉山和台北101" },
  { question: "韓元紙鈔上印有的人物均為何種身份？", options: ["政治家", "軍事領袖", "備受敬仰的文學家與科學家", "企業家"], correctAnswer: "備受敬仰的文學家與科學家" },
  { question: "韓元紙鈔的背面常見何種圖案？", options: ["現代建築", "傳統宮殿建築與書法樣式", "流行文化圖案", "自然風景"], correctAnswer: "傳統宮殿建築與書法樣式" },
  { question: "新加坡元鈔票的主要設計系列是「肖像系列」與什麼系列？", options: ["花卉系列", "動物系列", "建國系列", "地標系列"], correctAnswer: "建國系列" },
  { question: "新加坡元鈔票的設計主題緊扣「教育」與「科技發展」，圖案中常出現哪些元素？", options: ["歷史古蹟", "傳統文化", "校園、實驗室、建設藍圖", "著名人物"], correctAnswer: "校園、實驗室、建設藍圖" },
  { question: "港元紙鈔流通多個版本，象徵著什麼？", options: ["嚴謹的金融規範", "自由、開放的市場經濟", "統一的國家形象", "藝術多樣性"], correctAnswer: "自由、開放的市場經濟" },
  { question: "港元鈔票圖案的常見元素除了獅子山和天際線外，還有什麼？", options: ["西方文化圖騰", "殖民時期建築", "傳統文化圖騰", "自然生態景觀"], correctAnswer: "傳統文化圖騰" },
  { question: "印度盧比紙鈔正面統一印有誰的肖像？", options: ["泰戈爾", "尼赫魯", "聖雄甘地", "英迪拉·甘地"], correctAnswer: "聖雄甘地" },
  { question: "印度盧比鈔票上最能體現其多元民族特色的是什麼？", options: ["建築圖案", "印有15種不同的印度官方語言", "色彩搭配", "動物圖案"], correctAnswer: "印有15種不同的印度官方語言" },
  { question: "俄羅斯盧布紙鈔上印有的地標例如？", options: ["艾菲爾鐵塔", "自由女神像", "莫斯科的克里姆林宮、聖彼得堡的紀念碑", "羅馬競技場"], correctAnswer: "莫斯科的克里姆林宮、聖彼得堡的紀念碑" },
  { question: "俄羅斯盧布硬幣上的雙頭鷹圖案象徵什麼？", options: ["宗教和平", "帝國權威與東正教信仰", "商業繁榮", "國家統一"], correctAnswer: "帝國權威與東正教信仰" },
  { question: "德國馬克的設計哲學體現了對穩定、理性和什麼的尊崇？", options: ["權力", "軍事力量", "文化", "經濟增長"], correctAnswer: "文化" },
  { question: "德國馬克紙鈔選擇了誰作為主題人物？", options: ["政治領袖", "軍事英雄", "科學家、藝術家、作家與思想家", "動物"], correctAnswer: "科學家、藝術家、作家與思想家" },
  { question: "法國法郎的名字「Franc」意為什麼？", options: ["財富", "自由", "力量", "統一"], correctAnswer: "自由" },
  { question: "法國法郎紙鈔上的人物代表例如誰？", options: ["拿破崙", "法王路易十四", "《小王子》的作者聖修伯里、科學家居里夫婦等", "戴高樂總統"], correctAnswer: "《小王子》的作者聖修伯里、科學家居里夫婦等" },
  { question: "南非蘭特紙鈔的一大主題「非洲五霸」包含獅子、獵豹、非洲象、犀牛和什麼？", options: ["長頸鹿", "斑馬", "非洲水牛", "河馬"], correctAnswer: "非洲水牛" },
  { question: "新版南非蘭特正面統一採用了誰的肖像？", options: ["德斯蒙德·圖圖大主教", "納爾遜·曼德拉總統", "史蒂夫·比科", "沃爾特·西蘇魯"], correctAnswer: "納爾遜·曼德拉總統" },
];