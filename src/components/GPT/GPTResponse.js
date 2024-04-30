import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import styles from "../../scss/gpt.module.scss"; // 引入樣式文件

const GPTResponse = ({ question, response, isLoading, inputText }) => {
  const [elements, setElements] = useState([]);
  const responseEndRef = useRef(null);

  const options_data = [
    {
      value: "GXA-S背隙調整",
      label: "GXA-S背隙調整",
      videos: [
        {
          step: "Step1",
          path: "/detron_data/GXA170S背隙調整/step1打開塞蓋.mp4",
        },
        {
          step: "Step2",
          path: "/detron_data/GXA170S背隙調整/step2拆鬆聯軸器螺絲.mp4",
        },
        {
          step: "Step3",
          path: "/detron_data/GXA170S背隙調整/step3拆蜗桿封蓋.mp4",
        },
        {
          step: "Step4",
          path: "/detron_data/GXA170S背隙調整/step4放鬆M4螺絲2只.mp4",
        },
        {
          step: "Step5",
          path: "/detron_data/GXA170S背隙調整/step5旋轉套管座M6X50螺絲.mp4",
        },
        {
          step: "Step6",
          path: "/detron_data/GXA170S背隙調整/step6鎖緊M3螺絲2只.mp4",
        },
        {
          step: "Step7",
          path: "/detron_data/GXA170S背隙調整/step7量測背隙.mp4",
        },
        {
          step: "Step8",
          path: "/detron_data/GXA170S背隙調整/step8聯軸器鎖緊及鎖塞蓋.mp4",
        },
        {
          step: "Step9",
          path: "/detron_data/GXA170S背隙調整/step9安裝蜗桿封蓋.mp4",
        },
      ],
    },
  ];

  // 每次 response 更新時，自動滾動到底部
  useEffect(() => {
    if (responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [response]); // 依賴於 response 的更新

  // Loading... 過場動畫
  function LoadingIndicator() {
    const [dots, setDots] = useState("...");
    useEffect(() => {
      const timer = setInterval(() => {
        setDots((dots) => (dots.length < 6 ? dots + "." : "..."));
      }, 500);
      return () => clearInterval(timer);
    }, []);

    return <div className={styles["loading-indicator"]}>Loading{dots}</div>;
  }

  useEffect(() => {
    const parseContent = () => {
      const regex = /\{([^}]*?\.(png|mp4))\}/g; // 更新正則表達式以匹配 png 和 mp4 文件
      let lastIndex = 0;
      let match;
      const parsedElements = [];

      while ((match = regex.exec(inputText))) {
        const text = inputText.substring(lastIndex, match.index).trim();
        const mediaPath = match[1].trim().replace(/\s+/g, "");

        // 將文字部分作為Markdown渲染
        if (text) {
          parsedElements.push(
            <ReactMarkdown
              key={`text-${lastIndex}`}
              children={text}
              rehypePlugins={[rehypeRaw]}
            />,
          );
        }

        // 渲染圖片與對應的步驟名稱
        const stepLabel = mediaPath
          .replace(/\.(png|mp4)$/, "")
          .match(/Step\d+(-\d+)?$/i)[0];
        parsedElements.push(
          <div
            key={`container-${match.index}`}
            style={{ marginBottom: "15px" }}
          >
            <img
              key={`image-${match.index}`}
              src={`/detron_data/${mediaPath}`}
              alt={mediaPath}
              className={styles.image}
            />
            <div
              style={{
                marginTop: "0px",
                textAlign: "center",
                width: "40%",
                margin: "0px 0px 0px 5px",
              }}
            >
              {stepLabel + " - Image"}
            </div>
          </div>,
        );
        // 在options_data中查找與當前步驟相對應的影片
        if (
          options_data.some(
            (option) => option.value === "GXA-S背隙調整" && option.videos,
          )
        ) {
          // 約束只有"GXA-S背隙調整"才會顯示屬於此項目的影片檔呈現
          const stepVideo = options_data
            .find((option) => option.value === "GXA-S背隙調整")
            .videos.find((video) => video.step === stepLabel);
          if (stepVideo) {
            parsedElements.push(
              <div
                key={`video-container-${match.index}`}
                style={{ marginBottom: "15px" }}
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
                    marginTop: "0px",
                    textAlign: "center",
                    width: "40%",
                    margin: "0px 0px 0px 5px",
                  }}
                >
                  {stepLabel + " - Video"}
                </div>
              </div>,
            );
          }
        }

        lastIndex = regex.lastIndex;
      }

      // 添加文字部分（逐字呈現功能）
      if (lastIndex < inputText.length) {
        parsedElements.push(
          <ReactMarkdown
            key="text-last"
            children={inputText.substring(lastIndex)}
            rehypePlugins={[rehypeRaw]}
          />,
        );
      }

      // 在迴圈外部設置元素
      setElements(parsedElements);

      // 添加滾動到底部的功能
      if (responseEndRef.current) {
        responseEndRef.current.scrollIntoView({ behavior: "smooth" });
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