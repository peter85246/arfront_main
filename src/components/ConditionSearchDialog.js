import classNames from "classnames";
import styles from "../scss/ConditionSearchDialog.module.scss";
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { components } from "react-select";

export function ConditionSearchDialog({ onClose }) {
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
  const [selectedItems, setSelectedItems] = useState(new Set()); // 儲存已選擇的項目
  const { t } = useTranslation();

  const handleSearchChange = (event) => {
    setSearchFilter(event.target.value.toLowerCase()); // 更新搜索過濾條件
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

  // 處理表單儲存事件
  const handleSave = () => {
    let hasError = false;
    const newErrors = {};

    Object.keys(conditionInfo).forEach((key) => {
      if (!conditionInfo[key] || conditionInfo[key] === "") {
        newErrors[key] = "required";
        hasError = true;
      }
    });

    if (hasError) {
      alert("儲存失敗!");
    } else {
      console.log("全部有效，執行保存!");
      window.location.href = "#";
    }

    setErrors(newErrors);
  };

  // 處理選擇事件
  const handleSelectChange = (selectedOption, { name }) => {
    setConditionInfo({ ...conditionInfo, [name]: selectedOption });
    if (!selectedOption) {
      // When a selection is cleared
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(conditionInfo[name].label);
        return newSet;
      });
    }
  };

  const handleSelect = (item, nextField) => {
    if (nextField && !conditionInfo[nextField]) {
      setConditionInfo((prev) => ({
        ...prev,
        [nextField]: { label: item, value: item },
      }));
      setSelectedItems((prev) => new Set(prev.add(item)));
    }
  };

  const handleDoubleClick = (item) => {
    const nextField = findNextEmptyField();
    if (nextField && !conditionInfo[nextField]) {
      setConditionInfo((prev) => ({
        ...prev,
        [nextField]: { label: item, value: item },
      }));
      setSelectedItems((prev) => new Set(prev.add(item)));
    }
  };

  const findNextEmptyField = () => {
    const fieldsOrder = [
      "knowledgeBaseDeviceType",
      "knowledgeBaseDeviceParts",
      "knowledgeBaseRepairItems",
      "knowledgeBaseRepairType",
      "knowledgeBaseSpec",
      "knowledgeBaseSystem",
      "knowledgeBaseProductName",
    ];
    return fieldsOrder.find((field) => !conditionInfo[field]);
  };

  const handleDragStart = (event, item) => {
    event.dataTransfer.setData("text", item); // 設定拖拉時傳遞的數據
  };

  const handleDrop = (event, field) => {
    event.preventDefault();
    const item = event.dataTransfer.getData("text");
    if (item) {
      setConditionInfo((prev) => ({
        ...prev,
        [field]: { label: item, value: item },
      }));
      setSelectedItems((prev) => new Set(prev.add(item)));
    }
  };

  const allowDrop = (event) => {
    event.preventDefault(); // 阻止預設事件，以允許放下
  };

  return (
    <div>
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          onClose?.();
        }}
        backdrop="static"
        centered
        size="xl" // 設定為超大尺寸
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ marginLeft: "20px" }}>條件查詢</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.leftBoxCondition}>
            <p>可拖動選項至目標欄位填入項目</p>
            <div className={styles.boxCondition1}>
              <input
                type="text"
                id="search"
                className={styles.search}
                placeholder="搜尋全部內容項目"
                autocomplete="off"
                onChange={handleSearchChange}
              />
              <div className={styles.scrollBox} onDragOver={allowDrop}>
                {/* 動態生成的條件項目 */}
                {visibleItems.map((item, index) => (
                  <div
                    key={index}
                    className={classNames(styles.conditionItem)}
                    draggable="true"
                    onDoubleClick={() => handleDoubleClick(item)}
                    onDragStart={(e) => handleDragStart(e, item)}
                  >
                    {item}
                    <div className={styles.icon}>≡</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.rightBoxCondition}>
            <div className={styles.boxCondition2}>
              <div className={styles.formGroupCondition}>
                <label htmlFor="knowledgeBaseDeviceType">設備種類：</label>
                <div
                  className={styles.customSelectCondition}
                  onDrop={(e) => handleDrop(e, "knowledgeBaseDeviceType")}
                  onDragOver={allowDrop}
                >
                  <Select
                    id="knowledgeBaseDeviceType"
                    name="knowledgeBaseDeviceType"
                    value={conditionInfo.knowledgeBaseDeviceType}
                    onChange={handleSelectChange}
                    options={Array.from({ length: 10 }, (_, i) => ({
                      value: `項目${i + 1}`,
                      label: `項目${i + 1}`,
                    }))}
                    isClearable
                    placeholder="Select content..."
                    menuPortalTarget={document.body} // 將選項渲染到 body 元素
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }} // 設置高 z-index 以確保其在最上層
                  />
                </div>
              </div>

              <div className={styles.formGroupCondition}>
                <label htmlFor="knowledgeBaseDeviceParts">設備部件：</label>
                <div
                  className={styles.customSelectCondition}
                  onDrop={(e) => handleDrop(e, "knowledgeBaseDeviceParts")}
                  onDragOver={allowDrop}
                >
                  <Select
                    id="knowledgeBaseDeviceParts"
                    name="knowledgeBaseDeviceParts"
                    value={conditionInfo.knowledgeBaseDeviceParts}
                    onChange={handleSelectChange}
                    options={Array.from({ length: 10 }, (_, i) => ({
                      value: `項目${i + 1}`,
                      label: `項目${i + 1}`,
                    }))}
                    isClearable
                    placeholder="Select content..."
                    menuPortalTarget={document.body} // 將選項渲染到 body 元素
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }} // 設置高 z-index 以確保其在最上層
                  />
                </div>
              </div>

              {/* 繼續為其他選擇框添加相同功能 */}
              {/* 示例：維修項目 */}
              <div className={styles.formGroupCondition}>
                <label htmlFor="knowledgeBaseRepairItems">維修項目：</label>
                <div
                  className={styles.customSelectCondition}
                  onDrop={(e) => handleDrop(e, "knowledgeBaseRepairItems")}
                  onDragOver={allowDrop}
                >
                  <Select
                    id="knowledgeBaseRepairItems"
                    name="knowledgeBaseRepairItems"
                    value={conditionInfo.knowledgeBaseRepairItems}
                    onChange={handleSelectChange}
                    options={Array.from({ length: 10 }, (_, i) => ({
                      value: `項目${i + 1}`,
                      label: `項目${i + 1}`,
                    }))}
                    isClearable
                    placeholder="Select content..."
                    menuPortalTarget={document.body} // 將選項渲染到 body 元素
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }} // 設置高 z-index 以確保其在最上層
                  />
                </div>
              </div>

              <div className={styles.formGroupCondition}>
                <label htmlFor="knowledgeBaseRepairType">維修類型：</label>
                <div
                  className={styles.customSelectCondition}
                  onDrop={(e) => handleDrop(e, "knowledgeBaseRepairType")}
                  onDragOver={allowDrop}
                >
                  <Select
                    id="knowledgeBaseRepairType"
                    name="knowledgeBaseRepairType"
                    value={conditionInfo.knowledgeBaseRepairType}
                    onChange={handleSelectChange}
                    options={Array.from({ length: 10 }, (_, i) => ({
                      value: `項目${i + 1}`,
                      label: `項目${i + 1}`,
                    }))}
                    isClearable
                    placeholder="Select content..."
                    menuPortalTarget={document.body} // 將選項渲染到 body 元素
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }} // 設置高 z-index 以確保其在最上層
                  />
                </div>
              </div>

              <div className={styles.formGroupCondition}>
                <label
                  htmlFor="knowledgeBaseSpec"
                  style={{ width: "48px", marginLeft: "32px" }}
                >
                  規格：
                </label>
                <div
                  className={styles.customSelectCondition}
                  onDrop={(e) => handleDrop(e, "knowledgeBaseSpec")}
                  onDragOver={allowDrop}
                >
                  <Select
                    id="knowledgeBaseSpec"
                    name="knowledgeBaseSpec"
                    value={conditionInfo.knowledgeBaseSpec}
                    onChange={handleSelectChange}
                    options={Array.from({ length: 10 }, (_, i) => ({
                      value: `項目${i + 1}`,
                      label: `項目${i + 1}`,
                    }))}
                    isClearable
                    placeholder="Select content..."
                    menuPortalTarget={document.body} // 將選項渲染到 body 元素
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }} // 設置高 z-index 以確保其在最上層
                  />
                </div>
              </div>

              <div className={styles.formGroupCondition}>
                <label
                  htmlFor="knowledgeBaseSystem"
                  style={{ width: "48px", marginLeft: "32px" }}
                >
                  系統：
                </label>
                <div
                  className={styles.customSelectCondition}
                  onDrop={(e) => handleDrop(e, "knowledgeBaseSystem")}
                  onDragOver={allowDrop}
                >
                  <Select
                    id="knowledgeBaseSystem"
                    name="knowledgeBaseSystem"
                    value={conditionInfo.knowledgeBaseSystem}
                    onChange={handleSelectChange}
                    options={Array.from({ length: 10 }, (_, i) => ({
                      value: `項目${i + 1}`,
                      label: `項目${i + 1}`,
                    }))}
                    isClearable
                    placeholder="Select content..."
                    menuPortalTarget={document.body} // 將選項渲染到 body 元素
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }} // 設置高 z-index 以確保其在最上層
                  />
                </div>
              </div>

              <div className={styles.formGroupCondition}>
                <label htmlFor="knowledgeBaseProductName">產品名稱：</label>
                <div
                  className={styles.customSelectCondition}
                  onDrop={(e) => handleDrop(e, "knowledgeBaseProductName")}
                  onDragOver={allowDrop}
                >
                  <Select
                    id="knowledgeBaseProductName"
                    name="knowledgeBaseProductName"
                    value={conditionInfo.knowledgeBaseProductName}
                    onChange={handleSelectChange}
                    options={Array.from({ length: 10 }, (_, i) => ({
                      value: `項目${i + 1}`,
                      label: `項目${i + 1}`,
                    }))}
                    isClearable
                    placeholder="Select content..."
                    menuPortalTarget={document.body} // 將選項渲染到 body 元素
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }} // 設置高 z-index 以確保其在最上層
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            id="openModalBtn-condition"
            href="./QueryResult.html"
          >
            儲存
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
