// 平台目前功能分為：AR設備控制、使用者管理、機台管理、知識管理、GPT系統

// AR控制管理：
// 為原先機台管理，先進行改名為"AR設備控制"，將內部建立的機台內的SOP、Device、IoT功能中的SOP拔除，保留Device、IoT的功能即可。
// 已被拔除的SOP功能，將會移植到知識管理內的知識庫做使用。

/* ========================================================================================================================================================================= */

// 使用者管理：
// 此功能目前皆無須更動，但後續可能配合機台管理、知識庫等功能，會有需求約束使用者等級才能操作的部分。
// 目前內部有依照等級為：最高管理者，專家、一般用戶。
// 可能能操作一些更動的功能除了最高管理者、專家能操作外，一般用戶無法操作更改，類似像這種概念。

/* ========================================================================================================================================================================= */

// 機台管理：
// 為日後知識庫建立的機台資訊來源。
// 使用者透過頁面中"新增機台"按鈕，點選彈出視窗填選欄位，欄位分別為：機台種類、型號系列、機台名稱、機台圖片
// 建立欄位資訊後，可在機台管理頁面呈現出機台資訊，並且可於上方挑選條件篩選縮小範圍查看想查看、編輯、刪除的機台資訊。
// 但機台管理與AR控制管理不同之處，在於，機台管理的機台資訊只能"編輯、刪除"，並沒有AR控制管理的"IoT、Device"功能。
// 也等於刪除此機台資訊，將會刪除該機台已建立的的知識庫資料，刪除前也需再一次跳出視窗提示"是否刪除"等告誡訊息給使用者。

/* ========================================================================================================================================================================= */

// 知識管理 - 知識庫：
// 主要功能為建立機台的相關資料與檔案保存、修改、呈現，並可提供可印出的PDF檔。
// (Group 1)
// 使用者透過頁面中"新增知識"按鈕，點選彈出視窗填選欄位，欄位分別為：帳號、機台種類、型號系列、機台名稱
// 其中帳號為目前使用者登入的全像樣式，如果以最高管理者登入的話，此欄位也相對顯示為最高管理者。
// 另外，機台種類、型號系列、機台名稱皆為可選取的下拉式欄位，下拉式欄位分別對應目前"機台管理頁面內已建立的機台資訊"並可直接選取套入此欄位
// ，或是使用者已知最準確唯一的資訊，例如：機台名稱 此欄位，選取此欄位資訊便會自動套入上方的 機台種類、型號系列 資訊。
// (Group 2)
// Step1：
// 新增機台 欄位資訊填選完畢後，透過"儲存"按鈕進入下一頁"故障說明"，此步驟意味著，已進入到選取的機台填選該機台的相關檔案需求資訊(文字、圖片、影片)。
// Step2：
// 參考以下 DocumentEditor 內 result陣列內的元素內容，為該頁面需填入資訊。
// 1. 設備種類、設備部件、維修項目、維修類型 欄位可進行使用者的輸入歷史紀錄，點選欄位可輸入文字並同時也會有下拉選單呈現"歷史紀錄"與"已建立過的資料資訊"，並且與檔案編號一起為必填欄位。
// 2. 故障發生原因、故障描述、故障發生時機 可進行文字填入，並可使用欄位右上角-色盤功能，修改文字顏色。
// 3. For Model機型、所有使用工具、部位位置 可進行"圖片上傳"，並且可上傳圖片不只一張，依序由左至右排列。
//    "上傳圖片"功能，除了可上傳圖片外，上傳後告訴使用者須將圖檔命名，欄位內使用<input>的欄位方式給使用者填入名稱，且可保存此名稱呈現在圖片下方。
//    (命名的圖片可透過預覽查看維修檔案的相對呈現)
//    "刪除圖片"功能，點選依序由最後一個上傳的圖片開始刪除，點選一次刪除一張，並且也跳出提示告誡使用者是否刪除該圖片。
// Step3：
// 透過儲存按鈕，跳轉下一頁面"SOP"。
// 1. 步驟說明、備註說明 可進行文字填入，並可使用欄位右上角-色盤功能，修改文字顏色。
// 2. 步驟圖片、備註圖片 可進行"圖片上傳"，並且可上傳圖片不只一張，依序由左至右排列。
//    "上傳圖片"功能，除了可上傳圖片外，上傳後告訴使用者須將圖檔命名，欄位內使用<input>的欄位方式給使用者填入名稱，且可保存此名稱呈現在圖片下方。
//    (命名的圖片可透過預覽查看維修檔案的相對呈現)
//    "刪除圖片"功能，點選依序由最後一個上傳的圖片開始刪除，點選一次刪除一張，並且也跳出提示告誡使用者是否刪除該圖片。
// 3. 步驟影片、3D Model List、3D Model先行保留且不更動到功能

