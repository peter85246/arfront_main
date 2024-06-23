import classNames from "classnames";
import styles from "../scss/ConditionSearchDialog.module.scss";
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { useTranslation } from "react-i18next";

import { apiGetAllKnowledgeBaseByFilter } from "../utils/Api";

// 創建一個重用的 SelectField 組件
const SelectField = ({
  label,
  fieldName,
  conditionInfo,
  handleDrop,
  handleSelectChange,
  getOptionsForSelect,
  allowDrop,
  labelStyle,
}) => (
  <div className={styles.formGroupCondition}>
    <label htmlFor={fieldName} style={labelStyle}>
      {label}：
    </label>
    <div
      className={styles.customSelectCondition}
      onDrop={(e) => handleDrop(e, fieldName)}
      onDragOver={allowDrop}
    >
      <Select
        id={fieldName}
        name={fieldName}
        value={conditionInfo[fieldName]}
        onChange={handleSelectChange}
        options={getOptionsForSelect(fieldName)}
        isClearable
        placeholder="Select content..."
        menuPortalTarget={document.body}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      />
    </div>
  </div>
);

export function ConditionSearchDialog({ onClose, setSelectedConditions }) {
  const [showModal, setShowModal] = useState(true);
  const [conditionInfo, setConditionInfo] = useState({
    knowledgeBaseDeviceType: null,
    knowledgeBaseDeviceParts: null,
    knowledgeBaseRepairItems: null,
    knowledgeBaseRepairType: null,
    knowledgeBaseFileNo: null,
    knowledgeBaseAlarmCode: null,
    knowledgeBaseSpec: null,
    knowledgeBaseSystem: null,
    knowledgeBaseProductName: null,
  });
  const [errors, setErrors] = useState({});
  const [searchFilter, setSearchFilter] = useState(""); // 用於保存搜索過濾的字符串
  const [databaseItems, setDatabaseItems] = useState([]); // 用於儲存從資料庫撈取的項目

  const allowDrop = (event) => {
    event.preventDefault(); // 阻止默認處理（防止執行不必要的操作，如連結導航）
  };

  const { t } = useTranslation();

  // 當組件掛載時，執行資料獲取
  const fetchData = async (keyword = "") => {
    const response = await apiGetAllKnowledgeBaseByFilter({ keyword });
    console.log("API Response:", response);
    if (response && response.code === "0000") {
      setDatabaseItems(response.result);
      console.log("Fetched Items:", response.result);
    } else {
      console.error("Error fetching data:", response?.message);
    }
  };

  // 當組件掛載時，執行資料獲取
  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchChange = async (event) => {
    const searchValue = event.target.value.toLowerCase();
    // setSearchFilter(searchValue); // 更新搜索過濾字符串
    if (searchValue) {
      const response = await apiGetAllKnowledgeBaseByFilter({
        keyword: searchValue,
      });
      if (response && response.code === "0000") {
        // 過濾數據，確保包括數字和文本類型的數據
        const filteredItems = response.result.reduce((acc, item) => {
          const filteredEntry = {};
          Object.entries(item).forEach(([key, value]) => {
            if (
              displayKeys.includes(key) &&
              value !== null &&
              value !== undefined
            ) {
              // 將所有值轉為字符串並進行小寫處理，以便匹配
              const valueStr = value.toString().toLowerCase();
              if (valueStr.includes(searchValue)) {
                filteredEntry[key] = value;
              } else if (
                !isNaN(value) &&
                value.toString().includes(searchValue)
              ) {
                // 特殊處理數字匹配
                filteredEntry[key] = value;
              }
            }
          });
          if (Object.keys(filteredEntry).length > 0) {
            acc.push(filteredEntry);
          }
          return acc;
        }, []);
        setDatabaseItems(filteredItems); // 更新顯示項目
      } else {
        console.error("Error fetching data:", response?.message);
      }
    } else {
      fetchData(); // 如果沒有搜索關鍵字，則重新獲取所有數據
    }
  };

  const visibleItems = Array.from(
    { length: 10 },
    (_, i) => `項目${i + 1}`,
  ).filter((item) => item.toLowerCase().includes(searchFilter)); // 過濾並確認項目是否應該顯示

  // 處理模態窗關閉事件
  const handleCloseModal = () => {
    setShowModal(false);
    onClose?.();
  };

  // 使用集合來追蹤已經顯示的數據，避免重複
  const shownItems = new Set();

  // 處理表單儲存事件
  const handleSave = () => {
    let hasError = false;
    const newErrors = {};

    // 檢查必填欄位是否都已填寫
    Object.keys(conditionInfo).forEach((key) => {
      if (!conditionInfo[key] || conditionInfo[key] === "") {
        newErrors[key] = "required";
        hasError = true;
      }
    });

    // 如果有錯誤，不進行保存
    if (hasError) {
      alert("儲存失敗!");
    } else {
      console.log("全部有效，執行保存!");
      window.location.href = "#";
    }

    setErrors(newErrors);
  };

  const handleSelectChange = (selectedOption, { name }) => {
    if (!selectedOption) {
      // 當選擇被清除時，將項目返回到 databaseItems
      const currentItem = conditionInfo[name];
      setDatabaseItems((prev) => [...prev, { [name]: currentItem.value }]);
    }
    setConditionInfo({ ...conditionInfo, [name]: selectedOption });
  };

  // 更新handleDoubleClick，確保只處理點擊的項目
  const handleDoubleClick = (item, field) => {
    if (item && field && item[field]) {
      setConditionInfo((prev) => ({
        ...prev,
        [field]: { label: item[field], value: item[field] },
      }));
    }
  };

  // 指定需要顯示的鍵
  const displayKeys = [
    "knowledgeBaseDeviceType",
    "knowledgeBaseDeviceParts",
    "knowledgeBaseRepairItems",
    "knowledgeBaseRepairType",
    "knowledgeBaseSpec",
    "knowledgeBaseSystem",
    "knowledgeBaseProductName",
  ];

  const handleDragStart = (event, item) => {
    event.dataTransfer.setData("text/plain", JSON.stringify(item));
  };

  // 更新handleDrop方法以適應拖放操作
  const handleDrop = (event, field) => {
    event.preventDefault();
    const item = JSON.parse(event.dataTransfer.getData("text/plain"));
    // 如果欄位已被填入，則覆蓋並將被覆蓋的項目放回到 databaseItems
    const currentValue = conditionInfo[field];
    if (currentValue) {
      setDatabaseItems((prevItems) => [
        ...prevItems,
        { [field]: currentValue.value },
      ]);
    }
    setConditionInfo((prev) => ({
      ...prev,
      [field]: { label: item[field], value: item[field] },
    }));
  };

  // Select欄位展開資料庫數據
  const getOptionsForSelect = (fieldName) => {
    return databaseItems
      .map((item) => ({ value: item[fieldName], label: item[fieldName] }))
      .filter(
        (option, index, self) =>
          index ===
          self.findIndex(
            (t) => t.label === option.label && t.value === option.value,
          ),
      );
  };

  const fieldNames = [
    {
      field: "knowledgeBaseDeviceType",
      label: t("ConditionSearchDialog.knowledgeBaseDeviceType"),
    },
    {
      field: "knowledgeBaseDeviceParts",
      label: t("ConditionSearchDialog.knowledgeBaseDeviceParts"),
    },
    {
      field: "knowledgeBaseRepairItems",
      label: t("ConditionSearchDialog.knowledgeBaseRepairItems"),
    },
    {
      field: "knowledgeBaseRepairType",
      label: t("ConditionSearchDialog.knowledgeBaseRepairType"),
    },
    {
      field: "knowledgeBaseSpec",
      label: t("ConditionSearchDialog.knowledgeBaseSpec"),
      labelStyle: { marginLeft: "32px" },
    },
    {
      field: "knowledgeBaseSystem",
      label: t("ConditionSearchDialog.knowledgeBaseSystem"),
      labelStyle: { marginLeft: "32px" },
    },
    {
      field: "knowledgeBaseProductName",
      label: t("ConditionSearchDialog.knowledgeBaseProductName"),
    },
  ];

  return (
    <div>
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        backdrop="static"
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("ConditionSearchDialog.btn.search")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.leftBoxCondition}>
            {t("ConditionSearchDialog.canInput")}
            {/* 可拖動 & 點擊項目填入右側欄位 */}
            <div className={styles.boxCondition1}>
              <input
                type="text"
                id="search"
                className={styles.search}
                placeholder="搜尋全部內容項目"
                autocomplete="off"
                onChange={handleSearchChange}
              />
              <div className={styles.scrollBox}>
                {databaseItems.map((item, index) =>
                  Object.entries(item)
                    .filter(
                      ([key, value]) => displayKeys.includes(key) && value,
                    )
                    .map(([key, value]) => {
                      if (!shownItems.has(value)) {
                        shownItems.add(value); // 記錄顯示的數據，避免重複
                        return (
                          <div
                            key={`${key}-${index}`}
                            className={classNames(
                              styles.conditionItem,
                              styles.draggableItem,
                              {
                                [styles.selectedItem]:
                                  conditionInfo[key] &&
                                  conditionInfo[key].value === value,
                              },
                            )}
                            draggable="true"
                            onDoubleClick={() => handleDoubleClick(item, key)}
                            onDragStart={(e) => handleDragStart(e, item)}
                          >
                            {`${value}`}
                            <div className={styles.icon}>
                              {conditionInfo[key] &&
                              conditionInfo[key].value === value
                                ? "✓"
                                : "≡"}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }),
                )}
              </div>
            </div>
          </div>

          <div className={styles.rightBoxCondition}>
            <div className={styles.boxCondition2}>
              {fieldNames.map(({ field, label, labelStyle }) => (
                <SelectField
                  key={field}
                  label={label}
                  fieldName={field}
                  conditionInfo={conditionInfo}
                  setConditionInfo={setConditionInfo}
                  handleDrop={handleDrop}
                  handleSelectChange={handleSelectChange}
                  getOptionsForSelect={getOptionsForSelect}
                  allowDrop={allowDrop}
                  labelStyle={labelStyle}
                />
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            取消
          </Button>
          <Button
            variant="primary"
            // onClick={handleSave}
            id="openModalBtn-condition"
            onClick={() => {
              Object.entries(conditionInfo).forEach(([key, value]) => {
                if (value) {
                  setSelectedConditions(conditionInfo)
                }
              });
              handleCloseModal()
            }}
          >
            儲存
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
