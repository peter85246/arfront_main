import axios from 'axios';
import { getAuthToken, removeAuthToken, setAuthToken } from './TokenUtil';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

// 新增：设置用户 schema
export const setUserSchema = (userId) => {
  const schema = `user_${userId}`;
  localStorage.setItem('schema_name', schema);
  console.log(`Schema set to: ${schema}`);
};

// 修改：获取 headers，包括 schema
let getHeaders = () => {
  const schema = localStorage.getItem('schema_name') || 'public';
  console.log('Current Schema in Header:', schema);
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: 'Bearer ' + getAuthToken(),
    'X-Schema-Name': schema,
  };
};

//#region AR管理API
export const fetchDataCall = async (
  api,
  method,
  payload = null,
  download = false
) => {
  var config = {
    method: method,
    url: `${window.apiUrl}/api/${api}`,
    headers: getHeaders(),
    params: null,
    data: null,
  };

  console.log(
    `Sending request to ${api} with schema:`,
    config.headers['X-Schema-Name']
  );

  if (method == 'get') {
    if (payload != null) {
      Object.keys(payload).forEach((key) => {
        if (payload[key] === '') {
          delete payload[key];
        }
      });
    }
    config.params = payload;
  } else {
    config.data = payload;
  }

  if (download) {
    config.responseType = 'blob';
  }

  let apiReturn = await axios
    .request(config)
    .then(async function (response) {
      if (response.data.token != null) {
        setAuthToken(response.data.token);
      }

      if (response.data.code == '1001') {
        removeAuthToken();
        window.location.href = '/';
      }
      if (!download) {
        return response.data;
      } else {
        return response;
      }
    })
    .catch(function (error) {
      // console.log(error);
      console.error(`Error in ${api}:`, error);
    });

  return apiReturn;
};

// export const fetchDataCallFile = async (api, method, data) => {
//   let apiReturn = await axios
//     .put(`${window.apiUrl}/api/${api}`, data, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//         Accept: 'application/json',
//         Authorization: 'Bearer ' + getAuthToken(),
//       },
//     })
//     .then(async function (response) {
//       if (response.data.token != null) {
//         setAuthToken(response.data.token);
//       }

//       if (response.data.code == '1001') {
//         removeAuthToken();
//         window.location.href = '/';
//       }
//       return response.data;
//     })
//     .catch((error) => {
//       console.log(error);
//       console.log(JSON.stringify(error.response.data.errors));
//     });
//   return apiReturn;
// };
// 修改：fetchDataCallFile 函数，添加 schema
export const fetchDataCallFile = async (api, method, data) => {
  const headers = getHeaders();
  headers['Content-Type'] = 'multipart/form-data';

  console.log(
    `Sending file request to ${api} with schema:`,
    headers['X-Schema-Name']
  );

  let apiReturn = await axios
    .put(`${window.apiUrl}/api/${api}`, data, { headers })
    .then(async function (response) {
      console.log(`Response from ${api}:`, response.data);
      if (response.data.token != null) {
        setAuthToken(response.data.token);
      }

      if (response.data.code == '1001') {
        removeAuthToken();
        window.location.href = '/';
      }
      return response.data;
    })
    .catch((error) => {
      console.error(`Error in ${api}:`, error);
    });
  return apiReturn;
};
//#endregion

//#region 共用
export const apiMyUserData = (data) => fetchDataCall('myUserData', 'get'); //取得使用者
export const apiChangePaw = (data) => fetchDataCall('ChangePaw', 'put', data); //變更密碼
//#endregion

//#region 登入
// export const apiSignIn = (data) => fetchDataCall('signIn', 'post', data); //使用者登入
export const apiSignIn = async (data) => {
  const response = await fetchDataCall('signIn', 'post', data);
  if (response.code === '0000' && response.result && response.result.userId) {
    setUserSchema(response.result.userId);
  }
  return response;
};
//#endregion

//#region 註冊與驗證碼API
export const apiSendVerificationCode = (email) =>
  fetchDataCall('send-verification-code', 'post', { email });
export const apiVerifyCode = (email, code) =>
  fetchDataCall('verify-email', 'post', { email, code });
export const apiSignUp = (data) => fetchDataCall('register-user', 'post', data);
//#endregion

//#region 使用者管理
export const apiGetAllUserinfoByFilter = (data) =>
  fetchDataCall('GetAllUserinfoByFilter', 'post', data); //依據條件取得所有使用者列表
export const apiAddUserinfo = (data) =>
  fetchDataCall('AddUserinfo', 'put', data); //新增使用者
export const apiEditUserinfo = (data) =>
  fetchDataCall('EditUserinfo', 'put', data); //修改使用者
export const apiDeleteUserinfo = (data) =>
  fetchDataCall('DeleteUserinfo', 'delete', data); //刪除使用者
export const apiUserinfoChangePaw = (data) =>
  fetchDataCall('UserinfoChangePaw', 'put', data); //使用者修改密碼
//#endregion

//#region AR設備控制
export const apiMachineOverview = (data) =>
  fetchDataCall('MachineOverview', 'post', data); //機台列表
export const apiGetOneMachine = (data) =>
  fetchDataCall('GetOneMachine', 'post', data); //取得單一機台
