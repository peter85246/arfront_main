import React, { useState, useEffect, forwardRef } from 'react';
import styles from '../scss/PDFDesign.module.scss';
import classNames from 'classnames';
import { useLocation } from 'react-router-dom';

const PreviewPDFContent = React.forwardRef(
  ({ knowledgeInfo = {}, SOPData = [] }, ref) => {
    console.log('knowledgeInfo', knowledgeInfo);
    console.log('SOPData', SOPData);

    const stepsPerPage = 4;

    // 创建分页数据
    const paginatedSOPData = [];
    for (let i = 0; i < SOPData?.length; i += stepsPerPage) {
      paginatedSOPData.push(SOPData.slice(i, i + stepsPerPage));
    }

    //#region 分段格式化函數
    const formatSteps = (content) => {
      if (!content) return [];

      const parts = [];
      let lastIndex = 0;

      // 更新正则表达式，包括星号(*)、括号内编号、数字序号后的点（排除特定词之后的序号触发），以及英文段落结束后紧跟的中文字符开始
      const regex =
        /(\*\s)|\(\d+\)\s|(?<!remark\s)(?<!Remark\s)(?<!Illustration\s)(?<!illustration\s)(?<!敘述\s)(?<!備註\s)(?<!part\s)(\d+\.)\s(?![\d-])|[A-Za-z0-9]\.(?=[\u4e00-\u9fa5])/g;

      let match;
      while ((match = regex.exec(content)) !== null) {
        let index = match.index;
        // 处理星号、括号内编号和数字序号
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
        }
        // 处理英文结束和中文开始之间的转换
        else if (match[0].match(/[A-Za-z0-9]\.(?=[\u4e00-\u9fa5])/)) {
          parts.push(content.substring(lastIndex, index + 1).trim());
          lastIndex = index + 1; // 从中文字符开始新段落
        }
      }
      parts.push(content.substring(lastIndex).trim()); // 添加最后一部分文本

      return parts;
    };
    //#endregion

    return (
      <div className={styles['content-box']} ref={ref}>
        {/* PDF內容放在這裡 */}
        <div className={styles['page-outline']}>
          <div className={styles['file-title']} id="file-title">
            <div className={styles['page']}>
              <h1>Trouble Shooting</h1>
              <div className={styles['preview-content']}>
                <div className={styles['info-box']}>
                  <p style={{ textAlign: 'left' }}>
                    {/* 修改：添加空值檢查，使用 || 提供默認值 */}
                    File No : {knowledgeInfo.knowledgeBaseFileNo || ''}
                    <br />
                    Error Code : {knowledgeInfo.knowledgeBaseAlarmCode || ''}
                  </p>
                </div>
              </div>
              <img
                className={styles['logo-img']}
                style={{ border: '1px solid #a0a0a0', borderRadius: '8px' }}
                src={require('../Company Logo.jpg')}
                alt="LOGO"
              />
            </div>
            <label className={styles['sop-section']}>
              {/* 修改：添加空值檢查，使用 || 提供默認值 */}
              <p>SOP名稱: {knowledgeInfo.knowledgeBaseSOPName || ''}</p>
            </label>
          </div>

          <div className={styles['model-label']}>
            <label>
              For Model 機型 : {/* 修改：添加多層空值檢查 */}
              {knowledgeInfo.knowledgeBaseModelImageObj &&
              knowledgeInfo.knowledgeBaseModelImageObj[0]
                ? knowledgeInfo.knowledgeBaseModelImageObj[0].name
                : ''}
            </label>
          </div>
          <div className={styles['model']} id="model">
            <div>
              <div className="w-full flex justify-between py-2 px-6">
                <div className="flex gap-[8px] items-center">
                  {(() => {
                    if (knowledgeInfo.knowledgeBaseModelImageObj) {
                      return (
                        knowledgeInfo.knowledgeBaseModelImageObj &&
                        knowledgeInfo.knowledgeBaseModelImageObj.map(
                          (item, idx) => (
                            <div
                              className="w-[500px] h-[250px] relative"
                              style={{ overflow: 'hidden' }}
                            >
                              <img
                                key={idx}
                                src={item.img}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '8px',
                                  border: '1px solid #c0c0c0',
                                  objectFit: 'contain', // 確保圖片覆蓋整個容器
                                }}
                                alt="Your images Description"
                              />
                            </div>
                          )
                        )
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className={styles['tools']} id="tools">
            <div className="w-full">
              <div className={styles['tools-label']}>
                <label>Use Tools(使用工具圖片) :</label>
              </div>
              <div
                className="w-full flex justify-between py-2 px-6"
                style={{ minWidth: '60vw' }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-start',
                    gap: '8px',
                  }}
                >
                  {(() => {
                    // 檢查 knowledgeBaseToolsImage 是否存在並有內容
                    if (knowledgeInfo.knowledgeBaseToolsImageObj) {
                      return knowledgeInfo?.knowledgeBaseToolsImageObj.map(
                        (item, idx) => (
                          <div
                            style={{
                              width: '140px',
                              height: '200px',
                              position: 'relative',
                            }}
                          >
                            <img
                              key={idx}
                              src={item.img}
                              style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '8px',
                                border: '1px solid #c0c0c0',
                                objectFit: 'contain', // 確保圖片覆蓋整個容器並適當裁切
                              }}
                              alt="Your images Description"
                            />
                            <span
                              style={{
                                border: '1px solid red',
                                padding: '0px 6px',
                                borderRadius: '8px',
                                position: 'absolute',
                                top: '1px',
                                right: '1px',
                                backgroundColor: 'white',
                              }}
                            >
                              {['A', 'B', 'C', 'D', 'E', 'F'][idx]}
                            </span>
                          </div>
                        )
                      );
                    } else {
                      // 如果沒有圖片數據，可以顯示預設文字或者不顯示此區塊
                      return <div>No images available</div>;
                    }
                  })()}
                </div>
                <div className="flex flex-col gap-[6px]">
                  {(() => {
                    // 檢查 knowledgeBaseToolsImageNames 是否存在並有內容
                    if (knowledgeInfo.knowledgeBaseToolsImageObj) {
                      return knowledgeInfo?.knowledgeBaseToolsImageObj.map(
                        (item, idx) => (
                          <div
                            className="flex gap-[4px] items-center"
                            style={{
                              minWidth: '20vw', // 增加最小寬度
                              wordWrap: 'break-word', // 允許在達到邊緣時換行
                            }}
                          >
                            <span className="text-red-600 text-[20px]">
                              {['A', 'B', 'C', 'D', 'E', 'F'][idx]}
                              {': '}
                            </span>
                            <span>{item.name}</span>
                          </div>
                        )
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className={styles['tools']} id="tools">
            <div className="w-full">
              <div className={styles['tools-label']}>
                <label>Illustration(維修部位說明) :</label>
              </div>
              <div
                className="w-full flex justify-between py-2 px-6"
                style={{ minWidth: '60vw' }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-start',
                    gap: '8px',
                  }}
                >
                  {(() => {
                    if (knowledgeInfo.knowledgeBasePositionImageObj) {
                      return knowledgeInfo?.knowledgeBasePositionImageObj.map(
                        (item, idx) => (
                          <div
                            style={{
                              width: '220px',
                              height: '220px',
                              position: 'relative',
                            }}
                          >
                            <img
                              key={idx}
                              src={item.img}
                              style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '8px',
                                border: '1px solid #c0c0c0',
                                objectFit: 'contain', // 使圖片保持比例且完全顯示
                              }}
                              alt="Your images Description"
                            />
                            <span
                              style={{
                                border: '1px solid red',
                                padding: '0px 6px',
                                borderRadius: '8px',
                                position: 'absolute',
                                top: '1px',
                                right: '2px',
                                backgroundColor: 'white',
                              }}
                            >
                              {['A', 'B', 'C', 'D', 'E', 'F'][idx]}
                            </span>
                          </div>
                        )
                      );
                    }
                  })()}
                </div>
                <div
                  className="flex flex-col gap-[6px]"
                  style={{ marginLeft: '2vw' }}
                >
                  {(() => {
                    if (knowledgeInfo.knowledgeBasePositionImageObj) {
                      return knowledgeInfo?.knowledgeBasePositionImageObj.map(
                        (item, idx) => (
                          <div
                            className="flex gap-[4px] items-center"
                            style={{ minWidth: '15vw' }}
                          >
                            <span className="text-red-600 text-[20px]">
                              {['A', 'B', 'C', 'D', 'E', 'F'][idx]}
                              {': '}
                            </span>
                            <span>{item.name}</span>
                          </div>
                        )
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {paginatedSOPData.map((pageSteps, pageIndex) => (
          <>
            <div>
              <p></p>
              <br />
            </div>
            <div className={styles['page-outline']} key={pageIndex}>
              <div className={styles['file-title']} id="file-title">
                <div className={styles['page']}>
                  <h1>Trouble Shooting</h1>
                  <div className={styles['preview-content']}>
                    <div className={styles['info-box']}>
                      <p style={{ textAlign: 'left' }}>
                        File No : {knowledgeInfo.knowledgeBaseFileNo || ''}
                        <br />
                        Error Code :{' '}
                        {knowledgeInfo.knowledgeBaseAlarmCode || ''}
                      </p>
                    </div>
                  </div>
                  <img
                    className={styles['logo-img']}
                    style={{ border: '1px solid #a0a0a0', borderRadius: '8px' }}
                    src={require('../Company Logo.jpg')}
                    alt="LOGO"
                  />
                </div>
                <label className={styles['sop-section']}>
                  <p>SOP名稱: {knowledgeInfo.knowledgeBaseSOPName || ''}</p>
                </label>
              </div>
              {pageSteps.map((sop, idx) => (
                <div
                  key={idx}
                  className={styles['step1']}
                  style={idx !== 0 ? { borderTop: '1px solid' } : {}}
                >
                  <div className={styles['step-title1']}>
                    <span>Step {sop?.soP2Step || idx + 1}</span>
                  </div>
                  <div className={styles['step-content']}>
                    <div
                      className={classNames(
                        styles['content-section'],
                        styles['image-container']
                      )}
                      style={{ maxWidth: '25vw', wordWrap: 'break-word' }}
                    >
                      {sop.soP2ImageObj ? (
                        <img
                          src={URL.createObjectURL(sop.soP2ImageObj)}
                          style={{
                            width: '250px', // 直接在 style 中設定寬度
                            height: '250px', // 直接在 style 中設定高度
                            objectFit: 'contain', // 保持圖片原始比例並填滿容器
                            borderRadius: '8px', // 如果需要圓角
                            border: '1px solid #c0c0c0', // 只有當圖片存在時顯示邊框
                          }}
                          alt="Your images Description"
                        />
                      ) : null}
                    </div>
                    <div className={styles['content-section']}>
                      <p>Illustration(步驟說明)：</p>
                      <div
                        className={styles['step-content-box']}
                        style={{ maxWidth: '25vw', wordWrap: 'break-word' }}
                      >
                        {/* {sop?.soP2Message || ''} */}
                        {formatSteps(sop?.soP2Message || '').map(
                          (step, index) => (
                            <p key={index}>{step}</p>
                          )
                        )}
                      </div>
                    </div>
                    <div className={styles['content-section']}>
                      <p>Remark(備註補充)：</p>
                      <div
                        className={styles['step-content-box']}
                        style={{ maxWidth: '25vw', wordWrap: 'break-word' }}
                      >
                        {sop?.soP2Remark && (
                          <>
                            {/* {sop.soP2Remark} */}
                            {formatSteps(sop.soP2Remark).map(
                              (remark, index) => (
                                <p key={index}>
                                  {remark}
                                  <br />
                                </p> // 備註部分也應用格式化並保留原有的換行
                              )
                            )}
                            <br />
                          </>
                        )}
                        {sop?.soP2RemarkImageObj ? (
                          <img
                            src={URL.createObjectURL(sop.soP2RemarkImageObj)}
                            className={`w-[170px] h-[170px]`}
                            style={{
                              objectFit: 'contain', // 保持圖片原始比例並填滿容器
                              borderRadius: '8px', // 如果需要圓角
                              border: '1px solid #c0c0c0', // 只有當圖片存在時顯示邊框
                            }}
                            alt="Your images Description"
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ))}
      </div>
    );
  }
);

export default PreviewPDFContent;
