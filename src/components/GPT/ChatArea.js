import React, { useState, useEffect } from "react";
import Select from "react-select";
import styles from "../../scss/gpt.module.scss";

const ChatArea = ({
  input,
  onInputChange,
  onSubmit,
  handleNewChat,
  handleClear,
  setQuestion,
  setResponse,
  setIsLoading,
}) => {
  // 新增重置Option選項的處理
  const resetSelect = (setSelectedOption) => {
    setSelectedOption(null); // 重置選中的選項
  };

  // 修改 handleNewChat 的定義以包含重置 Select
  const modifiedHandleNewChat = () => {
    handleNewChat();
    resetSelect();
  };

  // 狀態變量用於模型選單
  const [selectedModelOption, setSelectedModelOption] = useState(null);
  // 狀態變量用於數據選單
  const [selectedDataOption, setSelectedDataOption] = useState(null);

  useEffect(() => {
    // 若頁面加載後需要選中特定選項，例如 LLM
    setSelectedModelOption({ value: "LLM", label: "LLM" });
  }, []);

  // 處理模型選單變更
  const handleModelChange = (option) => {
    setSelectedModelOption(option);
    // 假設你需要根據模型選項做一些操作
  };

  // 處理數據選單變更並提交
  const handleDataChange = async (option) => {
    setSelectedDataOption(option);
    setResponse("");
    setIsLoading(true);
    setQuestion(option.label);
    const messageWithImage = `${option.value}並加上圖片說明`;
    onInputChange(option.label);
    await new Promise((resolve) => setTimeout(resolve, 0));
    onSubmit(messageWithImage);
  };

  const options_model = [
    { value: "LLM", label: "LLM" },
    { value: "GPT-3.5", label: "GPT-3.5" },
    { value: "GPT-4", label: "GPT-4" },
  ];

  const options_data = [
    { value: "德川公司介紹", label: "德川公司介紹" },
    { value: "德川公司獲獎報導", label: "德川公司獲獎報導" },
    { value: "德川公司今年參展計畫", label: "德川公司今年參展計畫" },
    { value: "德川公司聯絡資訊", label: "德川公司聯絡資訊" },
    {
      value: "GXA-S背隙調整",
      label: "GXA-S背隙調整",
      videos: [
        {
          step: "Step1",
          path: "public/detron_data/GXA170S背隙調整/step1打開塞蓋.mp4",
        },
        {
          step: "Step2",
          path: "public/detron_data/GXA170S背隙調整/step2拆鬆聯軸器螺絲.mp4",
        },
        {
          step: "Step3",
          path: "public/detron_data/GXA170S背隙調整/step3拆蜗桿封蓋.mp4",
        },
        {
          step: "Step4",
          path: "public/detron_data/GXA170S背隙調整/step4放鬆M4螺絲2只.mp4",
        },
        {
          step: "Step5",
          path: "public/detron_data/GXA170S背隙調整/step5旋轉套管座M6X50螺絲.mp4",
        },
        {
          step: "Step6",
          path: "public/detron_data/GXA170S背隙調整/step6鎖緊M3螺絲2只.mp4",
        },
        {
          step: "Step7",
          path: "public/detron_data/GXA170S背隙調整/step7量測背隙.mp4",
        },
        {
          step: "Step8",
          path: "public/detron_data/GXA170S背隙調整/step8聯軸器鎖緊及鎖塞蓋.mp4",
        },
        {
          step: "Step9",
          path: "public/detron_data/GXA170S背隙調整/step9安裝蜗桿封蓋.mp4",
        },
      ],
    },
    { value: "油壓缸檢查更換", label: "油壓缸檢查更換" },
    {
      value: "壓力開關(IFM宜福門)調整及使用",
      label: "壓力開關(IFM宜福門)調整及使用",
    },
    { value: "GXA-H安裝煞車環", label: "GXA-H安裝煞車環" },
    { value: "更換氣壓缸", label: "更換氣壓缸" },
    { value: "電磁閥檢查及更換", label: "電磁閥檢查及更換" }, //bug閃文字
    { value: "GXA-S潤滑油更換", label: "GXA-S潤滑油更換" },
  ];

  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: "100%",
      margin: "5px 0px 0px 0px",
      border: "solid 1px black",
      borderRadius: "5px",
    }),
    control: (provided) => ({
      ...provided,
      color: "white",
      height: "6vh",
      borderRadius: "5px",
      textAlignLast: "center",
      fontSize: "16px",
      cursor: "pointer",
      overflowY: "auto",
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: "16px",
      padding: "8px",
      borderRadius: "0",
      cursor: "pointer",
    }),
  };

  return (
    <div className={styles["chat-area"]}>
      <textarea
        id="chat-input"
        className={styles["chat-input"]}
        placeholder="請輸入資訊"
        // defaultValue="請介紹貴公司??"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
      />
      <Select
        id="prompt-select-model"
        styles={customStyles}
        value={selectedModelOption}
        options={options_model}
        onChange={handleModelChange}
        placeholder="Select the Model"
      />
      <Select
        id="prompt-select"
        styles={customStyles}
        value={selectedDataOption}
        options={options_data}
        onChange={handleDataChange}
        placeholder="Select the Question"
      />
      <div className={styles["chat-controls"]}>
        <button id="send" onClick={() => onSubmit(input)}>
          Submit
        </button>
        <button id="new-chat" onClick={modifiedHandleNewChat}>
          New Chat
        </button>
        <button id="clear" onClick={handleClear}>
          Clear Response
        </button>
      </div>
    </div>
  );
};

export default ChatArea;
