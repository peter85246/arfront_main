export const knowledge = [
    {
        /* 心智圖資料架構 */
        machineName: "CNC-55688",
        KnowledgeDeviceParts: "主軸",
        KnowledgeRepairType: [
            {
                KnowledgeRepairType: "電控",
                sop: [
                    {
                        machineName: "CNC-55688",
                        KnowledgeDeviceType: "車床",
                        KnowledgeDeviceParts: "主軸",
                        RepairItem: `${KnowledgeRepairItem}: ${KnowledgeAlarmCode}`, /*機械目前處於是車工件的狀態:2014*/ 
                        KnowledgeRepairType: "電控層面",
                        KnowledgeFileNumber: "TS31103"
                    }
                ]
            }
        ],

        /* SOP頁面新增缺少元素內容 */
        sop: [
            {
                sopId: 0,
                deleted: 0,
                machineAlarmId: machineAlarmId,
                sopStep: lastSOP != null ? lastSOP.sopStep + 1 : 1,
                sopMessage: "",
                sopImage: "",
                sopImageObj: null,
                isDeletedSOPImage: false,
                /* 新增：sopRemarksMessage、sopRemarksImage、sopRemarksImageObj 三元素 */
                sopRemarksMessage: "",
                sopRemarksImage: "",
                sopRemarksImageObj: null,
                isDeletedSOPRemarksImage: false,
                sopVideo: "",
                sopVideoObj: null,
                isDeletedSOPVideo: false,
                sopplC1: "",
                sopplC2: "",
                sopplC3: "",
                sopplC4: "",
                sopModels: [],
            }
        ]

    }
]


