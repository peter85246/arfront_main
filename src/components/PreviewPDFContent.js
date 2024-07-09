import React, { useState, useEffect, forwardRef } from 'react';
import styles from '../scss/PDFDesign.module.scss';
import classNames from 'classnames';
import { useLocation } from 'react-router-dom';

const PreviewPDFContent = React.forwardRef(
  ({ knowledgeInfo, SOPData }, ref) => {
    console.log('knowledgeInfo', knowledgeInfo);
    console.log('SOPData', SOPData);
    const location = useLocation();
    const item = location.state?.item; // 訪問傳遞的狀態

    // const [based64SOP, setBased64SOP] = useState(SOPData || []);

    const stepsPerPage = 4;

    // 创建分页数据
    const paginatedSOPData = [];
    for (let i = 0; i < SOPData?.length; i += stepsPerPage) {
      paginatedSOPData.push(SOPData.slice(i, i + stepsPerPage));
    }

    // SOPData 是一個包含多個 SOP 相關數據的陣列
    // 顯示第一個 SOP 的名稱，確保數據已正確加載
    const sopName =
      SOPData?.length > 0 ? SOPData[0].soP2Name : 'Default SOP Name';

    function safeJsonParse(str) {
      try {
        return JSON.parse(str);
      } catch (e) {
        return [];
      }
    }

    useEffect(() => {
      console.log('Received knowledgeInfo:', knowledgeInfo);
      console.log('Received SOPData:', SOPData);
    }, [knowledgeInfo, SOPData]);

    // useEffect(() => {
    //   SOPData.map((item, idx) => {
    //     const reader1 = new FileReader();
    //     const reader2 = new FileReader();
    //     reader1.readAsDataURL(item.soP2ImageObj);
    //     reader1.onload = () => {
    //       setBased64SOP((prev) => [...prev, reader1.result]);
    //     };
    //     reader2.readAsDataURL(item.soP2RemarkImageObj);
    //     reader2.onload = () => {
    //       setBased64SOP((prev) => [...prev, reader2.result]);
    //     };

    //   })
    // }, [])

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
                    File No : {knowledgeInfo.knowledgeBaseFileNo}
                    <br></br>
                    Error Code : {knowledgeInfo.knowledgeBaseAlarmCode}
                  </p>
                </div>
              </div>
              <img
                className={styles['logo-img']}
                style={{ border: '1px solid #a0a0a0', borderRadius: '8px' }}
                src={require('../public/圖片TS31103/LOGO.jpg')}
                alt="LOGO"
              />
            </div>
            <label className={styles['sop-section']}>
              SOP名稱: {knowledgeInfo.knowledgeBaseSOPName}
            </label>
          </div>

          <div className={styles['model-label']}>
            <label>
              For Model 機型 :{' '}
              {Array.isArray(
                safeJsonParse(knowledgeInfo.knowledgeBaseModelImageNames)
              )
                ? safeJsonParse(
                    knowledgeInfo.knowledgeBaseModelImageNames
                  ).join(', ')
                : knowledgeInfo.knowledgeBaseModelImageNames}
            </label>
          </div>
          <div className={styles['model']} id="model">
            <div>
              {/* <div className={styles["image-container-page-model"]}>
              <img
                src={require("../public/圖片TS31103/For Model.jpg")}
                alt="Machine images"
              />
            </div> */}
              <div className="w-full flex justify-between py-2 px-6">
                <div className="flex gap-[8px] items-center">
                  {(() => {
                    if (knowledgeInfo.knowledgeBaseModelImageObj) {
                      return knowledgeInfo?.knowledgeBaseModelImageObj.map(
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
                        File No : {knowledgeInfo.knowledgeBaseFileNo}
                        <br></br>
                        Error Code : {knowledgeInfo.knowledgeBaseAlarmCode}
                      </p>
                    </div>
                  </div>
                  <img
                    className={styles['logo-img']}
                    style={{ border: '1px solid #a0a0a0', borderRadius: '8px' }}
                    src={require('../public/圖片TS31103/LOGO.jpg')}
                    alt="LOGO"
                  />
                </div>
                <label className={styles['sop-section']}>
                  SOP名稱: {knowledgeInfo.knowledgeBaseSOPName}
                </label>
              </div>
              {pageSteps.map((sop, idx) => (
                <div
                  key={idx}
                  className={styles['step1']}
                  style={idx !== 0 ? { borderTop: '1px solid' } : {}}
                >
                  <div className={styles['step-title1']}>
                    <span>Step {sop.soP2Step}</span>
                  </div>
                  <div className={styles['step-content']}>
                    <div
                      className={classNames(
                        styles['content-section'],
                        styles['image-container']
                      )}
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
                      <div className={styles['step-content-box']}>
                        {sop.soP2Message}
                      </div>
                    </div>
                    <div className={styles['content-section']}>
                      <p>Remark(備註補充)：</p>
                      <div
                        className={styles['step-content-box']}
                        style={{ maxWidth: '300px', wordWrap: 'break-word' }}
                      >
                        {sop.soP2Remark && (
                          <>
                            {sop.soP2Remark}
                            <br />
                          </>
                        )}
                        {sop.soP2RemarkImageObj ? (
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