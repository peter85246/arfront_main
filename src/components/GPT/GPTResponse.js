import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from '../../scss/gpt.module.scss';

const GPTResponse = ({ question, response, isLoading }) => {
    const responseEndRef = useRef(null);

    // 每次 response 更新時，自動滾動到底部
    useEffect(() => {
      if (responseEndRef.current) {
          responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [response]); // 依賴於 response 的更新

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
  
    // 定義一個自定義渲染方法
    const renderers = {
      // 當解析到 h2 標籤時，使用以下元素和樣式
      h2: ({node, ...props}) => (
        <h2 className={styles['custom-header']} {...props} />
      ),
  
      // // 當解析到文本包含特定格式時，解析並顯示圖片
      // p: ({node, ...props}) => {
      //   const content = props.children[0];
      //   if (typeof content === 'string') {
      //     const parts = content.split(/(\{[\w\s-]+\.png\})/);
      //     return (
      //       <p>
      //         {parts.map((part, index) => {
      //           const match = part.match(/\{([\w\s-]+\.png)\}/);
      //           if (match) {
      //             const imageUrl = `http://localhost:5000/images/${match[1]}`;
      //             return <img key={index} src={imageUrl} alt={match[1]} style={{ maxWidth: '100%' }} />;
      //           }
      //           return part;
      //         })}
      //       </p>
      //     );
      //   }
      //   return <p>{content}</p>;
      // },
      
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
          {/* 只有當 question 非空時顯示 "發問：" */}
          {question && <p>發問：{question}</p>}
        </div>
        <div className={styles["gpt-response"]}>
          <ReactMarkdown 
            children={response}
            rehypePlugins={[rehypeRaw]}
            components={renderers}  // 使用自定義渲染器來顯示Markdown內容
          />
          {!isLoading && <p className={styles["gptContent"]}></p>}
          {isLoading && <LoadingIndicator />}
          {/* 空 div 作為滾動定位元素 */}
          <div ref={responseEndRef} /> 
        </div>
      </div>
    );
}

export default GPTResponse
