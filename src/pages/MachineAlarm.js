import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next"; //語系
import { useParams, useNavigate } from "react-router-dom";
import { setWindowClass, removeWindowClass } from "../utils/helpers";
import { DebounceInput } from "react-debounce-input";
import { ToastContainer, toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import SimpleReactValidator from "simple-react-validator";
import Pagination from "react-bootstrap/Pagination";

import {
  apiGetAllMachineAlarmByFilter,
  apiAddMachineAlarm,
  apiEditMachineAlarm,
  apiDeleteMachineAlarm,
} from "../utils/Api";

function MachineAlarm() {
  const { t } = useTranslation();
  const navigate = useNavigate(); //跳轉Router
  const validator = new SimpleReactValidator({
    autoForceUpdate: this,
  });
  const [keyword, setKeyword] = useState(""); //關鍵字
  const { machineId } = useParams();
  const [machineAlarms, setMachineAlarms] = useState([]); //Alarm列表
  const [showMachineAlarms, setShowMachineAlarms] = useState([]); //Alarm列表(顯示前端)
  const [showMachineAlarmModal, setShowMachineAlarmModal] = useState(false); //顯示"Alarm modal"
  const [machineAlarm, setMachineAlarm] = useState({
    //單一Alarm
    machineAlarmId: 0,
    machineId: machineId,
    machineAlarmCode: "",
    machineAlarmAbstract: "",
  });
  const [machineAlarmErrors, setMachineAlarmErrors] = useState({
    //機台Alarm錯誤訊息
    machineAlarmCode: "",
    machineAlarmAbstract: "",
  });
  const [saveMachineAlarmLoading, setSaveMachineAlarmLoading] = useState(false);
  const [selectDeleteId, setSelectDeleteId] = useState(0); //要刪除的Alarm id
  const [showDeleteMachineAlarmModal, setShowDeleteMachineAlarmModal] =
    useState(false); //顯示"刪除IOT modal"
  const [saveDeleteMachineAlarmLoading, setSaveDeleteMachineAlarmLoading] =
    useState(false);

  //#region 初始載入
  useEffect(() => {
    removeWindowClass("login-page");

    const fetchData = async () => {
      await refreshMachineAlarms();
    };

    fetchData();
  }, [keyword]);
  //#endregion

  //#region 刷新Alarm列表
  const refreshMachineAlarms = async () => {
    var sendData = {
      machineId: machineId,
      keyword: keyword,
    };

    let machineAlarmResponse = await apiGetAllMachineAlarmByFilter(sendData);
    if (machineAlarmResponse) {
      if (machineAlarmResponse.code == "0000") {
        setMachineAlarms(machineAlarmResponse.result);
        setShowMachineAlarms(
          machineAlarmResponse.result.slice(
            activePage * pageRow - pageRow,
            activePage * pageRow,
          ),
        );
      }
    }
  };
  //#endregion

  //#region 頁碼
  let pageRow = 10; //一頁幾筆
  const [activePage, setActivePage] = useState(1); //目前停留頁碼
  let pages = []; //頁碼
  for (
    let number = 1;
    number <= Math.ceil(machineAlarms.length / pageRow);
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
    setShowMachineAlarms(
      machineAlarms.slice(number * pageRow - pageRow, number * pageRow),
    );
  };
  //#endregion

  //#region 關鍵字
  const handleChangeKeyword = async (e) => {
    const { name, value } = e.target;
    setKeyword(value);
  };
  //#endregion

  //#region 開啟新增/編輯機台Alarm Modal
  const handleOpenMachineAlarmModal = async (machineAlarmId) => {
    if (machineAlarmId == 0) {
      setMachineAlarm({
        machineAlarmId: 0,
        machineId: machineId,
        machineAlarmCode: "",
        machineAlarmAbstract: "",
      });
    } else {
      var tempMachineAlarm = machineAlarms.find(
        (x) => x.machineAlarmId == machineAlarmId,
      );
      setMachineAlarm(tempMachineAlarm);
    }

    setMachineAlarmErrors({
      machineAlarmCode: "",
      machineAlarmAbstract: "",
    });

    setShowMachineAlarmModal(true);
  };
  //#endregion

  //#region 關閉新增/編輯機台Alarm Modal
  const handleCloseMachineAlarmModal = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setShowMachineAlarmModal(false);
  };
  //#endregion

  //#region 修改機台Alarm 改變Input的欄位
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setMachineAlarm({ ...machineAlarm, [name]: value });
  };
  //#endregion

  //#region 修改機台Alarm 失去焦點Input的欄位
  const handleEditBlur = async (e) => {
    const { name, value } = e.target;

    await checkEditValidator(name);
  };
  //#endregion

  //#region 機台Alarm 欄位驗證
  const checkEditValidator = async (name = "", val = "") => {
    let result = true;
    let newMachineAlarmErrors = { ...machineAlarmErrors };

    if (name == "machineAlarmCode" || name == "") {
      if (!validator.check(machineAlarm.machineAlarmCode, "required")) {
        newMachineAlarmErrors.machineAlarmCode = "required";
        result = false;
      } else if (!validator.check(machineAlarm.machineAlarmCode, "max:50")) {
        newMachineAlarmErrors.machineAlarmCode = "max";
        result = false;
      } else {
        newMachineAlarmErrors.machineAlarmCode = "";
      }
    }

    if (name == "machineAlarmAbstract" || name == "") {
      if (!validator.check(machineAlarm.machineAlarmAbstract, "required")) {
        newMachineAlarmErrors.machineAlarmAbstract = "required";
        result = false;
      } else if (
        !validator.check(machineAlarm.machineAlarmAbstract, "max:1000")
      ) {
        newMachineAlarmErrors.machineAlarmAbstract = "max";
        result = false;
      } else {
        newMachineAlarmErrors.machineAlarmAbstract = "";
      }
    }

    setMachineAlarmErrors(newMachineAlarmErrors);
    return result;
  };
  //#endregion

  //#region 儲存機台Alarm
  const handleSaveMachineAlarm = async (e) => {
    e.preventDefault();

    if (await checkEditValidator()) {
      setSaveMachineAlarmLoading(true);

      if (machineAlarm.machineAlarmId == 0) {
        let addMachineAlarmResponse = await apiAddMachineAlarm(machineAlarm);
        if (addMachineAlarmResponse) {
          if (addMachineAlarmResponse.code == "0000") {
            toast.success(t("toast.add.success"), {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 3000,
              hideProgressBar: true,
              closeOnClick: false,
              pauseOnHover: false,
            });

            setShowMachineAlarmModal(false);
            await refreshMachineAlarms();
          } else {
            toast.error(addMachineAlarmResponse.message, {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: false,
              pauseOnHover: false,
            });
          }
          setSaveMachineAlarmLoading(false);
        } else {
          setSaveMachineAlarmLoading(false);
        }
      } else {
        let editMachineAlarmResponse = await apiEditMachineAlarm(machineAlarm);
        if (editMachineAlarmResponse) {
          if (editMachineAlarmResponse.code == "0000") {
            toast.success(t("toast.edit.success"), {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 3000,
              hideProgressBar: true,
              closeOnClick: false,
              pauseOnHover: false,
            });

            setShowMachineAlarmModal(false);
            await refreshMachineAlarms();
          } else {
            toast.error(editMachineAlarmResponse.message, {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: false,
              pauseOnHover: false,
            });
          }
          setSaveMachineAlarmLoading(false);
        } else {
          setSaveMachineAlarmLoading(false);
        }
      }
    }
  };
  //#endregion

  //#region 前往SOP
  const handleGotoSOP = (machineAlarmId) => {
    navigate(`/machine/${machineId}/machineAlarm/${machineAlarmId}/SOP`);
  };
  //#endregion

  //#region 開啟刪除Alarm Modal
  const handleOpenDeleteMachineAlarmModal = (machineAlarmId) => {
    setSelectDeleteId(machineAlarmId);
    setShowDeleteMachineAlarmModal(true);
  };
  //#endregion

  //#region 關閉刪除Alarm Modal
  const handleCloseDeleteMachineAlarmModal = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setShowDeleteMachineAlarmModal(false);
  };
  //#endregion

  //#region 儲存刪除Alarm Modal
  const handleSaveDeleteMachineAlarm = async (e) => {
    e.preventDefault();

    setSaveDeleteMachineAlarmLoading(true);

    var sendData = {
      id: selectDeleteId,
    };

    let deleteMachineAlarmResponse = await apiDeleteMachineAlarm(sendData);
    if (deleteMachineAlarmResponse) {
      if (deleteMachineAlarmResponse.code == "0000") {
        toast.success(t("toast.delete.success"), {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
        });

        setShowDeleteMachineAlarmModal(false);
        await refreshMachineAlarms();
      } else {
        toast.error(deleteMachineAlarmResponse.message, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
        });
      }
      setSaveDeleteMachineAlarmLoading(false);
    } else {
      setSaveDeleteMachineAlarmLoading(false);
    }
  };
  //#endregion

  return (
    <>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 justify-content-between">
            <div>
              <a href={`/machine`} className="d-flex align-items-center">
                <i className="fas fa-angle-left"></i>&nbsp;&nbsp;
                {t("machine.content.header")}
                {/*機台管理*/}
              </a>
            </div>
            <div className="content-header-text-color">
              <h1>
                <strong>
                  {t("machineAlarm.content.header")}
                  {/*Alarm管理*/}
                </strong>
              </h1>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-add"
              onClick={() => handleOpenMachineAlarmModal(0)}
            >
              <i className="fas fa-plus"></i> {t("machineAlarm.btn.add")}
              {/*新增Alarm*/}
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
          <div className="card">
            <div className="card-body table-responsive p-0">
              <table className="table table-striped table-valign-middle">
                <thead>
                  <tr>
                    <th>
                      {t("machineAlarm.MachineAlarmId")}
                      {/*編號*/}
                    </th>
                    <th>
                      {t("machineAlarm.MachineAlarmCode")}
                      {/*故障代碼*/}
                    </th>
                    <th>
                      {t("machineAlarm.MachineAlarmAbstract")}
                      {/*故障說明*/}
                    </th>
                    <th>
                      {t("machineAlarm.fun")}
                      {/*功能*/}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {showMachineAlarms && showMachineAlarms.length > 0 ? (
                    <>
                      {showMachineAlarms.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item.machineAlarmId}</td>
                            <td>{item.machineAlarmCode}</td>
                            <td>{item.machineAlarmAbstract}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() =>
                                  handleOpenMachineAlarmModal(
                                    item.machineAlarmId,
                                  )
                                }
                              >
                                {t("machineAlarm.btn.edit")}
                                {/*編輯*/}
                              </button>{" "}
                              <button
                                type="button"
                                className="btn btn-outline-info"
                                onClick={() =>
                                  handleGotoSOP(item.machineAlarmId)
                                }
                              >
                                {t("machineAlarm.btn.sop")}
                                {/*SOP*/}
                              </button>{" "}
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() =>
                                  handleOpenDeleteMachineAlarmModal(
                                    item.machineAlarmId,
                                  )
                                }
                              >
                                {t("machineAlarm.btn.del")}
                                {/*刪除*/}
                              </button>{" "}
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                              >
                                {t("machineAlarm.btn.pdf")}
                                {/*PDF*/}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center" }}>
                          {t("table.empty")}
                          {/*查無資料*/}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination className="d-flex justify-content-center">
            {pages}
          </Pagination>
        </div>
      </section>

      <ToastContainer />

      <Modal
        show={showMachineAlarmModal}
        onHide={(e) => handleCloseMachineAlarmModal(e)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {machineAlarm.machineAlarmId == 0
              ? t("machineAlarm.add")
              : t("machineAlarm.edit")}
            {/*新增Alarm : 編輯Alarm*/}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            {machineAlarm.machineAlarmId != 0 ? (
              <div className="row mb-3">
                <div className="col-12 form-group">
                  <label className="form-label">
                    {t("machineAlarm.MachineAlarmId")}
                    {/*編號*/}
                  </label>
                  <span className="form-text">
                    {machineAlarm.machineAlarmId}
                  </span>
                </div>
              </div>
            ) : (
              <></>
            )}
            <div className="row mb-3">
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t("machineAlarm.MachineAlarmCode")}
                  {/*故障代碼*/}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="machineAlarmCode"
                  value={machineAlarm.machineAlarmCode}
                  onChange={(e) => handleEditChange(e)}
                  onBlur={(e) => handleEditBlur(e)}
                  autoComplete="off"
                />
                {(() => {
                  switch (machineAlarmErrors.machineAlarmCode) {
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
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t("machineAlarm.MachineAlarmAbstract")}
                  {/*故障說明*/}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="machineAlarmAbstract"
                  value={machineAlarm.machineAlarmAbstract}
                  onChange={(e) => handleEditChange(e)}
                  onBlur={(e) => handleEditBlur(e)}
                  autoComplete="off"
                />
                {(() => {
                  switch (machineAlarmErrors.machineAlarmAbstract) {
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
            onClick={(e) => handleCloseMachineAlarmModal(e)}
          >
            {t("btn.cancel")}
            {/*取消*/}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={saveMachineAlarmLoading}
            onClick={handleSaveMachineAlarm}
          >
            {saveMachineAlarmLoading ? (
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

      <Modal
        show={showDeleteMachineAlarmModal}
        onHide={(e) => handleCloseDeleteMachineAlarmModal(e)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t("machineAlarm.delete")}
            {/*刪除Alarm*/}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {t("machineAlarm.deleteContent")}
            {/*您確定要刪除該筆資料嗎?*/}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={(e) => handleCloseDeleteMachineAlarmModal(e)}
          >
            {t("btn.cancel")}
            {/*取消*/}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={saveDeleteMachineAlarmLoading}
            onClick={handleSaveDeleteMachineAlarm}
          >
            {saveDeleteMachineAlarmLoading ? (
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
    </>
  );
}

export default MachineAlarm;
