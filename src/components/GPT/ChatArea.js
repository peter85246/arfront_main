import React, { useState } from 'react';
import Select from 'react-select';
import styles from '../../scss/gpt.module.scss';

const ChatArea = ({ input, onInputChange, onSubmit, handleNewChat, handleClear, setQuestion, setResponse, setIsLoading }) => {
    const [selectedOption, setSelectedOption] = useState(null); // 新增狀態來追蹤Option選中的選項
  
    // 處理 Q&A 選項變更並提交
    const handleSelectChange = async (selectedOption) => {
      setSelectedOption(selectedOption); // 更新選中的選項
      setResponse('');  // 重置回應內容
      setIsLoading(true);  // 保留加載狀態
      onInputChange(selectedOption.value); // 更新輸入值
      setQuestion(selectedOption.value); // 更新問題顯示
      
      // 使用異步函數等待狀態更新後提交
      await new Promise(resolve => setTimeout(resolve, 0)); // 微小的延遲確保狀態更新
      onSubmit(selectedOption.value); // 直接傳遞選項的值進行提交
    }
  
    // 新增重置Option選項的處理
    const resetSelect = () => {
      setSelectedOption(null); // 重置選中的選項
    }
  
    // 修改 handleNewChat 的定義以包含重置 Select
    const modifiedHandleNewChat = () => {
      handleNewChat();
      resetSelect();
    }
  
    const options_data = [
      { value: '德川公司介紹', label: '德川公司介紹' },
      { value: '德川公司獲獎報導', label: '德川公司獲獎報導' },
      { value: '德川公司今年參展計畫', label: '德川公司今年參展計畫' },
      { value: '德川公司聯絡資訊', label: '德川公司聯絡資訊' },
      { value: 'GXA-S背隙調整', label: 'GXA-S背隙調整' },
      { value: '電磁閥檢查及更換', label: '電磁閥檢查及更換' },
      { value: '油壓缸檢查更換', label: '油壓缸檢查更換' },
      { value: '壓力開關(IFM宜福門)調整及使用', label: '壓力開關(IFM宜福門)調整及使用' },
      { value: 'GXA-H安裝煞車環', label: 'GXA-H安裝煞車環' },
      { value: 'GXA-S潤滑油更換', label: 'GXA-S潤滑油更換' },
      { value: '更換氣壓缸', label: '更換氣壓缸' }
    ];
  
    const customStyles = {
    container: (provided) => ({
      ...provided,
      width: '100%',
      margin: '7px 0px',
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
    
    return (
      <div className={styles["chat-area"]}>
        <textarea
          id="chat-input"
          className={styles["chat-input"]}
          placeholder="請輸入資訊"
          // defaultValue="請介紹貴公司??"
          value={input}
          onChange={e => onInputChange(e.target.value)}
        />
        <Select
          id="prompt-select"
          styles={customStyles}
          value={selectedOption}
          options={options_data}
          onChange={handleSelectChange} // 為選單添加 onChange 事件處理器
          placeholder="Select the Question"
        />
        <div className={styles["chat-controls"]}>
          <button id="send" onClick={() => onSubmit(input)}>Submit</button>
          <button id="new-chat" onClick={modifiedHandleNewChat}>New Chat</button>
          <button id="clear" onClick={handleClear}>Clear Response</button>
        </div>
      </div>
    );
}

export default ChatArea
