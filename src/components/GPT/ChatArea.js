import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import styles from '../../scss/gpt.module.scss';
import { Button, Input, Flex } from 'antd';

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
  const [loadings, setLoadings] = useState([false, false, false]); // Loading 狀態追蹤
  const [selectedOption, setSelectedOption] = useState(null); // 追蹤選中的問題選項

  // 將LLM設為初始選中選項
  const [selectedModel, setSelectedModel] = useState({
    value: 'GPT-4',
    label: 'GPT-4',
  });

  const [messageToBackend, setMessageToBackend] = useState(''); // 添加一個新的狀態來存儲後端消息

  // 處理 Q&A 選項變更並提交
  const handleSelectChange = async (selectedOption) => {
    setSelectedOption(selectedOption); // 更新選中的選項
    setResponse(''); // 重置回應內容
    setIsLoading(true); // 保留加載狀態

    setQuestion(selectedOption.label); // 更新顯示在user-question中的文字（只顯示選擇的選項label）

    // 將完整訊息傳送給後台，包含"並加上圖片說明"
    const messageWithImage = `${selectedOption.value}附上圖片說明`;
    setMessageToBackend(messageWithImage); // 更新後端消息
    onInputChange(selectedOption.label); // 更新輸入值為選項的label

    // 使用異步函數等待狀態更新後提交
    await new Promise((resolve) => setTimeout(resolve, 500)); // 微小的延遲確保狀態更新
    onSubmit(messageWithImage); // 直接傳遞選項的值進行提交
  };

  // 加入點擊時的 Loading 效果
  const enterLoading = (index) => {
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = true;
      return newLoadings;
    });
    setTimeout(() => {
      setLoadings((prevLoadings) => {
        const newLoadings = [...prevLoadings];
        newLoadings[index] = false;
        return newLoadings;
      });
    }, 2800);
  };

  // 新增重置Option選項的處理
  const resetSelect = () => {
    setSelectedOption(null); // 重置選中的選項
    setMessageToBackend(''); // 重置後端消息
  };

  const handleSubmission = () => {
    // 檢查 input 是否有內容或 selectedOption 是否被選擇
    if (input.trim() === '' && !selectedOption) {
      window.alert('Please enter some Text or select a Question~!');
    } else {
      enterLoading(0); // 加入Loading效果
      const submitValue = input.trim() !== '' ? input : messageToBackend; // 使用 messageToBackend 來提交
      onSubmit(submitValue); // 使用 input 或 selectedOption 的值提交
    }
  };

  // 修改 handleNewChat 的定義以包含重置 Select
  const modifiedHandleNewChat = () => {
    handleNewChat();
    resetSelect();
    enterLoading(1); // 加入Loading效果
  };

  const modifiedHandleClear = () => {
    enterLoading(2); // 加入Loading效果
    handleClear();
  };

  const options_model = [
    { value: 'LLM', label: 'LLM' },
    { value: 'GPT-3.5', label: 'GPT-3.5' },
    { value: 'GPT-4', label: 'GPT-4' },
  ];

  const options_data = [
    { value: '德川公司介紹', label: '德川公司介紹' },
    { value: '德川公司獲獎報導', label: '德川公司獲獎報導' },
    { value: '德川公司今年參展計畫', label: '德川公司今年參展計畫' },
    { value: '德川公司聯絡資訊', label: '德川公司聯絡資訊' },
    {
      value: 'GXA-S背隙調整',
      label: 'GXA-S背隙調整',
      videos: [
        {
          step: 'Step1',
          path: 'public/detron_data/GXA170S背隙調整/step1打開塞蓋.mp4',
        },
        {
          step: 'Step2',
          path: 'public/detron_data/GXA170S背隙調整/step2拆鬆聯軸器螺絲.mp4',
        },
        {
          step: 'Step3',
          path: 'public/detron_data/GXA170S背隙調整/step3拆蜗桿封蓋.mp4',
        },
        {
          step: 'Step4',
          path: 'public/detron_data/GXA170S背隙調整/step4放鬆M4螺絲2只.mp4',
        },
        {
          step: 'Step5',
          path: 'public/detron_data/GXA170S背隙調整/step5旋轉套管座M6X50螺絲.mp4',
        },
        {
          step: 'Step6',
          path: 'public/detron_data/GXA170S背隙調整/step6鎖緊M3螺絲2只.mp4',
        },
        {
          step: 'Step7',
          path: 'public/detron_data/GXA170S背隙調整/step7量測背隙.mp4',
        },
        {
          step: 'Step8',
          path: 'public/detron_data/GXA170S背隙調整/step8聯軸器鎖緊及鎖塞蓋.mp4',
        },
        {
          step: 'Step9',
          path: 'public/detron_data/GXA170S背隙調整/step9安裝蜗桿封蓋.mp4',
        },
      ],
    },
    { value: '油壓缸檢查更換', label: '油壓缸檢查更換' },
    {
      value: '壓力開關(IFM宜福門)調整及使用',
      label: '壓力開關(IFM宜福門)調整及使用',
    },
    { value: 'GXA-H安裝煞車環', label: 'GXA-H安裝煞車環' },
    { value: '更換氣壓缸', label: '更換氣壓缸' },
    { value: '電磁閥檢查及更換', label: '電磁閥檢查及更換' }, //bug閃文字
    { value: 'GXA-S潤滑油更換', label: 'GXA-S潤滑油更換' },
  ];

  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: '100%',
      margin: '5px 0px 0px 0px',
      border: 'solid 1px black',
      borderRadius: '5px',
    }),
    control: (provided) => ({
      ...provided,
      color: 'white',
      height: '6vh',
      borderRadius: '5px',
      textAlignLast: 'center',
      fontSize: '16px',
      cursor: 'pointer',
      overflowY: 'auto',
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: '16px',
      padding: '8px',
      borderRadius: '0',
      cursor: 'pointer',
    }),
  };

  const { TextArea } = Input;

  return (
    <div className={styles['chat-area']}>
      <Flex vertical gap={32}>
        <TextArea
          style={{
            resize: 'none',
            height: '40vh', // 直接設定高度為視窗高度的百分比
          }}
          id="chat-input"
          className={styles['chat-input']}
          placeholder="Enter Information !"
          // defaultValue="請介紹貴公司??"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
        />
      </Flex>
      <Select
        id="prompt-select-model"
        styles={customStyles}
        value={selectedModel} // 頁面渲染出現GPT-4 Model，解開value、onChange方法註釋
        options={options_model}
        onChange={setSelectedModel}
        placeholder="Select the Model"
      />
      <Select
        id="prompt-select"
        styles={customStyles}
        value={selectedOption}
        options={options_data}
        onChange={handleSelectChange}
        placeholder="Select the Question"
      />
      <div className={styles['chat-controls']}>
        <Button id="send" loading={loadings[0]} onClick={handleSubmission}>
          Submit
        </Button>
        <Button id="new-chat" onClick={modifiedHandleNewChat}>
          New Chat
        </Button>
        <Button id="clear" onClick={modifiedHandleClear}>
          Clear Response
        </Button>
      </div>
    </div>
  );
};

export default ChatArea;
