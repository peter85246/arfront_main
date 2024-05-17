import { useEffect, useState } from "react";
import { AddingKnowledge } from "../components/AddingKnowledge";
import { ConditionSearchDialog } from "../components/ConditionSearchDialog";
import styles from "../scss/global.module.scss";
import classNames from "classnames";
import { useTranslation } from "react-i18next"; //語系
import { DebounceInput } from "react-debounce-input";
import Pagination from "react-bootstrap/Pagination";
import { ToastContainer, toast } from "react-toastify";
import { setWindowClass, removeWindowClass } from "../utils/helpers";

import {
  apiGetAllKnowledgeBaseByFilter,
  apiAddKnowledgeBase,
} from "../utils/Api";

const DataArray = [
  {
    id: 1,
    KnowledgeBaseDeviceType: "銑床",
    KnowledgeBaseDeviceParts: "冷卻系統",
    RepairItem: "主軸油冷機故障:1004",
    KnowledgeBaseRepairType: "機械故障",
    KnowledgeBaseFileNo: "TS31103",
  },
  {
    id: 2,
    KnowledgeBaseDeviceType: "車床",
    KnowledgeBaseDeviceParts: "主軸",
    RepairItem: "機械目前處於是車工件的狀態:2014",
    KnowledgeBaseRepairType: "電控層面",
    KnowledgeBaseFileNo: "TS23001",
  },
  {
    id: 3,
    KnowledgeBaseDeviceType: "等離子切割機",
    KnowledgeBaseDeviceParts: "保養調教",
    RepairItem: "電線鬆脫:3021",
    KnowledgeBaseRepairType: "零組件",
    KnowledgeBaseFileNo: "TS18331",
  },
  {
    id: 4,
    KnowledgeBaseDeviceType: "銑床",
    KnowledgeBaseDeviceParts: "冷卻系統",
    RepairItem: "主軸油冷機故障:1004",
    KnowledgeBaseRepairType: "機械故障",
    KnowledgeBaseFileNo: "TS31103",
  },
  {
    id: 5,
    KnowledgeBaseDeviceType: "車床",
    KnowledgeBaseDeviceParts: "主軸",
    RepairItem: "機械目前處於是車工件的狀態:2014",
    KnowledgeBaseRepairType: "電控層面",
    KnowledgeBaseFileNo: "TS23001",
  },
  {
    id: 6,
    KnowledgeBaseDeviceType: "等離子切割機",
    KnowledgeBaseDeviceParts: "保養調教",
    RepairItem: "電線鬆脫:3021",
    KnowledgeBaseRepairType: "零組件",
    KnowledgeBaseFileNo: "TS18331",
  },
  {
    id: 7,
    KnowledgeBaseDeviceType: "銑床",
    KnowledgeBaseDeviceParts: "冷卻系統",
    RepairItem: "主軸油冷機故障:1004",
    KnowledgeBaseRepairType: "機械故障",
    KnowledgeBaseFileNo: "TS31103",
  },
  {
    id: 8,
    KnowledgeBaseDeviceType: "車床",
    KnowledgeBaseDeviceParts: "主軸",
    RepairItem: "機械目前處於是車工件的狀態:2014",
    KnowledgeBaseRepairType: "電控層面",
    KnowledgeBaseFileNo: "TS23001",
  },
  {
    id: 9,
    KnowledgeBaseDeviceType: "等離子切割機",
    KnowledgeBaseDeviceParts: "保養調教",
    RepairItem: "電線鬆脫:3021",
    KnowledgeBaseRepairType: "零組件",
    KnowledgeBaseFileNo: "TS18331",
  },
  {
    id: 10,
    KnowledgeBaseDeviceType: "銑床",
    KnowledgeBaseDeviceParts: "冷卻系統",
    RepairItem: "主軸油冷機故障:1004",
    KnowledgeBaseRepairType: "機械故障",
    KnowledgeBaseFileNo: "TS31103",
  },
  {
    id: 11,
    KnowledgeBaseDeviceType: "車床",
    KnowledgeBaseDeviceParts: "主軸",
    RepairItem: "機械目前處於是車工件的狀態:2014",
    KnowledgeBaseRepairType: "電控層面",
    KnowledgeBaseFileNo: "TS23001",
  },
  {
    id: 12,
    KnowledgeBaseDeviceType: "等離子切割機",
    KnowledgeBaseDeviceParts: "保養調教",
    RepairItem: "電線鬆脫:3021",
    KnowledgeBaseRepairType: "零組件",
    KnowledgeBaseFileNo: "TS18331",
  },
];

