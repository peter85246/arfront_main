import React, { useState, useEffect } from 'react';

// 定義一個名為 GPTImageParser 的 React 組件，接收 inputText 屬性
const GPTImageParser = ({ inputText }) => {
  // 使用 useState 鉤子來創建和管理 imagePaths 狀態
  const [imagePaths, setImagePaths] = useState([]);

  // 使用 useEffect 鉤子來處理組件的副作用，此處為根據 inputText 提取圖片路徑
  useEffect(() => {
    const parseImages = () => {
      // 定義正則表達式，只匹配結尾為 .png 的圖片文件
      const regex = /\{([^}]*?\.png)\}/g;
      let matches;
      const paths = [];

      // 使用正則表達式循環匹配 inputText 中的所有圖片路徑
      while ((matches = regex.exec(inputText))) {
        // 將匹配到的路徑進行修剪並去除多餘空白
        const imagePath = matches[1].trim().replace(/\s+/g, '');
        // 將處理後的路徑加入 paths 數組
        paths.push(imagePath);
      }

      // 更新 imagePaths 狀態為提取到的所有圖片路徑
      setImagePaths(paths);
    };

    // 執行解析圖片的函數
    parseImages();
  }, [inputText]); // 當 inputText 更新時重新執行效果

  // 渲染圖片到頁面，使用 map 方法遍歷 imagePaths，並為每個圖片設置獨特的 key
  return (
    <div>
      {imagePaths.map((path, index) => (
        <img key={index} src={`/detron_images/${path}`} alt={path} style={{ maxWidth: '25%' }} />
      ))}
    </div>
  );
};

// 將 GPTImageParser 組件導出，以便在其他文件中使用
export default GPTImageParser;
