import { useEffect, useState } from "react";
import { AddingKnowledge } from "../components/AddingKnowledge";
import { ConditionSearchDialog } from "../components/ConditionSearchDialog";
import styles from "../scss/Knowledge.module.scss";
import classNames from "classnames";

const DataArray = [
  {
    id: 1,
    machineCategory: "銑床",
    part: "冷卻系統",
    fixedStatus: "主軸油冷機故障:1004",
    fixedCategory: "機械故障",
    fileNumber: "TS31103"
  },
  {
    id: 2,
    machineCategory: "車床",
    part: "主軸",
    fixedStatus: "機械目前處於是車工件的狀態:2014",
    fixedCategory: "電控層面",
    fileNumber: "TS31103"
  },
  {
    id: 3,
    machineCategory: "(Item3)",
    part: "(Item3)",
    fixedStatus: "(Item3)",
    fixedCategory: "(Item3)",
    fileNumber: "TS31103"
  },
  {
    id: 4,
    machineCategory: "銑床",
    part: "冷卻系統",
    fixedStatus: "主軸油冷機故障:1004",
    fixedCategory: "機械故障",
    fileNumber: "TS31103"
  },
  {
    id: 5,
    machineCategory: "車床",
    part: "主軸",
    fixedStatus: "機械目前處於是車工件的狀態:2014",
    fixedCategory: "電控層面",
    fileNumber: "TS31103"
  },
  {
    id: 6,
    machineCategory: "(Item3)",
    part: "(Item3)",
    fixedStatus: "(Item3)",
    fixedCategory: "(Item3)",
    fileNumber: "TS31103"
  },
  {
    id: 7,
    machineCategory: "銑床",
    part: "冷卻系統",
    fixedStatus: "主軸油冷機故障:1004",
    fixedCategory: "機械故障",
    fileNumber: "TS31103"
  },
  {
    id: 8,
    machineCategory: "車床",
    part: "主軸",
    fixedStatus: "機械目前處於是車工件的狀態:2014",
    fixedCategory: "電控層面",
    fileNumber: "TS31103"
  },
  {
    id: 9,
    machineCategory: "(Item3)",
    part: "(Item3)",
    fixedStatus: "(Item3)",
    fixedCategory: "(Item3)",
    fileNumber: "TS31103"
  },
  {
    id: 10,
    machineCategory: "車床",
    part: "主軸",
    fixedStatus: "機械目前處於是車工件的狀態:2014",
    fixedCategory: "電控層面",
    fileNumber: "TS31103"
  },
  {
    id: 10,
    machineCategory: "車床",
    part: "主軸",
    fixedStatus: "機械目前處於是車工件的狀態:2014",
    fixedCategory: "電控層面",
    fileNumber: "TS31103"
  }
];

export default function Knowledge() {
  const [isAddingKnowledge, setIsAddingKnowledge] = useState(false);
  const [isConditionSearch, setIsConditionSearch] = useState(false);

  const [groupedData, setGroupedData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // 分切資料
    const rows = 5;
    const SlicedData = []
    
    for (let i = 0; i < DataArray.length; i += rows) {
      SlicedData.push(DataArray.slice(i, i + rows));
    }

    setGroupedData(SlicedData);
  }, [currentPage])

  useEffect(() => {
    // 計算分頁
    const data = groupedData[currentPage - 1];
    setCurrentData(data);
  }, [currentData, groupedData, currentPage])

  return (
    <>
      <div className={styles.content}>
        <main>
          <h2>知識庫</h2>
          <div className={styles.content2}>
            <div className={styles.buttonFunction}>
              <button
                className={classNames(styles.button, styles.knowledgeBtn)}
                onClick={() => setIsAddingKnowledge((prev) => !prev)}
              >
                新增知識
              </button>
              <button
                className={classNames(styles.button, styles.conditionBtn)}
                onClick={() => setIsConditionSearch((prev) => !prev)}
              >
                條件查詢
              </button>
              {/* <!-- ... 其他的按鈕 ... --> */}
            </div>
            <div className={styles.contentWrapper}>
              <div className={styles.listSearch}>
                <input
                  type="text"
                  id="searchInput"
                  placeholder="請輸入關鍵字"
                />
              </div>

              <table>
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
                  {currentData?.map((item) => (
                    <tr key={item.id} className={styles.row}>
                      <td>{item.id}</td>
                      <td>{item.machineCategory}</td>
                      <td>{item.part}</td>
                      <td>{item.fixedStatus}</td>
                      <td>{item.fixedCategory}</td>
                      <td>{item.fileNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.buttonPage} id="pagination">
                <button 
                  className={styles.buttonPage1} 
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  {currentPage}
                </button>
                <span className={styles.tab}>...</span>
                <button 
                  className={styles.buttonPage2} 
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, groupedData.length))}
                >
                  {currentPage >= groupedData.length ? '-' : currentPage + 1}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      {isAddingKnowledge && (
        <AddingKnowledge
          onClose={() => setIsAddingKnowledge(false)}
        />
      )}
      {isConditionSearch && (
        <ConditionSearchDialog
          onClose={() => setIsConditionSearch(false)}
        />
      )}
    </>
  );
}
