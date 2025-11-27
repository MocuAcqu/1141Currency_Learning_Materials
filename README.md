# 智慧貨幣收集家 (Smart Currency Collector)

## 成員 (第二組)
- 科技116 邱鈺婷 41271124H
- 科技116 盧姵帆 41271122H
- 科技116 林渝桓 41271120H

## 專案內容
<details>
<summary>啟動說明</summary>

### | 啟動說明
0. 目前設計改本地 IP 
    - collection.tsx
    - login.tsx
    - register.tsx
    - RatesContext.tsx
    - [code].tsx
    - recognize.tsx
    - AuthContext.tsx

    以上檔案需要:
    ```
    const API_URL = 'http://(這裡放 IP):5000';
    ```

需要同時開兩個終端機:
1. 後端
```
cd backend
venv\Scripts\activate
python app.py 
```
    
2. 前端
```
cd frontend
cd SmartCurrencyApp
npx expo start
```
</details>

<details>
<summary>系統架構</summary>

### | 系統架構 (System Architecture)

本專案採用前後端分離的 Client-Server 架構。前端 App 負責使用者介面與互動，後端伺服器則負責核心業務邏輯、資料處理與 AI 辨識功能。

### | 後端服務架構圖 (Architecture Diagram)

```mermaid
graph TD;
    User["📱<br/>使用者"] --> App["<b>React Native App</b><br/>智慧貨幣收集家"];

    subgraph "Backend Server"
        App -- "HTTP API Requests" --> API["<b>API Gateway</b><br/>RESTful API"];
        API --> ImageRecognition["🖼️<br/>影像辨識服務<br/>AI Model"];
        API --> ExchangeRate["💹<br/>匯率換算服務"];
        API --> QuizAndCollection["🏆<br/>測驗與收藏服務"];
    end

    subgraph "Data and Services"
        ImageRecognition --> DB["<b>MySQL Database</b><br/>貨幣資料"];
        ExchangeRate --> ExternalAPI["<b>第三方匯率 API</b><br/>"];
        QuizAndCollection --> UserDB["<b>MySQL Database</b><br/>使用者資料"];
    end

    classDef darkText color:#000000;
    class User,App,API,DB,UserDB,ExternalAPI darkText;

    style User fill:#D5E8D4,stroke:#82B366
    style App fill:#DAE8FC,stroke:#6C8EBF
    style API fill:#FFE6CC,stroke:#D79B00
    style DB fill:#F8CECC,stroke:#B85450
    style UserDB fill:#F8CECC,stroke:#B85450
    style ExternalAPI fill:#E1D5E7,stroke:#9673A6

    style ImageRecognition fill:#222,stroke:#555,color:#fff
    style ExchangeRate fill:#222,stroke:#555,color:#fff
    style QuizAndCollection fill:#222,stroke:#555,color:#fff
```

### | 前端服務架構 (重點檔案之結構)
```
app/
├── (tabs)/                     # 具有底部 Tab 導覽列的主分頁
│   ├── currencies/            # 與貨幣功能相關的頁面群組
│   │   └── [code].tsx         # 動態路由：顯示特定貨幣資訊
│   ├── _layout.tsx        # currencies 子路由的佈局
│   ├── collection.tsx     # 我的收藏頁
│   ├── converter.tsx      # 貨幣換算頁
│   ├── index.tsx          # 貨幣主頁
│   └── recognize.tsx      # 貨幣辨識頁
│   
├── _layout.tsx            # Tabs 區域的底部導覽欄設定
├── login.tsx              # 登入頁
└── register.tsx           # 註冊頁
```
```
assets/
├── currency_images/       # 貨幣照片資源
├── images/                # 通用圖片資源
└── lottie/
     └── money.json         # 動畫素材（Lottie）
```
```
contexts/                  # 全域 Context
├── AuthContext.tsx        # 登入/使用者狀態 Context
└── RatesContext.tsx       # 匯率資料 Context
```
### | 資料庫結構 ERD圖

<img src="https://github.com/MocuAcqu/1141Currency_Learning_Materials/blob/main/1141CLM_ERD.png" width=600px>

</details>

<details>
<summary>功能說明</summary>

### | 影像辨識 (Image Recognition)

*   **功能簡述：**
    本功能使用者可以透過手機相機或從相簿上傳鈔票圖片。後端伺服器會利用深度學習與機器學習模型，即時分析圖片並回傳辨識出的貨幣種類與面額，提供高機率的預測結果與其他可能的選項。

