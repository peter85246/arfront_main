import React from "react";
import styles from "../scss/global.module.scss";
import classNames from "classnames";

const PdfContent = React.forwardRef((props, ref) => {
  return (
    <div className={styles["content-box"]}>
      {/* PDF內容放在這裡 */}
      <div className={styles["content-box-middle"]}>
        <div ref={ref} className={styles["page-outline-bigPreview"]}>
          <div className={styles["file-title"]} id="file-title">
            <div className={styles["page"]}>
              <h1>Trouble Shooting</h1>
              <div className={styles["preview-content"]}>
                <div className={styles["info-box"]}>
                  <p>File No : TS31103</p>
                  <p>Error Code : 0000</p>
                </div>
                <img
                  className={styles["logo-img"]}
                  src={require("../public/圖片TS31103/LOGO.jpg")}
                  alt="LOGO"
                />
              </div>
            </div>
            <label className={styles["sop-section"]}>
              SOP名稱 : Adjustment of Backlash for GXA-S series GXA-S背隙調整
            </label>
          </div>

          <div className={styles["model"]} id="model">
            <div>
              <label>
                For Model 機型 : GXA-S GXA-H GVA GFA-S GFA-H GTF GTFAE Series
              </label>
              <div className={styles["image-container-page"]}>
                <img
                  src={require("../public/圖片TS31103/For Model.jpg")}
                  alt="Machine images"
                />
              </div>
            </div>
          </div>

          <div className={styles["tools"]} id="tools">
            <div>
              <label>Use Tools(使用工具圖片) :</label>
              <div className={styles["image-container-page"]}>
                <img
                  src={require("../public/圖片TS31103/Tool.jpg")}
                  alt="Tool 1"
                />
              </div>
            </div>
            <div className={styles["list-container"]}>
              <ul className={styles["tools-list"]}>
                <li>A. Flat Screwdriver (平口螺絲起子)</li>
                <li>B. T-Wrench (T型板手)</li>
                <li>C. Dial indicator (千分錶)</li>
                <li>D. Jig-T-slot wrench (T溝板手-治具)</li>
                <li>E. Tensiometer (推拉力計)</li>
              </ul>
            </div>
          </div>

          <div className={styles["illustration"]} id="illustration">
            <div>
              <label>Illustration(維修部位說明) :</label>
              <div className={styles["image-container-page"]}>
                <img
                  src={require("../public/圖片TS31103/illustration.jpg")}
                  alt="illustration-photos 1"
                />
              </div>
            </div>
            <div className={styles["list-container"]}>
              <ul className={styles["illustration-list"]}>
                <li>Parts (零件)：</li>
                <li>1. Plug (塞蓋)</li>
                <li>2. Coupling (聯軸器)</li>
                <li>3. Cover (封軸蓋)</li>
                <li>4. Sleeve of Worm Shaft (調整測套管)</li>
              </ul>
            </div>
          </div>
        </div>
        <p></p>
        <br />

        <div className={styles["page-outline-bigPreview"]}>
          <div className={styles["file-title"]} id="file-title">
            <div className={styles["page2"]}>
              <h1>Trouble Shooting</h1>
              <div className={styles["preview-content"]}>
                <div className={styles["info-box2"]}>
                  <p>File No : TS31103</p>
                  <p>Error Code : 0000</p>
                </div>
                <img
                  className={styles["logo-img"]}
                  src={require("../public/圖片TS31103/LOGO.jpg")}
                  alt="LOGO"
                />
              </div>
              <label className={styles["sop-section2"]}>
                SOP名稱 : Adjustment of Backlash for GXA-S series GXA-S背隙調整
              </label>
            </div>
          </div>

          <div className={styles["step1"]} id="step1">
            <div className={styles["step-title1"]}>
              <span>Step 1</span>
            </div>
            <div className={styles["step-content"]}>
              <div
                className={classNames(
                  styles["content-section"],
                  styles["image-container"],
                )}
              >
                <img
                  src={require("../public/圖片TS31103/Step1-photo.jpg")}
                  alt="Your images Description"
                />
              </div>
              <div className={styles["content-section"]}>
                <p>Illustration(步驟說明)：</p>
                <div className={styles["step-content-box"]}>
                  Remove part 1. by tool A<br />
                  <p>使用平口螺絲起子移除塞蓋</p>
                </div>
              </div>
              <div className={styles["content-section"]}>
                <p>Remark(備註補充)：</p>
                <div className={styles["step-content-box"]}>
                  (Tool A)
                  <br />
                  <img
                    src={require("../public/圖片TS31103/Tool A.jpg")}
                    alt="Your images Description"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles["step2"]} id="step2">
            <div className={styles["step-title2"]}>
              <span>Step 2</span>
            </div>
            <div className={styles["step-content"]}>
              <div
                className={classNames(
                  styles["content-section"],
                  styles["image-container"],
                )}
              >
                <img
                  src={require("../public/圖片TS31103/Step2-photo.jpg")}
                  alt="Your images Description"
                />
              </div>
              <div className={styles["content-section"]}>
                <p>Illustration(步驟說明)：</p>
                <div className={styles["step-content-box"]}>
                  Rotate motor until tool B(4mm) can reach M5 screws on part 2.
                  loose the screws. At remark 2. SKT.HD.CAP.SCR.
                  <br />
                  <p></p>
                  轉動馬達至可將T型板手4mm套入聯軸器上的M5螺絲2.後，將螺絲放鬆。
                </div>
              </div>
              <div className={styles["content-section"]}>
                <p>Remark(備註補充)：</p>
                <div className={styles["step-content-box"]}>
                  (Tool B)
                  <br />
                  <img
                    src={require("../public/圖片TS31103/Tool B.jpg")}
                    alt="Your images Description"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles["step3"]} id="step3">
            <div className={styles["step-title3"]}>
              <span>Step 3</span>
            </div>
            <div className={styles["step-content"]}>
              <div
                className={classNames(
                  styles["content-section"],
                  styles["image-container"],
                )}
              >
                <img
                  src={require("../public/圖片TS31103/Step3-photo.jpg")}
                  alt="Your images Description"
                />
              </div>
              <div className={styles["content-section"]}>
                <p>Illustration(步驟說明)：</p>
                <div className={styles["step-content-box"]}>
                  Remove Flat.HD.SKT.SKR *4pcs by tool B(2.5mm). Remove part 3.
                  <br />
                  <p></p>
                  使用T型板手2.5mm拆開皿型螺絲 4只，將軸封蓋取 下。
                </div>
              </div>
              <div className={styles["content-section"]}>
                <p>Remark(備註補充)：</p>
                <div className={styles["step-content-box"]}>
                  (Tool B)
                  <br />
                  <img
                    src={require("../public/圖片TS31103/Tool B-2.jpg")}
                    alt="Your images Description"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles["step4"]} id="step4">
            <div className={styles["step-title4"]}>
              <span>Step 4</span>
            </div>
            <div className={styles["step-content"]}>
              <div
                className={classNames(
                  styles["content-section"],
                  styles["image-container"],
                )}
              >
                <img
                  src={require("../public/圖片TS31103/Step4-photo.jpg")}
                  alt="Your images Description"
                />
              </div>
              <div
                className={styles["content-section"]}
                id="illustrationContent"
              >
                <p>Illustration(步驟說明)：</p>
                <div className={styles["step-content-box"]}>
                  Loose SKT.HD.CAP.SCR *2pcs by tool B(3mm).
                  <br />
                  <p></p>
                  使用T型板手3mm放鬆內六角螺絲M4螺絲 2只。
                </div>
              </div>
              <div className={styles["content-section"]} id="remarksContent">
                <p>Remark(備註補充)：</p>
                <div className={styles["step-content-box"]}>
                  (Tool B)
                  <br />
                  <img
                    src={require("../public/圖片TS31103/Tool B-2.jpg")}
                    alt="Your images Description"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PdfContent;
