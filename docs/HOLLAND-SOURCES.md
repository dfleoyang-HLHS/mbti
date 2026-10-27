# Holland 職業興趣探索 — 題目來源查證紀錄

> 查證日期：2026-10-27
> 查證方式：直接下載官方網站頁面與文件，引述原文
> 對應企劃：[`PLAN-RIASEC.md`](PLAN-RIASEC.md) 第五節、第十一節第 2 階段
> 備註：`holland` repo 建立後，本文件移至該 repo 的 `docs/SOURCES.md`

---

## 一、結論摘要

| 候選來源 | 題數／結構 | 授權 | 可否翻譯並放在公開網站 | 查證結果 |
|---|---|---|---|---|
| **O\*NET Interest Profiler 短版** | 60 題，RIASEC 六型各 10 題 | CC BY-ND 4.0，或 O\*NET Tools Developer License | **可以**，但須依 Developer License 標示改作聲明，並**在推出前完成效度驗證研究** | ✅ 已查證 |
| Armstrong, Allison & Rounds（2008）公開 RIASEC 標記量表 | 依文獻為 48 題（未能核對） | 未能核對 | 未能核對 | ⚠️ 無法查證 |
| IPIP：Oregon Vocational Interest Scales（ORVIS） | 8 個興趣量表，非 RIASEC 六型 | 公有領域 | **可以**，不需申請許可 | ✅ 已查證（僅授權部分） |

**決定：採用 O\*NET Interest Profiler 短版，並遵守 O\*NET Tools Developer License 的三項義務**（2026-10-27 定案）。理由見第五節。

---

## 二、O\*NET Interest Profiler 短版（Short Form）

### 來源
- 介紹頁：<https://www.onetcenter.org/IP.html>
- 授權頁：<https://www.onetcenter.org/license_tools.html>
- 開發者授權全文：<https://www.onetcenter.org/license_toolsdev.html>
- 紙本題目：<https://www.onetcenter.org/dl_tools/ipsf/Interest_Profiler.pdf>
- 心理計量摘要：Rounds, J., Su, R., Lewis, P., & Rivkin, D.（2010）. *O\*NET Interest Profiler Short Form Psychometric Characteristics: Summary*. National Center for O\*NET Development. <https://www.onetcenter.org/reports/IPSF_Psychometric.html>
- 發行單位：美國勞工部就業與訓練署（USDOL/ETA），由 National Center for O\*NET Development 開發

### 題目結構
- 紙本題目原文：「Read the 60 work activities below.」共 60 題工作活動，R、I、A、S、E、C 各 10 題。
- 題目範例（原文）：R「Build kitchen cabinets」、I「Develop a new medicine」、A「Write books or plays」、S「Help people with personal or emotional problems」、E「Start your own business」、C「Develop a spreadsheet using computer software」。

### 作答與計分（心理計量摘要原文）
> In the case of the computerized assessment for the Short Form, a five-point response format is used … participants indicate their interest in each activity from 0 = "strongly dislike," 1 = "dislike," 2 = "unsure," 3 = "like," and 4 = "strongly like." Scores are computed by summing responses for each of the six Holland types with a score range of 0 to 40.

- 電腦版：5 點量表（0～4），每型分數範圍 0～40。
- 紙本版：建議 3 點（like／dislike／unsure），計算 like 的數量。
- 對本專案的影響：畫面可顯示 1～5，計分時換算為 0～4，與原量表一致。企劃書的公式 `(原始分數 − n) ÷ 4n × 100` 與此等價。

### 心理計量證據（美國樣本，心理計量摘要原文）
| 指標 | 數據 |
|---|---|
| 內部一致性（發展樣本 N = 1061） | Cronbach's α 為 .78～.87（平均 .81） |
| 內部一致性（穩定性樣本 N = 132） | 第一次 .78～.89（平均 .84）；第二次 .82～.90（平均 .86） |
| 重測信度 | .78～.86（平均 .82） |
| 聚斂效度（與 Interest-Finder 同名量表） | .74～.82 |
| 六角形結構 | 相關矩陣符合環形順序；Correspondence Index = .69 |

**注意**：以上是英文版在美國樣本的數據，不能直接代表中文版。

### 授權條款
O\*NET Career Exploration Tools（含 Interest Profiler）提供兩種授權（授權頁原文）：

> If you want to copy or publish the Tools verbatim, use the CC BY-ND 4.0 license.
> If you want to modify, edit, or extend the Tools, use the O\*NET Tools Developer License.

**翻譯屬於改作**。開發者授權對 Adapted Material 的定義（原文）：

> Adapted Material means material … in which the Licensed Material is translated, altered, arranged, transformed, or otherwise modified …

因此本專案**必須使用 O\*NET Tools Developer License**。CC BY-ND 4.0 禁止改作，翻譯版不能使用這份授權。

### O\*NET Tools Developer License 的義務

**1. 效度驗證研究（Validation Study）——必須在推出前完成**

> Modification of Content. If You only use a part of, or in any other manner modify or revise, any part of the Licensed Material, You must conduct a Validation Study to ensure that any and all results, information or other materials derived from the use of the Adapted Material are valid for the intended purpose, audience and end-user prior to introduction of the new Product.

研究須符合 *Standards for Educational and Psychological Testing*（AERA、APA、NCME）等業界標準。

**2. 標示聲明（原文須照錄）**

> "This [page/product/application] includes information from the O\*NET Career Exploration Tools by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the O\*NET Tools Developer License. O\*NET® is a trademark of USDOL/ETA. [Your name or company] has modified all or some of this information. USDOL/ETA has not approved, endorsed, or tested these modifications."

