import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from '../../scss/gpt.module.scss'; // 引入樣式文件

const GPTResponse = ({ question, response, isLoading, inputText }) => {
  const [elements, setElements] = useState([]);
  const responseEndRef = useRef(null);

  // 每次 response 更新時，自動滾動到底部
  useEffect(() => {
    if (responseEndRef.current) {
        responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response]); // 依賴於 response 的更新

  // Loading... 過場動畫
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

  useEffect(() => {
    const parseContent = () => {
      const regex = /\{([^}]*?\.png)\}/g;
      let lastIndex = 0;
      let match;
      const parsedElements = [];

      while ((match = regex.exec(inputText))) {
        const text = inputText.substring(lastIndex, match.index).trim();
        const imagePath = match[1].trim().replace(/\s+/g, '');

        // 將文字部分作為Markdown渲染
        if (text) {
          parsedElements.push(
            <ReactMarkdown key={`text-${lastIndex}`} children={text} rehypePlugins={[rehypeRaw]} />
          );
        }

        // 將圖片和標籤封裝在同一個<div>中
        parsedElements.push(
          <div key={`container-${match.index}`} style={{ marginBottom: '15px'}}>
            <img 
              key={`image-${match.index}`} 
              src={`/detron_images/${imagePath}`} 
              alt={imagePath} 
              className={styles.image} 
            />
            <div 
              style={{ 
                marginTop: '0px',
                textAlign: 'center', 
                width: '40%', 
                margin: '0px 0px 0px 5px' 
              }}
              >
              {imagePath.replace(/\.png$/, '').match(/Step\d+(-\d+)?$/i)[0]}
            </div>
          </div>
        );               

        lastIndex = regex.lastIndex;
      }

      // 添加文字部分（逐字呈現功能）
      if (lastIndex < inputText.length) {
        parsedElements.push(
          <ReactMarkdown key="text-last" children={inputText.substring(lastIndex)} rehypePlugins={[rehypeRaw]} />
        );
      }

      // 在迴圈外部設置元素
      setElements(parsedElements);

      // 添加滾動到底部的功能
      if (responseEndRef.current) {
        responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    parseContent();
  }, [inputText]); // 當 inputText 更新時重新執行效果

  return (
    <div className={styles["gpt-response-area"]}>
      <div className={styles["user-question"]}>
        {/* 只有當 question 非空時顯示 "發問：" */}
        {question && <p>發問：{question.split("並加上圖片說明")[0]}</p>}
      </div>
      <div className={styles["gpt-response"]}>
        {!isLoading && <p className={styles["gptContent"]}></p>}
        {isLoading && <LoadingIndicator />}

        {/* 圖片png檔案前端渲染器函數 */}
        <div className={styles.step}>{elements}</div>
        
        {/* 空 div 作為滾動定位元素 */}
        <div ref={responseEndRef} /> 
      </div>
    </div>
  );
};

export default GPTResponse;