export default function Knowledge() {
  const [isAddingKnowledge, setIsAddingKnowledge] = useState(false);
  const [isConditionSearch, setIsConditionSearch] = useState(false);

  const [groupedData, setGroupedData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { t } = useTranslation();
  const [keyword, setKeyword] = useState(""); //關鍵字
  const [knowledgeBases, setKnowledgeBases] = useState([]); //知識庫列表
  const [showKnowledgeBases, setShowKnowledgeBases] = useState([]); //知識庫列表(顯示前端)
  const [showAddKnowledgeBaseModal, setShowAddKnowledgeBaseModal] =
    useState(false); //顯示"新增知識庫modal"

  const [addKnowledgeBase, setAddKnowledgeBase] = useState({
    //新增單一使用者
    userId: 0,
    userName: "",
    userAccount: "",
    userPaw: "",
    userAgainPaw: "",
    userLevel: 0,
  });

  const [addKnowledgeBaseErrors, setAddKnowledgeBaseErrors] = useState({
    //新增單一使用者錯誤訊息
    userName: "",
    userAccount: "",
    userPaw: "",
    userAgainPaw: "",
  });

  // 篩選資料
  const filterData = (e) => {
    const searchInput = e.target.value?.toLowerCase();
    const filteredData = DataArray.filter((item) => {
      return (
        item.KnowledgeBaseDeviceType.toLowerCase().includes(searchInput) ||
        item.KnowledgeBaseDeviceParts.toLowerCase().includes(searchInput) ||
        item.RepairItem.toLowerCase().includes(searchInput) ||
        item.KnowledgeBaseRepairType.toLowerCase().includes(searchInput) ||
        item.KnowledgeBaseFileNo.toLowerCase().includes(searchInput)
      );
    });

    const rows = 5;
    const SlicedData = [];

    for (let i = 0; i < filteredData.length; i += rows) {
      SlicedData.push(filteredData.slice(i, i + rows));
    }
    setGroupedData(SlicedData);
  };

  useEffect(() => {
    // 分切資料
    const rows = 5;
    const SlicedData = [];

    for (let i = 0; i < DataArray.length; i += rows) {
      SlicedData.push(DataArray.slice(i, i + rows));
    }

    setGroupedData(SlicedData);
  }, [currentPage]);

  useEffect(() => {
    // 計算分頁
    const data = groupedData[currentPage - 1];
    setCurrentData(data);
  }, [currentData, groupedData, currentPage]);

  //#region 初始載入
  useEffect(() => {
    removeWindowClass("login-page");

    const fetchData = async () => {
      await refreshKnowledgeBases();
    };

    fetchData();
  }, [keyword]);
  //#endregion

  //#region 刷新知識庫列表
  const refreshKnowledgeBases = async () => {
    var sendData = {
      keyword: keyword,
    };

    let knowledgeBasesResponse = await apiGetAllKnowledgeBaseByFilter(sendData);
    if (knowledgeBasesResponse) {
      if (knowledgeBasesResponse.code == "0000") {
        setKnowledgeBases(knowledgeBasesResponse.result);
        setShowKnowledgeBases(
          knowledgeBasesResponse.result.slice(
            activePage * pageRow - pageRow,
            activePage * pageRow,
          ),
        );
      }
    }
  };
  //#endregion

  //#region 頁碼
  let pageRow = 5; //一頁幾筆
  const [activePage, setActivePage] = useState(1); //目前停留頁碼

  let pages = []; //頁碼
  for (
    let number = 1;
    number <= Math.ceil(knowledgeBases.length / pageRow);
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
    setShowKnowledgeBases(
      knowledgeBases.slice(number * pageRow - pageRow, number * pageRow),
    );
  };
  //#endregion

  //#region 關鍵字
  const handleChangeKeyword = async (e) => {
    const { name, value } = e.target;
    setKeyword(value);
  };
  //#endregion

  //#region 開啟新增知識庫Model
  const handleOpenAddKnowledgeBaseModal = async (e) => {
    e.preventDefault();
    setAddKnowledgeBase({
      userId: 0,
      userName: "",
      userAccount: "",
      userPaw: "",
      userAgainPaw: "",
      userLevel: 1,
    });

    setAddKnowledgeBaseErrors({
      userName: "",
      userAccount: "",
      userPaw: "",
      userAgainPaw: "",
    });

    setShowAddKnowledgeBaseModal(true);
  };
  //#endregion

  //#region 關閉新增知識Model
  const handleCloseAddKnowledgeBaseModal = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setShowAddKnowledgeBaseModal(false);
  };
  //#endregion

  //#region 新增知識庫 改變Input的欄位
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddKnowledgeBase({ ...addKnowledgeBase, [name]: value });
  };
  //#endregion

  return (
    <>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 justify-content-between">
            <div />
            <div className="content-header-text-color">
              <h1>
                <strong>
                  {t("knowledgeBase.content.header")}
                  {/*知識庫*/}
                </strong>
              </h1>
            </div>
            <div>
              <button
                type="button"
                className="btn btn-add"
                // onClick={(e) => handleOpenAddKnowledgeBaseModal(e)}
                onClick={() => setIsAddingKnowledge((prev) => !prev)}
                style={{ marginBottom: "10px" }}
              >
                <i className="fas fa-plus" style={{ marginLeft: "2px" }}></i>{" "}
                {t("knowledgeBase.btn.add")}
                {/*新增知識*/}
              </button>
              <br></br>
              <button
                type="button"
                className="btn btn-search"
                // onClick={(e) => handleOpenAddKnowledgeBaseModal(e)}
                onClick={() => setIsConditionSearch((prev) => !prev)}
              >
                <i className="fa fa-search"></i>{" "}
                {t("ConditionSearchDialog.btn.search")}
                {/*條件查詢*/}
              </button>
            </div>
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
                    <th>編號</th>
                    <th>設備種類</th>
                    <th>設備部件</th>
                    <th>維修項目</th>
                    <th>維修類型</th>
                    <th>檔案編號</th>
                  </tr>
                </thead>
                <tbody>
                  {showKnowledgeBases && showKnowledgeBases.length > 0 ? (
                    <>
                      {showKnowledgeBases.map((item, index) => {
                        return (
                          <tr
                            key={item.knowledgeBaseId}
                            className={styles["row"]}
                            onClick={() => (window.location = "/database")}
                          >
                            <td>{item.knowledgeBaseId}</td>
                            <td>{item.knowledgeBaseDeviceType}</td>
                            <td>{item.knowledgeBaseDeviceParts}</td>
                            <td>{item.knowledgeBaseRepairItems}</td>
                            <td>{item.knowledgeBaseRepairType}</td>
                            <td>{item.knowledgeBaseFileNo}</td>
                          </tr>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center" }}>
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

      {isAddingKnowledge && (
        <AddingKnowledge onClose={() => setIsAddingKnowledge(false)} />
      )}
      {isConditionSearch && (
        <ConditionSearchDialog onClose={() => setIsConditionSearch(false)} />
      )}
    </>
  );
}
