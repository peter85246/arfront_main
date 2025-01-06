import React, { useMemo } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// 註冊字體
Font.register({
  family: 'NotoSansCJK',
  src: '/fonts/NotoSansTC-Regular.ttf',
  format: 'truetype',
});

// 工具函數
const safeJsonParse = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return jsonString;
  }
};

// 修改 extractFileName 函數
const extractFileName = (path) => {
  if (!path) return '';

  // 如果是 JSON 字符串，先解析它
  let processedPath = path;
  try {
    if (
      typeof path === 'string' &&
      (path.startsWith('[') || path.startsWith('['))
    ) {
      processedPath = JSON.parse(path)[0]; // 取第一個元素
    }
  } catch (e) {
    processedPath = path;
  }

  // 如果是數組，取第一個元素
  if (Array.isArray(processedPath)) {
    processedPath = processedPath[0];
  }

  // 移除路徑，只保留文件名
  return processedPath.split('\\').pop().split('/').pop();
};

// 修改 formatSteps 函數，使其與 PDFContent.js 一致
const formatSteps = (content) => {
  if (!content) return [];

  const parts = [];
  let lastIndex = 0;

  // 更新正則表達式，包括星號(*)、括號內編號、數字序號後的點以及英文段落結束後緊跟的中文字符開始
  const regex =
    /(\*\s)|\(\d+\)\s|(?<!remark\s)(?<!Remark\s)(?<!Illustration\s)(?<!illustration\s)(?<!敘述\s)(?<!備註\s)(?<!part\s)(\d+\.)\s(?![\d-])|[A-Za-z0-9]\.(?=[\u4e00-\u9fa5])/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    let index = match.index;
    if (
      match[0].includes('*') ||
      match[0].includes('(') ||
      (match[0].match(/\d+\./) &&
        !content
          .substring(lastIndex, index)
          .match(
            /(remark|Remark|Illustration|illustration|敘述|備註|part)\s\d+\.$/i
          ))
    ) {
      if (index !== 0) {
        parts.push(content.substring(lastIndex, index).trim());
        lastIndex = index;
      }
    } else if (match[0].match(/[A-Za-z0-9]\.(?=[\u4e00-\u9fa5])/)) {
      parts.push(content.substring(lastIndex, index + 1).trim());
      lastIndex = index + 1;
    }
  }
  parts.push(content.substring(lastIndex).trim());

  return parts.filter((part) => part.trim() !== '');
};

