import React, { useState, useEffect } from "react";
import { Select, Input } from "antd";
import classNames from "classnames";
import styles from "../../scss/global.module.scss";

const FormGroup = ({
  label,
  id,
  hasRedStar = false,
  inputType = "select",
  options = [],
}) => {
  const [inputValue, setInputValue] = useState([]); // 保持為數組以支持標籤模式
  const [history, setHistory] = useState(() => {
    // 從 localStorage 加載歷史選項
    const savedHistory = localStorage.getItem(id);
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  useEffect(() => {
    // 將歷史選項存儲到 localStorage
    localStorage.setItem(id, JSON.stringify(history));
  }, [history, id]);

  const handleSelectChange = (values) => {
    setInputValue(values);
    // 更新歷史記錄，只添加新的非重複項目
    const newHistory = [...new Set([...history, ...values])];
    setHistory(newHistory);
  };

  return (
    <div className={styles["form-group"]}>
      <label
        htmlFor={id}
      >
        <span className="text-danger">*</span>
        {label}
      </label>
      {inputType === "select" ? (
        <Select
          mode="tags"
          style={{ width: "100%" }}
          placeholder="Select content..."
          value={inputValue}
          onChange={handleSelectChange}
          options={history.map((item) => ({ value: item, label: item }))}
        />
      ) : (
        <Input
          placeholder="Enter content..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{ width: "100%" }}
        />
      )}
    </div>
  );
};

export default FormGroup;
