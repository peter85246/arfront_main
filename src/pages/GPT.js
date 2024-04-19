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


// 修改typeWritter函數以接受完成時的回調
const typeWritter = (text, idx, setResponseFunc, onFinish, shouldContinue, signal, delay = 50) => {
  if (signal.aborted || !shouldContinue) {
    // 如果收到中止信號，立即停止
    if (onFinish) onFinish();
    return;
  }

  if (idx < text.length) {
    setResponseFunc(prev => prev + text.charAt(idx));
    setTimeout(() => typeWritter(text, idx + 1, setResponseFunc, onFinish, shouldContinue, signal, delay), delay);
  } else {
    if (onFinish) onFinish();
  }
};


function GPTResponse({ question, response, isTerminated, isLoading}) {
  return (
    <div className={styles["gpt-response-area"]}>
      <div className={styles["user-question"]}>
        {/* <p>請介紹貴公司??</p> */}
        <p>{question}</p>
      </div>
      <div className={styles["gpt-response"]}>
          {/* 德川GPT回答： */}
        <p className={styles["gptContent"]}>
          {response}
          {/* 公司介紹影片[https://www.youtube.com/watch?v=GzUDqPUih5A] <br />
          德川公司是一間專業的數控旋轉工作台製造廠，本著誠信、務實、專精及恆心的理念，不斷的研究與創新，並有嚴格之品質管制機制，以確保出廠的產品都有著高水準的品質。德川擁有多位工具機械機床設計的人員，整合分度盤與機床的搭配，讓德川的每個工作台都能發揮最大的實質效能，為世界各國各大工具機製造商所信賴。除此之外，您可以點選【德川網站
          https://www.detron-rotary.com/tw/index.html】來查閱其他德川相關的資訊。 */}
        </p>
        
        {/* 在回應容器內顯示加載指示器 */}
        {isLoading && <LoadingIndicator />}
        {isTerminated}
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
    setResponse('');
    setQuestion(input);
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
    setResponse('對話已中止....');
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