// 移除原有的 ForceLineBreak 組件，替換為 AutoWrapText
const AutoWrapText = ({ text, style }) => {
  const words = useMemo(() => {
    if (!text) return [];

    // 分割文本，保持原有的換行
    return text
      .split(
        /(?<=[\u4e00-\u9fa5])|(?=[\u4e00-\u9fa5])|(?<=\s)|(?=\s)|(?<=[@#$%^&*])|(?=[@#$%^&*])|(?<=\w{10})(?=\w)/g
      )
      .filter((word) => word.trim().length > 0);
  }, [text]);

  if (!text) return null;

  return (
    <View style={[styles.autoWrapContainer, style]}>
      {words.map((word, index) => {
        // 檢查是否是編號或包含 mm 的數字
        const isNumber = /^(\d+\.|[\(（]\d+[\)）])(?!\d+\.\d+)/.test(word);
        const hasMM = /(?:\d+\.?\d*|\(\d+\.?\d*\))(?:\s)?mm/.test(word);

        return (
          <Text
            key={index}
            style={[
              styles.wordSpan,
              isNumber || hasMM ? { color: 'red' } : null,
            ]}
          >
            {word}
          </Text>
        );
      })}
    </View>
  );
};

// 樣式定義
const styles = StyleSheet.create({
  page: {
    padding: '10mm',
    backgroundColor: '#ffffff',
    fontFamily: 'NotoSansCJK',
  },
  pageOutline: {
    border: '1pt solid black',
    paddingTop: '3mm',
    minHeight: '60mm',
    height: 'auto',
    maxHeight: '277mm',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
  },
  // 標題區域
  fileTitle: {
    marginBottom: '0',
    minHeight: '48mm', // 增加最小高度
    // borderBottom: '1pt solid black',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3mm',
  },
  titleSection: {
    width: '100%', // 控制標題區域寬度
  },
  // 標題區域
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
    marginLeft: '40%', // 向右偏移以達到完整置中
    padding: '5mm',
  },
  infoBox: {
    marginTop: '2mm',
  },
  infoText: {
    fontSize: 10,
    marginBottom: '1mm',
    paddingLeft: '3mm',
  },
  logo: {
    width: '80mm', // 加大 LOGO
    height: '32mm',
    marginLeft: 'auto', // 靠右顯示
    margin: '0mm 3mm 0mm 3mm',
    border: '1pt solid #c0c0c0',
    borderRadius: '3mm',
  },

  // SOP名稱區域
  sopContainer: {
    borderTop: '1pt solid black', // 移除頂部邊框
    borderBottom: 'none',
    padding: '1mm',
  },
  sopSection: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Section 標題樣式
  sectionHeader: {
    marginTop: '0',
    marginBottom: '0',
  },
  sectionLabelContainer: {
    borderTop: '1pt solid black',
    borderBottom: '1pt solid black',
    padding: '1mm 0',
  },
  // 機型、工具和維修部位的標籤統一樣式
  sectionLabel: {
    fontSize: 11,
    paddingLeft: '3mm',
  },

  // 機型區域
  // For Model 和 SOP 名稱之間的間距調整
  modelSection: {
    marginTop: '5mm',
    marginBottom: '5mm',
    justifyContent: 'center', // 垂直置中
    alignItems: 'center', // 水平置中
    borderBottom: 'none', // 移除底部邊框
  },
  modelImage: {
    width: '60%', // 縮小左右兩邊
    height: '45mm',
    objectFit: 'contain',
    border: '1pt solid #c0c0c0', // 更淺的灰色
    borderRadius: '1mm',
    padding: '0.5mm',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  // 工具區域
  toolsSection: {
    marginTop: '5mm',
  },
  toolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '60mm', // 增加整體高度
    paddingLeft: '3mm',
  },
  toolsImagesContainer: {
    width: '65%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '1mm',
  },
  toolsNamesContainer: {
    width: '32%',
    borderLeft: '1pt solid black',
    paddingLeft: '1mm', // 增加左邊距
  },
  toolItem: {
    width: '15%', // 一排6個
    height: '40mm', // 增加圖片高度
    marginBottom: '5mm',
    marginTop: '6mm',
    position: 'relative',
    overflow: 'hidden', // 確保內容不會溢出
  },
  toolImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    border: '1pt solid #c0c0c0',
    borderRadius: '1mm',
    padding: '0.5mm',
  },
  toolNameLabel: {
    color: 'red',
    fontSize: 10,
    paddingBottom: '1mm',
  },
  toolName: {
    marginBottom: '2mm',
  },
  toolNameText: {
    color: 'black', // 檔案名稱為黑色
    fontSize: 10,
    paddingBottom: '1mm',
  },
  // 維修部位說明區域
  illustrationSection: {
    marginTop: '5mm',
  },
  illustrationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '90mm', // 增加整體高度
    paddingLeft: '3mm',
  },
  // 維修部位說明區域
  illustrationImagesContainer: {
    width: '65%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '2mm',
    maxHeight: '90mm', // 限制最多兩排
    marginTop: '3mm',
  },
  illustrationNamesContainer: {
    width: '35%',
    paddingLeft: '1mm',
    display: 'flex',
    justifyContent: 'center', // ��直置中
    paddingVertical: '3mm', // 上下間距
  },
  illustrationItem: {
    width: '30%', // 調整為3個
    height: '40mm', // 增加圖片高度
    marginBottom: '0mm',
    position: 'relative',
    overflow: 'hidden', // 確保內容不會溢出
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    border: '1pt solid #c0c0c0',
    borderRadius: '1mm',
    padding: '0.5mm',
  },
  // SOP步驟頁面
  stepContainer: {
    borderTop: '1pt solid black',
    marginTop: '0',
    flex: 1,
    display: 'flex',
  },
  stepContent: {
    flexDirection: 'row',
    height: '75mm',
    marginTop: '0',
    marginBottom: '0',
    flex: 1,
  },
  stepImageSection: {
    width: '30%',
    borderRight: '1pt solid black',
    padding: '2mm',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'auto',
    flex: 1,
  },
  stepImage: {
    width: 'auto',
    height: 'auto',
    maxWidth: '95%',
    maxHeight: '95%',
    objectFit: 'contain',
    border: '1pt solid #c0c0c0',
    borderRadius: '1mm',
    padding: '1mm',
  },
  stepDescriptionSection: {
    width: '35%',
    borderRight: '1pt solid black',
    padding: '2mm',
    display: 'flex',
    flexDirection: 'column',
    height: 'auto',
    flex: 1,
    overflow: 'auto',
    paddingBottom: '3mm',
  },
  stepRemarkSection: {
    width: '35%',
    padding: '2mm',
    display: 'flex',
    flexDirection: 'column',
    height: 'auto',
    flex: 1,
    overflow: 'auto',
  },
  stepTitle: {
    fontSize: 10,
    marginBottom: '2mm',
    fontWeight: 'bold',
  },
  // 工具和維修部位共用樣式
  itemLabel: {
    position: 'absolute',
    top: 1,
    right: 1,
    color: 'black',
    fontSize: 8,
    border: '1pt solid red',
    padding: '1mm',
    backgroundColor: 'white',
    borderRadius: '1mm',
  },
  // 工具和維修部位的容器樣式
  sectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '3mm',
  },
  imagesContainer: {
    width: '65%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '2mm',
  },
  namesContainer: {
    width: '35%',
    paddingLeft: '1mm',
    display: 'flex',
    justifyContent: 'center',
    paddingVertical: '3mm',
  },

  // 新增外層容器樣式
  stepHeaderContainer: {
    height: '8mm',
    borderBottom: '1pt solid black',
    display: 'flex',
    justifyContent: 'center',
  },
  // Step 樣式
  stepHeader: {
    fontSize: 11,
    paddingLeft: '3mm',
  },
  stepText: {
    fontSize: 10,
    width: '100%',
    maxWidth: '100%',
    lineHeight: 1.6,
  },

  stepTextContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    marginTop: '2mm',
  },
  remarkImage: {
    width: 'auto',
    height: 'auto',
    maxWidth: '95%',
    maxHeight: '95%',
    objectFit: 'contain',
    marginTop: '2mm',
    border: '1pt solid #c0c0c0',
    borderRadius: '1mm',
    padding: '1mm',
  },

  // 添加 AutoWrapText 相關樣式
  autoWrapContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    width: '100%',
    padding: '1mm',
  },

  wordSpan: {
    fontSize: 10,
    lineHeight: 1.3,
    marginRight: '1pt',
  },

  stepSectionLarge: {
    height: '100%',
    overflow: 'auto',
  },

  stepContentFullPage: {
    flexDirection: 'row',
    height: '225mm',
    marginTop: '0',
    marginBottom: '0',
    flex: 1,
  },

  remarkTextContainer: {
    flexGrow: 0, // 讓容器根據內容大小自動調整
    flexShrink: 0, // 防止內容被壓縮
    marginBottom: '2mm',
  },

  remarkImageContainer: {
    flexGrow: 1, // 讓圖片容器佔據剩餘空間
    flexShrink: 1, // 允許在需要時縮小
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2mm', // 與文字保持一定間距
  },
});