// export const apiMachineInfo = (data) =>
//   fetchDataCallFile('MachineInfo', 'put', data); //新增/編輯機台
export const apiMachineInfo = async (formData) => {
  console.log('Sending formData to MachineInfo API');
  const headers = getHeaders();
  delete headers['Content-Type']; // Let the browser set the correct content type for FormData

  try {
    const response = await axios.put(
      `${window.apiUrl}/api/MachineInfo`,
      formData,
      { headers }
    );
    console.log('Response from MachineInfo API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in MachineInfo API:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    throw error;
  }
};

export const apiDeleteMachine = (data) =>
  fetchDataCall('DeleteMachine', 'delete', data); //刪除機台
export const apiGetOneMachineDevice = (data) =>
  fetchDataCall('GetOneMachineDevice', 'post', data); //取得單一一筆機台設備
export const apiEditMachineDevice = (data) =>
  fetchDataCall('EditMachineDevice', 'put', data); //修改機台設備
//#endregion

//#region 機台Alarm管理
export const apiGetAllMachineAlarmByFilter = (data) =>
  fetchDataCall('GetAllMachineAlarmByFilter', 'post', data); //依據條件取得指定機台的所有Alarm
export const apiGetOneMachineAlarm = (data) =>
  fetchDataCall('GetOneMachine', 'post', data); //取得指定機台的單一Alarm
export const apiAddMachineAlarm = (data) =>
  fetchDataCall('AddMachineAlarm', 'put', data); //新增指定機台的Alarm
export const apiEditMachineAlarm = (data) =>
  fetchDataCall('EditMachineAlarm', 'put', data); //修改指定機台的Alarm
export const apiDeleteMachineAlarm = (data) =>
  fetchDataCall('DeleteMachineAlarm', 'delete', data); //刪除指定機台的Alarm
//#endregion

//#region SOP
export const apiGetAllSOPByMachineAlarmId = (data) =>
  fetchDataCall('GetAllSOPByMachineAlarmId', 'post', data); //依據AlarmId取得所有SOP
export const apiSaveSOP = (data) => fetchDataCallFile('SaveSOP', 'put', data); //儲存SOP
//#endregion

//#region 機台IOT
export const apiIOTOverview = (data) =>
  fetchDataCall('IOTOverview', 'post', data); //IOT列表
export const apiDeleteMachineIOT = (data) =>
  fetchDataCall('DeleteMachineIOT', 'delete', data); //刪除IOT

export const apiGetOneMachineIOT = (data) =>
  fetchDataCall('GetOneMachineIOT', 'post', data); //取得單一IOT資訊
export const apiSaveMachineIOT = (data) =>
  fetchDataCall('SaveMachineIOT', 'put', data); //取得單一IOT資訊
//#endregion

//#region 機台管理
export const apiMachineAddOverview = (data) =>
  fetchDataCall('MachineAddOverview', 'post', data); //機台列表
export const apiGetOneMachineAdd = (data) =>
  fetchDataCall('GetOneMachineAdd', 'post', data); //取得單一機台
export const apiMachineAddInfo = (data) =>
  fetchDataCallFile('MachineAddInfo', 'put', data); //新增/編輯機台
export const apiDeleteMachineAdd = (data) =>
  fetchDataCall('DeleteMachineAdd', 'delete', data); //刪除機台
//#endregion

//#region 知識庫管理
export const apiGetAllKnowledgeBaseByFilter = (data) =>
  fetchDataCall('GetAllKnowledgeBaseByFilter', 'post', data); //依據條件取得所有知識庫列表
export const apiAddKnowledgeBase = (data) =>
  fetchDataCall('AddKnowledgeBase', 'put', data); //新增指定機台的知識庫
export const apiGetMachineOptions = (data) =>
  fetchDataCall('GetMachineOptions', 'get', data); //取得機台內容
//#endregion

//#region SOP
export const apiGetAllKnowledgeBaseByMachineAddId = (data) =>
  fetchDataCall('GetAllKnowledgeBaseByMachineAddId', 'post', data); //依據MachineAddId取得所有 故障說明
export const apiSaveKnowledgeBase = (data) =>
  fetchDataCallFile('SaveKnowledgeBase', 'put', data); //儲存 故障說明 資訊
export const apiSaveSOP2 = (data) => fetchDataCallFile('SaveSOP2', 'put', data); //新增SOP2

export const apiGetAllSOPByMachineAddId = (data) =>
  fetchDataCall('GetAllSOPByMachineAddId', 'post', data); //取得SOP2
//#endregion

//#region MindMap
export const apiGetMachineAddMindMap = (data) =>
  fetchDataCall('GetMachineAddMindMap', 'get', data);
//#endregion

// Mail帳號註冊
export const apiVendorSignIn = (data) =>
  fetchDataCall('VendorRegistration/login', 'post', data);
export const apiVendorSignUp = (data) =>
  fetchDataCall('VendorRegistration/register', 'post', data);
export const apiVendorSendVerificationCode = (data) =>
  fetchDataCall('VendorRegistration/send-verification-code', 'post', data);
export const apiVendorVerifyCode = (data) =>
  fetchDataCall('VendorRegistration/verify-email', 'post', data);
//#endregion

//#region 更新上傳 PDF 的方法
export const apiUploadAndBackupPdf = async (file) => {
  const schemaName = localStorage.getItem('schema_name') || 'public';
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let fileName = '';

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const chunk = file.slice(
      chunkIndex * CHUNK_SIZE,
      (chunkIndex + 1) * CHUNK_SIZE
    );
    const formData = new FormData();
    formData.append('file', chunk, file.name);
    formData.append('schemaName', schemaName);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());

    try {
      const response = await axios.put(
        `${window.apiUrl}/api/Pdf/upload-chunk`,
        formData,
        {
          headers: {
            ...getHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.code !== '0000') {
        throw new Error(response.data.message);
      }

      if (chunkIndex === totalChunks - 1) {
        fileName = response.data.result; // 直接使用後端返回的文件名
        console.log('Received file name from backend:', fileName); // 添加日誌
        return { fileName, ...response.data };
      }
    } catch (error) {
      console.error(
        `Error uploading chunk ${chunkIndex + 1}/${totalChunks}:`,
        error
      );
      throw error;
    }
  }
};
//#endregion
