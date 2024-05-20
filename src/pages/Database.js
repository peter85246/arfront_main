import classNames from "classnames";
import styles from "../scss/global.module.scss";
import { useTranslation } from "react-i18next"; //語系
import { Link } from "react-router-dom";
import PdfContent from "../components/PDFContent";
import { useLocation } from 'react-router-dom';
import { useDatabase } from '../components/useDatabse';


export default function Database() {
  const location = useLocation();
  const item = location.state?.item; // 訪問傳遞的狀態
  const { t } = useTranslation();
  
  return (
    <>
      <main>
      <section className="content-header" style={{marginBottom:'10px'}}>
        <div className="container-fluid">
          <div className="row mb-2 justify-content-between">
            <div />
            <div className="content-header-text-color">
              <h1>
                <strong>
                  {t("database.content.header")}
                  {/*資料庫*/}
                </strong>
              </h1>
            </div>
            <div>
            </div>
          </div>
        </div>
      </section>
        <div className={styles["back-page"]}>
          <Link to="/knowledge" className={"fas fa-angle-left"}>
            {" "}
            知識庫
          </Link>
        </div>
        <div className={styles["buttons-container"]}>
        <Link to="/document-editor" className={classNames(styles["button"], styles["btn-edit"])} type="button">
  編輯
</Link>
<Link to="/knowledge" className={classNames(styles["button"], styles["btn-delete"])}>
  刪除
</Link>
<Link to="/repairDocument" className={classNames(styles["button"], styles["btn-pdf"])}>
  PDF
</Link>
        </div>

        {/* <!--中間欄位內容--> */}
        <div className={styles["content-box"]}>
          <div className={styles["content-box-middle"]}>
            <div className={styles["content-wrapper-database"]}>
              <p className={styles["mark-text"]}>▶ 查詢資訊結果</p>
              <table>
                <thead>
                  <tr className={styles["row-title-database"]}>
                    <th>編號</th>
                    <th>設備種類</th>
                    <th>設備部件</th>
                    <th>維修項目</th>
                    <th>維修類型</th>
                  </tr>
                </thead>
                <tbody>
                {item ? (
                  <tr className={styles["row-database"]}>
                    <td>{item.knowledgeBaseId}</td>
                    <td>{item.knowledgeBaseDeviceType}</td>
                    <td>{item.knowledgeBaseDeviceParts}</td>
                    <td>{item.knowledgeBaseRepairItems}</td>
                    <td>{item.knowledgeBaseRepairType}</td>
                  </tr>
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center" }}>
                        查無資料
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <p></p>
              <div className={styles["mark-note"]}>
                {/* <!-- 調整文字位置 --> */}
                <p className={styles["mark-text"]}>
                  ▶ 點擊項目說明欄位即可進行編輯
                </p>
                {/* <!-- 新增放大按鈕 --> */}
                <a
                  href="repairDocument"
                  className={styles["btn-enlarge"]}
                  type="button"
                >
                  點擊放大預覽
                </a>
              </div>
              <PdfContent />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
