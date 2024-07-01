import { useEffect, useState } from 'react';
import { AddingKnowledge } from '../components/AddingKnowledge';
import { ConditionSearchDialog } from '../components/ConditionSearchDialog';
import styles from '../scss/global.module.scss';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next'; //語系
import { DebounceInput } from 'react-debounce-input';
import Pagination from 'react-bootstrap/Pagination';
import { ToastContainer, toast } from 'react-toastify';
import { setWindowClass, removeWindowClass } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

import {
  apiGetAllKnowledgeBaseByFilter,
  apiAddKnowledgeBase,
} from '../utils/Api';

const DataArray = [
  {
    id: 1,
    KnowledgeBaseDeviceType: '銑床',
    KnowledgeBaseDeviceParts: '冷卻系統',
    RepairItem: '主軸油冷機故障:1004',
    KnowledgeBaseRepairType: '機械故障',
    KnowledgeBaseFileNo: 'TS31103',
  },
  {
    id: 2,
    KnowledgeBaseDeviceType: '車床',
    KnowledgeBaseDeviceParts: '主軸',
    RepairItem: '機械目前處於是車工件的狀態:2014',
    KnowledgeBaseRepairType: '電控層面',
    KnowledgeBaseFileNo: 'TS23001',
  },
  {
    id: 3,
    KnowledgeBaseDeviceType: '等離子切割機',
    KnowledgeBaseDeviceParts: '保養調教',
    RepairItem: '電線鬆脫:3021',
    KnowledgeBaseRepairType: '零組件',
    KnowledgeBaseFileNo: 'TS18331',
  },
];

