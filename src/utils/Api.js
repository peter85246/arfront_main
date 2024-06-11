import axios from "axios";
import { getAuthToken, removeAuthToken, setAuthToken } from "./TokenUtil";

let getHeaders = () => {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Bearer " + getAuthToken(),
  };
};

//#region AR管理API
export const fetchDataCall = async (
  api,
  method,
  payload = null,
  download = false,
) => {
  var config = {
    method: method,
    url: `${window.apiUrl}/api/${api}`,
    headers: getHeaders(),
    params: null,
    data: null,
  };

  if (method == "get") {
    if (payload != null) {
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "") {
          delete payload[key];
        }
      });
    }
    config.params = payload;
  } else {
    config.data = payload;
  }

  if (download) {
    config.responseType = "blob";
  }

  let apiReturn = await axios
    .request(config)
    .then(async function (response) {
      if (response.data.token != null) {
        setAuthToken(response.data.token);
      }

      if (response.data.code == "1001") {
        removeAuthToken();
        window.location.href = "/";
      }
      if (!download) {
        return response.data;
      } else {
        return response;
      }
    })
    .catch(function (error) {
      console.log(error);
    });

  return apiReturn;
};

export const fetchDataCallFile = async (api, method, data) => {
  let apiReturn = await axios
    .put(`${window.apiUrl}/api/${api}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
        Authorization: "Bearer " + getAuthToken(),
      },
    })
    .then(async function (response) {
      if (response.data.token != null) {
        setAuthToken(response.data.token);
      }

      if (response.data.code == "1001") {
        removeAuthToken();
        window.location.href = "/";
      }
      return response.data;
    })
    .catch((error) => {
      console.log(error);
      console.log(JSON.stringify(error.response.data.errors));
    });
  return apiReturn;
};
//#endregion

//#region 共用
export const apiMyUserData = (data) => fetchDataCall("myUserData", "get"); //取得使用者
export const apiChangePaw = (data) => fetchDataCall("ChangePaw", "put", data); //變更密碼
//#endregion

//#region 登入
export const apiSignIn = (data) => fetchDataCall("signIn", "post", data); //使用者登入
//#endregion

//#region 使用者管理
export const apiGetAllUserinfoByFilter = (data) =>
  fetchDataCall("GetAllUserinfoByFilter", "post", data); //依據條件取得所有使用者列表
export const apiAddUserinfo = (data) =>
  fetchDataCall("AddUserinfo", "put", data); //新增使用者
export const apiEditUserinfo = (data) =>
  fetchDataCall("EditUserinfo", "put", data); //修改使用者
export const apiDeleteUserinfo = (data) =>
  fetchDataCall("DeleteUserinfo", "delete", data); //刪除使用者
export const apiUserinfoChangePaw = (data) =>
  fetchDataCall("UserinfoChangePaw", "put", data); //使用者修改密碼
//#endregion

//#region AR設備控制
export const apiMachineOverview = (data) =>
  fetchDataCall("MachineOverview", "post", data); //機台列表
export const apiGetOneMachine = (data) =>
  fetchDataCall("GetOneMachine", "post", data); //取得單一機台
export const apiMachineInfo = (data) =>
  fetchDataCallFile("MachineInfo", "put", data); //新增/編輯機台
export const apiDeleteMachine = (data) =>
  fetchDataCall("DeleteMachine", "delete", data); //刪除機台
export const apiGetOneMachineDevice = (data) =>
  fetchDataCall("GetOneMachineDevice", "post", data); //取得單一一筆機台設備
export const apiEditMachineDevice = (data) =>
  fetchDataCall("EditMachineDevice", "put", data); //修改機台設備
//#endregion

//#region 機台Alarm管理
export const apiGetAllMachineAlarmByFilter = (data) =>
  fetchDataCall("GetAllMachineAlarmByFilter", "post", data); //依據條件取得指定機台的所有Alarm
export const apiGetOneMachineAlarm = (data) =>
  fetchDataCall("GetOneMachine", "post", data); //取得指定機台的單一Alarm
export const apiAddMachineAlarm = (data) =>
  fetchDataCall("AddMachineAlarm", "put", data); //新增指定機台的Alarm
export const apiEditMachineAlarm = (data) =>
  fetchDataCall("EditMachineAlarm", "put", data); //修改指定機台的Alarm
export const apiDeleteMachineAlarm = (data) =>
  fetchDataCall("DeleteMachineAlarm", "delete", data); //刪除指定機台的Alarm
//#endregion

//#region SOP
export const apiGetAllSOPByMachineAlarmId = (data) =>
  fetchDataCall("GetAllSOPByMachineAlarmId", "post", data); //依據AlarmId取得所有SOP
export const apiSaveSOP = (data) => fetchDataCallFile("SaveSOP", "put", data); //儲存SOP
//#endregion

//#region 機台IOT
export const apiIOTOverview = (data) =>
  fetchDataCall("IOTOverview", "post", data); //IOT列表
export const apiDeleteMachineIOT = (data) =>
  fetchDataCall("DeleteMachineIOT", "delete", data); //刪除IOT

export const apiGetOneMachineIOT = (data) =>
  fetchDataCall("GetOneMachineIOT", "post", data); //取得單一IOT資訊
export const apiSaveMachineIOT = (data) =>
  fetchDataCall("SaveMachineIOT", "put", data); //取得單一IOT資訊
//#endregion

//#region 機台管理
export const apiMachineAddOverview = (data) =>
  fetchDataCall("MachineAddOverview", "post", data); //機台列表
export const apiGetOneMachineAdd = (data) =>
  fetchDataCall("GetOneMachineAdd", "post", data); //取得單一機台
export const apiMachineAddInfo = (data) =>
  fetchDataCallFile("MachineAddInfo", "put", data); //新增/編輯機台
export const apiDeleteMachineAdd = (data) =>
  fetchDataCall("DeleteMachineAdd", "delete", data); //刪除機台
//#endregion

//#region 知識庫管理
export const apiGetAllKnowledgeBaseByFilter = (data) =>
  fetchDataCall("GetAllKnowledgeBaseByFilter", "post", data); //依據條件取得所有知識庫列表
export const apiAddKnowledgeBase = (data) =>
  fetchDataCall("AddKnowledgeBase", "put", data); //新增指定機台的知識庫
export const apiGetMachineOptions = (data) =>
  fetchDataCall("GetMachineOptions", "get", data); //取得機台內容
//#endregion

//#region SOP
export const apiGetAllKnowledgeBaseByMachineAddId = (data) =>
  fetchDataCall("GetAllKnowledgeBaseByMachineAddId", "post", data); //依據MachineAddId取得所有 故障說明
export const apiSaveKnowledgeBase = (data) =>
  fetchDataCallFile("SaveKnowledgeBase", "put", data); //儲存 故障說明 資訊
export const apiSaveSOP2 = (data) => fetchDataCallFile("SaveSOP2", "put", data); //新增SOP2
//#endregion

// 在../utils/Api.js

// // 模擬數據
// const machines = [
//   {
//     machineAddId: 1,
//     machineName: "CNC旋削機",
//     machineType: "CNC",
//     modelSeries: "XJ-900",
//     machineImage: "/detron_data/For Model.jpg",
//     machineDeviceId: 101,
//   },
//   {
//     machineAddId: 2,
//     machineName: "雷射切割機",
//     machineType: "Laser",
//     modelSeries: "LZ-400",
//     machineImage: "/detron_data/SolenoidValveStep3-3.png",
//     machineDeviceId: 102,
//   },
// ];

// // 模擬API呼叫
// export const apiMachineAddOverview = async (sendData) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         code: "0000",
//         result: machines.filter((machine) =>
//           machine.machineName.includes(sendData.keyword),
//         ),
//       });
//     }, 1000);
//   });
// };

// export const apiGetOneMachineAdd = async (sendData) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const machine = machines.find((m) => m.machineId === sendData.MachineId);
//       resolve({ code: "0000", result: machine || null });
//     }, 1000);
//   });
// };

// export const apiMachineAddInfo = async (formData) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       // 假定這裡是處理表單數據，根據 machineId 判斷是新增還是修改
//       const existingIndex = machines.findIndex(
//         (m) => m.machineId === parseInt(formData.get("machineId")),
//       );
//       if (existingIndex > -1) {
//         // 更新現有機台資訊
//         machines[existingIndex] = {
//           ...machines[existingIndex],
//           ...Object.fromEntries(formData),
//         };
//         resolve({ code: "0000", result: machines[existingIndex] });
//       } else {
//         // 新增機台
//         const newMachine = {
//           ...Object.fromEntries(formData),
//           machineId: machines.length + 1,
//         };
//         machines.push(newMachine);
//         resolve({ code: "0000", result: newMachine });
//       }
//     }, 1000);
//   });
// };

// // export const apiMachineAddInfo = (data) =>
// //   fetchDataCallFile("MachineInfo", "put", data); //新增/編輯機台

// export const apiDeleteMachineAdd = async (sendData) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const index = machines.findIndex((m) => m.machineId === sendData.id);
//       if (index > -1) {
//         machines.splice(index, 1);
//         resolve({ code: "0000" });
//       } else {
//         resolve({ code: "0001", message: "Machine not found" });
//       }
//     }, 1000);
//   });
// };

// export const apiGetOneMachineAddDevice = async (sendData) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const machine = machines.find(
//         (m) => m.machineDeviceId === sendData.MachineDeviceId,
//       );
//       resolve({ code: "0000", result: machine || null });
//     }, 1000);
//   });
// };

// export const apiEditMachineAddDevice = async (machineDevice) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const index = machines.findIndex(
//         (m) => m.machineDeviceId === machineDevice.machineDeviceId,
//       );
//       if (index > -1) {
//         // 更新設備資訊
//         machines[index] = { ...machines[index], ...machineDevice };
//         resolve({ code: "0000", result: machines[index] });
//       } else {
//         resolve({ code: "0001", message: "Device not found" });
//       }
//     }, 1000);
//   });
// };