- 須**醒目地**顯示在產品上，也要放在 README 中，並在開啟畫面顯示一段合理的時間。

**3. 「修改內容與免責聲明」說明**
- 開啟畫面須有連結，文字至少要提到「modifications and disclaimers」，連到修改內容的說明。
- 說明中須包含以下原文：

> "[Your name or company] has modified all of, a portion of, or the purpose of the O\*NET® Career Exploration Tools. The U.S. Department of Labor, Employment and Training Administration (USDOL/ETA) has not approved, endorsed, or tested these modifications. As such, USDOL/ETA will not be liable to any third party or end-user for any damages arising out of or from the use or misuse of the modified O\*NET Career Exploration Tools or any products incorporating or containing the modified O\*NET Career Exploration Tools."

**4. 其他規定**
- 不得暗示與 USDOL/ETA 有關聯，或獲得其背書（No endorsement）。
- 商標規定：「O\*NET」須加上 ® 符號；只能當形容詞使用，例如「O\*NET 職業興趣量表」，不能用複數或所有格。
- 只修改軟體、把量表整合到系統中，不算內容的改作。
- 授權方建議開發者填寫選填的登記表：Register as a Developer。

---

## 三、Armstrong, Allison & Rounds（2008）公開 RIASEC 標記量表

- 文獻：Armstrong, P. I., Allison, W., & Rounds, J.（2008）. Development and initial validation of brief public domain RIASEC marker scales. *Journal of Vocational Behavior, 73*, 287–299.
- 查證結果：**無法查證**
  - ScienceDirect 拒絕自動程式存取，回應 HTTP 403。這不是網路政策造成的。
  - IPIP 網站的量表索引沒有收錄這份量表。
- 待確認事項：題目清單、公有領域聲明、題目是否取自其他量表，以及原量表的授權狀態。
- 若要評估這個來源，需要你提供論文 PDF。

---

## 四、IPIP：Oregon Vocational Interest Scales（ORVIS）

### 來源
- IPIP 首頁：<https://ipip.ori.org/>
- 許可說明：<https://ipip.ori.org/newPermission.htm>
- 題目與計分鍵：<https://ipip.ori.org/newORVISSurvey.htm>、<https://ipip.ori.org/newORVISKey.htm>
- 文獻：Pozzebon, J. A., Visser, B. A., Ashton, M. C., Lee, K., & Goldberg, L. R.（2010）. Psychometric characteristics of a public-domain self-report measure of vocational interests: The Oregon Vocational Interest Scales. *Journal of Personality Assessment, 92*, 168–174.

### 授權（原文）
> The items and scales are in the public domain, which means that one can copy, edit, translate, or use them for any purpose without asking permission and without paying a fee.

> Because the IPIP has been placed in the public domain, permission has already been automatically granted for any person to use IPIP items, scales, and inventories for any purpose, commercial or non-commercial.

### 結構與限制
- 8 個興趣量表：Leadership、Organization、Altruism、Creativity、Analysis、Production、Adventure、Erudition。
- 這 8 個量表**不是 Holland 的 RIASEC 六型**。其中 6 個在概念上大致對應 RIASEC，但多了 Adventure、Erudition 兩個量表。對應方式需要依原始文獻確認，不能自行推定。
- 作答方式：5 點量表（Strongly dislike、Dislike、Neutral、Like、Strongly like），全部正向計分。
- 題數：我從計分鍵頁面數到約 92 題，各量表題數不一，需以原始文獻核對。
- 心理計量數據：未能取得原始文獻，**尚未查證**。
- 已有德文翻譯版（IPIP 翻譯頁面有記載），目前未見中文版。

---

## 五、建議與理由

**建議採用 O\*NET Interest Profiler 短版（60 題）**

1. **直接對應 RIASEC 六型**，符合企劃的理論架構與「6 階段 × 10 題」的設計。
2. **授權明確允許翻譯**，條款與義務都有原文可依循。
3. **心理計量證據完整**：信度、重測信度、聚斂效度和六角形結構都有公開數據。
4. 題目是具體的工作活動，符合企劃「描述活動、不寫職業名稱」的原則。

**採用後對企劃的影響**

| 項目 | 原企劃 | 依授權調整後 |
|---|---|---|
| 上線時機 | 「試行版」先公開，再試測 | **先完成效度驗證研究，才能正式公開推出** |
| 試測期間 | — | 只提供給研究參與者使用，不公開推廣；頁面標示為研究用途 |
| 標示 | 一般免責聲明 | 加上 O\*NET 規定的改作聲明：放在首頁開啟畫面與 README，並提供「modifications and disclaimers」連結 |
| 計分 | 1～5 分 | 畫面顯示 1～5，計分換算為 0～4，與原量表一致 |

**效度驗證研究的最低內容**（依授權引用的測驗標準，由專業人員確認後執行）
- 中文化程序紀錄：翻譯、回譯、文化調適、專家審閱、認知訪談。
- 台灣成人樣本的信度（Cronbach's α）與重測信度。
- 六角形結構檢驗：相關矩陣、Correspondence Index。
- 與原版數據的比較，並撰寫研究報告公開於網站。

---

## 六、決定紀錄

| 日期 | 決定 |
|---|---|
| 2026-10-27 | 採用 O\*NET Interest Profiler 短版（60 題），依 O\*NET Tools Developer License 翻譯使用 |
| 2026-10-27 | 遵守三項義務：正式推出前完成效度驗證研究、醒目標示改作聲明、提供「modifications and disclaimers」修改說明連結 |
| 2026-10-27 | 不再評估 Armstrong 等人（2008）與 ORVIS |

待定：效度驗證研究的心理計量專業人員人選。
