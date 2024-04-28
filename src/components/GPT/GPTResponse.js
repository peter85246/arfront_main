import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from '../../scss/gpt.module.scss';
import GPTImageParser from './GPTImageParser';

// 步驟組件，用於將文本和圖片包裝在一起
// const Step = ({ text, imagePath }) => {
//   return (
//     <div className={styles.step}>
//       <ReactMarkdown children={text} rehypePlugins={[rehypeRaw]} />
//       {imagePath && (
//         <img
//           src={`/detron_images/${imagePath}`}
//           alt={imagePath}
//           className={styles.image}
//         />
//       )}
//     </div>
//   );
// };

// 現在 Step 組件只需要處理文本，圖片由外部渲染
const Step = ({ children }) => {
  return (
    <div className={styles.step}>
      <ReactMarkdown children={children} rehypePlugins={[rehypeRaw]} />
    </div>
  );
};

const GPTResponse = ({ question, response, isLoading, error }) => {
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
  
    // 定義一個自定義渲染方法
    const renderers = {
      // 添加圖片解析器，自動挑選detron_images檔案內的png圖檔渲染
      // image: ({ src, alt }) => <GPTImageParser inputText={response} />,

      text: ({ node }) => {
        const elements = [];
        const regex = /\{(.*?)\.png\}/g;
        let lastIndex = 0;
        let match;
        
        while ((match = regex.exec(node.value))) {
          const text = node.value.substring(lastIndex, match.index).trim();
          const imagePath = match[1].trim();
          // 首先將文本添加到元素中
          if (text) {
            elements.push(<ReactMarkdown key={`text-${lastIndex}`} children={text} rehypePlugins={[rehypeRaw]} />);
          }
          // 然後使用GPTImageParser組件來顯示圖片
          elements.push(<GPTImageParser key={`image-${match.index}`} inputText={imagePath} />);
          lastIndex = regex.lastIndex;
        }
        
        if (lastIndex < node.value.length) {
          elements.push(<ReactMarkdown key={`text-last`} children={node.value.substring(lastIndex)} rehypePlugins={[rehypeRaw]} />);
        }
  
        return <>{elements}</>;
      },

      // Markdown文字渲染器...
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
            children={response} // 確保 response 變量為包含要渲染的Markdown內容
            rehypePlugins={[rehypeRaw]}
            components={renderers}  // 使用自定義渲染器來顯示Markdown內容
          />
          {!isLoading && <p className={styles["gptContent"]}></p>}
          {isLoading && <LoadingIndicator />}

          {/* 圖片png檔案前端渲染器組件 */}
          <GPTImageParser inputText={response} /> 
          
          {/* 空 div 作為滾動定位元素 */}
          <div ref={responseEndRef} /> 
        </div>
      </div>
    );
  };

export default GPTResponse;
