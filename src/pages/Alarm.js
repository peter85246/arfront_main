import { useCallback, useState, useEffect } from "react";
import classNames from "classnames";
import styles from "../scss/global.module.scss";
import MindMap from "../components/MindMap";
import { Link } from "react-router-dom";
import AlarmListTree from "../components/AlarmGroup/AlarmListTree";
import { useTranslation } from "react-i18next"; //語系
import { apiMachineAddOverview } from "../utils/Api";

export default function Alarm() {
  const [alarmValue, setAlarmValue] = useState("Select Machine");
  const [dropMenuOpen, setDropMenuOpen] = useState(false);
  const [machineData, setMachineData] = useState([]); // 將初始樹形數據設置為空數組
  const [machineCategory, setMachineCategory] = useState([]);
  const [machineSeries, setMachineSeries] = useState([]);
  const [machineName, setMachineName] = useState([]);
  const [selectedMachineName, setSelectedMachineName] = useState("");
  const [machineNames, setMachineNames] = useState([]); // 儲存當選中的 modelSeries 下的所有 children 名稱
  const [selectedModelSeriesKey, setSelectedModelSeriesKey] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedMachineId, setSelectedMachineId] = useState("");

  const { t } = useTranslation();

  const handleSelectMachineName = (name, key) => {
    const parts = key.split("-");
    const modelSeriesKey = parts.slice(0, 2).join("-"); // 取得 "Type1-ModelSeries1"

    setSelectedMachineName(name);
    setAlarmValue(name); // 更新按鈕顯示為選中的 machineName
    setSelectedKey(key); // 更新 key

    // 從 machineData 中找到相應的 modelSeries
    let selectedSeriesChildren = [];
    machineData.forEach((type) => {
      type.children.forEach((series) => {
        if (series.key === modelSeriesKey) {
          selectedSeriesChildren = series.children.map((child) => child.title);
        }
      });
    });
    setMachineNames(selectedSeriesChildren); // 更新下拉菜單顯示同 modelSeries 下的所有 machineName
  };

  const refreshMachineinfos = async (props) => {
    const { machineType, name, series } = props || {};
    var sendData = {
      ...(machineType ? { machineType: machineType } : {}),
      ...(series ? { modelSeries: series } : {}),
      ...(name ? { machineName: name } : {}),
    };

    let machineOverviewResponse = await apiMachineAddOverview(sendData);
    if (machineOverviewResponse && machineOverviewResponse.code === "0000") {
      // 更新機台類型和系列
      setMachineCategory(machineOverviewResponse.machineType);
      setMachineSeries(machineOverviewResponse.modelSeries);
      setMachineName(machineOverviewResponse.machineName);

      // 轉換數據並設置
      const transformedData = transformToTreeData(
        machineOverviewResponse.result,
      );
      setMachineData(transformedData);
    }
  };

  const transformToTreeData = (data) => {
    let treeMap = new Map();

    data.forEach((item) => {
      if (!treeMap.has(item.machineType)) {
        treeMap.set(item.machineType, {
          title: item.machineType,
          key: item.machineType,
          children: [],
          seriesMap: new Map(), // 為每个 machineType 添加一个 seriesMap
        });
      }

      let typeNode = treeMap.get(item.machineType);
      let seriesMap = typeNode.seriesMap; // 獲取現有的 seriesMap

      let seriesKey = `${item.machineType}-${item.modelSeries}`;
      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, {
          title: item.modelSeries,
          key: seriesKey,
          children: [],
        });
      }

      let seriesNode = seriesMap.get(seriesKey);
      seriesNode.children.push({
        title: item.machineName,
        key: `${seriesKey}-${item.machineName}`, // 確保key的唯一性
        machineAddId: item.machineAddId,
      });

      // 重新構建 children 數組
      typeNode.children = Array.from(seriesMap.values());
    });

    return Array.from(treeMap.values()).map((item) => ({
      title: item.title,
      key: item.key,
      children: item.children,
    }));
  };

  useEffect(() => {
    refreshMachineinfos(); // 初始加載數據
  }, []);

  return (
    <main>
      <section className="content-header" style={{ marginBottom: "10px" }}>
        <div className="container-fluid">
          <div className="row mb-2 justify-content-between">
            <div />
            <div className="content-header-text-color">
              <h1>
                <strong>
                  {t("alarm.content.header")}
                  {/*故障庫*/}
                </strong>
              </h1>
            </div>
            <div></div>
          </div>
        </div>
      </section>
      <div>
        <div className={styles["buttons-container-item"]}>
          <div className={styles["buttons-alarm"]}>
            <a
              href="#"
              className={classNames(styles["button"], styles["btn-new"])}
              style={{ color: selectedMachineName ? "#266DF7" : "#8F8F8F" }}
            >
              {selectedMachineName || alarmValue}
            </a>
            <span
              className={styles["drop-down-arrow-alarm"]}
              onClick={() => setDropMenuOpen((prev) => !prev)}
            >
              ▼
            </span>
            {dropMenuOpen && (
              <ul className={styles["custom-datalist-alarm"]}>
                {machineNames.map((name, index) => (
                  <li
                    key={index}
                    onClick={() =>
                      handleSelectMachineName(
                        name,
                        `${selectedModelSeriesKey}-${name}`,
                      )
                    }
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* <!-- <span id="addMachineBtn" className={styles["alarm-add-machine">&#43;</span> --> */}
        </div>
      </div>

      <div
        className={styles["content-box"]}
        style={{ paddingTop: 0, gap: "5px" }}
      >
        {/* <!-- 編輯按鈕容器 --> */}
        <div className={styles["edit-container"]}>
          <button className={styles["edit-button"]}>編輯</button>
        </div>
        <div className={styles["content-box-left-alarm"]}>
          {/* <!-- 標題 --> */}
          <div className={styles["title-bar"]}>
            <h3 style={{ padding: "0", marginTop: "20px" }}>機台種類型號</h3>
          </div>

          <div className={styles["menu"]}>
            <div className={styles["alarm-list"]}>
              <AlarmListTree
                treeData={machineData}
                onSelectMachineName={handleSelectMachineName}
                selectedKey={selectedKey}
                setSelectedMachineId={setSelectedMachineId}
              />
            </div>
          </div>
        </div>
        {/* <!--右側欄位內容--> */}
        <div className={styles["content-box-right-alarm"]} id="alarm-mindMap">
          {
            selectedMachineId && (
              <Link to="/pageMindMap">
                <p className={styles["mark-text"]}>▶ 點擊即可展開心智圖</p>
                {/* <!-- 內容待添加 --> */}
                <div className={styles["mindmap"]}>
                  {/* <div className={styles["node central-node"]} id="central-node"> */}
                  {/* <!-- <div className={styles["add-btn left">+</div> --> */}
                  {/* <span>心智圖</span> */}
                  {/* <!-- <div className={styles["add-btn right">+</div> --> */}
                  {/* </div> */}
                  <MindMap machineAddId={selectedMachineId} />
                </div>
              </Link>
            )
          }
        </div>
      </div>
    </main>
  );
}
