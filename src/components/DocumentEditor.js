import classNames from "classnames";
import { useTranslation } from "react-i18next"; //語系
import styles from "../scss/global.module.scss";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // 導入 useNavigate
import { Link } from "react-router-dom";
import FormGroup from "./FormGroup/FormGroup";
import { Space, ColorPicker, theme, Flex, Input } from "antd";
import { generate, red, green, blue } from "@ant-design/colors";
import Spinner from "react-bootstrap/Spinner";
import SimpleReactValidator from "simple-react-validator";
import { ToastContainer, toast } from "react-toastify";

import {
  apiGetAllKnowledgeBaseByMachineAddId,
  apiSaveKnowledgeBase,
} from "../utils/Api";

const { TextArea } = Input;
const onChange = (e) => {
  console.log(e);
};

export function DocumentEditor() {
  const uploadModelRef = useRef(null);
  const uploadToolsRef = useRef(null);
  const uploadPositionRef = useRef(null);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate(); // 使用 navigate 來處理導航
  const { t } = useTranslation();

  const [textColor, setTextColor] = useState("#000000"); // 初始文字顏色設為黑色
  const validator = new SimpleReactValidator({
    autoForceUpdate: this,
  });

  const [knowledgeInfo, setKnowledgeInfo] = useState({
    //新增以及修改內容
    knowledgeBaseId: 0,
    knowledgeBaseDeviceType: "", //設備種類
    knowledgeBaseDeviceParts: "", //設備部件
    knowledgeBaseRepairItems: "", //維修項目
    knowledgeBaseRepairType: "", //維修類型
    knowledgeBaseFileNo: "", //檔案編號
    knowledgeBaseAlarmCode: "", //故障代碼
    knowledgeBaseSpec: "", //規格
    knowledgeBaseSystem: "", //系統
    knowledgeBaseProductName: "", //產品名稱
    knowledgeBaseAlarmCause: "", //故障發生原因
    knowledgeBaseAlarmDesc: "", //故障描述
    knowledgeBaseAlarmOccasion: "", //故障發生時機
    knowledgeBaseModelImage: "", //Model機型路徑
    knowledgeBaseModelImageObj: null, //Model機型圖片物件
    isDeletedKnowledgeBaseModelImage: false, //是否刪除Model機型圖片
    knowledgeBaseToolsImage: "", //Tools機型路徑
    knowledgeBaseToolsImageObj: null, //Tools工具圖片物件
    isDeletedKnowledgeBaseToolsImage: false, //是否刪除Tools工具圖片
    knowledgeBasePositionImage: "", //Position位置路徑
    knowledgeBasePositionImageObj: null, //Position位置圖片物件
    isDeletedKnowledgeBasePositionImage: false, //是否刪除Position位置圖片
  });

  const [knowledgeInfoErrors, setKnowledgeInfoErrors] = useState({
    //錯誤訊息
    knowledgeBaseDeviceType: "", //設備種類
    knowledgeBaseDeviceParts: "", //設備部件
    knowledgeBaseRepairItems: "", //維修項目
    knowledgeBaseRepairType: "", //維修類型
    knowledgeBaseFileNo: "", //檔案編號
    knowledgeBaseAlarmCode: "", //故障代碼
    knowledgeBaseSpec: "", //規格
    knowledgeBaseSystem: "", //系統
    knowledgeBaseProductName: "", //產品名稱
    knowledgeBaseAlarmCause: "", //故障發生原因
    knowledgeBaseAlarmDesc: "", //故障描述
    knowledgeBaseAlarmOccasion: "", //故障發生時機
    knowledgeBaseModelImage: "", //Model圖片路徑
    knowledgeBaseToolsImage: "", //Tools圖片路徑
    knowledgeBasePositionImage: "", //Position圖片路徑
  });

  //#region 故障說明 欄位驗證
  const checkEditValidator = async (name = "", val = "") => {
    let result = true;
    let newKnowledgeInfoErrors = { ...knowledgeInfoErrors };

    if (name == "knowledgeBaseDeviceType" || name == "") {
      if (!validator.check(knowledgeInfo.knowledgeBaseDeviceType, "required")) {
        newKnowledgeInfoErrors.knowledgeBaseDeviceType = "required";
        result = false;
      } else if (
        !validator.check(knowledgeInfo.knowledgeBaseDeviceType, "max:100")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseDeviceType = "max";
        result = false;
      } else {
        newKnowledgeInfoErrors.knowledgeBaseDeviceType = "";
      }
    }

    if (name == "knowledgeBaseDeviceParts" || name == "") {
      if (
        !validator.check(knowledgeInfo.knowledgeBaseDeviceParts, "required")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseDeviceParts = "required";
        result = false;
      } else if (
        !validator.check(knowledgeInfo.knowledgeBaseDeviceParts, "max:100")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseDeviceParts = "max";
        result = false;
      } else {
        newKnowledgeInfoErrors.knowledgeBaseDeviceParts = "";
      }
    }

    if (name == "knowledgeBaseRepairItems" || name == "") {
      if (
        !validator.check(knowledgeInfo.knowledgeBaseRepairItems, "required")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseRepairItems = "required";
        result = false;
      } else if (
        !validator.check(knowledgeInfo.knowledgeBaseRepairItems, "max:100")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseRepairItems = "max";
        result = false;
      } else {
        newKnowledgeInfoErrors.knowledgeBaseRepairItems = "";
      }
    }

    if (name == "knowledgeBaseRepairType" || name == "") {
      if (!validator.check(knowledgeInfo.knowledgeBaseRepairType, "required")) {
        newKnowledgeInfoErrors.knowledgeBaseRepairType = "required";
        result = false;
      } else if (
        !validator.check(knowledgeInfo.knowledgeBaseRepairType, "max:100")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseRepairType = "max";
        result = false;
      } else {
        newKnowledgeInfoErrors.knowledgeBaseRepairType = "";
      }
    }

    if (name == "knowledgeBaseFileNo" || name == "") {
      if (!validator.check(knowledgeInfo.knowledgeBaseFileNo, "required")) {
        newKnowledgeInfoErrors.knowledgeBaseFileNo = "required";
        result = false;
      } else if (
        !validator.check(knowledgeInfo.knowledgeBaseFileNo, "max:100")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseFileNo = "max";
        result = false;
      } else {
        newKnowledgeInfoErrors.knowledgeBaseFileNo = "";
      }
    }

    if (name == "knowledgeBaseAlarmCode" || name == "") {
      if (!validator.check(knowledgeInfo.knowledgeBaseAlarmCode, "required")) {
        newKnowledgeInfoErrors.knowledgeBaseAlarmCode = "required";
        result = false;
      } else if (
        !validator.check(knowledgeInfo.knowledgeBaseAlarmCode, "max:100")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseAlarmCode = "max";
        result = false;
      } else {
        newKnowledgeInfoErrors.knowledgeBaseAlarmCode = "";
      }
    }

    if (name == "knowledgeBaseRepairItems" || name == "") {
      if (
        !validator.check(knowledgeInfo.knowledgeBaseRepairItems, "required")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseRepairItems = "required";
        result = false;
      } else if (
        !validator.check(knowledgeInfo.knowledgeBaseRepairItems, "max:100")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseRepairItems = "max";
        result = false;
      } else {
        newKnowledgeInfoErrors.knowledgeBaseRepairItems = "";
      }
    }

    if (name == "knowledgeBaseSpec" || name == "") {
      if (!validator.check(knowledgeInfo.knowledgeBaseSpec, "required")) {
        newKnowledgeInfoErrors.knowledgeBaseSpec = "required";
        result = false;
      } else if (!validator.check(knowledgeInfo.knowledgeBaseSpec, "max:100")) {
        newKnowledgeInfoErrors.knowledgeBaseSpec = "max";
        result = false;
      } else {
        newKnowledgeInfoErrors.knowledgeBaseSpec = "";
      }
    }

    if (name == "knowledgeBaseSystem" || name == "") {
      if (!validator.check(knowledgeInfo.knowledgeBaseSystem, "required")) {
        newKnowledgeInfoErrors.knowledgeBaseSystem = "required";
        result = false;
      } else if (
        !validator.check(knowledgeInfo.knowledgeBaseSystem, "max:100")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseSystem = "max";
        result = false;
      } else {
        newKnowledgeInfoErrors.knowledgeBaseSystem = "";
      }
    }

    if (name == "knowledgeBaseProductName" || name == "") {
      if (
        !validator.check(knowledgeInfo.knowledgeBaseProductName, "required")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseProductName = "required";
        result = false;
      } else if (
        !validator.check(knowledgeInfo.knowledgeBaseProductName, "max:100")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseProductName = "max";
        result = false;
      } else {
        newKnowledgeInfoErrors.knowledgeBaseProductName = "";
      }
    }

    if (name == "knowledgeBaseAlarmCause" || name == "") {
      if (!validator.check(knowledgeInfo.knowledgeBaseAlarmCause, "required")) {
        newKnowledgeInfoErrors.knowledgeBaseAlarmCause = "required";
        result = false;
      } else if (
        !validator.check(knowledgeInfo.knowledgeBaseAlarmCause, "max:400")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseAlarmCause = "max";
        result = false;
      } else {
        newKnowledgeInfoErrors.knowledgeBaseAlarmCause = "";
      }
    }

    if (name == "knowledgeBaseAlarmDesc" || name == "") {
      if (!validator.check(knowledgeInfo.knowledgeBaseAlarmDesc, "required")) {
        newKnowledgeInfoErrors.knowledgeBaseAlarmDesc = "required";
        result = false;
      } else if (
        !validator.check(knowledgeInfo.knowledgeBaseAlarmDesc, "max:400")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseAlarmDesc = "max";
        result = false;
      } else {
        newKnowledgeInfoErrors.knowledgeBaseAlarmDesc = "";
      }
    }

    if (name == "knowledgeBaseAlarmOccasion" || name == "") {
      if (
        !validator.check(knowledgeInfo.knowledgeBaseAlarmOccasion, "required")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseAlarmOccasion = "required";
        result = false;
      } else if (
        !validator.check(knowledgeInfo.knowledgeBaseAlarmOccasion, "max:400")
      ) {
        newKnowledgeInfoErrors.knowledgeBaseAlarmOccasion = "max";
        result = false;
      } else {
        newKnowledgeInfoErrors.knowledgeBaseAlarmOccasion = "";
      }
    }

    if (name == "") {
      if (newKnowledgeInfoErrors.knowledgeBaseModelImage != "") {
        result = false;
      }
    }
    if (name == "") {
      if (newKnowledgeInfoErrors.knowledgeBaseToolsImage != "") {
        result = false;
      }
    }
    if (name == "") {
      if (newKnowledgeInfoErrors.knowledgeBasePositionImage != "") {
        result = false;
      }
    }

    setKnowledgeInfoErrors(newKnowledgeInfoErrors);
    return result;
  };
  //#endregion

  // 處理表單提交
  const handleSaveKnowledgeInfo = async (e) => {
    console.log("Submitting Form Data:", formData);

    e.preventDefault();

    let newKnowledgeInfoErrors = { ...knowledgeInfoErrors };
    let newKnowledgeInfo = { ...knowledgeInfo };
    if (newKnowledgeInfoErrors.knowledgeBaseModelImage != "") {
      newKnowledgeInfo.knowledgeBaseModelImageObj = null;
    }
    if (newKnowledgeInfoErrors.knowledgeBaseToolsImage != "") {
      newKnowledgeInfo.knowledgeBaseToolsImageObj = null;
    }
    if (newKnowledgeInfoErrors.knowledgeBasePositionImage != "") {
      newKnowledgeInfo.knowledgeBasePositionImageObj = null;
    }

    if (await checkEditValidator()) {
      setSaveKnowledgeInfoLoading(true);

      var formData = new FormData();

      formData.append(
        "KnowledgeBases[0].KnowledgeBaseId",
        newKnowledgeInfo.knowledgeBaseId,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBaseDeviceType",
        newKnowledgeInfo.knowledgeBaseDeviceType,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBaseDeviceParts",
        newKnowledgeInfo.knowledgeBaseDeviceParts,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBaseRepairItems",
        newKnowledgeInfo.knowledgeBaseRepairItems,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBaseRepairType",
        newKnowledgeInfo.knowledgeBaseRepairType,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBaseFileNo",
        newKnowledgeInfo.knowledgeBaseFileNo,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBaseAlarmCode",
        newKnowledgeInfo.knowledgeBaseAlarmCode,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBaseSpec",
        newKnowledgeInfo.knowledgeBaseSpec,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBaseSystem",
        newKnowledgeInfo.knowledgeBaseSystem,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBaseProductName",
        newKnowledgeInfo.knowledgeBaseProductName,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBaseAlarmCause",
        newKnowledgeInfo.knowledgeBaseAlarmCause,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBaseAlarmDesc",
        newKnowledgeInfo.knowledgeBaseAlarmDesc,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBaseAlarmOccasion",
        newKnowledgeInfo.knowledgeBaseAlarmOccasion,
      );

      formData.append(
        "KnowledgeBases[0].KnowledgeBaseModelImage",
        newKnowledgeInfo.knowledgeBaseModelImage,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBaseModelImageObj",
        newKnowledgeInfo.knowledgeBaseModelImageObj,
      );
      formData.append(
        "isDeleteKnowledgeBaseModelImage",
        newKnowledgeInfo.isDeleteKnowledgeBaseModelImage,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBaseToolsImage",
        newKnowledgeInfo.knowledgeBaseToolsImage,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBaseToolsImageObj",
        newKnowledgeInfo.knowledgeBaseToolsImageObj,
      );
      formData.append(
        "isDeleteKnowledgeBaseToolsImage",
        newKnowledgeInfo.isDeleteKnowledgeBaseToolsImage,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBasePositionImage",
        newKnowledgeInfo.knowledgeBasePositionImage,
      );
      formData.append(
        "KnowledgeBases[0].KnowledgeBasePositionImageObj",
        newKnowledgeInfo.knowledgeBasePositionImageObj,
      );
      formData.append(
        "isDeletedKnowledgeBasePositionImage",
        newKnowledgeInfo.isDeletedKnowledgeBasePositionImage,
      );

      let knowledgeInfoResponse = await apiSaveKnowledgeBase(formData);
      if (knowledgeInfoResponse) {
        if (knowledgeInfoResponse.code == "0000") {
          toast.success(
            newKnowledgeInfo.knowledgeBaseId == 0
              ? t("toast.add.success")
              : t("toast.edit.success"),
            {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 3000,
              hideProgressBar: true,
              closeOnClick: false,
              pauseOnHover: false,
            },
          );
        } else {
          toast.error(knowledgeInfoResponse.message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
          });
        }
        setSaveKnowledgeInfoLoading(false);
      } else {
        setSaveKnowledgeInfoLoading(false);
      }
    }
    // 這裡可以添加將數據發送到後端的代碼
    // 假設提交成功後導航到另一頁面
    navigate("/sop2");
  };

  const [saveKnowledgeInfoLoading, setSaveKnowledgeInfoLoading] =
    useState(false); //儲存的轉圈圈

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
      inputType: "input",
      hasRedStar: true,
    },
    { label: "故障代碼：", id: "invoice-number6", inputType: "input" },
    { label: "規格：", id: "invoice-number7", inputType: "input" },
    { label: "系統：", id: "invoice-number8", inputType: "input" },
    { label: "產品名稱：", id: "invoice-number9", inputType: "input" },
  ];

  return (
    <main>
      <div>
        <section className="content-header" style={{marginBottom:'10px'}}>
        <div className="container-fluid">
          <div className="row mb-2 justify-content-between">
            <div />
            <div className="content-header-text-color">
              <h1>
                <strong>
                  {t("documentEditor.content.header")}
                  {/*故障說明*/}
                </strong>
              </h1>
            </div>
            <div>
            </div>
          </div>
        </div>
      </section>
        <div className={styles["buttons-container"]}>
          <button
            type="button"
            className={classNames(styles["button"], styles["btn-save"])}
            disabled={saveKnowledgeInfoLoading}
            onClick={handleSaveKnowledgeInfo}
          >
            {saveKnowledgeInfoLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              </>
            ) : (
              <span>
                {t("btn.save")}
                {/*儲存*/}
              </span>
            )}
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
                hasRedStar={field.hasRedStar}
                inputType={field.inputType}
                // 去除 options 傳遞給 input 類型的欄位
              />
            ))}
          </div>
        </div>
        <div className={styles["content-box-right"]}>
          <div className={styles["text-area-container"]}>
            <span className="text-danger">*</span>
            <label htmlFor="invoice-number10">故障發生原因：</label>
            <TextArea
              name="knowledgeBaseAlarmCause"
              id="invoice-number10"
              placeholder="Enter content..."
              allowClear={true} // 啟用清除圖標
              onChange={onChange}
              style={{ color: textColor, height: "150px" }} // 注意：請確保 textColor 已經定義
            />
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
            <span className="text-danger">*</span>
            <label htmlFor="invoice-number11">故障描述：</label>
            <TextArea
              name="knowledgeBaseAlarmDesc"
              id="invoice-number11"
              placeholder="Enter content..."
              allowClear={true} // 啟用清除圖標
              onChange={onChange}
              style={{ color: textColor, height: "150px" }} // 注意：請確保 textColor 已經定義
            />

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
            <span className="text-danger">*</span>
            <label htmlFor="invoice-number12">故障發生時機：</label>
            <TextArea
              name="knowledgeBaseAlarmOccasion"
              id="invoice-number12"
              placeholder="Enter content..."
              allowClear={true} // 啟用清除圖標
              onChange={onChange}
              style={{ color: textColor, height: "150px" }} // 注意：請確保 textColor 已經定義
            />

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

          <span className="text-danger">*</span>
          <label for="invoice-title">For Model機型：</label>
          <div ref={uploadModelRef}>
            <div
              className={styles["image-box"]}
              data-step="stepImage"
              data-id="modelImage"
              style={{
                border: "1px solid #ccc", // 添加邊框類似 TextArea
                minHeight: "150px", // 設定最小高度類似 TextArea
                backgroundColor: "#fff", // 背景顏色類似 TextArea
              }}
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

          <span className="text-danger">*</span>
          <label for="invoice-title">所有使用工具：</label>
          <div ref={uploadToolsRef}>
            <div
              className={styles["image-box"]}
              data-step="stepImage"
              data-id="toolsImage"
              style={{
                border: "1px solid #ccc", // 添加邊框類似 TextArea
                minHeight: "150px", // 設定最小高度類似 TextArea
                backgroundColor: "#fff", // 背景顏色類似 TextArea
              }}
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

          <span className="text-danger">*</span>
          <label for="invoice-title">部位位置：</label>
          <div ref={uploadPositionRef}>
            <div
              className={styles["image-box"]}
              data-step="stepImage"
              data-id="positionImage"
              style={{
                border: "1px solid #ccc", // 添加邊框類似 TextArea
                minHeight: "150px", // 設定最小高度類似 TextArea
                backgroundColor: "#fff", // 背景顏色類似 TextArea
              }}
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
