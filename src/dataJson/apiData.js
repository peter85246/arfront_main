Machine = [

    {
        "machineId": 0
    },
    {
        "token": "string",
        "code": "string",
        "message": "string",
        "result": {
          "machineId": 0,
          "deleted": 0,
          "machineCode": "string",
          "machineType": "string", /*機台種類*/
          "modelSeries": "string", /*型號系列*/
          "machineName": "string",
          "machineSpec": "string",
          "machineImage": "string",
          "machineImageObj": "string",
          "isDeletedMachineImage": true,
          "machineFile": "string",
          "machineFileObj": "string",
          "isDeletedMachineFile": true
        }
    }
      /* 機器管理-新增機台Page：保存以上所有使用者填寫的欄位項目，新增"machineType、modelSeries"兩欄位，
      欄位新增目的：後續"知識庫-新增機台"功能可使用來選取需求機台*/
];


AddingKnowledge = [

    {
        "machineId": 0
    },
    {
        "token": "string",
        "code": "string",
        "message": "string",
        "result": {
          "machineId": 0,
          "deleted": 0,
          "machineCode": "string",
          "machineType": "string", /*機台種類*/
          "modelSeries": "string", /*型號系列*/
          "machineName": "string" /*機台名稱 (修改對應機器管理-新增機台)*/
        }
    }
      /* 知識庫-新增機台Page：對應機器管理-新增機台，使用下拉式選單選取已建立機台來進入故障說明、SOP頁面內容填寫
      機台選取模式：提供機台名稱給予下拉選單選取，而選取完畢後"機台種類、型號系列"則自動填入? 
      後續對應"故障庫"左側列表"機台種類型號"呈現，階梯式展開呈現並可選取查看*/
];

DocumentEditor = [

    {
        "id": 0,
        "isCommon": 0
    },
    {
        "token": "string",
        "code": "string",
        "message": "string",
        "result": [
          {
            "knowledgeBaseId": 0,
            "deleted": 0,
            "knowledgeBaseDeviceType": "string", /*設備種類*/
            "knowledgeBaseDeviceParts": "string", /*設備部件*/
            "knowledgeBaseRepairItems": "string", /*維修項目*/
            "knowledgeBaseRepairType": "string", /*維修類型*/
            "knowledgeBaseFileNo": "string", /*檔案編號*/
            "knowledgeBaseAlarmCode": "string", /*故障代碼*/
            "knowledgeBaseSpec": "string", /*規格*/
            "knowledgeBaseSystem": "string", /*系統*/
            "knowledgeBaseProductName": "string", /*產品名稱*/
            "knowledgeBaseAlarmCause": "string", /*故障發生原因*/
            "knowledgeBaseAlarmDesc": "string", /*故障描述*/
            "knowledgeBaseAlarmOccasion": "string", /*故障發生時機*/
            "knowledgeBaseModelImage": "string", /*For Model機型*/
            "knowledgeBaseModelImageObj": "string",
            "knowledgeBaseToolsImage": "string", /*所有使用工具*/
            "knowledgeBaseToolsImageObj": "string",
            "knowledgeBasePositionImage": "string", /*部位位置*/
            "knowledgeBasePositionImageObj": "string",
            "machineAddId": 0
          }
        ]
    }
      /* 故障說明Page：保存以上所有使用者填寫的欄位項目，對應第一頁Knowledge.js呈現、 預覽頁面PDFContent.js呈現，
      並可透過印出按鈕印出檔案資訊*/
];

sop = [

    {
        "id": 0,
        "isCommon": 0
    },
    {
        "token": "string",
        "code": "string",
        "message": "string",
        "result": [
        {
            "sopId": 0,
            "deleted": 0,
            "machineAlarmId": 0,
            "sopStep": 0,
            "sopMessage": "string", /*步驟說明*/
            "sopImage": "string", /*步驟圖片*/
            "sopImageObj": "string",
            "isDeletedSOPImage": true,
            "sopRemarksMessage": "string", /*備註說明*/
            "sopRemarksImage": "string", /*備註圖片*/
            "sopRemarksImageObj": "string",
            "isDeletedSOPRemarksImage": true,
            "sopVideo": "string",
            "sopVideoObj": "string",
            "isDeletedSOPVideo": true,
            "sopplC1": "string",
            "sopplC2": "string",
            "sopplC3": "string",
            "sopplC4": "string",
            "sopModels": [
            {
                "sopModelId": 0,
                "deleted": 0,
                "sopId": 0,
                "sopModelImage": "string",
                "sopModelFile": "string",
                "sopModelPX": 0,
                "sopModelPY": 0,
                "sopModelPZ": 0,
                "sopModelRX": 0,
                "sopModelRY": 0,
                "sopModelRZ": 0,
                "sopModelSX": 0,
                "sopModelSY": 0,
                "sopModelSZ": 0,
                "isCommon": 0
            }
            ]
        }
        ]
    }
    /* SOP Page：保存以上所有使用者填寫的欄位項目，對應預覽頁面PDFContent.js呈現"Step欄位文字圖片內容"，
    並可透過印出按鈕印出檔案資訊*/
]