// prettier-igonre
export default function Knowledge() {
  const [isAddingKnowledge, setIsAddingKnowledge] = useState(false);
  const [isConditionSearch, setIsConditionSearch] = useState(false);

  const [groupedData, setGroupedData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { t } = useTranslation();
  const [keyword, setKeyword] = useState(''); //關鍵字
  const [knowledgeBases, setKnowledgeBases] = useState([]); //知識庫列表
  const [showKnowledgeBases, setShowKnowledgeBases] = useState([]); //知識庫列表(顯示前端)
  const [rawKnowledgeBases, setRawKnowledgeBases] = useState([]); //原始知識庫列表
  const [showAddKnowledgeBaseModal, setShowAddKnowledgeBaseModal] =
    useState(false); //顯示"新增知識庫modal"
  const [selectedConditions, setSelectedConditions] = useState(null);
  const [hover, setHover] = useState(false);

  const [addKnowledgeBase, setAddKnowledgeBase] = useState({
    //新增單一使用者
    userId: 0,
    userName: '',
    userAccount: '',
    userPaw: '',
    userAgainPaw: '',
    userLevel: 0,
  });

  const [addKnowledgeBaseErrors, setAddKnowledgeBaseErrors] = useState({
    //新增單一使用者錯誤訊息
    userName: '',
    userAccount: '',
    userPaw: '',
    userAgainPaw: '',
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
    setCurrentPage(1); // 重置到第一頁
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
    removeWindowClass('login-page');

    const fetchData = async () => {
      await refreshKnowledgeBases();
    };

    fetchData();
  }, [keyword]);
  //#endregion

  useEffect(() => {
    if (selectedConditions) {
      console.log('rawKnowledgeBases', rawKnowledgeBases);
      console.log('selectedConditions', selectedConditions);

      const filteredData = Object.entries(selectedConditions).reduce(
        (result, [key, value]) => {
          console.log('value', value);
          if (value) {
            return result.filter((item) => item[key] == value.label);
          }
          return result;
        },
        rawKnowledgeBases
      );

      console.log('filteredData', filteredData);
      setShowKnowledgeBases(filteredData);
    }
  }, [selectedConditions, rawKnowledgeBases]);

  //#region 刷新知識庫列表
  const refreshKnowledgeBases = async () => {
    var sendData = {
      keyword: keyword,
    };

    try {
      let knowledgeBasesResponse =
        await apiGetAllKnowledgeBaseByFilter(sendData);
      console.log('Knowledge bases response:', knowledgeBasesResponse);

      if (knowledgeBasesResponse && knowledgeBasesResponse.code === '0000') {
        setKnowledgeBases(knowledgeBasesResponse.result);
        setShowKnowledgeBases(knowledgeBasesResponse.result.slice(0, pageRow));
        console.log('Knowledge bases set successfully.');
      } else {
        console.error(
          'Failed to fetch knowledge bases, code:',
          knowledgeBasesResponse.code
        );
      }
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
    }
  };
  //#endregion

  useEffect(() => {
    refreshKnowledgeBases();
  }, []); // 添加空陣列作為依賴，確保僅在組件掛載時調用一次

  //#region 頁碼
  let pageRow = 5; //一頁幾筆
  const [activePage, setActivePage] = useState(1); //目前停留頁碼

  useEffect(() => {
    // console.log("Total entries:", knowledgeBases.length, "Entries per page:", pageRow);

    let newPages = []; //頁碼
    let totalPages = Math.ceil(knowledgeBases.length / pageRow);
    // console.log("Total pages calculated:", totalPages);

    for (
      let number = 1;
      number <= Math.ceil(knowledgeBases.length / pageRow);
      number++
    ) {
      newPages.push(
        <Pagination.Item
          key={number}
          active={number === activePage}
          onClick={() => handleChangePage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    setPages(newPages); // 將生成的頁碼更新到狀態中
    console.log('Pages set:', newPages);
  }, [knowledgeBases.length, activePage, pageRow]); // 確保當這些依賴更新時重新計算頁碼

  const [pages, setPages] = useState([]); //保存頁碼按鈕

  const handleChangePage = (number) => {
    console.log('Changing page to', number);
    setActivePage(number);
    setCurrentPage(number); // 更新當前頁碼
    const start = (number - 1) * pageRow;
    const end = number * pageRow;
    setShowKnowledgeBases(knowledgeBases.slice(start, end));
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
      userName: '',
      userAccount: '',
      userPaw: '',
      userAgainPaw: '',
      userLevel: 1,
    });

    setAddKnowledgeBaseErrors({
      userName: '',
      userAccount: '',
      userPaw: '',
      userAgainPaw: '',
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

  const navigate = useNavigate();

  const handleRowClick = (item, index) => {
    navigate('/database', {
      state: {
        item: { ...item, index },
        currentPage, // 傳遞當前頁碼
        pageRow, // 傳遞每頁行數
      },
    });
  };

  return (
    <>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 justify-content-between">
            <div />
            <div className="content-header-text-color">
              <h1>
                <strong>
                  {t('knowledgeBase.content.header')}
                  {/*知識庫*/}
                </strong>
              </h1>
            </div>
            <div className="flex flex-col gap-[6px]">
              <button
                type="button"
                className="btn btn-add"
                onClick={() => setIsAddingKnowledge((prev) => !prev)}
              >
                <i className="fas fa-plus" style={{ marginLeft: '2px' }}></i>{' '}
                {t('knowledgeBase.btn.add')}
                {/*新增知識*/}
              </button>
              <button
                type="button"
                className="btn btn-search"
                onClick={() => setIsConditionSearch((prev) => !prev)}
              >
                <i className="fa fa-search"></i>{' '}
                {t('ConditionSearchDialog.btn.search')}
                {/*條件查詢*/}
              </button>
              <button
                type="button"
                className="btn btn-search"
                style={{
                  background: hover ? '#b10000' : '#f83c3c',
                  borderColor: '#f83c3c',
                }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={() => {
                  setSelectedConditions(null);
                  refreshKnowledgeBases();
                }}
              >
                <i className="fa fa-window-close"></i> {'清除條件'}
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
                  placeholder={t('keyword.placeholder')}
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
                            className={styles['row']}
                            onClick={() => handleRowClick(item, index)}
                          >
                            <td>{(currentPage - 1) * pageRow + index + 1}</td>
                            {/* <td>{item.knowledgeBaseId}</td> */}
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
                        <td colSpan="6" style={{ textAlign: 'center' }}>
                          {t('table.empty')}
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
        <ConditionSearchDialog
          onClose={() => setIsConditionSearch(false)}
          setSelectedConditions={setSelectedConditions}
        />
      )}
    </>
  );
}
