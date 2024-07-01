import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import styles from '../../scss/gpt.module.scss'; // 引入樣式文件
import { createElement } from 'react';
import { Link } from 'react-router-dom'; // 若使用 React Router，或改用標準的 <a> 標籤

import Button from '@mui/material/Button';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DownloadIcon from '@mui/icons-material/CloudDownload';
import classNames from 'classnames';

const GPTResponse = ({
  question,
  response,
  isLoading,
  inputText,
  setIsLoading,
}) => {
  const [elements, setElements] = useState([]);
  const responseEndRef = useRef(null);
  const responseAreaRef = useRef(null); // 用來參照包含所有渲染文字的容器

  const options_data = [
    {
      value: 'GXA-S背隙調整',
      label: 'GXA-S背隙調整',
      videos: [
        {
          step: 'Step1',
          path: '/detron_data/GXA170S背隙調整/step1打開塞蓋.mp4',
        },
        {
          step: 'Step2',
          path: '/detron_data/GXA170S背隙調整/step2拆鬆聯軸器螺絲.mp4',
        },
        {
          step: 'Step3',
          path: '/detron_data/GXA170S背隙調整/step3拆蜗桿封蓋.mp4',
        },
        {
          step: 'Step4',
          path: '/detron_data/GXA170S背隙調整/step4放鬆M4螺絲2只.mp4',
        },
        {
          step: 'Step5',
          path: '/detron_data/GXA170S背隙調整/step5旋轉套管座M6X50螺絲.mp4',
        },
        {
          step: 'Step6',
          path: '/detron_data/GXA170S背隙調整/step6鎖緊M3螺絲2只.mp4',
        },
        {
          step: 'Step7',
          path: '/detron_data/GXA170S背隙調整/step7量測背隙.mp4',
        },
        {
          step: 'Step8',
          path: '/detron_data/GXA170S背隙調整/step8聯軸器鎖緊及鎖塞蓋.mp4',
        },
        {
          step: 'Step9',
          path: '/detron_data/GXA170S背隙調整/step9安裝蜗桿封蓋.mp4',
        },
      ],
    },
  ];

  // 引入網站url判斷功能linkify
  const linkify = (text) => {
    const urlRegex = /(\bhttps?:\/\/[^\s<]+)\b/g; // 確保 URL 前後是邊界
    return text.replace(
      urlRegex,
      (url) => `<a href="${url}" target="_blank">${url}</a>`
    );
  };

  // 網站連結精確抓取設定
  const renderers = {
    link: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  };

  // 複製到剪貼簿的函數
  const copyToClipboard = () => {
    if (responseAreaRef.current) {
      const text = responseAreaRef.current.innerText; // 獲取渲染後的純文字
      navigator.clipboard.writeText(text).then(
        () => {
          alert('文字已複製到剪貼簿！');
        },
        (err) => {
          console.error('Failed to copy: ', err);
        }
      );
    } else {
      console.error('Unable to access the text container.');
    }
  };

  // 下載文字為 TXT 檔的函數
  const downloadTxtFile = () => {
    if (responseAreaRef.current) {
      const text = responseAreaRef.current.innerText;
      const element = document.createElement('a');
      const file = new Blob([text], { type: 'text/plain' });

      // 移除指定字樣並清理前後空白
      const cleanQuestion = question.replace('並加上圖片說明', '').trim();
      // 使用正則表達，移除特定字樣並允許中文字符、字母、數字、連字符、底線及空白
      const fileName =
        cleanQuestion.replace(/[^a-zA-Z0-9-_\s\u4e00-\u9fa5]/g, '_') + '.txt';

      element.href = URL.createObjectURL(file);
      element.download = fileName; // 將文件名設定與詢問的問題對應相同
      document.body.appendChild(element);
      element.click();
    } else {
      console.error('無法接收的文字訊息，下載失敗!');
    }
  };

  useEffect(() => {
    if (elements) {
      setIsLoading(false);
    }
  }, [inputText, setIsLoading]);

  useEffect(() => {
    const parseContent = () => {
      const regex = /\{([^}]*?\.(png|mp4))\}/g; // 更新正則表達式以匹配 png 和 mp4 文件
      let lastIndex = 0;
      let match;
      const parsedElements = [];
      const loadedSteps = new Set(); // 用來記錄已經加載過影片的步驟

      while ((match = regex.exec(inputText))) {
        const text = inputText.substring(lastIndex, match.index).trim();
        const mediaPath = match[1].trim().replace(/\s+/g, '');

        // 將文字部分作為Markdown渲染
        if (text) {
          parsedElements.push(
            <ReactMarkdown
              key={`text-${lastIndex}`}
              children={linkify(text)} // 確保文本經過 linkify 處理
              rehypePlugins={[rehypeRaw]}
              components={renderers}
            />
          );
        }

        // 撈取檔案 png、mp4 內容，與呈現Step字樣
        const fullStepLabel = mediaPath
          .replace(/\.(png|mp4)$/, '')
          .match(/Step\d+(-\d+)?$/i)[0];

        // 取得步驟主編號Step1，忽略子編號Step1"-1" (避免發生影片呈現不出來問題)
        const stepLabel = fullStepLabel.split('-')[0];

        // 分別處理圖片和影片
        if (mediaPath.endsWith('.png')) {
          parsedElements.push(
            <div
              key={`container-${match.index}`}
              style={{ marginBottom: '15px' }}
            >
              <img
                key={`image-${match.index}`}
                src={`/detron_data/${mediaPath}`}
                alt={mediaPath}
                className={styles.image}
              />
              <div
                style={{
                  marginTop: '0px',
                  textAlign: 'center',
                  width: '40%',
                  margin: '0px 0px 0px 5px',
                }}
              >
                {fullStepLabel + ' - Image'}
              </div>
            </div>
          );
        }

        if (!loadedSteps.has(stepLabel)) {
          // 檢查此步驟的影片是否已加載
          const stepVideo = options_data
            .find((option) => option.value === 'GXA-S背隙調整')
            ?.videos.find((video) => video.step === stepLabel);

          if (stepVideo) {
            parsedElements.push(
              <div
                key={`video-container-${match.index}`}
                style={{ marginBottom: '10px' }}
              >
                <video
                  key={`video-${match.index}`}
                  controls
                  autoPlay
                  loop
                  muted
                  src={stepVideo.path}
                  className={styles.image}
                >
                  Your browser does not support the video tag.
                </video>
                <div
                  style={{
                    marginTop: '0px',
                    textAlign: 'center',
                    width: '40%',
                    margin: '0px 0px 0px 5px',
                  }}
                >
                  {stepLabel + ' - Video'}
                </div>
              </div>
            );
            loadedSteps.add(stepLabel); // 標記此步驟的影片已加載
          }
        }

        lastIndex = regex.lastIndex;
      }

      // 添加文字部分（逐字呈現功能）
      if (lastIndex < inputText.length) {
        parsedElements.push(
          <ReactMarkdown
            key="text-last"
            children={linkify(inputText.substring(lastIndex))}
            rehypePlugins={[rehypeRaw]}
            components={renderers}
          />
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

  // 監聽 elements，當完成更新後結束加載動畫
  useEffect(() => {
    if (elements.length > 0) {
      setIsLoading(false); // 當 elements 完全生成後停止加載動畫
    }
  }, [elements]);

  return (
    <div className={styles['gpt-response-area']}>
      <div className={styles['user-question']}>
        {/* 只有當 question 非空時顯示 "發問：" */}
        {question && <p>發問：{question.split('並加上圖片說明')[0]}</p>}
      </div>

      <div className={styles['gpt-response']} ref={responseAreaRef}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            marginRight: '-5px',
          }}
        >
          <Button
            startIcon={<FileCopyIcon />}
            onClick={copyToClipboard}
            variant="contained"
            color="primary"
            sx={{
              minWidth: 30,
              width: 30,
              padding: '3px 5px 3px 17px',
              marginRight: '5px',
              backgroundColor: '#439cfc',
              '&:hover': {
                backgroundColor: '#0056b3',
              },
            }}
          ></Button>
          <Button
            startIcon={<DownloadIcon />}
            onClick={downloadTxtFile}
            variant="contained"
            color="primary"
            sx={{
              minWidth: 30,
              width: 30,
              padding: '3px 5px 3px 17px',
              backgroundColor: '#439cfc',
              '&:hover': {
                backgroundColor: '#0056b3',
              },
            }}
          ></Button>
        </div>
        {!isLoading && <p className={styles['gptContent']}></p>}
        {/* {isLoading && <LoadingIndicator />} */}

        {/* 圖片png檔案前端渲染器函數 */}
        <div className={styles.step}>{elements}</div>

        {/* 空 div 作為滾動定位元素 */}
        <div ref={responseEndRef} />
      </div>
    </div>
  );
};

export default GPTResponse;
