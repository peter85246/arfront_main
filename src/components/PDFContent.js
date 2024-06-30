import React, { useState, useEffect, forwardRef } from "react";
import styles from "../scss/PDFDesign.module.scss";
import classNames from "classnames";
import { useLocation } from "react-router-dom";

const PDFContent = React.forwardRef(({ knowledgeInfo, SOPData }, ref) => {
  console.log("knowledgeInfo", knowledgeInfo);
  console.log("SOPData", SOPData);
  const location = useLocation();
  const item = location.state?.item; // 訪問傳遞的狀態

  return (
    <div className={styles["content-box"]} ref={ref}>
      {/* PDF內容放在這裡 */}
      <div className={styles["page-outline"]}>
        <div className={styles["file-title"]} id="file-title">
          <div className={styles["page"]}>
            <h1>Trouble Shooting</h1>
            <div className={styles["preview-content"]}>
              <div className={styles["info-box"]}>
                {item ? (
                  <p style={{ textAlign: "left" }}>
                    File No : {item.knowledgeBaseFileNo}
                    <br></br>
                    Error Code : {item.knowledgeBaseAlarmCode}
                  </p>
                ) : (
                  <p style={{ textAlign: "left" }}>
                    File No : 12345<br></br>
                    Error Code : 00000
                  </p>
                )}
              </div>
            </div>
            <img
              className={styles["logo-img"]}
              src={require("../public/圖片TS31103/LOGO.jpg")}
              alt="LOGO"
            />
          </div>
          <label className={styles["sop-section"]}>
            SOP名稱 : Adjustment of Backlash for GXA-S series GXA-S背隙調整
          </label>
        </div>

        <div className={styles["model-label"]}>
          <label>
            For Model 機型 : GXA-S GXA-H GVA GFA-S GFA-H GTF GTFAE Series
          </label>
        </div>
        <div className={styles["model"]} id="model">
          <div>
            <div className={styles["image-container-page-model"]}>
              <img
                src={require("../public/圖片TS31103/For Model.jpg")}
                alt="Machine images"
              />
            </div>
          </div>
        </div>

        <div className={styles["tools"]} id="tools">
          <div>
            <div className={styles["tools-label"]}>
              <label>Use Tools(使用工具圖片) :</label>
            </div>
            <div className={styles["image-container-page"]}></div>
          </div>
        </div>

        <div className={styles["illustration"]} id="illustration">
          <div>
            <div className={styles["illustration-label"]}>
              <label>Illustration(維修部位說明) :</label>
            </div>
            <div className={styles["image-container-page"]}></div>
          </div>
        </div>
      </div>
      <p></p>
      <br />

      {SOPData?.length > 0 && (
        <div className={styles["page-outline"]}>
          <div className={styles["file-title"]} id="file-title">
            <div className={styles["page"]}>
              <h1>Trouble Shooting</h1>
              <div className={styles["preview-content"]}>
                <div className={styles["info-box"]}>
                  {item ? (
                    <p style={{ textAlign: "left" }}>
                      File No : {item.knowledgeBaseFileNo}
                      <br></br>
                      Error Code : {item.knowledgeBaseAlarmCode}
                    </p>
                  ) : (
                    <p style={{ textAlign: "left" }}>
                      File No : 12345<br></br>
                      Error Code : 00000
                    </p>
                  )}
                </div>
              </div>
              <img
                className={styles["logo-img"]}
                src={require("../public/圖片TS31103/LOGO.jpg")}
                alt="LOGO"
              />
            </div>
            <label className={styles["sop-section"]}>
              SOP名稱 : Adjustment of Backlash for GXA-S series GXA-S背隙調整
            </label>
          </div>
          {SOPData.map((sop, idx) => (
            <div className={styles["step1"]} id="step1">
              <div className={styles["step-title1"]}>
                <span>Step {sop.soP2Step}</span>
              </div>
              <div className={styles["step-content"]}>
                <div
                  className={classNames(
                    styles["content-section"],
                    styles["image-container"]
                  )}
                >
                  <img
                    src={sop.soP2Image}
                    className="w-[200px] h-[200px]"
                    alt="Your images Description"
                  />
                </div>
                <div className={styles["content-section"]}>
                  <p>Illustration(步驟說明)：</p>
                  <div className={styles["step-content-box"]}>
                    {sop.soP2Message}
                  </div>
                </div>
                <div className={styles["content-section"]}>
                  <p>Remark(備註補充)：</p>
                  <div className={styles["step-content-box"]}>
                    (Tool A)
                    <br />
                    <img
                      src={sop.soP2RemarkImage}
                      className="w-[200px] h-[200px]"
                      alt="Your images Description"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default PDFContent;
