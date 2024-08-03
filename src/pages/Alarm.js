import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import styles from '../scss/global.module.scss';
import { useNavigate } from 'react-router-dom'; // 導入 useNavigate
import MindMap from '../components/MindMap';
import MenuTest from '../components/MenuTest';
import { Link } from 'react-router-dom';
import AlarmListTree from '../components/AlarmGroup/AlarmListTree';
import { useTranslation } from 'react-i18next';
import { apiMachineAddOverview } from '../utils/Api';
import { Height } from '@mui/icons-material';

export default function Alarm() {
  const [alarmValue, setAlarmValue] = useState('Select Machine'); // 選中的機台顯示值
  const [dropMenuOpen, setDropMenuOpen] = useState(false); // 下拉菜單開關狀態
  const [machineData, setMachineData] = useState([]); // 機台數據
  const [machineCategory, setMachineCategory] = useState([]); // 機台類型
  const [machineSeries, setMachineSeries] = useState([]); // 機台系列
  const [machineName, setMachineName] = useState([]); // 機台名稱
  const [selectedMachineName, setSelectedMachineName] = useState(''); // 選中的機台名稱
  const [machineNames, setMachineNames] = useState([]); // 存放當選中的 modelSeries 下的所有 children 名稱
  const [selectedModelSeriesKey, setSelectedModelSeriesKey] = useState(''); // 選中的 modelSeries 的 key
  const [selectedKey, setSelectedKey] = useState(''); // 選中的機台的 key
  const [selectedMachineId, setSelectedMachineId] = useState(''); // 選中的機台的 ID
  const [isEditing, setIsEditing] = useState(false); // 編輯狀態
  const [isDeleting, setIsDeleting] = useState(false); // 刪除狀態
  const navigate = useNavigate(); // 創建 navigate 函數實例

  const { t } = useTranslation(); // i18n 語言翻譯函數

  // 選擇機台名稱時的處理函數
  const handleSelectMachineName = (name, key) => {
    const parts = key.split('-');
    const modelSeriesKey = parts.slice(0, 2).join('-');

    setSelectedMachineName(name); // 更新選中的機台名稱
    setAlarmValue(name); // 更新按鈕顯示為選中的機台名稱
    setSelectedKey(key); // 更新選中的機台的 key

    let selectedSeriesChildren = [];
    machineData.forEach((type) => {
      type.children.forEach((series) => {
        if (series.key === modelSeriesKey) {
          selectedSeriesChildren = series.children.map((child) => child.title);
        }
      });
    });
    setMachineNames(selectedSeriesChildren); // 更新下拉菜單顯示同 modelSeries 下的所有機台名稱
  };

  // 刷新機台信息的函數
  const refreshMachineinfos = async (props) => {
    const { machineType, name, series } = props || {};
    var sendData = {
      ...(machineType ? { machineType: machineType } : {}),
      ...(series ? { modelSeries: series } : {}),
      ...(name ? { machineName: name } : {}),
    };

    let machineOverviewResponse = await apiMachineAddOverview(sendData);
    if (machineOverviewResponse && machineOverviewResponse.code === '0000') {
      setMachineCategory(machineOverviewResponse.machineType); // 更新機台類型
      setMachineSeries(machineOverviewResponse.modelSeries); // 更新機台系列
      setMachineName(machineOverviewResponse.machineName); // 更新機台名稱

      const transformedData = transformToTreeData(
        machineOverviewResponse.result
      ); // 轉換數據為樹形結構
      setMachineData(transformedData); // 更新機台數據
    }
  };

  // 將數據轉換為樹形結構的函數
  const transformToTreeData = (data) => {
    let treeMap = new Map();

    data.forEach((item) => {
      if (!treeMap.has(item.machineType)) {
        treeMap.set(item.machineType, {
          title: item.machineType,
          key: item.machineType,
          children: [],
          seriesMap: new Map(),
        });
      }

      let typeNode = treeMap.get(item.machineType);
      let seriesMap = typeNode.seriesMap;

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

      typeNode.children = Array.from(seriesMap.values());
    });

    return Array.from(treeMap.values()).map((item) => ({
      title: item.title,
      key: item.key,
      children: item.children,
    }));
  };

  // 初始化加載數據
  useEffect(() => {
    refreshMachineinfos();
  }, []);

  // 編輯按鈕點擊事件處理函數
  const handleEditButtonClick = () => {
    setIsEditing(true); // 設置為編輯模式
  };

  // 保存按鈕點擊事件處理函數
  const handleSaveButtonClick = () => {
    setIsEditing(false); // 退出編輯模式
  };

  // 刪除按鈕點擊事件處理函數
  const handleDeleteButtonClick = () => {
    setIsDeleting(true); // 設置為刪除模式
  };

  // 使用 navigate 函數來進行程序化導航
  const handleMindMapClick = () => {
    if (selectedMachineId && selectedMachineName) {
      const parts = selectedKey.split('-');
      const modelSeries = parts.length > 1 ? parts[1] : ''; // 假設 key 的格式為 Type-Series-Name，並取第二部分
      navigate('/pageMindMap', {
        state: {
          machineAddId: selectedMachineId,
          modelSeries: modelSeries, // 將 modelSeries 傳遞
          machineName: selectedMachineName, // 將 machineName 傳遞
        },
      });
    }
  };

  useEffect(() => {
    console.log('Selected Machine ID:', selectedMachineId);
  }, [selectedMachineId]);

  console.log('Before navigation - Selected Machine ID:', selectedMachineId);

  return (
    <main>
      <section className="content-header" style={{ marginBottom: '10px' }}>
        <div className="container-fluid">
          <div className="row mb-2 justify-content-between">
            <div />
            <div className="content-header-text-color">
              <h1>
                <strong>
                  {t('alarm.content.header')} {/* 語系翻譯 */}
                </strong>
              </h1>
            </div>
            <div></div>
          </div>
        </div>
      </section>

      {/* 按鈕及下拉菜單 */}
      {/* <div className={styles['buttons-container-item']}>
        <div className={styles['buttons-alarm']}>
          
          <a
            href="#"
            className={classNames(styles['button'], styles['btn-new'])}
            style={{ color: selectedMachineName ? '#266DF7' : '#8F8F8F' }}
          >
            {selectedMachineName || alarmValue}
          </a>

          <span
            className={styles['drop-down-arrow-alarm']}
            onClick={() => setDropMenuOpen((prev) => !prev)}
          >
            ▼
          </span>

          {dropMenuOpen && (
            <ul className={styles['custom-datalist-alarm']}>
              {machineNames.map((name, index) => (
                <li
                  key={index}
                  onClick={() =>
                    handleSelectMachineName(
                      name,
                      `${selectedModelSeriesKey}-${name}`
                    )
                  }
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div> */}

      {/* 主要內容區域 */}
      <div
        className={styles['content-box']}
        style={{ paddingTop: 0, gap: '5px' }}
      >
        {/* 編輯及保存按鈕 */}
        {/* <div className={styles['edit-container']}>
          {isEditing ? (
            <>
              <button
                className={styles['delete-button']}
                onClick={handleDeleteButtonClick}
              >
                刪除
              </button>
              <button
                className={styles['save-button']}
                onClick={handleSaveButtonClick}
              >
                保存
              </button>
            </>
          ) : (
            <button
              className={styles['edit-button']}
              onClick={handleEditButtonClick}
            >
              編輯
            </button>
          )}
        </div> */}

        {/* 左側列表 */}
        <div className={styles['content-box-left-alarm']}>
          <div className={styles['title-bar']}>
            <h3 style={{ padding: '0', marginTop: '20px' }}>機台種類型號</h3>
          </div>
          <div className={styles['menu']}>
            <div className={styles['alarm-list']}>
              <AlarmListTree
                treeData={machineData}
                onSelectMachineName={handleSelectMachineName}
                selectedKey={selectedKey}
                setSelectedMachineId={setSelectedMachineId}
              />
            </div>
          </div>
        </div>

        {/* 右側心智圖區域 */}
        <div className={styles['content-box-right-alarm']} id="alarm-mindMap">
          <p className={styles['mark-text']}>▶ 點擊即可展開心智圖</p>
          <div
            className={styles['mindmap']}
            onClick={handleMindMapClick}
            style={{ marginTop: '-7em', marginLeft: '-10em' }}
          >
            <div className='pointer-events-none'>
              <MenuTest
                key={selectedMachineId}
                machineAddId={selectedMachineId}
                machineName={selectedMachineName}
                defaultZoom={0.7}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