// 故障說明、SOP，此兩個頁面，能輸入文字圖片影片，且皆有儲存、取消、預覽功能，可邊新增資訊邊預覽維修檔案的填寫進度相對呈現出來。
// 補充：SOP頁面的"儲存設定"按鈕，調整樣式與故障說明相同，包含"儲存、取消、預覽"三個按鈕。但這邊的"儲存"點選會跳出彈出視窗並有兩個欄位："帳號、SOP名稱"。帳號顯示目前登入者資訊、同一開始知識庫的新增機台功能呈現相同。SOP名稱，將建立之檔案命名。

// 預覽按鈕：
// 為查看維修檔案欄位填寫資訊，分別對應故障說明、SOP部分欄位。
// 維修說明檔案，"第一頁為相關資訊呈現、第二頁為SOP步驟呈現"，而遇SOP步驟繁多情況會依序往下生成第二頁第三頁。

// 首頁：
// 欄位呈現，每一欄位皆為建立的一筆機台資料，可點選進入該資料"資料庫"頁面查看與修改、印出檔案。

// 資料庫頁面：
// 上方為Title呈現首頁欄位資訊，下方為故障資訊與SOP步驟呈現，使用者等級高者，可點選欄位直接修改欄位內的內容進行保存更新該筆檔案資料，同時也有視窗提示是否修改。
// 上方按鈕：編輯、刪除、PDF，編輯、刪除皆須依照使用者等級約束操作，PDF一般使用著與以上皆可使用此印出檔案功能。
// 編輯：直接跳轉到該筆資料的"故障說明"修改內容。
// 刪除：直接刪除該筆資料。
// PDF：保存於本機且可印出該筆資料維修檔案。

// 知識庫 - 條件查詢：
// 點選之彈出視窗，可進行搜尋、拖拉、點選進入右側欄位，根據加入的條件越多，縮小大範圍的首頁欄位項目檔案，"儲存"後會導入到一個相同樣式的頁面，但"標題從知識庫改為查詢結果"

/* ========================================================================================================================================================================= */

// 知識管理 - 故障庫：
// 主要功能為呈現知識庫已建立之資料。
// 首頁左側：
// 列表呈現並可展開點選該機台名稱查看心智圖與資料庫內容。
// 列表內的內容為階層式展開，對應方式與機台管理一樣，撈取機台管理"新增機台"彈出視窗內的欄位，第一階~第三階分別為：機台種類、型號系列、機台名稱
// 點選列表內的第三階層"機台名稱"右側的心智圖才會更新為該機台的資訊呈現。
// 上方"編輯按鈕"，點選出現儲存 & 刪除按鈕，選取列表內的項目進行刪除後的儲存操作，也是依照使用者權限才可操作，同時也要有訊息告誡是否刪除。
// 目前範例樣式有checkbox，當點選編輯才出現checkbox給使用者勾選要刪除保存結果的項目檔案。

