import { useTranslation } from "react-i18next"; //語系
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Space, ColorPicker, theme, Flex, Input, Select } from "antd";
import { useNavigate } from "react-router-dom"; // 導入 useNavigate
import { generate, red, green, blue } from "@ant-design/colors";
import { useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import styles from "../scss/global.module.scss";
import classNames from "classnames";
import FormGroup from "./FormGroup/FormGroup";
import Spinner from "react-bootstrap/Spinner";
import SimpleReactValidator from "simple-react-validator";

import {
  apiGetAllKnowledgeBaseByFilter,
  apiGetAllKnowledgeBaseByMachineAddId,
  apiSaveKnowledgeBase,
} from "../utils/Api";

import { useStore } from "../zustand/store";

const { TextArea } = Input;

export function DocumentEditor() {
  const { SOPInfo, setSOPInfo } = useStore();
  const navigate = useNavigate(); // 使用 navigate 來處理導航
  const { t } = useTranslation();

  const uploadModelRef = useRef(null);
  const uploadToolsRef = useRef(null);
  const uploadPositionRef = useRef(null);
  const [formData, setFormData] = useState({});
  const [saveKnowledgeInfoLoading, setSaveKnowledgeInfoLoading] =
    useState(false); //儲存的轉圈圈

  const [textColor, setTextColor] = useState("#000000"); // 初始文字顏色設為黑色
  const validator = new SimpleReactValidator({
    autoForceUpdate: this,
  });

  const [searchParams] = useSearchParams();
  const machineName = searchParams.get("name");

  const [knowledgeInfo, setKnowledgeInfo] = useState(
    SOPInfo.knowledgeInfo || {
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
    },
  );

  const [formFields, setFormFields] = useState([
    {
      field: "knowledgeBaseDeviceType",
      label: "設備種類：",
      id: "invoice-number1",
      options: [],
      required: true,
    },
    {
      field: "knowledgeBaseDeviceParts",
      label: "設備部件：",
      id: "invoice-number2",
      options: [],
      required: true,
    },
    {
      field: "knowledgeBaseRepairItems",
      label: "維修項目：",
      id: "invoice-number3",
      options: [],
      required: true,
    },
    {
      field: "knowledgeBaseRepairType",
      label: "維修類型：",
      id: "invoice-number4",
      options: [],
      required: true,
    },
    {
      field: "knowledgeBaseFileNo",
      label: "檔案編號：",
      id: "invoice-number5",
      required: true,
    },
    {
      field: "knowledgeBaseAlarmCode",
      label: "故障代碼：",
      id: "invoice-number6",
    },
    {
      field: "knowledgeBaseSpec",
      label: "規格：",
      id: "invoice-number7",
    },
    {
      field: "knowledgeBaseSystem",
      label: "系統：",
      id: "invoice-number8",
    },
    {
      field: "knowledgeBaseProductName",
      label: "產品名稱：",
      id: "invoice-number9",
    },
  ]);

  // 處理表單提交
  const handleSaveKnowledgeInfo = async (e) => {
    e.preventDefault();
    setSOPInfo((prev) => ({ ...prev, knowledgeInfo: knowledgeInfo }));

    // let knowledgeInfoResponse = await apiSaveKnowledgeBase(formData);
    // if (knowledgeInfoResponse) {
    //   if (knowledgeInfoResponse.code == "0000") {
    //     toast.success(
    //       newKnowledgeInfo.knowledgeBaseId == 0
    //         ? t("toast.add.success")
    //         : t("toast.edit.success"),
    //       {
    //         position: toast.POSITION.TOP_CENTER,
    //         autoClose: 3000,
    //         hideProgressBar: true,
    //         closeOnClick: false,
    //         pauseOnHover: false,
    //       },
    //     );
    //   } else {
    //     toast.error(knowledgeInfoResponse.message, {
    //       position: toast.POSITION.TOP_CENTER,
    //       autoClose: 5000,
    //       hideProgressBar: true,
    //       closeOnClick: false,
    //       pauseOnHover: false,
    //     });
    //   }
    //   setSaveKnowledgeInfoLoading(false);
    // } else {
    //   setSaveKnowledgeInfoLoading(false);
    // }

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

  useEffect(() => {
    const getDocumentOptions = async () => {
      const res = await apiGetAllKnowledgeBaseByFilter({ keyword: "" });

      setFormFields((prev) =>
        prev.map((item) => {
          if (item.field === "knowledgeBaseDeviceType") {
            return {
              ...item,
              options: res.result.map((item) => ({
                value: item.knowledgeBaseDeviceType,
                label: item.knowledgeBaseDeviceType,
              })),
            };
          }
          if (item.field === "knowledgeBaseDeviceParts") {
            return {
              ...item,
              options: res.result.map((item) => ({
                value: item.knowledgeBaseDeviceParts,
                label: item.knowledgeBaseDeviceParts,
              })),
            };
          }
          if (item.field === "knowledgeBaseRepairItems") {
            return {
              ...item,
              options: res.result.map((item) => ({
                value: item.knowledgeBaseRepairItems,
                label: item.knowledgeBaseRepairItems,
              })),
            };
          }
          if (item.field === "knowledgeBaseRepairType") {
            return {
              ...item,
              options: res.result.map((item) => ({
                value: item.knowledgeBaseRepairType,
                label: item.knowledgeBaseRepairType,
              })),
            };
          }
          return item;
        }),
      );
    };
    getDocumentOptions();
  }, []);

  return (
    <main>
      <div>
        <section className="content-header" style={{ marginBottom: "10px" }}>
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
              <div></div>
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
              {SOPInfo?.machineInfo?.machineName}
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
            {formFields.map((item) => (
              <div className={styles["form-group"]}>
                <label>
                  {item.required && <span className="text-danger">*</span>}
                  {item.label}
                </label>
                {item.options ? (
                  <Select
                    mode="tags"
                    className="w-full"
                    value={knowledgeInfo[item.field] || null}
                    onChange={(v) =>
                      setKnowledgeInfo((prev) => ({
                        ...prev,
                        [item.field]: v[v.length - 1],
                      }))
                    }
                    options={item?.options}
                  />
                ) : (
                  <Input
                    value={knowledgeInfo[item.field]}
                    onChange={(v) =>
                      setKnowledgeInfo((prev) => ({
                        ...prev,
                        [item.field]: v.target.value,
                      }))
                    }
                  />
                )}
              </div>
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
              value={knowledgeInfo.knowledgeBaseAlarmCause}
              onChange={(e) =>
                setKnowledgeInfo({
                  ...knowledgeInfo,
                  knowledgeBaseAlarmCause: e.target.value,
                })
              }
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
          <div className={styles["text-area-container"]}>
            <span className="text-danger">*</span>
            <label htmlFor="invoice-number11">故障描述：</label>
            <TextArea
              name="knowledgeBaseAlarmDesc"
              id="invoice-number11"
              placeholder="Enter content..."
              allowClear={true} // 啟用清除圖標
              value={knowledgeInfo.knowledgeBaseAlarmDesc}
              onChange={(e) =>
                setKnowledgeInfo({
                  ...knowledgeInfo,
                  knowledgeBaseAlarmDesc: e.target.value,
                })
              }
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

          <div className={styles["text-area-container"]}>
            <span className="text-danger">*</span>
            <label htmlFor="invoice-number12">故障發生時機：</label>
            <TextArea
              name="knowledgeBaseAlarmOccasion"
              id="invoice-number12"
              placeholder="Enter content..."
              allowClear={true} // 啟用清除圖標
              value={knowledgeInfo.knowledgeBaseAlarmOccasion}
              onChange={(e) =>
                setKnowledgeInfo({
                  ...knowledgeInfo,
                  knowledgeBaseAlarmOccasion: e.target.value,
                })
              }
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
        </div>
      </div>
    </main>
  );
}
