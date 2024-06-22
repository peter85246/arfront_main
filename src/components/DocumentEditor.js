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

// prettier-ignore
export function DocumentEditor() {
  const { SOPInfo, setSOPInfo } = useStore();
  const navigate = useNavigate(); // 使用 navigate 來處理導航
  const { t } = useTranslation();

  const uploadModelRef = useRef(null);
  const uploadToolsRef = useRef(null);
  const uploadPositionRef = useRef(null);
  const [formData, setFormData] = useState({});
  const [saveKnowledgeInfoLoading, setSaveKnowledgeInfoLoading] = useState(false); //儲存的轉圈圈

  const [textColor, setTextColor] = useState("#000000"); // 初始文字顏色設為黑色
  const validator = new SimpleReactValidator({
    autoForceUpdate: this,
  });

  const [searchParams] = useSearchParams();
  const machineName = searchParams.get("name");

  const [knowledgeInfo, setKnowledgeInfo] = useState(
    SOPInfo?.knowledgeInfo || {
      //新增以及修改內容
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
      knowledgeBaseModelImageObj: null, //Model機型圖片物件
      isDeletedKnowledgeBaseModelImage: false, //是否刪除Model機型圖片
      knowledgeBaseToolsImageObj: null, //Tools工具圖片物件
      isDeletedKnowledgeBaseToolsImage: false, //是否刪除Tools工具圖片
      knowledgeBasePositionImageObj: null, //Position位置圖片物件
      isDeletedKnowledgeBasePositionImage: false, //是否刪除Position位置圖片
    },
  );
  
  const [knowledgeBaseModelImages, setKnowledgeBaseModelImages] = useState(
    SOPInfo?.knowledgeInfo?.knowledgeBaseModelImageObj 
    || []
  );
  const [knowledgeBaseToolsImages, setKnowledgeBaseToolsImages] = useState(
    SOPInfo?.knowledgeInfo?.knowledgeBaseToolsImageObj 
    || []
  );
  const [knowledgeBasePositionImages, setKnowledgeBasePositionImages] = useState(
    SOPInfo?.knowledgeInfo?.knowledgeBasePositionImageObj
    || []
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

  const requiredFields = [
    { field: 'knowledgeBaseDeviceType', lebel: '設備種類' },
    { field: 'knowledgeBaseDeviceParts', lebel: '設備部件' },
    { field: 'knowledgeBaseRepairItems', lebel: '維修項目' },
    { field: 'knowledgeBaseRepairType', lebel: '維修類型' },
    { field: 'knowledgeBaseFileNo', lebel: '檔案編號' },
    { field: 'knowledgeBaseAlarmCause', lebel: '故障發生原因' },
    { field: 'knowledgeBaseAlarmDesc', lebel: '故障描述' },
    { field: 'knowledgeBaseAlarmOccasion', lebel: '故障發生時機' },
    { field: 'knowledgeBaseModelImageObj', lebel: 'Model機型圖片物件' },
    { field: 'knowledgeBaseToolsImageObj', lebel: 'Tools工具圖片物件' },
    { field: 'knowledgeBasePositionImageObj', lebel: 'Position位置圖片物件' },
  ]

  // 處理表單提交
  const handleSaveKnowledgeInfo = async (e) => {
    let isValid = true
    
    const allKnowledgeInfo = {
      ...knowledgeInfo,
      knowledgeBaseModelImageObj: knowledgeBaseModelImages,
      knowledgeBaseToolsImageObj: knowledgeBaseToolsImages,
      knowledgeBasePositionImageObj: knowledgeBasePositionImages
    }

    for (const item of requiredFields) {
      const { field, lebel } = item
      if (allKnowledgeInfo[field] === '' || allKnowledgeInfo[field].length === 0) {
        isValid = false
        return toast.error(`\x22 ${lebel} \x22 是必填的欄位`, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
        });
      }
    }

    if (isValid) {
      setSOPInfo((prev) => ({ ...prev, knowledgeInfo: allKnowledgeInfo }));
      navigate("/sop2");
    }
  };

  useLayoutEffect(() => {
    const uploadRefArray = [
      uploadModelRef.current,
      uploadToolsRef.current,
      uploadPositionRef.current,
    ];

    uploadRefArray.forEach((ref, idx) => {
      const uploadBtn = ref.querySelectorAll("button")[0];
      const deleteBtn = ref.querySelectorAll("button")[1];
      const input = ref.querySelectorAll("input")[0];

      input.onchange = () => {
        const file = input.files[0];

        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            switch (idx) {
              case 0:
                setKnowledgeBaseModelImages((prev) =>
                  prev.length < 1
                    ? [...prev, { name: file.name, img: e.target.result, file: file }]
                    : prev,
                );
                input.value = "";
                break;
              case 1:
                setKnowledgeBaseToolsImages((prev) =>
                  prev.length < 6
                    ? [...prev, { name: file.name, img: e.target.result, file: file }]
                    : prev,
                );
                input.value = "";
                break;
              case 2:
                setKnowledgeBasePositionImages((prev) =>
                  prev.length < 6
                    ? [...prev, { name: file.name, img: e.target.result, file: file }]
                    : prev,
                );
                input.value = "";
                break;
              default:
                return;
            }
          };
          reader.readAsDataURL(file);
        }
      };

      uploadBtn.onclick = () => input.click();

      switch (idx) {
        case 0:
          deleteBtn.onclick = () =>
            setKnowledgeBaseModelImages((prev) =>
              prev.slice(0, prev.length - 1),
            );
          break;
        case 1:
          deleteBtn.onclick = () =>
            setKnowledgeBaseToolsImages((prev) =>
              prev.slice(0, prev.length - 1),
            );
          break;
        case 2:
          deleteBtn.onclick = () =>
            setKnowledgeBasePositionImages((prev) =>
              prev.slice(0, prev.length - 1),
            );
          break;
        default:
          return;
      }
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
            {formFields.map((item, idx) => (
              <div key={idx} className={styles["form-group"]}>
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
              style={{
                color: textColor,
                height: "150px",
                marginBottom: "10px",
              }} // 注意：請確保 textColor 已經定義
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
              style={{
                color: textColor,
                height: "150px",
                marginBottom: "10px",
              }} // 注意：請確保 textColor 已經定義
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
              style={{
                color: textColor,
                height: "150px",
                marginBottom: "10px",
              }} // 注意：請確保 textColor 已經定義
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
          <label>For Model機型：</label>
          <div ref={uploadModelRef}>
            <div
              className={styles["image-box"]}
              data-step="stepImage"
              data-id="modelImage"
              style={{
                border: "1px solid #ccc", // 添加邊框類似 TextArea
                minHeight: "150px", // 設定最小高度類似 TextArea
                backgroundColor: "#fff", // 背景顏色類似 TextArea
                gap: "8px",
              }}
            >
              {knowledgeBaseModelImages.map((item, idx) => (
                <div className="w-[120px] flex flex-col gap-[8px] border p-2 rounded">
                  <img
                    key={idx}
                    src={item.img}
                    className={styles["uploaded-image"]}
                    alt="Uploaded Images"
                    id="modelImage"
                  />
                  <input
                    type="text"
                    className="w-full"
                    value={item.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setKnowledgeBaseModelImages((prev) =>
                        prev.map((image, imageIdx) =>
                          imageIdx === idx
                            ? { ...image, name: newName }
                            : image,
                        ),
                      );
                    }}
                  />
                </div>
              ))}
            </div>
            <div
              className={styles["image-actions"]}
              style={{
                marginBottom: "10px",
              }}
            >
              <input
                type="file"
                name="KnowledgeBaseModelImage"
                id="modelImage-image-input"
                className={styles["image-input"]}
                hidden
                data-id="modelImage"
              />
              <button className={styles["upload-btn-model"]}>上傳圖片</button>
              <button className={styles["delete-btn-model"]}>刪除圖片</button>
            </div>
          </div>

          <span className="text-danger">*</span>
          <label>所有使用工具：</label>
          <div ref={uploadToolsRef}>
            <div
              className={styles["image-box"]}
              data-step="stepImage"
              data-id="toolsImage"
              style={{
                border: "1px solid #ccc", // 添加邊框類似 TextArea
                minHeight: "150px", // 設定最小高度類似 TextArea
                backgroundColor: "#fff", // 背景顏色類似 TextArea
                gap: "8px",
              }}
            >
              {knowledgeBaseToolsImages.map((item, idx) => (
                <div className="w-[120px] flex flex-col gap-[8px] border p-2 rounded">
                  <img
                    key={idx}
                    src={item.img}
                    className={styles["uploaded-image"]}
                    alt="Uploaded Images"
                    id="modelImage"
                  />
                  <input
                    type="text"
                    className="w-full"
                    value={item.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setKnowledgeBaseToolsImages((prev) =>
                        prev.map((image, imageIdx) =>
                          imageIdx === idx
                            ? { ...image, name: newName }
                            : image,
                        ),
                      );
                    }}
                  />
                </div>
              ))}
            </div>
            <div
              className={styles["image-actions"]}
              style={{
                marginBottom: "10px",
              }}
            >
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
          <label>部位位置：</label>
          <div ref={uploadPositionRef}>
            <div
              className={styles["image-box"]}
              data-step="stepImage"
              data-id="positionImage"
              style={{
                border: "1px solid #ccc", // 添加邊框類似 TextArea
                minHeight: "150px", // 設定最小高度類似 TextArea
                backgroundColor: "#fff", // 背景顏色類似 TextArea
                gap: "8px",
              }}
            >
              {knowledgeBasePositionImages.map((item, idx) => (
                <div className="w-[120px] flex flex-col gap-[8px] border p-2 rounded">
                  <img
                    key={idx}
                    src={item.img}
                    className={styles["uploaded-image"]}
                    alt="Uploaded Images"
                    id="modelImage"
                  />
                  <input
                    type="text"
                    className="w-full"
                    value={item.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setKnowledgeBasePositionImages((prev) =>
                        prev.map((image, imageIdx) =>
                          imageIdx === idx
                            ? { ...image, name: newName }
                            : image,
                        ),
                      );
                    }}
                  />
                </div>
              ))}
            </div>
            <div
              className={styles["image-actions"]}
              style={{
                marginBottom: "10px",
              }}
            >
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