*   **使用技術：**
    *   **前端**：`expo-image-picker` 用於存取相機與相簿；`fetch` API 搭配 `FormData` 將圖片以 `multipart/form-data` 格式上傳至後端。
    *   **後端**：
          整合 [Microsoft BankNote-Net](https://github.com/microsoft/banknote-net) 模型
        *   **框架**：`Flask` (Python Web 框架)。
        *   **影像處理**：`Pillow` (PIL) 用於讀取與預處理上傳的圖片。
        *   **特徵提取**：使用預先訓練好的 `TensorFlow/Keras` 深度學習模型 (`MobileNetV2` Encoder) 將圖片轉換為高維度的特徵向量 (Embedding)。
        *   **幣別分類 (第一階段)**：使用 `scikit-learn` 的 `KNeighborsClassifier` (KNN) 演算法，將圖片特徵向量與資料庫中預存的所有貨幣特徵進行比對，快速找出最相似的貨幣種類。
        *   **面額分類 (第二階段)**：在確定幣別後，載入該幣別專屬的 `TensorFlow/Keras` 分類器模型，對圖片特徵向量進行更精細的面額預測。
        
*   **資料包含：**
    *   **輸入**：使用者上傳的鈔票圖片 (`.jpg`, `.png` 等)。
    *   **處理**：Microsoft BankNote-Net Encoder:

        這個Open source 提供了一個已經訓練好的貨幣辨識模型，其中涵蓋了 17 種不同國家的貨幣、共 112 種面額。
        我們直接利用這些 embedding 特徵來建立分類器來辨識新影像中的貨幣種類與面額，所以不需要重新收集資料或重新訓練模型。
        
    *   **輸出 (API 回應)**：一個 JSON 物件，包含最高機率的幣別與面額預測，以及其他可能性與其對應的信賴度分數 (`prob`)。

*   **所有功能：**
    *   [x] 支援從手機相簿選擇圖片上傳。
    *   [x] 支援即時啟動相機拍照上傳。
    *   [x] 圖片自動裁剪、縮放、正規化
    *   [x] 顯示上傳圖片的預覽。
    *   [x] 辨識過程中顯示載入動畫。
    *   [x] 使用 BankNote-Net encoder 標出紙鈔特徵
    *   [x] 使用分類模型判斷紙鈔所屬國別
    *   [x] 辨識完成後，以卡片和圖表的形式視覺化呈現 Top-K 的幣別與 Top-5 的面額預測結果。
    *   [x] 提示使用者將新辨識出的貨幣加入「集幣冊」。

---

### | 貨幣匯率換算 (Currency Exchange Rate Converter)

*   **功能簡述：**
    提供一個即時、互動的貨幣換算工具。使用者可以輸入任意金額，並在兩百種以上的全球貨種中自由選擇，系統會立即計算並顯示換算後的金額，幫助使用者建立直觀的貨幣價值概念。

*   **使用技術：**
    *   **前端**：
        *   **狀態管理**：使用 React Context (`RatesContext`) 進行全域狀態管理，在 App 啟動時一次性獲取所有匯率與貨幣資訊，供多個頁面共享，避免重複 API 請求。
        *   **UI 元件**：使用 `@react-native-picker/picker` 作為幣別選擇器，`TextInput` 作為金額輸入框。
    *   **後端**：
        *   **中介層 (Proxy)**：建立一個 `/api/rates` 端點，作為前端與第三方匯率服務之間的中介。這樣做可以隱藏 API Key，並統一資料格式。
        *   **資料來源**：透過 `requests` 函式庫呼叫外部的 `ExchangeRate-API.com`，獲取以新台幣 (TWD) 為基準的即時匯率資料。

*   **資料包含：**
    *   **輸入**：使用者輸入的金額、選擇的來源幣別 (`fromCurrency`) 與目標幣別 (`toCurrency`)。
    *   **處理**：後端 API 回傳的、以 TWD 為基準的全域匯率 JSON 物件。
    *   **輸出**：換算後的金額、兩種幣別間的直接匯率，以及詳細的計算過程。

*   **所有功能：**
    *   [x] 支援兩百多種全球貨幣的選擇。
    *   [x] 即時計算並顯示換算結果。
    *   [x] 提供「交換幣別」按鈕，一鍵反轉來源與目標貨幣。
    *   [x] 在介面中清晰展示當前兩種幣別的直接匯率 (例如 `1 USD = 32.5 TWD`)。
    *   [x] 提供彈出式視窗 (`Modal`)，內含可搜尋的完整匯率表，並顯示各幣別所屬國家/地區，強化學習效果。

---

### | 集幣冊與收藏系統 (Collection & Gamification)

*   **功能簡述：**
    本功能希望將貨幣學習遊戲化，且可以產生行動學習的動機，握們提供一個「貨幣圖鑑」介面，展示 App 中收錄的所有貨幣。使用者透過「影像辨識」功能成功識別一種新貨幣後，即可將其「收藏」起來。已收藏的貨幣會在圖鑑中以特殊的「Got it」印章標示，給予使用者收集的成就感。

*   **使用技術：**
    *   **前端**：
        *   **狀態管理**：使用 React Context (`AuthContext`) 在全域管理使用者的收藏列表 (`collections`)。
        *   **路由**：使用 `expo-router` 的動態路由 (`/currencies/[code].tsx`)，為每種貨幣自動生成獨一無二的詳細資訊頁面。
        *   **UI 元件**：使用 `FlatList` 高效渲染貨幣圖鑑列表；使用 `Alert` 彈出收藏確認視窗。
    *   **後端**：
        *   **資料庫**：使用 `MySQL`。建立 `users`, `currencies`, `denominations`, `user_collections` 四個表格，透過外鍵建立清晰的關聯。
        *   **使用者認證**：使用 `Flask-JWT-Extended` 實現基於 JWT 的使用者註冊與登入系統，確保收藏資料的安全性。
        *   **RESTful API**：
            *   `GET /api/currencies`: 獲取所有貨幣的基本列表。
            *   `GET /api/currencies/<code>`: 獲取單一貨幣及其所有面額的完整詳細資訊。
            *   `GET /api/me/collections`: 獲取當前登入使用者的收藏列表。
            *   `POST /api/me/collections`: 將一個新的貨幣加入到當前使用者的收藏中。

*   **資料包含：**
    *   **輸入**：使用者透過影像辨識成功後，點擊「收藏」按鈕的動作。
    *   **處理**：後端接收到收藏請求，將 `user_id` 和 `currency_id` 寫入 `user_collections` 表格。前端在 `AuthContext` 中更新收藏列表。
    *   **輸出**：在集幣冊頁面，已收藏的貨幣旁會顯示「Got it」印章。

*   **所有功能：**
    *   [x] 支援使用者註冊與登入。
    *   [x] 以列表形式展示所有可收集的貨幣。
    *   [x] 為已收藏的貨幣顯示特殊標記。
    *   [x] 點擊任一貨幣可進入「卡牌式」詳細資訊頁面，查看其歷史、設計、面額等豐富資訊。
    *   [x] 支援左右滑動瀏覽不同面額的鈔票圖片，並可點擊放大。
    *   [x] 在影像辨識成功後，提供互動式的收藏確認流程。
    
</details>

<details>
<summary>工具說明</summary>
### | 元件說明 (Component Descriptions)

*   **Frontend (React Native App):**
    *   **技術棧:** React Native (with Expo)
    *   **角色:** 使用者手機上運行的應用程式，是使用者與系統互動的唯一入口。
    *   **職責:**
        1.  提供所有 UI 介面，如相機、資訊展示頁、測驗畫面等。
        2.  處理使用者操作，如拍照、點擊按鈕、輸入文字。
        3.  透過發送 HTTP API 請求與後端伺服器進行通訊，以獲取或提交資料。
        4.  管理 App 的本地狀態。

*   **Backend Server (Python Flask):**
    *   **技術棧:** Python, Flask
    *   **角色:** 專案的大腦，處理所有核心業務邏輯與資料。
    *   **職責:**
        1.  **API Gateway:** 提供一組 RESTful API 接口，供前端 App 呼叫。
        2.  **影像辨識服務:** 接收前端上傳的貨幣圖片，呼叫 AI 模型進行辨識，並回傳辨識結果。
        3.  **[匯率換算服務](https://app.exchangerate-api.com/dashboard):** 接收前端的換算請求，呼叫第三方 API 獲取即時匯率，並執行計算。
        4.  **測驗與收藏服務:** 管理使用者的測驗邏輯、計分、虛擬集幣冊與成就系統的資料存取。

*   **Database (MySQL):**
    *   **技術棧:** MySQL
    *   **角色:** 專案的永久性資料倉庫。
    *   **職責:**
        1.  **貨幣資料庫:** 儲存所有貨幣的詳細靜態資料，如名稱、國家、面額、歷史背景、文化故事等。
        2.  **使用者資料庫:** 儲存使用者帳號資訊、虛擬集幣冊內容、測驗成績與解鎖的成就。

*   **External Services:**
    *   **第三方匯率 API:** 一個外部的網路服務，提供即時、準確的全球貨幣匯率數據。後端伺服器會定時或按需向其請求資料。

</details>