// 首頁右側：
// 心智圖呈現並可選該機台心智圖展開大樣式心智圖內容檔案。
// 右上方"待新增"下拉欄位，可進行點選選取第二階層下方內的內容所有機台來切換心智圖呈現。
// 例如：
// 第一階~第三階分別為：CNC車床 → CNC → CNC-55688，則待新增可選取CNC底下的所有系列機台，CNC-55688、CNC-66588、CNC-88566…等等

// 已有列出一個資料邏輯如下方資料：MindMap 陣列。 依照德哥實作為主，大致上為此階層。
// 點選到最後一階層：sop陣列，心智圖呈現為 RepairItem ，即進入該資料庫頁面。 (此資料庫頁面與知識庫首頁點選的位置為相同，皆為相同之處功能也相同)

// 補充：
// 首頁心智圖為圖片呈現，只能點選進入整頁式的心智圖呈現，不能點選分支 (可參考之前提供的Figma內容)
// 進入整頁式的心智圖呈現時，上方的"系列"為第二階層呈現。
// 例如：CNC車床 → CNC → CNC-55688，則上方顯示 "CNC系列"，下方心智圖中心顯示"CNC-55688"

// 總結：
// 知識庫：用以提供使用者輸入"文本、圖片、影片"保存，且可"呈現、修改、刪除、印出PDF檔案"內容。並支援條件查詢廣泛搜索項目。
// 故障庫：用以撈取已保存的知識庫資訊內容，以"列表、心智圖"方式呈現，並且可與知識庫功能相同，進入該筆資料的資料庫頁面，進行"編輯、刪除、保存、印出PDF檔案"功能。
// 在知識庫內建立的檔案內容，皆綁定在機器管理建立的機台資訊，尤其為"機台名稱"此欄位，因此欄位為唯一不會重複的欄位，而機台種類、型號系列皆有高機率會重複。

// 頁面UI有些為自Key並沒有統一，可參考信箱提供的 React UI工具，可直接import使用。
// 1. 彈出視窗依照機器管理的"新增機台"統一
// 2. "欄位、紅星星與提示不可空白"等功能，也依照"機台管理"彈出視窗內的設計統一
/* ========================================================================================================================================================================= */

// 新增功能 & 頁面

// 新增頁面 - 此為目前平台之"機台管理"
MachineKnowledge = [
  {
    machineKnowledgeId: 0,
  },
  {
    token: 'string',
    code: 'string',
    message: 'string',
    result: {
      machineKnowledgeId: 0,
      deleted: 0,
      machineType: 'string' /*機台種類*/,
      modelSeries: 'string' /*型號系列*/,
      machineName: 'string' /*機台名稱*/,
      machineImage: 'string',
      machineImageObj: 'string',
      isDeletedMachineImage: true,
    },
  },
  /* 機器管理-新增機台Page：保存以上所有使用者填寫的欄位項目，machineType、modelSeries、machineName欄位，
     欄位新增目的：後續"知識庫-新增機台"功能可使用來選取需求機台*/
];

AddingKnowledge = [
  {
    machineId: 0,
  },
  {
    token: 'string',
    code: 'string',
    message: 'string',
    result: {
      machineId: 0,
      deleted: 0,
      machineType: 'string' /*機台種類*/,
      modelSeries: 'string' /*型號系列*/,
      machineName: 'string' /*機台名稱*/,
    },
  },
  /* 知識庫-新增機台Page：對應機器管理-新增機台，使用下拉式選單選取已建立機台來進入故障說明、SOP頁面內容填寫
      機台選取模式：提供機台名稱給予下拉選單選取，而選取完畢後"機台種類、型號系列"則自動填入? 
      後續對應"故障庫"左側列表"機台種類型號"呈現，階梯式展開呈現並可選取查看*/
];

