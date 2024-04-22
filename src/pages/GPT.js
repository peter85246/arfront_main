import React from 'react';  // 確保 React 已被導入
import { useState, useEffect } from 'react';
import styles from '../scss/gpt.module.scss';
import { type } from '@testing-library/user-event/dist/type';

// 設定一個模擬的 fetchGPTResponse 函數
const fetchGPTResponse = async (input, handleNewChunk) => {
  try {
    const response = await fetch('http://localhost:5000/conversation', {
      method: 'POST',
      headers: {
          'Content-Type':'application/json',
      },
      body: JSON.stringify({ query: input })
    });

    if (response.ok) {
      const reader = response.body.getReader();
      return new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            const chunk = new TextDecoder().decode(value, { stream: true });
            handleNewChunk(chunk);  // 處理每一塊數據
          }
        }
      });
    } else {
      throw new Error('Network response was not ok.');
    }
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch response');
  }
};

function ChatArea({ input, onInputChange, onSubmit, handleTerminate, handleNewChat, handleClear }) {
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
      <select
        aria-label="option-gate"
        id="prompt-select"
        className={styles["prompt-select"]}
      >
        <option value="prompt-general">[@PROMPT]一般指令</option>
        <option value="prompt-general">[@PROMPT]一般指令2</option>
        {/* <!-- 在這裡添加更多的選項 --> */}
      </select>
      <div className={styles["chat-controls"]}>
        <button id="send" onClick={onSubmit}>Submit</button>
        <button id="cancel" onClick={handleTerminate}>Stop</button>
        <button id="new-chat" onClick={handleNewChat}>New Chat</button>
        <button id="clear" onClick={handleClear}>Clear Response</button>
      </div>
    </div>
  );
}

function LoadingIndicator() {
  const [dots, setDots] = useState('...');
  useEffect(() => {
    const timer = setInterval(() => {
      setDots(dots => dots.length < 6 ? dots + '.' : '...');
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return <div className={styles["loading-indicator"]}>Loading{dots}</div>;
}


// 修改typeWritter函數以接受完成時的回調與段落切割
const typeWritter = (text, idx, setResponseFunc, onFinish, shouldContinue, signal, delay = 100) => {
  if (signal.aborted || !shouldContinue) {
    // 如果收到中止信號，立即停止
    if (onFinish) onFinish();
    return;
  }

  if (idx < text.length) {
    let insertBreak = false;
    let nextIdx = idx + 1; // 預設下一個索引

    // 匹配 "步驟如下：" 或 "步驟 X：" 並確保它是新段落的開頭，考慮格式可能的異常如"步 驟"
    const sectionStartMatch = text.substring(idx).match(/^(步驟如下：|步\s*驟\s*\d+：)/);
    if (sectionStartMatch) {
      const sectionStart = sectionStartMatch[0];
      if (idx !== 0 && !text.substring(0, idx).endsWith("<br /><br />")) {
        setResponseFunc(prev => `${prev}<br /><br />${sectionStart}`);
        insertBreak = true;
      } else if (idx === 0) {
        setResponseFunc(prev => `${prev}${sectionStart}`);
      }
      nextIdx = idx + sectionStart.length; // 更新下一個字符的索引
    } else {
      // 當前字符加入到暫存的回應中
      setResponseFunc(prev => `${prev}${text[idx]}`);
    }

    // 設置超時以繼續打字效果
    setTimeout(() => typeWritter(text, nextIdx, setResponseFunc, onFinish, shouldContinue, signal, delay), insertBreak ? 500 : delay);
  } else {
    if (onFinish) onFinish();
  }
};


function GPTResponse({ question, response, isTerminated, isLoading }) {
  // 解析HTML標籤的函數
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };

  // 使用正則表達式 split 來分割響應成段落，並移除空字符串
  const paragraphs = response.split(/<br \/><br \/>/).filter(p => p.trim() !== '');

  return (
    <div className={styles["gpt-response-area"]}>
      <div className={styles["user-question"]}>
        <p>{question}</p>
      </div>
      <div className={styles["gpt-response"]}>
        {paragraphs.map((paragraph, idx) => (
          // 使用dangerouslySetInnerHTML來解析HTML標籤
          <p key={idx} className={styles["gptContent"]} dangerouslySetInnerHTML={createMarkup(paragraph)}></p>
        ))}
        {isTerminated && <p className={styles["gptContent"]}>對話已中止...</p>}
        {isLoading && !isTerminated && <LoadingIndicator />}
      </div>
    </div>
  );
}


export default function GPT() {
  const [input, setInput] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isTerminated, setIsTerminated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldContinueTyping, setShouldContinueTyping] = useState(true); // 控制button中止response回應顯示

  let fetchController = new AbortController();  // 創建一個全局控制器

  // 處理送出按鈕
  const handleSubmit = async () => {
    setIsTerminated(false);  // 確保終止狀態被重置
    setIsLoading(true);  // 啟動載入標誌
    setResponse(''); // 回應欄位
    setQuestion(input); // 送出問題欄位
    setShouldContinueTyping(true);  // 允許新的輸入開始逐字顯示
    fetchController.abort();  // 終止之前的請求
    fetchController = new AbortController();  // 重新創建控制器
    try {
      await fetchGPTResponse(input, (chunk) => {
        typeWritter(chunk, 0, setResponse, () => setIsLoading(false), shouldContinueTyping, fetchController.signal);
      }, fetchController.signal);
    } catch (error) {
      console.error('Error fetching response:', error);
      setResponse('Failed to fetch response');
      setIsLoading(false);  // 出錯時也需要關閉載入標誌
    }
  };
  

  // 處理中止按鈕
  const handleTerminate = () => {
    fetchController.abort();  // 中止fetch請求
    setShouldContinueTyping(false);  // 立即停止逐字顯示
    setIsTerminated(true);
    setIsLoading(false);
    setResponse('');
  };

  // 處理 new chat 按鈕
  const handleNewChat = () => {
    fetchController.abort();  // 確保中止現有操作
    setShouldContinueTyping(false);
    setInput('');
    setQuestion('');
    setResponse('');
    setIsTerminated(false);
    setIsLoading(false);
  };

  // 處理 Clear 按鈕
  const handleClear = () => {
    fetchController.abort();  // 確保中止現有操作
    setResponse('');
  };

  return (
    <main>
      <h2>GPT</h2>
      <div className={styles["content2"]}>
        <div className={styles["button-function"]}></div>
        <div className={styles["content-wrapper-gpt"]}>
          <div className={styles["container-gpt"]}>
            <ChatArea 
            input={input} 
            onInputChange={setInput} 
            onSubmit={handleSubmit} 
            handleTerminate={handleTerminate}
            handleNewChat={handleNewChat}
            handleClear={handleClear}
            />
            <GPTResponse 
              question={question} 
              response={response} 
              isTerminated={isTerminated} 
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
