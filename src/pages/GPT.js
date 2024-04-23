import React from 'react';  // 確保 React 已被導入
import { useState, useEffect, useRef } from 'react';
import styles from '../scss/gpt.module.scss';
import { type } from '@testing-library/user-event/dist/type';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Select from 'react-select';
import { Background } from 'reactflow';

// 設定一個模擬的 fetchGPTResponse 函數
const fetchGPTResponse = async (input, handleNewChunk, setLoadingFalse) => {
  try {
    const response = await fetch('http://localhost:5000/conversation', {
      method: 'POST',
      headers: {
          'Content-Type':'application/json',
      },
      body: JSON.stringify({ query: input })
    });

    if (response.ok) {
      const reader = response.body.getReader(); // 確保 reader 在此定義
      let isFirstChunk = true; // 用來檢查是否為第一塊資料
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        handleNewChunk(chunk);  // 逐塊處理數據
        if (isFirstChunk && setLoadingFalse) {
          setLoadingFalse();
          isFirstChunk = false; // 確保加載指示器隱藏邏輯只執行一次
        }
      }
    } else {
      throw new Error('Network response was not ok.');
    }
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch response');
  }
};

function ChatArea({ input, onInputChange, onSubmit, handleTerminate, handleNewChat, handleClear, setQuestion }) {
  
  // 處理 Q&A 選項變更並提交
  const handleSelectChange = async (selectedOption) => {
    onInputChange(selectedOption.value); // 將選擇的 option 值設定為輸入框的值
    setQuestion(selectedOption.value); // 同時更新顯示的問題
    
    // 使用異步函數等待狀態更新後提交
    await new Promise(resolve => setTimeout(resolve, 0)); // 微小的延遲確保狀態更新
    onSubmit(selectedOption.value); // 直接傳遞選項的值進行提交
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
        options={options_data}
        onChange={handleSelectChange} // 為選單添加 onChange 事件處理器
        placeholder="Select the Question"
      />
      <div className={styles["chat-controls"]}>
        <button id="send" onClick={() => onSubmit(input)}>Submit</button>
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
    let nextIdx = idx + 1; // 預設下一個索引

    // 匹配 "步驟如下：" 或 "步驟 X：" 並確保它是新段落的開頭，考慮格式可能的異常如"步 驟"
    const sectionStartMatch = text.substring(idx).match(/^(步驟如下：|步\s*驟\s*\d+：)/);
    if (sectionStartMatch) {
      const sectionStart = sectionStartMatch[0].replace(/：/, ' ： '); // 增加"："的左右間距
      nextIdx = idx + sectionStart.length;
      delay = 500; // 給新段落增加延時
    } else {
      setResponseFunc(prev => `${prev}${text[idx]}`);
    }

    setTimeout(() => typeWritter(text, nextIdx, setResponseFunc, onFinish, shouldContinue, signal, delay), delay);
  } else {
    if (onFinish) onFinish();
  }
};

function GPTResponse({ question, response, isTerminated, isLoading }) {
  const responseEndRef = useRef(null); // 創建一個 ref

  // 每次 response 更新時，自動滾動到底部
  useEffect(() => {
    if (responseEndRef.current) {
        responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response]); // 依賴於 response 的更新

  // 定義一個自定義渲染方法
  const renderers = {
    // 當解析到 h2 標籤時，使用以下元素和樣式
    h2: ({node, ...props}) => (
      <h2 className={styles['custom-header']} {...props} />
    ),

    // 自定義 img 標籤渲染
    img: ({ node, ...props }) => {
      // 根據您的後端設置，這裡可能需要修改路徑
      const imageUrl = `http://localhost:5000/${props.src}`;
      return <img {...props} src={imageUrl} alt={props.alt || ''} style={{ maxWidth: '100%' }} />
    },
    
    // 其他自定義渲染器...
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={dark}
          language={match[1]}
          PreTag="div"
          {...props}
        >{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className={styles["gpt-response-area"]}>
      <div className={styles["user-question"]}>
        <p>{question}</p>
      </div>
      <div className={styles["gpt-response"]}>
        <ReactMarkdown 
          children={response}
          rehypePlugins={[rehypeRaw]}
          components={renderers}  // 使用自定義渲染器來顯示Markdown內容
        />
        {isTerminated && <p className={styles["gptContent"]}>對話已中止...</p>}
        {isLoading && !isTerminated && <LoadingIndicator />}
        {/* 空 div 作為滾動定位元素 */}
        <div ref={responseEndRef} /> 
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
  const [error, setError] = useState(null);

  let fetchController = new AbortController();  // 創建一個全局控制器

  useEffect(() => {
    return () => {
      fetchController.abort();
    };
  }, []);


  const handleSubmit = async (inputValue) => {
    setIsLoading(true);
    setError(null);
    setQuestion(inputValue); // 配合setQuestion選取option_data功能，修改直接設定問題為傳入的值
    let fullText = '';

    try {
      await fetchGPTResponse(inputValue, (chunk) => {
        fullText += chunk; // 累積數據
        setResponse(fullText); // 更新響應
      }, () => setIsLoading(false));
      setIsLoading(false);
    } catch (error) {
      setError('Failed to fetch response');
      setIsLoading(false);
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
            setQuestion={setQuestion}  // 傳遞 setQuestion 給 ChatArea
            />
            <GPTResponse 
              question={question} 
              response={response} 
              isTerminated={isTerminated} 
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>
    </main>
  );
}