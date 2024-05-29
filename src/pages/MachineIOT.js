import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next"; //語系
import { useParams, useNavigate } from "react-router-dom";
import { setWindowClass, removeWindowClass } from "../utils/helpers";
import { ToastContainer, toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import SimpleReactValidator from "simple-react-validator";

import { apiGetOneMachineIOT, apiSaveMachineIOT } from "../utils/Api";

function MachineIOT() {
  const { t } = useTranslation();
  const navigate = useNavigate(); //跳轉Router
  const validator = new SimpleReactValidator({
    autoForceUpdate: this,
  });
  const { machineId, machineIOTId } = useParams();
  const [machineIOT, setMachineIOT] = useState({
    //IOT資料
    machineIOTId: machineIOTId,
    machineId: machineId,
    machineIOTDeviceName: "",
    machineIOTMQTTBroker: "",
    machineIOTClientId: "",
    machineIOTUserName: "",
    machineIOTPassword: "",
    machineIOTTopics: [],
  });

  const [machineIOTErrors, setMachineIOTErrors] = useState({
    //IOT資料 - 錯誤訊息
    machineIOTDeviceName: "",
    machineIOTMQTTBroker: "",
    machineIOTClientId: "",
    machineIOTUserName: "",
    machineIOTPassword: "",
  });

  const [showTopicModal, setShowTopicModal] = useState(false); //顯示"Topic modal"
  const [selectTopic, setSelectTopic] = useState({
    //被選中的Topic
    index: -1,
    deleted: 0,
    topicId: 0,
    machineIOTId: 0,
    topicValue: "",
  });
  const [topicErrors, setTopicErrors] = useState({
    //Topic - 錯誤訊息
    topicValue: "",
  });

  const [saveMachineIOTLoading, setSaveMachineIOTLoading] = useState(false); //機台設備儲存的轉圈圈

  const [selectDeleteTopicIndex, setSelectDeleteTopicIndex] = useState(-1); //要刪除的topic的index
  const [showDeleteTopicModal, setShowDeleteTopicModal] = useState(false); //顯示"刪除機台 modal"

  //#region 初始載入
  useEffect(() => {
    removeWindowClass("login-page");

    const fetchData = async () => {
      await refreshMachineIOT();
    };

    fetchData();
  }, []);
  //#endregion

  //#region 刷新IOT
  const refreshMachineIOT = async () => {
    if (machineIOTId > 0) {
      var sendData = {
        id: machineIOTId,
      };

      let getOneMachineIOTResponse = await apiGetOneMachineIOT(sendData);
      if (getOneMachineIOTResponse) {
        if (getOneMachineIOTResponse.code == "0000") {
          setMachineIOT(getOneMachineIOTResponse.result);
        }
      }
    }
  };
  //#endregion

  //#region 修改機台IOT 改變Input的欄位
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setMachineIOT({ ...machineIOT, [name]: value });
  };
  //#endregion

  //#region 修改機台IOT 失去焦點Input的欄位
  const handleEditBlur = async (e) => {
    const { name, value } = e.target;

    await checkEditValidator(name);
  };
  //#endregion

  //#region 機台IOT 欄位驗證
  const checkEditValidator = async (name = "", val = "") => {
    let result = true;
    let newMachineIOTErrors = { ...machineIOTErrors };

    if (name == "machineIOTDeviceName" || name == "") {
      if (!validator.check(machineIOT.machineIOTDeviceName, "required")) {
        newMachineIOTErrors.machineIOTDeviceName = "required";
        result = false;
      } else if (
        !validator.check(machineIOT.machineIOTDeviceName, "max:1000")
      ) {
        newMachineIOTErrors.machineIOTDeviceName = "max";
        result = false;
      } else {
        newMachineIOTErrors.machineIOTDeviceName = "";
      }
    }

    if (name == "machineIOTMQTTBroker" || name == "") {
      if (!validator.check(machineIOT.machineIOTMQTTBroker, "required")) {
        newMachineIOTErrors.machineIOTMQTTBroker = "required";
        result = false;
      } else if (
        !validator.check(machineIOT.machineIOTMQTTBroker, "max:1000")
      ) {
        newMachineIOTErrors.machineIOTMQTTBroker = "max";
        result = false;
      } else {
        newMachineIOTErrors.machineIOTMQTTBroker = "";
      }
    }

    if (name == "machineIOTClientId" || name == "") {
      if (!validator.check(machineIOT.machineIOTClientId, "required")) {
        newMachineIOTErrors.machineIOTClientId = "required";
        result = false;
      } else if (!validator.check(machineIOT.machineIOTClientId, "max:1000")) {
        newMachineIOTErrors.machineIOTClientId = "max";
        result = false;
      } else {
        newMachineIOTErrors.machineIOTClientId = "";
      }
    }

    if (name == "machineIOTUserName" || name == "") {
      if (!validator.check(machineIOT.machineIOTUserName, "required")) {
        newMachineIOTErrors.machineIOTUserName = "required";
        result = false;
      } else if (!validator.check(machineIOT.machineIOTUserName, "max:50")) {
        newMachineIOTErrors.machineIOTUserName = "max";
        result = false;
      } else {
        newMachineIOTErrors.machineIOTUserName = "";
      }
    }

    if (name == "machineIOTPassword" || name == "") {
      if (!validator.check(machineIOT.machineIOTPassword, "required")) {
        newMachineIOTErrors.machineIOTPassword = "required";
        result = false;
      } else if (!validator.check(machineIOT.machineIOTPassword, "max:50")) {
        newMachineIOTErrors.machineIOTPassword = "max";
        result = false;
      } else {
        newMachineIOTErrors.machineIOTPassword = "";
      }
    }

    setMachineIOTErrors(newMachineIOTErrors);
    return result;
  };
  //#endregion

  //#region 開啟Topic Modal
  const handleOpenTopicModal = (index) => {
    if (index > -1) {
      let tempTopic = machineIOT.machineIOTTopics[index];
      let tempSelectTopic = {
        index: index,
        topicId: tempTopic.topicId,
        machineIOTId: tempTopic.machineIOTId,
        topicValue: tempTopic.topicValue,
      };
      setSelectTopic(tempSelectTopic);
    } else {
      setSelectTopic({
        index: -1,
        topicId: 0,
        machineIOTId: 0,
        topicValue: "",
      });
    }

    setShowTopicModal(true);
  };
  //#endregion

  //#region 關閉Topic Modal
  const handleCloseTopicModal = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setShowTopicModal(false);
  };
  //#endregion

  //#region 修改Topic 改變Input的欄位
  const handleTopicChange = (e) => {
    const { name, value } = e.target;
    setSelectTopic({ ...selectTopic, [name]: value });
  };
  //#endregion

  //#region 修改Topic 失去焦點Input的欄位
  const handleTopicBlur = async (e) => {
    const { name, value } = e.target;

    await checkTopicValidator(name);
  };
  //#endregion

  //#region Topic 欄位驗證
  const checkTopicValidator = async (name = "", val = "") => {
    let result = true;
    let newTopicErrors = { ...topicErrors };

    if (name == "topicValue" || name == "") {
      if (!validator.check(selectTopic.topicValue, "required")) {
        newTopicErrors.topicValue = "required";
        result = false;
      } else if (!validator.check(selectTopic.topicValue, "max:1000")) {
        newTopicErrors.topicValue = "max";
        result = false;
      } else {
        newTopicErrors.topicValue = "";
      }
    }

    setTopicErrors(newTopicErrors);
    return result;
  };
  //#endregion

  //#region 確認修改Topic Modal
  const handleUpdateTopic = async (e) => {
    e.preventDefault();

    if (await checkTopicValidator()) {
      let newMachineIOT = { ...machineIOT };

      if (selectTopic.index > -1) {
        var tempTopic = {
          topicId: selectTopic.topicId,
          deleted: 0,
          machineIOTId: selectTopic.machineIOTId,
          topicValue: selectTopic.topicValue,
        };

        newMachineIOT.machineIOTTopics[selectTopic.index] = tempTopic;
      } else {
        var tempTopic = {
          topicId: 0,
          deleted: 0,
          machineIOTId: 0,
          topicValue: selectTopic.topicValue,
        };
        newMachineIOT.machineIOTTopics.push(tempTopic);
      }

      setMachineIOT(newMachineIOT);
      setShowTopicModal(false);
    }
  };
  //#endregion

  //#region 開啟刪除topic Modal
  const handleOpenDeleteTopicModal = (index) => {
    setSelectDeleteTopicIndex(index);
    setShowDeleteTopicModal(true);
  };
  //#endregion

  //#region 關閉刪除topic Modal
  const handleCloseDeleteTopicModal = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setSelectDeleteTopicIndex(-1);
    setShowDeleteTopicModal(false);
  };
  //#endregion

  //#region 刪除topic
  const handleSaveDeleteTopic = async (e) => {
    let newMachineIOT = { ...machineIOT };

    let tempTopic = newMachineIOT.machineIOTTopics[selectDeleteTopicIndex];
    if (tempTopic.topicId > 0) {
      tempTopic.deleted = 1;
      newMachineIOT.machineIOTTopics[selectDeleteTopicIndex] = tempTopic;
    } else {
      let newTopics = [...newMachineIOT.machineIOTTopics];
      newTopics.splice(selectDeleteTopicIndex, 1);

      newMachineIOT.machineIOTTopics = newTopics;
    }

    setMachineIOT(newMachineIOT);
    setShowDeleteTopicModal(false);
  };
  //#endregion

  //#region 儲存機台IOT
  const handleSaveMachineIOT = async (e) => {
    e.preventDefault();

    if (await checkEditValidator()) {
      setSaveMachineIOTLoading(true);

      let saveMachineIOTResponse = await apiSaveMachineIOT(machineIOT);
      if (saveMachineIOTResponse) {
        if (saveMachineIOTResponse.code == "0000") {
          refreshMachineIOT();
          toast.success(
            machineIOTId == 0
              ? t("toast.add.success")
              : t("toast.edit.success"),
            {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 3000,
              hideProgressBar: true,
              closeOnClick: false,
              pauseOnHover: false,
              onClose: () => {
                if (machineIOTId == 0) {
                  window.location.href = `/machine/${machineId}/machineIOTList/${saveMachineIOTResponse.result}`;
                }
              },
            },
          );
        } else {
          toast.error(saveMachineIOTResponse.message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
          });
        }
        setSaveMachineIOTLoading(false);
      } else {
        setSaveMachineIOTLoading(false);
      }
    }
  };
  //#endregion

  return (
    <>
      <section className="content-header">
        <div className="container-fluid">
          <div className="d-flex mb-2 justify-content-between align-items-center">
            <div>
              <a
                href={`/machine/${machineId}/machineIOTList`}
                className="d-flex align-items-center"
              >
                <i className="fas fa-angle-left">&nbsp;&nbsp;
                {t("machineIOTList.content.header")}
                {/*IOT管理*/}
                </i>
              </a>
            </div>
            <div className="content-header-text-color">
              <h1>
                <strong>
                  {machineIOTId == 0
                    ? t("machineIOT.content.header.add")
                    : t("machineIOT.content.header.edit")}
                  {/*新增IOT:編輯IOT*/}
                </strong>
              </h1>
            </div>
            <div>
              <button
                type="button"
                className="btn btn-primary btn-add"
                disabled={saveMachineIOTLoading}
                onClick={(e) => handleSaveMachineIOT(e)}
              >
                {saveMachineIOTLoading ? (
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
                  <>
                    <i className="fas fa-plus"></i> {t("machineIOT.btn.save")}
                    {/*儲存設定*/}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-12 col-md-6 mb-2">
              <div className="machineIOT-col-border-l">
                <div className="row mb-3">
                  <div className="col form-group">
                    <label className="form-label">
                      <span className="text-danger">*</span>
                      {t("machineIOT.machineIOTDeviceName")}
                      {/*設備名稱*/}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="machineIOTDeviceName"
                      maxLength="1000"
                      value={machineIOT.machineIOTDeviceName}
                      onChange={(e) => handleEditChange(e)}
                      onBlur={(e) => handleEditBlur(e)}
                    />
                    {(() => {
                      switch (machineIOTErrors.machineIOTDeviceName) {
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
                              {t("helpWord.max", { e: 1000 })}
                              {/*超過上限{{e}}個字元*/}
                            </div>
                          );
                        default:
                          return null;
                      }
                    })()}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col form-group">
                    <label className="form-label">
                      <span className="text-danger">*</span>
                      {t("machineIOT.machineIOTMQTTBroker")}
                      {/*Server*/}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="machineIOTMQTTBroker"
                      maxLength="1000"
                      value={machineIOT.machineIOTMQTTBroker}
                      onChange={(e) => handleEditChange(e)}
                      onBlur={(e) => handleEditBlur(e)}
                    />
                    {(() => {
                      switch (machineIOTErrors.machineIOTMQTTBroker) {
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
                              {t("helpWord.max", { e: 1000 })}
                              {/*超過上限{{e}}個字元*/}
                            </div>
                          );
                        default:
                          return null;
                      }
                    })()}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col form-group">
                    <label className="form-label">
                      <span className="text-danger">*</span>
                      {t("machineIOT.machineIOTClientId")}
                      {/*Client ID*/}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="machineIOTClientId"
                      maxLength="1000"
                      value={machineIOT.machineIOTClientId}
                      onChange={(e) => handleEditChange(e)}
                      onBlur={(e) => handleEditBlur(e)}
                    />
                    {(() => {
                      switch (machineIOTErrors.machineIOTClientId) {
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
                              {t("helpWord.max", { e: 1000 })}
                              {/*超過上限{{e}}個字元*/}
                            </div>
                          );
                        default:
                          return null;
                      }
                    })()}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col form-group">
                    <label className="form-label">
                      <span className="text-danger">*</span>
                      {t("machineIOT.machineIOTUserName")}
                      {/*Username*/}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="machineIOTUserName"
                      maxLength="50"
                      value={machineIOT.machineIOTUserName}
                      onChange={(e) => handleEditChange(e)}
                      onBlur={(e) => handleEditBlur(e)}
                    />
                    {(() => {
                      switch (machineIOTErrors.machineIOTUserName) {
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
                              {t("helpWord.max", { e: 50 })}
                              {/*超過上限{{e}}個字元*/}
                            </div>
                          );
                        default:
                          return null;
                      }
                    })()}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col form-group">
                    <label className="form-label">
                      <span className="text-danger">*</span>
                      {t("machineIOT.machineIOTPassword")}
                      {/*Password*/}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      name="machineIOTPassword"
                      maxLength="50"
                      value={machineIOT.machineIOTPassword}
                      onChange={(e) => handleEditChange(e)}
                      onBlur={(e) => handleEditBlur(e)}
                    />
                    {(() => {
                      switch (machineIOTErrors.machineIOTPassword) {
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
                              {t("helpWord.max", { e: 50 })}
                              {/*超過上限{{e}}個字元*/}
                            </div>
                          );
                        default:
                          return null;
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-12 col-md-6 mb-2">
              <div className="machineIOT-col-border-r">
                {machineIOT.machineIOTTopics.map((item, index) => {
                  if (item.deleted == 0) {
                    return (
                      <div key={index} className="mb-2 machineIOT-topic">
                        <div className="row align-items-center">
                          <div className="col-10">
                            <div>topic:</div>
                            <div style={{ wordBreak: "break-all" }}>
                              {item.topicValue}
                            </div>
                          </div>
                          <div className="col-2 text-right">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-circle btn-sm"
                              onClick={() => handleOpenTopicModal(index)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-circle btn-sm ml-1"
                              onClick={() => handleOpenDeleteTopicModal(index)}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}

                <div className="row">
                  <div className="col-12">
                    <button
                      type="button"
                      className="btn btn-primary machineIOT-topic-btn-add"
                      onClick={() => handleOpenTopicModal(-1)}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ToastContainer />

      <Modal
        show={showTopicModal}
        onHide={(e) => handleCloseTopicModal(e)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t("machineIOT.updateTopic")}
            {/*Topic*/}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="row mb-3">
              <div className="col-12 form-group">
                <input
                  type="text"
                  className="form-control"
                  name="topicValue"
                  maxLength="50"
                  value={selectTopic.topicValue}
                  onChange={(e) => handleTopicChange(e)}
                  onBlur={(e) => handleTopicBlur(e)}
                  autoComplete="off"
                />
                {(() => {
                  switch (topicErrors.topicValue) {
                    case "required":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.required")} {/*不得空白*/}
                        </div>
                      );
                    case "max":
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{" "}
                          {t("helpWord.max", { e: 1000 })}
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
            onClick={(e) => handleCloseTopicModal(e)}
          >
            {t("btn.cancel")}
            {/*取消*/}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => handleUpdateTopic(e)}
          >
            <span>
              {t("btn.confirm")}
              {/*確定*/}
            </span>
          </button>
        </Modal.Footer>
      </Modal>

      {/*delete topic modal - start*/}
      <Modal
        show={showDeleteTopicModal}
        onHide={(e) => handleCloseDeleteTopicModal(e)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t("machineIOT.deleteTopic")}
            {/*刪除Topic*/}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {t("machineIOT.deleteContent")}
            {/*您確定要刪除該筆資料嗎?*/}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={(e) => handleCloseDeleteTopicModal(e)}
          >
            {t("btn.cancel")}
            {/*取消*/}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => handleSaveDeleteTopic(e)}
          >
            <span>
              {t("btn.confirm")}
              {/*確定*/}
            </span>
          </button>
        </Modal.Footer>
      </Modal>
      {/*delete machine modal - end*/}
    </>
  );
}

export default MachineIOT;
