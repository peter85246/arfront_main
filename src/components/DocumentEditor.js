import classNames from "classnames";
import { useTranslation } from "react-i18next"; //語系
import styles from "../scss/global.module.scss";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // 導入 useNavigate
import { Link } from "react-router-dom";
import FormGroup from "./FormGroup/FormGroup";
import { Space, ColorPicker, theme } from "antd";
import { generate, red, green, blue } from "@ant-design/colors";

import ReactDOM from "react-dom";
import { Container, Header, List } from "semantic-ui-react";

export function DocumentEditor() {
  const uploadModelRef = useRef(null);
  const uploadToolsRef = useRef(null);
  const uploadPositionRef = useRef(null);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate(); // 使用 navigate 來處理導航

  const [textColor, setTextColor] = useState("#000000"); // 初始文字顏色設為黑色

  const { token } = theme.useToken();
  // 生成顏色組合
  const presets = Object.entries({
    primary: generate("#0052cc"), // 這裡使用一個假設的主要顏色
    red: red,
    green: green,
    blue: blue,
  }).map(([label, colors]) => ({ label, colors }));

  // 收集 FormGroup 的輸入
  const handleInputChange = (id, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  // 處理表單提交
  const handleSubmit = () => {
    console.log("Submitting Form Data:", formData);
    // 這裡可以添加將數據發送到後端的代碼
    // 假設提交成功後導航到另一頁面
    navigate("/sop2");
  };

  useLayoutEffect(() => {
    const uploadRefArray = [
      uploadModelRef.current,
      uploadToolsRef.current,
      uploadPositionRef.current,
    ];
    uploadRefArray.forEach((ref) => {
      const uploadBtn = ref.querySelectorAll("button")[0];
      const deleteBtn = ref.querySelectorAll("button")[1];
      const input = ref.querySelectorAll("input")[0];
      const image = ref.querySelectorAll("img")[0];

      input.onchange = () => {
        const file = input.files[0];
        console.log(file);
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            image.src = e.target.result;
            image.style.display = "block";
          };
          reader.readAsDataURL(file);
        }
      };
      uploadBtn.onclick = () => input.click();
      deleteBtn.onclick = () => {
        input.value = "";
        image.src = "";
        image.style.display = "none";
      };
    });
  }, []);

  // 定義一個渲染文本域的方法
  const renderLabeledTextarea = (label, id, placeholder) => {
    return (
      <div className={styles["form-group"]}>
        <label className={styles["red-star"]} htmlFor={id}>
          {label}
        </label>
        <textarea
          className={classNames(styles["text-box"], styles["knowledge-input"])}
          id={id}
          name={id}
          placeholder={placeholder}
        ></textarea>
      </div>
    );
  };

  const formFields = [
    {
      label: "設備種類：",
      id: "invoice-number1",
      options: ["選項1", "選項2", "選項3"],
      hasRedStar: true,
    },
    {
      label: "設備部件：",
      id: "invoice-number2",
      options: ["選項1", "選項2", "選項3"],
      hasRedStar: true,
    },
    {
      label: "維修項目：",
      id: "invoice-number3",
      options: ["選項1", "選項2", "選項3"],
      hasRedStar: true,
    },
    {
      label: "維修類型：",
      id: "invoice-number4",
      options: ["選項1", "選項2", "選項3"],
      hasRedStar: true,
    },
    {
      label: "檔案編號：",
      id: "invoice-number5",
      options: [],
      hasRedStar: true,
    },
    { label: "故障代碼：", id: "invoice-number6", options: [] },
    { label: "規格：", id: "invoice-number7", options: [] },
    { label: "系統：", id: "invoice-number8", options: [] },
    { label: "產品名稱：", id: "invoice-number9", options: [] },
  ];

  return (
    <main>
      <div>
        <h2>故障說明</h2>
        <div className={styles["buttons-container"]}>
          {/* <button type="button" id="btn-save-js" className={classNames(styles["button"], styles["btn-save"])}>
            儲存
          </button> */}
          <button
            type="button"
            className={classNames(styles["button"], styles["btn-save"])}
            id="btn-save-js"
            onClick={handleSubmit} // 處理點擊事件來提交表單
          >
            儲存
          </button>
          <a
            href="/knowledge"
            className={classNames(styles["button"], styles["btn-cancel"])}
          >
            取消
          </a>
          <a
            href="/repairDocument"
            className={classNames(styles["button"], styles["btn-preview"])}
          >
            預覽
          </a>

          <div className={styles["showMachine"]}>
            <a
              href="#"
              className={classNames(
                styles["button"],
                styles["btn-showMachine"],
              )}
            >
              待新增
            </a>
          </div>
        </div>
      </div>
      <div className={styles["back-page"]}>
        <Link to="/knowledge" className={"fas fa-angle-left"}>
          {" "}
          知識庫
        </Link>
      </div>

      <div className={styles["content-box"]} style={{ paddingTop: "5px" }}>
        <div className={styles["content-box-left"]}>
          <div className={styles["dropdown"]}>
            {formFields.map((field) => (
              <FormGroup
                key={field.id}
                label={field.label}
                id={field.id}
                options={field.options}
                hasRedStar={field.hasRedStar}
                onChange={(value) => handleInputChange(field.id, value)}
              />
            ))}
          </div>
        </div>
        <div className={styles["content-box-right"]}>
          <div className={styles["text-area-container"]}>
            <label className={styles["red-star"]} htmlFor="invoice-number10">
              故障發生原因：
            </label>
            <textarea
              type="text"
              className={classNames(
                styles["text-box"],
                styles["knowledge-input"],
              )}
              name="KnowledgeBaseAlarmCause"
              id="invoice-number10"
              style={{ color: textColor }}
            ></textarea>
            <div className={styles["color-picker-container"]}>
              <Space direction="vertical">
                <ColorPicker
                  defaultValue={textColor}
                  size="small"
                  onChange={(color) => setTextColor(color.hex)}
                />
              </Space>
            </div>
          </div>

          <p></p>

          <div className={styles["text-area-container"]}>
            <label className={styles["red-star"]} for="invoice-title">
              故障描述：
            </label>
            <textarea
              type="text"
              className={classNames(
                styles["text-box"],
                styles["knowledge-input"],
              )}
              name="KnowledgeBaseAlarmDesc"
              id="invoice-number11"
              style={{ color: textColor }}
            ></textarea>

            <div className={styles["color-picker-container"]}>
              <Space direction="vertical">
                <ColorPicker
                  defaultValue={textColor}
                  size="small"
                  onChange={(color) => setTextColor(color.hex)}
                />
              </Space>
            </div>
          </div>

          <p></p>

          <div className={styles["text-area-container"]}>
            <label className={styles["red-star"]} for="invoice-title">
              故障發生時機：
            </label>
            <textarea
              type="text"
              className={classNames(
                styles["text-box"],
                styles["knowledge-input"],
              )}
              name="KnowledgeBaseAlarmOccasion"
              id="invoice-number12"
            ></textarea>

            <div className={styles["color-picker-container"]}>
              <Space direction="vertical">
                <ColorPicker
                  defaultValue={textColor}
                  size="small"
                  onChange={(color) => setTextColor(color.hex)}
                />
              </Space>
            </div>
          </div>
          <p></p>

          <label className={styles["red-star"]} for="invoice-title">
            For Model機型：
          </label>
          <div ref={uploadModelRef}>
            <div
              className={styles["image-box"]}
              data-step="stepImage"
              data-id="modelImage"
            >
              <img
                src=""
                className={styles["uploaded-image"]}
                alt="Uploaded Images"
                style={{ display: "none" }}
                id="modelImage"
              />
            </div>
            <div className={styles["image-actions"]}>
              <input
                type="file"
                name="KnowledgeBaseModelImage"
                id="modelImage-image-input"
                className={styles["image-input"]}
                hidden
                data-id="modelImage"
              />
              <button
                className={styles["upload-btn-model"]}
                id="upload-btn-model"
              >
                上傳圖片
              </button>
              <button
                className={styles["delete-btn-model"]}
                id="delete-btn-model"
              >
                刪除圖片
              </button>
            </div>
          </div>
          <p></p>

          <label className={styles["red-star"]} for="invoice-title">
            所有使用工具：
          </label>
          <div ref={uploadToolsRef}>
            <div
              className={styles["image-box"]}
              data-step="stepImage"
              data-id="toolsImage"
            >
              <img
                src=""
                className={styles["uploaded-image"]}
                alt="Uploaded Images"
                style={{ display: "none" }}
                id="toolsImage"
              />
            </div>
            <div className={styles["image-actions"]}>
              <input
                type="file"
                name="KnowledgeBaseToolsImage"
                id="toolsImage-image-input"
                className={styles["image-input"]}
                hidden
                data-id="toolsImage"
              />
              <button
                className={styles["upload-btn-tools"]}
                id="upload-btn-tools"
              >
                上傳圖片
              </button>
              <button
                className={styles["delete-btn-tools"]}
                id="delete-btn-tools"
              >
                刪除圖片
              </button>
            </div>
          </div>
          <p></p>

          <label className={styles["red-star"]} for="invoice-title">
            部位位置：
          </label>
          <div ref={uploadPositionRef}>
            <div
              className={styles["image-box"]}
              data-step="stepImage"
              data-id="positionImage"
            >
              <img
                src=""
                className={styles["uploaded-image"]}
                alt="Uploaded Images"
                style={{ display: "none" }}
                id="positionImage"
              />
            </div>
            <div className={styles["image-actions"]}>
              <input
                type="file"
                name="KnowledgeBasePositionImage"
                id="positionImage-image-input"
                className={styles["image-input"]}
                hidden
                data-id="positionImage"
              />
              <button
                className={styles["upload-btn-position"]}
                id="upload-btn-position"
              >
                上傳圖片
              </button>
              <button
                className={styles["delete-btn-position"]}
                id="delete-btn-position"
              >
                刪除圖片
              </button>
            </div>
          </div>
          <p></p>
        </div>
      </div>
    </main>
  );
}