// 在 PDFDocument 組件中的渲染部分
const PDFDocument = ({ knowledgeInfo, SOPData }) => {
  // 計算每頁實際需要的高度
  const calculatePageHeight = (stepsCount) => {
    const headerHeight = 48; // 標題區域高度（mm）
    const stepHeight = 75; // 將每個步驟的高度從 60mm 增加到 75mm
    const totalHeight = headerHeight + stepsCount * stepHeight;

    // 確保高度不超過 277mm（A4 高度減去邊距）
    return Math.min(totalHeight, 277);
  };

  // 優化內容長度檢查函數
  const checkContentLength = (text) => {
    if (!text) return { isLong: false, length: 0 };

    const baseLength = text.length;
    const newLines = (text.match(/\n/g) || []).length;
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;

    // 調整計算方式，降低對長度的敏感度
    const estimatedHeight =
      Math.ceil(
        (baseLength * 0.6 + // 降低基本長度的權重
          newLines * 25 + // 調整換行的影響
          chineseChars * 1.2) / // 調整中文字符的權重
          100
      ) * 10;

    return {
      isLong: estimatedHeight > 45,
      estimatedHeight: estimatedHeight,
      needsFullPage: estimatedHeight > 80,
      needsExtraLargePage: estimatedHeight > 120,
    };
  };

  // 修改分頁邏輯
  const paginatedSOPData = useMemo(() => {
    const result = [];
    if (!SOPData) return result;

    let currentPage = [];
    let currentHeight = 48;
    const maxPageHeight = 277;

    // 修改：檢查兩個步驟是否可以合併的函數，增加寬鬆模式參數
    const canCombineSteps = (step1, step2, isLastTwo = false) => {
      const step1IllustrationCheck = checkContentLength(step1.soP2Message);
      const step1RemarkCheck = checkContentLength(step1.soP2Remark);
      const step2IllustrationCheck = checkContentLength(step2.soP2Message);
      const step2RemarkCheck = checkContentLength(step2.soP2Remark);

      // 計算合併後的總高度
      const combinedHeight =
        Math.max(
          step1IllustrationCheck.estimatedHeight,
          step1RemarkCheck.estimatedHeight
        ) +
        Math.max(
          step2IllustrationCheck.estimatedHeight,
          step2RemarkCheck.estimatedHeight
        );

      // 為最後兩個步驟提供更寬鬆的條件
      if (isLastTwo) {
        // 檢查文字內容長度
        const totalTextLength =
          (step1.soP2Message?.length || 0) +
          (step1.soP2Remark?.length || 0) +
          (step2.soP2Message?.length || 0) +
          (step2.soP2Remark?.length || 0);

        // 如果總文字長度在合理範圍內，允許合併
        return totalTextLength <= 800 && combinedHeight <= 225; // 增加高度限制
      }

      // 一般情況的合併條件保持不變
      return (
        combinedHeight <= 120 &&
        !step1IllustrationCheck.needsExtraLargePage &&
        !step1RemarkCheck.needsExtraLargePage &&
        !step2IllustrationCheck.needsExtraLargePage &&
        !step2RemarkCheck.needsExtraLargePage
      );
    };

    for (let i = 0; i < SOPData.length; i++) {
      const step = SOPData[i];
      const nextStep = i < SOPData.length - 1 ? SOPData[i + 1] : null;
      const isLastTwo = i === SOPData.length - 2; // 檢查是否為最後兩個步驟

      const illustrationCheck = checkContentLength(step.soP2Message);
      const remarkCheck = checkContentLength(step.soP2Remark);

      const needsFullPage =
        illustrationCheck.needsExtraLargePage ||
        remarkCheck.needsExtraLargePage ||
        illustrationCheck.estimatedHeight + remarkCheck.estimatedHeight > 90;

      // 檢查是否可以與下一步驟合併
      if (
        (needsFullPage || isLastTwo) &&
        nextStep &&
        canCombineSteps(step, nextStep, isLastTwo)
      ) {
        // 如果當前頁面有其他內容，先保存
        if (currentPage.length > 0) {
          result.push({
            steps: currentPage,
            height: currentHeight,
          });
          currentPage = [];
        }

        // 合併當前步驟和下一步驟
        currentPage = [step, nextStep];
        // 根據是否為最後兩個步驟調整高度
        currentHeight = isLastTwo ? 48 + 180 : 48 + 150;
        i++; // 跳過下一步驟

        // 保存合併後的頁面
        result.push({
          steps: currentPage,
          height: currentHeight,
          isCombined: true,
          isLastTwo: isLastTwo,
        });
        currentPage = [];
        currentHeight = 48;
        continue;
      }

      // 原有的分頁邏輯保持不變
      if (needsFullPage) {
        if (currentPage.length > 0) {
          result.push({
            steps: currentPage,
            height: currentHeight,
          });
        }
        result.push({
          steps: [step],
          height: maxPageHeight,
          isFullPage: true,
        });
        currentPage = [];
        currentHeight = 48;
      } else {
        if (currentHeight + 75 > maxPageHeight) {
          result.push({
            steps: currentPage,
            height: currentHeight,
          });
          currentPage = [step];
          currentHeight = 48 + 75;
        } else {
          currentPage.push(step);
          currentHeight += 75;
        }
      }
    }

    // 處理最後一頁
    if (currentPage.length > 0) {
      result.push({
        steps: currentPage,
        height: currentHeight,
      });
    }

    return result;
  }, [SOPData]);

  // 修改步驟內容渲染邏輯
  const StepContent = ({ sop, isFullPage }) => {
    const illustrationCheck = checkContentLength(sop.soP2Message);
    const remarkCheck = checkContentLength(sop.soP2Remark);

    // 根據是否為整頁決定使用的樣式
    const contentStyle = isFullPage
      ? styles.stepContentFullPage
      : styles.stepContent;

    return (
      <View style={contentStyle}>
        <View style={styles.stepImageSection}>
          {sop.soP2Image && (
            <Image style={styles.stepImage} src={sop.soP2Image} />
          )}
        </View>

        <View
          style={[
            styles.stepDescriptionSection,
            illustrationCheck.isLong && styles.stepSectionLarge,
          ]}
        >
          <Text style={styles.stepTitle}>Illustration(步驟說明)：</Text>
          <AutoWrapText text={sop.soP2Message} />
        </View>

        <View
          style={[
            styles.stepRemarkSection,
            remarkCheck.isLong && styles.stepSectionLarge,
          ]}
        >
          <View style={styles.remarkTextContainer}>
            <Text style={styles.stepTitle}>Remark(備註補充)：</Text>
            <AutoWrapText text={sop.soP2Remark} />
          </View>
          {sop.soP2RemarkImage && (
            <View style={styles.remarkImageContainer}>
              <Image style={styles.remarkImage} src={sop.soP2RemarkImage} />
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.pageOutline}>
          {/* 標題區域 */}
          <View style={styles.fileTitle}>
            <View style={styles.headerContainer}>
              <View style={styles.titleSection}>
                <Text style={styles.title}>Trouble Shooting</Text>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    File No : {knowledgeInfo.knowledgeBaseFileNo}
                  </Text>
                  <Text style={styles.infoText}>
                    Error Code : {knowledgeInfo.knowledgeBaseAlarmCode}
                  </Text>
                </View>
              </View>
              <Image
                style={styles.logo}
                src={require('../HandBook-Logo2.png')}
              />
            </View>
            <View style={styles.sopContainer}>
              <Text style={styles.sopSection}>
                SOP名稱: {knowledgeInfo.knowledgeBaseSOPName}
              </Text>
            </View>
          </View>

          {/* For Model 機型 */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLabelContainer}>
              <Text style={styles.sectionLabel}>
                For Model 機型:{' '}
                {knowledgeInfo.knowledgeBaseModelImageNames &&
                  extractFileName(knowledgeInfo.knowledgeBaseModelImageNames)}
              </Text>
            </View>
            <View style={styles.modelSection}>
              {knowledgeInfo.knowledgeBaseModelImage &&
                safeJsonParse(knowledgeInfo.knowledgeBaseModelImage).map(
                  (item, idx) => (
                    <Image key={idx} style={styles.modelImage} src={item} />
                  )
                )}
            </View>
          </View>

          {/* Use Tools */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLabelContainer}>
              <Text style={styles.sectionLabel}>Use Tools(使用工具圖片) :</Text>
            </View>
            <View style={styles.toolsContainer}>
              <View style={styles.toolsImagesContainer}>
                {knowledgeInfo.knowledgeBaseToolsImage &&
                  safeJsonParse(knowledgeInfo.knowledgeBaseToolsImage).map(
                    (item, idx) => (
                      <View key={idx} style={styles.toolItem}>
                        <Image style={styles.toolImage} src={item} />
                        <Text style={styles.itemLabel}>
                          {['A', 'B', 'C', 'D', 'E', 'F'][idx]}
                        </Text>
                      </View>
                    )
                  )}
              </View>
              <View style={styles.namesContainer}>
                {knowledgeInfo.knowledgeBaseToolsImageNames &&
                  safeJsonParse(knowledgeInfo.knowledgeBaseToolsImageNames).map(
                    (name, idx) => (
                      <Text key={idx} style={styles.toolName}>
                        <Text style={styles.toolNameLabel}>
                          {['A', 'B', 'C', 'D', 'E', 'F'][idx]}:
                        </Text>
                        <Text style={styles.toolNameText}>
                          {extractFileName(name)}
                        </Text>
                      </Text>
                    )
                  )}
              </View>
            </View>
          </View>

          {/* Illustration 區域 */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLabelContainer}>
              <Text style={styles.sectionLabel}>
                Illustration(維修部位說明) :
              </Text>
            </View>
            <View style={styles.illustrationContainer}>
              <View style={styles.illustrationImagesContainer}>
                {knowledgeInfo.knowledgeBasePositionImage &&
                  safeJsonParse(knowledgeInfo.knowledgeBasePositionImage).map(
                    (item, idx) => (
                      <View key={idx} style={styles.illustrationItem}>
                        <Image style={styles.illustrationImage} src={item} />
                        <Text style={styles.itemLabel}>
                          {['A', 'B', 'C', 'D', 'E', 'F'][idx]}
                        </Text>
                      </View>
                    )
                  )}
              </View>
              <View style={styles.illustrationNamesContainer}>
                {knowledgeInfo.knowledgeBasePositionImageNames &&
                  safeJsonParse(
                    knowledgeInfo.knowledgeBasePositionImageNames
                  ).map((name, idx) => (
                    <Text key={idx} style={styles.toolName}>
                      <Text style={styles.toolNameLabel}>
                        {['A', 'B', 'C', 'D', 'E', 'F'][idx]}:
                      </Text>
                      <Text style={styles.toolNameText}>
                        {extractFileName(name)}
                      </Text>
                    </Text>
                  ))}
              </View>
            </View>
          </View>
        </View>
      </Page>

      {/* SOP步驟頁面 */}
      {paginatedSOPData.map((page, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <View
            style={{
              ...styles.pageOutline,
              height: `${page.height}mm`,
            }}
          >
            {/* 標題區域 */}
            <View style={styles.fileTitle}>
              <View style={styles.headerContainer}>
                <View style={styles.titleSection}>
                  <Text style={styles.title}>Trouble Shooting</Text>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      File No : {knowledgeInfo.knowledgeBaseFileNo}
                    </Text>
                    <Text style={styles.infoText}>
                      Error Code : {knowledgeInfo.knowledgeBaseAlarmCode}
                    </Text>
                  </View>
                </View>
                <Image
                  style={styles.logo}
                  src={require('../HandBook-Logo2.png')}
                />
              </View>
              <View style={styles.sopContainer}>
                <Text style={styles.sopSection}>
                  SOP名稱: {knowledgeInfo.knowledgeBaseSOPName}
                </Text>
              </View>
            </View>

            {/* 步驟內容 */}
            {page.steps.map((sop, idx) => (
              <View key={idx} style={styles.stepContainer}>
                <View style={styles.stepHeaderContainer}>
                  <Text style={styles.stepHeader}>Step {sop.soP2Step}</Text>
                </View>
                <StepContent
                  sop={sop}
                  isFullPage={page.isFullPage} // 傳遞是否為整頁的標記
                />
              </View>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default PDFDocument;
