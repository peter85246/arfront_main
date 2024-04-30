import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next"; //語系
import { useNavigate } from "react-router-dom";
import { DebounceInput } from "react-debounce-input";
import { ToastContainer, toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";
import { setWindowClass, removeWindowClass } from "../utils/helpers";
import SimpleReactValidator from "simple-react-validator";
import Modal from "react-bootstrap/Modal";
import Pagination from "react-bootstrap/Pagination";

import {
  apiMachineOverview,
  apiGetOneMachine,
  apiMachineInfo,
  apiDeleteMachine,
  apiGetOneMachineDevice,
  apiEditMachineDevice,
} from "../utils/Api";

function Machine() {
  const { t } = useTranslation();
  const navigate = useNavigate(); //跳轉Router
  const validator = new SimpleReactValidator({
    autoForceUpdate: this,
  });
  const [keyword, setKeyword] = useState(""); //關鍵字
  const [machineList, setMachineList] = useState([]); //機台列表(全部資料)
  const [showMachineList, setShowMachineList] = useState([]); //機台列表(顯示前端)

  const [showMachineinfoModal, setShowMachineinfoModal] = useState(false); //顯示"機台 modal"
  const [machineInfo, setMachineInfo] = useState({
    //新增以及修改內容
    machineId: 0,
    machineCode: "", //機台ID
    machineType: "", //機台種類
    modelSeries: "", //型號系列
    machineName: "", //機台名稱
    machineSpec: "", //機台規格
    machineImage: "", //機台圖片路徑
    machineImageObj: null, //機台圖片物件
    isDeletedMachineImage: false, //是否刪除圖片
    machineFile: "", //AR檔案路徑
    machineFileObj: null, //AR檔案物件
    isDeletedMachineFile: false, //是否刪除AR檔案
  });
  const [machineInfoErrors, setMachineInfoErrors] = useState({
    //錯誤訊息
    machineCode: "", //機台ID
    machineType: "", //機台種類
    modelSeries: "", //型號系列
    machineName: "", //機台名稱
    machineSpec: "", //機台規格
    machineImage: "", //機台圖片路徑
    machineFile: "", //AR檔案路徑
  });
  const inputImageRef = useRef(null); //input File類型的圖片
  const [saveMachineinfoLoading, setSaveMachineinfoLoading] = useState(false); //儲存的轉圈圈

  const [selectDeleteMachineId, setSelectDeleteMachineId] = useState(0); //要刪除的機台id
  const [showDeleteMachineModal, setShowDeleteMachineModal] = useState(false); //顯示"刪除機台 modal"
  const [saveDeleteMachineLoading, setSaveDeleteMachineLoading] =
    useState(false);

  const [showMachineDeviceModal, setShowMachineDeviceModal] = useState(false); //顯示機台設備"modal"

  const [machineDevice, setMachineDevice] = useState({
    //機台設備
    machineDeviceId: 0,
    machineId: 0,
    machineCode: 0,
    machineDeviceControlerModel: "", //控制器模組
    machineDeviceServerIP: "", //伺服器IP
    machineDeviceServerPort: "", //伺服器port
    machineDeviceMachineIP: "", //機台IP
  });

  const [machineDeviceErrors, setMachineDeviceErrors] = useState({
    //機台設備 - 錯誤訊息
    machineDeviceControlerModel: "", //控制器模組
    machineDeviceServerIP: "", //伺服器IP
    machineDeviceServerPort: "", //伺服器port
    machineDeviceMachineIP: "", //機台IP
  });

  const [saveMachineDeviceLoading, setSaveMachineDeviceLoading] =
    useState(false); //機台設備儲存的轉圈圈

  //#region 初始載入
  useEffect(() => {
    removeWindowClass("login-page");

    const fetchData = async () => {
      await refreshMachineinfos();
    };

    fetchData();
  }, [keyword]);
  //#endregion

  //#region 刷新機台列表
  const refreshMachineinfos = async () => {
    var sendData = {
      keyword: keyword,
    };

    let machineOverviewResponse = await apiMachineOverview(sendData);
    if (machineOverviewResponse) {
      if (machineOverviewResponse.code == "0000") {
        setMachineList(machineOverviewResponse.result);
        setShowMachineList(
          machineOverviewResponse.result.slice(
            activePage * pageRow - pageRow,
            activePage * pageRow,
          ),
        );
      }
    }
  };
  //#endregion

  //#region 頁碼
  let pageRow = 12; //一頁幾筆
  const [activePage, setActivePage] = useState(1); //目前停留頁碼
  let pages = []; //頁碼
  for (
    let number = 1;
    number <= Math.ceil(machineList.length / pageRow);
    number++
  ) {
    pages.push(
      <Pagination.Item
        key={number}
        active={number === activePage}
        onClick={(e) => handleChangePage(e, number)}
      >
        {number}
      </Pagination.Item>,
    );
  }

  const handleChangePage = async (e, number) => {
    setActivePage(number);
    setShowMachineList(
      machineList.slice(number * pageRow - pageRow, number * pageRow),
    );
  };
  //#endregion

  //#region 關鍵字
  const handleChangeKeyword = async (e) => {
    const { name, value } = e.target;
    setKeyword(value);
  };
  //#endregion

  //#region 開啟機台Modal
  const handleOpenMachineinfoModal = async (machineId) => {
    //e.preventDefault();

    if (machineId == 0) {
      setMachineInfo({
        machineId: 0,
        machineCode: "", //機台ID
        machineType: "", //機台種類
        modelSeries: "", //型號系列
        machineName: "", //機台名稱
        machineSpec: "", //機台規格
        machineImage: "", //機台圖片路徑
        machineImageObj: null, //機台圖片物件
        isDeletedMachineImage: false, //是否刪除圖片
        machineFile: "", //AR檔案路徑
        machineFileObj: null, //AR檔案物件
        isDeletedMachineFile: false, //是否刪除AR檔案
      });
    } else {
      var sendData = {
        MachineId: machineId,
      };

      let getOneMachineResponse = await apiGetOneMachine(sendData);
      if (getOneMachineResponse) {
        if (getOneMachineResponse.code == "0000") {
          setMachineInfo(getOneMachineResponse.result);
        }
      }
    }

    setMachineInfoErrors({
      //錯誤訊息
      machineCode: "", //機台ID
      machineType: "", //機台種類
      modelSeries: "", //型號系列
      machineName: "", //機台名稱
      machineSpec: "", //機台規格
      machineImage: "", //機台圖片檔名
      machineFile: "", //AR檔案檔名
    });
    setSaveMachineinfoLoading(false);
    setShowMachineinfoModal(true);
  };
  //#endregion

  //#region 關閉機台Modal
  const handleCloseMachineinfoModal = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setShowMachineinfoModal(false);
  };
  //#endregion

  //#region 修改機台 改變Input的欄位
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setMachineInfo({ ...machineInfo, [name]: value });
  };
  //#endregion

  //#region 修改機台 失去焦點Input的欄位
  const handleEditBlur = async (e) => {
    const { name, value } = e.target;

    await checkEditValidator(name);
  };
  //#endregion

  //#region 機台 欄位驗證
  const checkEditValidator = async (name = "", val = "") => {
    let result = true;
    let newMachineInfoErrors = { ...machineInfoErrors };

    if (name == "machineCode" || name == "") {
      if (!validator.check(machineInfo.machineCode, "required")) {
        newMachineInfoErrors.machineCode = "required";
        result = false;
      } else if (!validator.check(machineInfo.machineCode, "max:100")) {
        newMachineInfoErrors.machineCode = "max";
        result = false;
      } else {
        newMachineInfoErrors.machineCode = "";
      }
    }

    if (name == "machineType" || name == "") {
      if (!validator.check(machineInfo.machineType, "required")) {
        newMachineInfoErrors.machineType = "required";
        result = false;
      } else if (!validator.check(machineInfo.machineType, "max:100")) {
        newMachineInfoErrors.machineType = "max";
        result = false;
      } else {
        newMachineInfoErrors.machineType = "";
      }
    }

    if (name == "modelSeries" || name == "") {
      if (!validator.check(machineInfo.modelSeries, "required")) {
        newMachineInfoErrors.modelSeries = "required";
        result = false;
      } else if (!validator.check(machineInfo.modelSeries, "max:100")) {
        newMachineInfoErrors.modelSeries = "max";
        result = false;
      } else {
        newMachineInfoErrors.modelSeries = "";
      }
    }

    if (name == "machineName" || name == "") {
      if (!validator.check(machineInfo.machineName, "required")) {
        newMachineInfoErrors.machineName = "required";
        result = false;
      } else if (!validator.check(machineInfo.machineName, "max:100")) {
        newMachineInfoErrors.machineName = "max";
        result = false;
      } else {
        newMachineInfoErrors.machineName = "";
      }
    }

    if (name == "machineSpec" || name == "") {
      if (!validator.check(machineInfo.machineSpec, "required")) {
        newMachineInfoErrors.machineSpec = "required";
        result = false;
      } else if (!validator.check(machineInfo.machineSpec, "max:100")) {
        newMachineInfoErrors.machineSpec = "max";
        result = false;
      } else {
        newMachineInfoErrors.machineSpec = "";
      }
    }

    if (name == "") {
      if (newMachineInfoErrors.machineImage != "") {
        result = false;
      }

      if (newMachineInfoErrors.machineFile != "") {
        result = false;
      }
    }

    setMachineInfoErrors(newMachineInfoErrors);
    return result;
  };
  //#endregion

  //#region 上傳圖片按鈕
  const handleUploadImageBtn = (e) => {
    e.preventDefault();
    inputImageRef.current.click();
  };
  //#endregion

  //#region 上傳圖片Change事件
  const onImageChange = (e) => {
    var file, img;
    file = e.target.files[0];
    let newMachineInfo = { ...machineInfo };
    let newMachineInfoErrors = { ...machineInfoErrors };
    if (file != null) {
      let newMachineInfoErrors = { ...machineInfoErrors };
      var fileExtension = file.name
        .substr(file.name.lastIndexOf(".") + 1 - file.name.length)
        .toLowerCase();
      if (
        !(
          fileExtension == "png" ||
          fileExtension == "jpg" ||
          fileExtension == "jpeg"
        )
      ) {
        newMachineInfoErrors.machineImage = "format";
        newMachineInfo.machineImageObj = null;

        setMachineInfoErrors(newMachineInfoErrors);
      } else {
        var img = new Image();
        var objectUrl = URL.createObjectURL(file);
        img.onload = function () {
          if (!(img.width == "640" && img.height == "480")) {
            newMachineInfoErrors.machineImage = "size";
          } else {
            newMachineInfoErrors.machineImage = "";
          }

          newMachineInfo.machineImageObj = file;
          if (newMachineInfo.machineImage != "") {
            newMachineInfo.isDeletedMachineImage = true;
          }

          setMachineInfoErrors(newMachineInfoErrors);
        };
        img.src = objectUrl;
      }
    } else {
      newMachineInfo.machineImageObj = null;
      newMachineInfoErrors.machineImage = "";
    }

    setMachineInfo(newMachineInfo);
    setMachineInfoErrors(newMachineInfoErrors);
  };
  //#endregion

  //#region 移除圖片按鈕
  const handleRemoveImageBtn = (e) => {
    e.preventDefault();
    let newMachineInfo = { ...machineInfo };

    newMachineInfo.machineImage = "";
    newMachineInfo.machineImageObj = null;
    newMachineInfo.isDeletedMachineImage = true;

    setMachineInfo(newMachineInfo);

    let newMachineInfoErrors = { ...machineInfoErrors };

    newMachineInfoErrors.machineImage = "";

    setMachineInfoErrors(newMachineInfoErrors);
  };
  //#endregion

  //#region 上傳檔案事件
  const onFileChange = (e) => {
    let newMachineInfo = { ...machineInfo };
    let newMachineInfoErrors = { ...machineInfoErrors };
    var file = e.target.files[0];
    if (file != null) {
      var fileExtension = file.name
        .substr(file.name.lastIndexOf(".") + 1 - file.name.length)
        .toLowerCase();
      if (!(fileExtension == "zip")) {
        newMachineInfoErrors.machineFile = "format";
        newMachineInfo.machineFileObj = null;
      } else {
        newMachineInfoErrors.machineFile = "";
        newMachineInfo.machineFileObj = file;
        if (newMachineInfo.machineFile != "") {
          newMachineInfo.isDeletedMachineFile = true;
        }
      }
      setMachineInfoErrors(newMachineInfoErrors);
    }
    setMachineInfo(newMachineInfo);
  };
  //#endregion

  //#region 移除檔案按鈕
  const handleRemoveFileBtn = (e) => {
    e.preventDefault();
    let newMachineInfo = { ...machineInfo };

    newMachineInfo.machineFile = "";
    newMachineInfo.machineFileObj = null;
    newMachineInfo.isDeletedMachineFile = true;

    setMachineInfo(newMachineInfo);
  };
  //#endregion

  //#region 儲存機台
  const handleSaveMachineinfo = async (e) => {
    e.preventDefault();

    let newMachineInfoErrors = { ...machineInfoErrors };
    let newMachineInfo = { ...machineInfo };
    if (newMachineInfoErrors.machineImage != "") {
      newMachineInfo.machineImageObj = null;
    }

    if (newMachineInfoErrors.machineFile != "") {
      newMachineInfo.machineFileObj = null;
    }

    if (await checkEditValidator()) {
      setSaveMachineinfoLoading(true);

      var formData = new FormData();
      formData.append("machineId", newMachineInfo.machineId);
      formData.append("machineCode", newMachineInfo.machineCode);
      formData.append("machineType", newMachineInfo.machineType);
      formData.append("modelSeries", newMachineInfo.modelSeries);
      formData.append("machineName", newMachineInfo.machineName);
      formData.append("machineSpec", newMachineInfo.machineSpec);
      formData.append("machineImage", newMachineInfo.machineImage);
      formData.append("machineImageObj", newMachineInfo.machineImageObj);
      formData.append(
        "isDeletedMachineImage",
        newMachineInfo.isDeletedMachineImage,
      );
      formData.append("machineFile", newMachineInfo.machineFile);
      formData.append("machineFileObj", newMachineInfo.machineFileObj);
      formData.append(
        "isDeletedMachineFile",
        newMachineInfo.isDeletedMachineFile,
      );

      let machineInfoResponse = await apiMachineInfo(formData);
      if (machineInfoResponse) {
        if (machineInfoResponse.code == "0000") {
          toast.success(
            newMachineInfo.machineId == 0
              ? t("toast.add.success")
              : t("toast.edit.success"),
            {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 3000,
              hideProgressBar: true,
              closeOnClick: false,
              pauseOnHover: false,
            },
          );

          setShowMachineinfoModal(false);
          await refreshMachineinfos();
        } else {
          toast.error(machineInfoResponse.message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
          });
        }
        setSaveMachineinfoLoading(false);
      } else {
        setSaveMachineinfoLoading(false);
      }
    }
  };
  //#endregion

  //#region 開啟刪除機台Modal
  const handleOpenDeleteMachineModal = (machineId) => {
    setSelectDeleteMachineId(machineId);
    setShowDeleteMachineModal(true);
  };
  //#endregion

  //#region 關閉刪除機台Modal
  const handleCloseDeleteMachineModal = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setShowDeleteMachineModal(false);
  };
  //#endregion

  //#region 儲存刪除機台
  const handleSaveDeleteMachine = async (e) => {
    e.preventDefault();

    setSaveDeleteMachineLoading(true);

    var sendData = {
      id: selectDeleteMachineId,
    };

    let deleteMachineResponse = await apiDeleteMachine(sendData);
    if (deleteMachineResponse) {
      if (deleteMachineResponse.code == "0000") {
        toast.success(t("toast.delete.success"), {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
        });

        setShowDeleteMachineModal(false);
        await refreshMachineinfos();
      } else {
        toast.error(deleteMachineResponse.message, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
        });
      }
      setSaveDeleteMachineLoading(false);
    } else {
      setSaveDeleteMachineLoading(false);
    }
  };
  //#endregion

  //#region 開啟機台設備Modal
  const handleOpenMachineDeviceModal = async (machineDeviceId) => {
    var sendData = {
      MachineDeviceId: machineDeviceId,
    };

    let getOneMachineDeviceResponse = await apiGetOneMachineDevice(sendData);
    if (getOneMachineDeviceResponse) {
      if (getOneMachineDeviceResponse.code == "0000") {
        setMachineDevice(getOneMachineDeviceResponse.result);
      }
    }
    setMachineDeviceErrors({
      //錯誤訊息
      MachineDeviceControlerModel: "", //控制器模組
      MachineDeviceServerIP: "", //伺服器IP
      MachineDeviceServerPort: "", //伺服器port
      MachineDeviceMachineIP: "", //機台IP
    });
    setShowMachineDeviceModal(true);
  };
  //#endregion

  //#region 關閉機台設備Modal
  const handleCloseMachineDeviceModal = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setShowMachineDeviceModal(false);
  };
  //#endregion

  //#region 修改機台設備 改變Input的欄位
  const handleEditMachineDeviceChange = (e) => {
    const { name, value } = e.target;
    setMachineDevice({ ...machineDevice, [name]: value });
  };
  //#endregion

  //#region 修改機台設備 失去焦點Input的欄位
  const handleEditMachineDeviceBlur = async (e) => {
    const { name, value } = e.target;

    await checkEditMachineDeviceValidator(name);
  };
  //#endregion

  //#region 機台設備 欄位驗證
  const checkEditMachineDeviceValidator = async (name = "", val = "") => {
    let result = true;
    let newMachineDeviceErrors = { ...machineDeviceErrors };

    if (name == "machineDeviceControlerModel" || name == "") {
      if (
        !validator.check(machineDevice.machineDeviceControlerModel, "required")
      ) {
        newMachineDeviceErrors.machineDeviceControlerModel = "required";
        result = false;
      } else if (
        !validator.check(machineDevice.machineDeviceControlerModel, "max:100")
      ) {
        newMachineDeviceErrors.machineDeviceControlerModel = "max";
        result = false;
      } else {
        newMachineDeviceErrors.machineDeviceControlerModel = "";
      }
    }

    if (name == "machineDeviceServerIP" || name == "") {
      if (!validator.check(machineDevice.machineDeviceServerIP, "required")) {
        newMachineDeviceErrors.machineDeviceServerIP = "required";
        result = false;
      } else if (
        !validator.check(machineDevice.machineDeviceServerIP, "max:20")
      ) {
        newMachineDeviceErrors.machineDeviceServerIP = "max";
        result = false;
      } else {
        newMachineDeviceErrors.machineDeviceServerIP = "";
      }
    }

    if (name == "machineDeviceServerPort" || name == "") {
      if (!validator.check(machineDevice.machineDeviceServerPort, "required")) {
        newMachineDeviceErrors.machineDeviceServerPort = "required";
        result = false;
      } else if (
        !validator.check(
          machineDevice.machineDeviceServerPort.toString(),
          "max:10",
        )
      ) {
        newMachineDeviceErrors.machineDeviceServerPort = "max";
        result = false;
      } else if (
        !validator.check(machineDevice.machineDeviceServerPort, "integer")
      ) {
        newMachineDeviceErrors.machineDeviceServerPort = "numeric";
        result = false;
      } else {
        newMachineDeviceErrors.machineDeviceServerPort = "";
      }
    }

    if (name == "machineDeviceMachineIP" || name == "") {
      if (!validator.check(machineDevice.machineDeviceMachineIP, "required")) {
        newMachineDeviceErrors.machineDeviceMachineIP = "required";
        result = false;
      } else if (
        !validator.check(machineDevice.machineDeviceMachineIP, "max:20")
      ) {
        newMachineDeviceErrors.machineDeviceMachineIP = "max";
        result = false;
      } else {
        newMachineDeviceErrors.machineDeviceMachineIP = "";
      }
    }

    setMachineDeviceErrors(newMachineDeviceErrors);
    return result;
  };
  //#endregion

  //#region 儲存機台設備
  const handleSaveMachineDevice = async (e) => {
    e.preventDefault();

    if (await checkEditMachineDeviceValidator()) {
      setSaveMachineDeviceLoading(true);

      let editMachineDeviceResponse = await apiEditMachineDevice(machineDevice);
      if (editMachineDeviceResponse) {
        if (editMachineDeviceResponse.code == "0000") {
          toast.success(t("toast.edit.success"), {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
          });

          setShowMachineDeviceModal(false);
        } else {
          toast.error(editMachineDeviceResponse.message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
          });
        }
        setSaveMachineDeviceLoading(false);
      } else {
        setSaveMachineDeviceLoading(false);
      }
    }
  };
  //#endregion

  //#region 前往機台IOT
  const handleGotoMachineIOT = (machineId) => {
    navigate(`/machine/${machineId}/machineIOTList`);
  };
  //#endregion

  //#region 前往機台Alarm
  const handleGotoMachineAlarm = (machineId) => {
    navigate(`/machine/${machineId}/machineAlarm`);
  };
  //#endregion

  return (
    <>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 justify-content-between align-items-center">
            <div />
            <div className="content-header-text-color">
              <h1>
                <strong>
                  {t("machine.content.header")}
                  {/*機台管理*/}
                </strong>
              </h1>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-add"
              onClick={() => handleOpenMachineinfoModal(0)}
            >
              <i className="fas fa-plus"></i> {t("machine.btn.add")}
              {/*新增機台*/}
            </button>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid container-fluid-border">
          <div className="row justify-content-end mb-3">
            <div className="col-3">
              <div className="from-item search">
                <DebounceInput
                  debounceTimeout={300}
                  type="search"
                  placeholder={t("keyword.placeholder")}
                  onChange={(e) => handleChangeKeyword(e)}
                />
                {/*請輸入關鍵字*/}
              </div>
            </div>
          </div>

          <div className="row">
            {machineList && machineList.length > 0 ? (
              showMachineList && showMachineList.length > 0 ? (
                showMachineList.map((item, index) => {
                  return (
                    <div key={index} className="col-12 col-sm-4 col-md-3">
                      <div className="card">
                        <div className="card-header">
                          <div className="row">
                            <div className="col-8 h3">{item.machineCode}</div>
                            <div className="col-4 d-flex justify-content-end px-1">
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-circle btn-sm"
                                onClick={() =>
                                  handleOpenMachineinfoModal(item.machineId)
                                }
                              >
                                <i className="fas fa-pencil-alt"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-circle btn-sm ml-1"
                                onClick={() =>
                                  handleOpenDeleteMachineModal(item.machineId)
                                }
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                        {item.machineImage != "" ? (
                          <img
                            className="card-img-top"
                            src={item.machineImage}
                            alt={item.machineCode}
                            style={{ minHeight: "292px" }}
                          />
                        ) : (
                          <img
                            src="/default-image.jpg"
                            style={{ minHeight: "292px" }}
                          />
                        )}
                        <div className="card-body">
                          <h3 className="mb-0"></h3>
                          <h4 className="mb-0">{item.machineName}</h4>
                          <h4 className="mb-0">{item.machineSpec}</h4>
                          <h4 className="mb-0">{item.machineType}</h4>
                          <h4 className="mb-0">{item.modelSeries}</h4>
                        </div>
                        <div className="card-footer">
                          <div className="text-muted row justify-content-center">
                            <button
                              type="button"
                              className="btn btn-info col-3 mt-2"
                              onClick={() =>
                                handleGotoMachineAlarm(item.machineId)
                              }
                            >
                              SOP
                            </button>
                            <button
                              type="button"
                              className="btn btn-info col-3 offset-md-1 mt-2"
                              onClick={() =>
                                handleOpenMachineDeviceModal(
                                  item.machineDeviceId,
                                )
                              }
                            >
                              Device
                            </button>
                            <button
                              type="button"
                              className="btn btn-info col-3 offset-md-1 mt-2"
                              onClick={() =>
                                handleGotoMachineIOT(item.machineId)
                              }
                            >
                              IOT
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-100 d-flex justify-content-center">
                  <label>
                    {t("machine.searchEmpty")}
                    {/*查無機台*/}
                  </label>
                </div>
              )
            ) : (
              <div className="w-100 d-flex justify-content-center">
                <label>
                  {t("machine.empty")}
                  {/*尚無資料*/}
                </label>
              </div>
            )}
          </div>
          <Pagination className="d-flex justify-content-center">
            {pages}
          </Pagination>
        </div>
      </section>
      <div className="row">
        {machineList && machineList.length > 0 ? (
          showMachineList && showMachineList.length > 0 ? (
            showMachineList.map((item, index) => {
              return (
                <div key={index} className="col-12 col-sm-4 col-md-3">
                  <div className="card">
                    <div className="card-header">
                      <div className="row">
                        <div className="col-8 h3">{item.machineCode}</div>
                        <div className="col-4 d-flex justify-content-end px-1">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-circle btn-sm"
                            onClick={() =>
                              handleOpenMachineinfoModal(item.machineId)
                            }
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-circle btn-sm ml-1"
                            onClick={() =>
                              handleOpenDeleteMachineModal(item.machineId)
                            }
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    {item.machineImage != "" ? (
                      <img
                        className="card-img-top"
                        src={item.machineImage}
                        alt={item.machineCode}
                        style={{ minHeight: "292px" }}
                      />
                    ) : (
                      <img
                        src="/default-image.jpg"
                        style={{ minHeight: "292px" }}
                      />
                    )}
                    <div className="card-body">
                      <h3 className="mb-0"></h3>
                      <h4 className="mb-0">{item.machineName}</h4>
                      <h4 className="mb-0">{item.machineSpec}</h4>
                      <h4 className="mb-0">{item.machineType}</h4>
                      <h4 className="mb-0">{item.modelSeries}</h4>
                    </div>
                    <div className="card-footer">
                      <div className="text-muted row justify-content-center">
                        <button
                          type="button"
                          className="btn btn-info col-3 mt-2"
                          onClick={() => handleGotoMachineAlarm(item.machineId)}
                        >
                          SOP
                        </button>
                        <button
                          type="button"
                          className="btn btn-info col-3 offset-md-1 mt-2"
                          onClick={() =>
                            handleOpenMachineDeviceModal(item.machineDeviceId)
                          }
                        >
                          Device
                        </button>
                        <button
                          type="button"
                          className="btn btn-info col-3 offset-md-1 mt-2"
                          onClick={() => handleGotoMachineIOT(item.machineId)}
                        >
                          IOT
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="w-100 d-flex justify-content-center">
              <label>
                {t("machine.searchEmpty")}
                {/*查無機台*/}
              </label>
            </div>
          )
        ) : (
          <div className="w-100 d-flex justify-content-center">
            <label>
              {t("machine.empty")}
              {/*尚無資料*/}
            </label>
          </div>
        )}
      </div>
      <Pagination className="d-flex justify-content-center">{pages}</Pagination>
      <ToastContainer />

      {/*machine modal - start*/}
      <Modal
        size="xl"
        show={showMachineinfoModal}
        onHide={(e) => handleCloseMachineinfoModal(e)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {machineInfo.machineId == 0
              ? t("machine.addTitle")
              : t("machine.editTitle")}
            {/*新增機台 : 編輯機台*/}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="row mb-3">
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t("machine.machineCode")}
                  {/*機台ID*/}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="machineCode"
                  value={machineInfo.machineCode}
                  onChange={(e) => handleEditChange(e)}
                  onBlur={(e) => handleEditBlur(e)}
                  autoComplete="off"
                />
                {(() => {
                  switch (machineInfoErrors.machineCode) {
                    case "required":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.required")}
                          {/*不得空白*/}
                        </div>
                      );
                    case "max":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.max", { e: 100 })}
                          {/*超過上限{{e}}個字元*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t("machine.machineType")}
                  {/*機台種類*/}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="machineType"
                  value={machineInfo.machineType}
                  onChange={(e) => handleEditChange(e)}
                  onBlur={(e) => handleEditBlur(e)}
                  autoComplete="off"
                />
                {(() => {
                  switch (machineInfoErrors.machineType) {
                    case "required":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.required")}
                          {/*不得空白*/}
                        </div>
                      );
                    case "max":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.max", { e: 100 })}
                          {/*超過上限{{e}}個字元*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t("machine.modelSeries")}
                  {/*型號系列*/}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="modelSeries"
                  value={machineInfo.modelSeries}
                  onChange={(e) => handleEditChange(e)}
                  onBlur={(e) => handleEditBlur(e)}
                  autoComplete="off"
                />
                {(() => {
                  switch (machineInfoErrors.modelSeries) {
                    case "required":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.required")}
                          {/*不得空白*/}
                        </div>
                      );
                    case "max":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.max", { e: 100 })}
                          {/*超過上限{{e}}個字元*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>

              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t("machine.machineName")}
                  {/*機台名稱*/}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="machineName"
                  value={machineInfo.machineName}
                  onChange={(e) => handleEditChange(e)}
                  onBlur={(e) => handleEditBlur(e)}
                  autoComplete="off"
                />
                {(() => {
                  switch (machineInfoErrors.machineName) {
                    case "required":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.required")}
                          {/*不得空白*/}
                        </div>
                      );
                    case "max":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.max", { e: 100 })}
                          {/*超過上限{{e}}個字元*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t("machine.machineSpec")}
                  {/*機台規格*/}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="machineSpec"
                  value={machineInfo.machineSpec}
                  onChange={(e) => handleEditChange(e)}
                  onBlur={(e) => handleEditBlur(e)}
                  autoComplete="off"
                />
                {(() => {
                  switch (machineInfoErrors.machineSpec) {
                    case "required":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.required")}
                          {/*不得空白*/}
                        </div>
                      );
                    case "max":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.max", { e: 100 })}
                          {/*超過上限{{e}}個字元*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
              <div className="col-12 form-group">
                <label className="form-label">
                  {t("machine.machineImage")}
                  {/*機台圖片*/}(640*480)
                </label>
                <input
                  type="file"
                  className="form-control d-none"
                  name="machineImage"
                  ref={inputImageRef}
                  onChange={(e) => onImageChange(e)}
                  autoComplete="off"
                  accept="image/png, image/jpeg"
                />
                <div
                  style={{
                    borderStyle: "dotted",
                    cursor: "pointer",
                    minHeight: "240px",
                  }}
                  className="d-flex justify-content-center align-items-center"
                  onClick={(e) => handleUploadImageBtn(e)}
                >
                  {machineInfo.machineImage != "" ||
                  machineInfo.machineImageObj != null ? (
                    <img
                      alt="not found"
                      style={{ width: "320px", minHeight: "240px" }}
                      src={
                        machineInfo.machineImageObj != null
                          ? URL.createObjectURL(machineInfo.machineImageObj)
                          : machineInfo.machineImage
                      }
                    />
                  ) : (
                    <span>
                      {t("machine.uploadImage")}
                      {/*上傳圖片*/}
                    </span>
                  )}
                </div>
                {(() => {
                  switch (machineInfoErrors.machineImage) {
                    case "format":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.imageFormat")}
                          {/*圖片格式不正確*/}
                        </div>
                      );
                    case "size":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.imageRatio")}
                          {/*圖片長寬比不正確*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
                <button
                  className="btn btn-danger mt-2"
                  onClick={(e) => handleRemoveImageBtn(e)}
                >
                  {t("machine.btn.deleteMachineImage")}
                  {/*移除圖片*/}
                </button>
              </div>
              <div className="col-12 form-group">
                <label className="form-label">
                  {t("machine.machineFile")}
                  {/*機台檔案*/}
                </label>
                <br />
                {(() => {
                  var fileExtension = "";
                  if (machineInfo.machineFile != "") {
                    fileExtension = machineInfo.machineFile
                      .substr(
                        machineInfo.machineFile.lastIndexOf(".") +
                          1 -
                          machineInfo.machineFile.length,
                      )
                      .toLowerCase();
                  } else if (machineInfo.machineFileObj != null) {
                    fileExtension = machineInfo.machineFileObj.name
                      .substr(
                        machineInfo.machineFileObj.name.lastIndexOf(".") +
                          1 -
                          machineInfo.machineFileObj.name.length,
                      )
                      .toLowerCase();
                  }

                  return fileExtension != "" ? (
                    <img src={`/${fileExtension}.png`} alt="圖片" />
                  ) : null;
                })()}
                <input
                  type="file"
                  className="form-control"
                  name="machineFile"
                  onChange={(e) => onFileChange(e)}
                  autoComplete="off"
                  accept=".zip"
                />
                {(() => {
                  switch (machineInfoErrors.machineFile) {
                    case "format":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.imageFormat")}
                          {/*檔案格式不正確*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
                <button
                  className="btn btn-danger mt-2"
                  onClick={(e) => handleRemoveFileBtn(e)}
                >
                  {t("machine.btn.deleteMachineFile")}
                  {/*移除檔案*/}
                </button>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={(e) => handleCloseMachineinfoModal(e)}
          >
            {t("btn.cancel")}
            {/*取消*/}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={saveMachineinfoLoading}
            onClick={handleSaveMachineinfo}
          >
            {saveMachineinfoLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              </>
            ) : (
              <span>
                {t("btn.save")}
                {/*儲存*/}
              </span>
            )}
          </button>
        </Modal.Footer>
      </Modal>
      {/*machine modal - end*/}

      {/*delete machine modal - start*/}
      <Modal
        show={showDeleteMachineModal}
        onHide={(e) => handleCloseDeleteMachineModal(e)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t("machine.delete")}
            {/*刪除機台*/}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {t("machine.deleteContent")}
            {/*您確定要刪除該筆資料嗎?*/}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={(e) => handleCloseDeleteMachineModal(e)}
          >
            {t("btn.cancel")}
            {/*取消*/}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => handleSaveDeleteMachine(e)}
          >
            {saveDeleteMachineLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              </>
            ) : (
              <span>
                {t("btn.confirm")}
                {/*確定*/}
              </span>
            )}
          </button>
        </Modal.Footer>
      </Modal>
      {/*delete machine modal - end*/}

      {/*device modal - start*/}
      <Modal
        show={showMachineDeviceModal}
        onHide={(e) => handleCloseMachineDeviceModal(e)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t("machineDevice.editTitle")}
            {/*編輯機台設備*/}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="row mb-3">
              <div className="col-12 form-group">
                <label className="form-label">
                  {t("machine.machineCode")}
                  {/*機台ID*/}
                </label>
                <span className="form-text">{machineDevice.machineCode}</span>
              </div>
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t("machineDevice.machineDeviceControlerModel")}
                  {/*控制器模組*/}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="machineDeviceControlerModel"
                  maxLength="100"
                  value={machineDevice.machineDeviceControlerModel}
                  onChange={(e) => handleEditMachineDeviceChange(e)}
                  onBlur={(e) => handleEditMachineDeviceBlur(e)}
                  autoComplete="off"
                />
                {(() => {
                  switch (machineDeviceErrors.machineDeviceControlerModel) {
                    case "required":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.required")}
                          {/*不得空白*/}
                        </div>
                      );
                    case "max":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.max", { e: 100 })}
                          {/*超過上限{{e}}個字元*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t("machineDevice.machineDeviceServerIP")}
                  {/*伺服器IP*/}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="machineDeviceServerIP"
                  maxLength="20"
                  value={machineDevice.machineDeviceServerIP}
                  onChange={(e) => handleEditMachineDeviceChange(e)}
                  onBlur={(e) => handleEditMachineDeviceBlur(e)}
                  autoComplete="off"
                />
                {(() => {
                  switch (machineDeviceErrors.machineDeviceServerIP) {
                    case "required":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.required")}
                          {/*不得空白*/}
                        </div>
                      );
                    case "max":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.max", { e: 20 })}
                          {/*超過上限{{e}}個字元*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t("machineDevice.machineDeviceServerPort")}
                  {/*伺服器Port*/}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="machineDeviceServerPort"
                  maxLength="10"
                  value={machineDevice.machineDeviceServerPort}
                  onChange={(e) => handleEditMachineDeviceChange(e)}
                  onBlur={(e) => handleEditMachineDeviceBlur(e)}
                  autoComplete="off"
                />
                {(() => {
                  switch (machineDeviceErrors.machineDeviceServerPort) {
                    case "required":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.required")}
                          {/*不得空白*/}
                        </div>
                      );
                    case "numeric":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.numeric")}
                          {/*需為數字*/}
                        </div>
                      );
                    case "max":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.max", { e: 10 })}
                          {/*超過上限{{e}}個字元*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t("machineDevice.machineDeviceMachineIP")}
                  {/*機台IP*/}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="machineDeviceMachineIP"
                  maxLength="20"
                  value={machineDevice.machineDeviceMachineIP}
                  onChange={(e) => handleEditMachineDeviceChange(e)}
                  onBlur={(e) => handleEditMachineDeviceBlur(e)}
                  autoComplete="off"
                />
                {(() => {
                  switch (machineDeviceErrors.machineDeviceMachineIP) {
                    case "required":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.required")}
                          {/*不得空白*/}
                        </div>
                      );
                    case "max":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.max", { e: 20 })}
                          {/*超過上限{{e}}個字元*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={(e) => handleCloseMachineDeviceModal(e)}
          >
            {t("btn.cancel")}
            {/*取消*/}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={saveMachineDeviceLoading}
            onClick={handleSaveMachineDevice}
          >
            {saveMachineDeviceLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              </>
            ) : (
              <span>
                {t("btn.save")}
                {/*儲存*/}
              </span>
            )}
          </button>
        </Modal.Footer>
      </Modal>
      {/*device modal - end*/}
    </>
  );
}

export default Machine;
