import React from "react"; // 確保 React 已被導入
import { useState, useEffect, useRef } from "react";
import styles from "../scss/gpt.module.scss";
import ChatArea from "../components/GPT/ChatArea";
import GPTResponse from "../components/GPT/GPTResponse";

// 設定一個模擬的 fetchGPTResponse 函數
const fetchGPTResponse = async (
  input,
  signal,
  handleNewChunk,
  setLoadingFalse,
  setResponse,
  setIsLoading,
) => {
  try {
    const response = await fetch("http://localhost:5000/conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: input }),
      signal: signal,
    });

    if (response.ok) {
      const reader = response.body.getReader(); // 確保 reader 在此定義
      let isFirstChunk = true; // 用來檢查是否為第一塊資料
      let fullText = ""; // 累積完整文本，解決閃出文字問題
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        fullText += chunk; // 累加文本
        handleNewChunk(chunk); // 逐塊處理數據
        if (isFirstChunk && setLoadingFalse) {
          setLoadingFalse();
          isFirstChunk = false; // 確保加載指示器隱藏邏輯只執行一次
        }
      }
      typeWritter(
        fullText,
        0,
        setResponse,
        () => setIsLoading(false),
        true,
        signal,
        100,
        500,
      ); // 一次性呼叫逐字顯示
    } else {
      throw new Error("Network response was not ok.");
    }
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to fetch response");
  }
};

// defaultDelay：用於控制每個文字之間的延遲時間。
// initialDelay：用於控制開始顯示文字之前的等待時間。
// delay：用於控制特定情況下的額外延遲，例如在特定段落開頭或特定事件觸發時增加延遲，以提供更好的閱讀體驗。

// 修改typeWritter函數以接受完成時的回調與段落切割
const typeWritter = (
  text,
  setResponseFunc,
  onFinish,
  shouldContinue,
  signal,
  defaultDelay = 500,
  initialDelay = 800,
) => {
  const startTyping = () => {
    if (signal.aborted || !shouldContinue) {
      // 如果收到中止信號或不應繼續，立即停止
      if (onFinish) onFinish();
      return;
    }

    const typeNextCharacter = (currentIdx) => {
      if (currentIdx < text.length) {
        let nextIdx = currentIdx + 1; // 預設下一個索引
        let delay = defaultDelay; // 使用新的局部變量延遲，確保每次使用的都是預設延遲

        // 檢查是否為特定段落開頭，如"步驟如下："或"步驟 X："
        const sectionStartMatch = text
          .substring(currentIdx)
          .match(/^(步驟如下：|步\s*驟\s*\d+：)/);
        if (sectionStartMatch) {
          const sectionStart = sectionStartMatch[0].replace(/：/, " ： "); // 增加"："的左右間距
          nextIdx = currentIdx + sectionStart.length; // 更新索引跳過整個匹配字串
          delay = 500; // 增加延時
        }

        setResponseFunc((prev) => `${prev}${text[currentIdx]}`); // 移動到條件外以確保每次迭代都執行
        setTimeout(() => typeNextCharacter(nextIdx), delay); // 使用更新後的延遲和索引
      } else {
        if (onFinish) onFinish();
      }
    };

    setTimeout(startTyping, initialDelay);
  };

  startTyping(); // 開始打字
};

export default function GPT({ options_data }) {
  const [input, setInput] = useState("");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchController, setFetchController] = useState(new AbortController()); // 創建一個全局控制器

  useEffect(() => {
    return () => {
      fetchController.abort();
    };
  }, []);

  const handleSubmit = async (inputValue) => {
    setIsLoading(true);
    setError(null);
    setQuestion(inputValue); // 配合setQuestion選取option_data功能，修改直接設定問題為傳入的值

    // 中止之前的請求並創建一個新的控制器
    fetchController.abort();
    const newController = new AbortController(); // 創建一個新的控制器
    setFetchController(newController); // 更新控制器狀態

    try {
      let fullText = "";
      await fetchGPTResponse(
        inputValue,
        newController.signal,
        (chunk) => {
          fullText += chunk; // 累積數據
          setResponse(fullText); // 更新響應
        },
        () => {
          setIsLoading(false);
          // typeWritter(fullText, 0, setResponse, () => setIsLoading(false), true, newController.signal, 100, 500);
        },
      );
    } catch (error) {
      if (error.name !== "AbortError") {
        setError("Failed to fetch response");
      }
      setIsLoading(false);
    }
  };

  // 處理 new chat 按鈕
  const handleNewChat = () => {
    fetchController.abort(); // 確保中止現有操作
    const newController = new AbortController(); // 創建一個新的控制器
    setFetchController(newController); // 更新控制器狀態

    setInput(""); // 清空輸入
    setQuestion(""); // 清空問題
    setResponse(""); // 清空回應
    setIsLoading(false); // 停止加載動畫
  };

  // 處理 Clear 按鈕
  const handleClear = () => {
    fetchController.abort(); // 確保中止現有操作
    setResponse(""); // 清空回應
    setIsLoading(false); // 停止加载动画
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
              handleNewChat={handleNewChat}
              handleClear={handleClear}
              setQuestion={setQuestion} // 傳遞 setQuestion 給 ChatArea
              setResponse={setResponse} // 傳遞 setResponse
              setIsLoading={setIsLoading} // 傳遞 setIsLoading
              options_data={options_data}
            />
            <GPTResponse
              question={question}
              inputText={response} // 傳遞回應文本給 GPTImageParser
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
