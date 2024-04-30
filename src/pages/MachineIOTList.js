import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next"; //語系
import { useParams, useNavigate } from "react-router-dom";
import { setWindowClass, removeWindowClass } from "../utils/helpers";
import { DebounceInput } from "react-debounce-input";
import { ToastContainer, toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import SimpleReactValidator from "simple-react-validator";
import reactStringReplace from "react-string-replace";
import Pagination from "react-bootstrap/Pagination";

import { apiIOTOverview, apiDeleteMachineIOT } from "../utils/Api";

function MachineIOTList() {
  const { t } = useTranslation();
  const navigate = useNavigate(); //跳轉Router
  const [keyword, setKeyword] = useState(""); //關鍵字
  const { machineId } = useParams();
  const [machineIOTs, setMachineIOTs] = useState([]); //IOT列表
  const [showMachineIOTs, setShowMachineIOTs] = useState([]); //IOT列表(顯示前端)
  const [selectDeleteId, setSelectDeleteId] = useState(0); //要刪除的使用者id
  const [showDeleteMachineIOTModal, setShowDeleteMachineIOTModal] =
    useState(false); //顯示"刪除IOT modal"
  const [saveDeleteMachineIOTLoading, setSaveDeleteMachineIOTLoading] =
    useState(false);

  //#region 初始載入
  useEffect(() => {
    removeWindowClass("login-page");

    const fetchData = async () => {
      await refreshMachineIOTs();
    };

    fetchData();
  }, [keyword]);
  //#endregion

  //#region 刷新IOT列表
  const refreshMachineIOTs = async () => {
    var sendData = {
      machineId: machineId,
      keyword: keyword,
    };

    let iotOverviewResponse = await apiIOTOverview(sendData);
    if (iotOverviewResponse) {
      if (iotOverviewResponse.code == "0000") {
        setMachineIOTs(iotOverviewResponse.result);
        setShowMachineIOTs(
          iotOverviewResponse.result.slice(
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
    number <= Math.ceil(machineIOTs.length / pageRow);
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
    setShowMachineIOTs(
      machineIOTs.slice(number * pageRow - pageRow, number * pageRow),
    );
  };
  //#endregion

  //#region 關鍵字
  const handleChangeKeyword = async (e) => {
    const { name, value } = e.target;
    setKeyword(value);
  };
  //#endregion

  //#region 前往新增/編輯機台IOT
  const handleGotoMachineIOT = (machineIOTId) => {
    navigate(`/machine/${machineId}/machineIOTList/${machineIOTId}`);
  };
  //#endregion

  //#region 開啟刪除IOT Modal
  const handleOpenDeleteMachineIOTModal = (machineIOTId) => {
    setSelectDeleteId(machineIOTId);
    setShowDeleteMachineIOTModal(true);
  };
  //#endregion

  //#region 關閉刪除IOT Modal
  const handleCloseDeleteMachineIOTModal = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setShowDeleteMachineIOTModal(false);
  };
  //#endregion

  //#region 儲存刪除IOT Modal
  const handleSaveDeleteMachineIOT = async (e) => {
    e.preventDefault();

    setSaveDeleteMachineIOTLoading(true);

    var sendData = {
      id: selectDeleteId,
    };

    let deleteMachineIOTResponse = await apiDeleteMachineIOT(sendData);
    if (deleteMachineIOTResponse) {
      if (deleteMachineIOTResponse.code == "0000") {
        toast.success(t("toast.delete.success"), {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
        });

        setShowDeleteMachineIOTModal(false);
        await refreshMachineIOTs();
      } else {
        toast.error(deleteMachineIOTResponse.message, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
        });
      }
      setSaveDeleteMachineIOTLoading(false);
    } else {
      setSaveDeleteMachineIOTLoading(false);
    }
  };
  //#endregion

  return (
    <>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 justify-content-between align-items-center">
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
                  {t("machineIOTList.content.header")}
                  {/*IOT管理*/}
                </strong>
              </h1>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-add"
              onClick={() => handleGotoMachineIOT(0)}
            >
              <i className="fas fa-plus"></i> {t("machineIOTList.btn.add")}
              {/*新增IOT*/}
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
                      {t("machineIOTList.machineIOTId")}
                      {/*編號*/}
                    </th>
                    <th>
                      {t("machineIOT.machineIOTDeviceName")}
                      {/*設備名稱*/}
                    </th>
                    <th>
                      {t("machineIOT.machineIOTMQTTBroker")}
                      {/*Server*/}
                    </th>
                    <th>
                      {t("machineIOT.machineIOTClientId")}
                      {/*Client ID*/}
                    </th>
                    <th>
                      {t("machineIOTList.fun")}
                      {/*功能*/}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {showMachineIOTs && showMachineIOTs.length > 0 ? (
                    <>
                      {showMachineIOTs.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item.machineIOTId}</td>
                            <td>{item.machineIOTDeviceName}</td>
                            <td>{item.machineIOTMQTTBroker}</td>
                            <td>{item.machineIOTClientId}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() =>
                                  handleGotoMachineIOT(item.machineIOTId)
                                }
                              >
                                {t("machineIOTList.btn.edit")}
                                {/*編輯*/}
                              </button>{" "}
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() =>
                                  handleOpenDeleteMachineIOTModal(
                                    item.machineIOTId,
                                  )
                                }
                              >
                                {t("machineIOTList.btn.del")}
                                {/*刪除*/}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center" }}>
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
        show={showDeleteMachineIOTModal}
        onHide={(e) => handleCloseDeleteMachineIOTModal(e)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t("machineIOTList.delete")}
            {/*刪除IOT*/}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {t("machineIOTList.deleteContent")}
            {/*您確定要刪除該筆資料嗎?*/}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={(e) => handleCloseDeleteMachineIOTModal(e)}
          >
            {t("btn.cancel")}
            {/*取消*/}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={saveDeleteMachineIOTLoading}
            onClick={handleSaveDeleteMachineIOT}
          >
            {saveDeleteMachineIOTLoading ? (
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

export default MachineIOTList;