DocumentEditor = [
  {
    id: 0,
    isCommon: 0,
  },
  {
    token: 'string',
    code: 'string',
    message: 'string',
    result: [
      {
        knowledgeBaseId: 0,
        deleted: 0,
        knowledgeBaseDeviceType: 'string' /*設備種類*/,
        knowledgeBaseDeviceParts: 'string' /*設備部件*/,
        knowledgeBaseRepairItems: 'string' /*維修項目*/,
        knowledgeBaseRepairType: 'string' /*維修類型*/,
        knowledgeBaseFileNo: 'string' /*檔案編號*/,
        knowledgeBaseAlarmCode: 'string' /*故障代碼*/,
        knowledgeBaseSpec: 'string' /*規格*/,
        knowledgeBaseSystem: 'string' /*系統*/,
        knowledgeBaseProductName: 'string' /*產品名稱*/,
        knowledgeBaseAlarmCause: 'string' /*故障發生原因*/,
        knowledgeBaseAlarmDesc: 'string' /*故障描述*/,
        knowledgeBaseAlarmOccasion: 'string' /*故障發生時機*/,
        knowledgeBaseModelImage: 'string' /*For Model機型*/,
        knowledgeBaseModelImageObj: 'string',
        knowledgeBaseToolsImage: 'string' /*所有使用工具*/,
        knowledgeBaseToolsImageObj: 'string',
        knowledgeBasePositionImage: 'string' /*部位位置*/,
        knowledgeBasePositionImageObj: 'string',
        machineAddId: 0,
      },
    ],
  },
  /* 故障說明Page：保存以上所有使用者填寫的欄位項目，對應第一頁Knowledge.js呈現、 預覽頁面PDFContent.js呈現，
      並可透過印出按鈕印出檔案資訊*/
];

sop = [
  {
    id: 0,
    isCommon: 0,
  },
  {
    token: 'string',
    code: 'string',
    message: 'string',
    result: [
      {
        sopId: 0,
        deleted: 0,
        machineAlarmId: 0,
        sopStep: 0,
        sopMessage: 'string' /*步驟說明*/,
        sopImage: 'string' /*步驟圖片*/,
        sopImageObj: 'string',
        isDeletedSOPImage: true,
        sopRemarksMessage: 'string' /*備註說明*/,
        sopRemarksImage: 'string' /*備註圖片*/,
        sopRemarksImageObj: 'string',
        isDeletedSOPRemarksImage: true,
        sopVideo: 'string',
        sopVideoObj: 'string',
        isDeletedSOPVideo: true,
        sopplC1: 'string',
        sopplC2: 'string',
        sopplC3: 'string',
        sopplC4: 'string',
        sopModels: [
          {
            sopModelId: 0,
            deleted: 0,
            sopId: 0,
            sopModelImage: 'string',
            sopModelFile: 'string',
            sopModelPX: 0,
            sopModelPY: 0,
            sopModelPZ: 0,
            sopModelRX: 0,
            sopModelRY: 0,
            sopModelRZ: 0,
            sopModelSX: 0,
            sopModelSY: 0,
            sopModelSZ: 0,
            isCommon: 0,
          },
        ],
      },
    ],
  },
  /* SOP Page：保存以上所有使用者填寫的欄位項目，對應預覽頁面PDFContent.js呈現"Step欄位文字圖片內容"，
    並可透過印出按鈕印出檔案資訊*/

  (MindMap = [
    {
      /* 心智圖資料架構 */
      machineName: 'CNC-55688',
      KnowledgeDeviceParts: '主軸',
      KnowledgeRepairType: [
        {
          KnowledgeRepairType: '電控',
          sop: [
            {
              machineName: 'CNC-55688',
              KnowledgeDeviceType: '車床',
              KnowledgeDeviceParts: '主軸',
              RepairItem: `${KnowledgeRepairItem}: ${KnowledgeAlarmCode}` /*機械目前處於是車工件的狀態:2014*/,
              KnowledgeRepairType: '電控層面',
              KnowledgeFileNumber: 'TS31103',
            },
          ],
        },
      ],
    },
  ]),
];
