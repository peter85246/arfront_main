import React, { useState, useEffect } from "react";
import classNames from "classnames";
import styles from "../../scss/global.module.scss";

const FormGroup = ({ label, id, options, hasRedStar = false }) => {
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState(() => {
    // 從localStorage獲取歷史數據或初始化為空數組
    const savedHistory = localStorage.getItem(id);
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  useEffect(() => {
    // 當歷史數據變化時，更新localStorage
    localStorage.setItem(id, JSON.stringify(history));
  }, [history, id]);

  const handleSelect = (value) => {
    setInputValue(value);
    // 檢查歷史是否已經包含這個新選項（忽略大小寫）
    if (!history.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setHistory([...history, value]);
    }
  };

  return (
    <div className={styles["form-group"]}>
      <label
        className={classNames({ [styles["red-star"]]: hasRedStar })}
        htmlFor={id}
      >
        {label}
      </label>
      <div
        className={classNames(
          styles["custom-select"],
          styles["equipment-field"],
        )}
      >
        <input
          className={classNames(
            styles["fault-Info"],
            styles["knowledge-input"],
          )}
          id={id}
          name={id}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoComplete="off"
        />
        {options.length > 0 && (
          <span
            className={styles["drop-down-arrow"]}
            onClick={() => setInputValue("")}
          >
            ▼
          </span>
        )}{" "}
        <ul className={styles["custom-datalist"]} id={`${id}-options`}>
          {history.map((option, index) => (
            <li
              key={index}
              onClick={() => handleSelect(option)}
              data-value={option}
            >
              {option}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FormGroup;
