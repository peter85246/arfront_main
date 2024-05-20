import classNames from "classnames";
import styles from "../scss/global.module.scss";
import { useTranslation } from "react-i18next"; //語系
import { Link } from "react-router-dom";
import PdfContent from "../components/PDFContent";

export default function Database() {
  return (
    <>
      <main>
        <h2>資料庫</h2>
        <div className={styles["back-page"]}>
          <Link to="/knowledge" className={"fas fa-angle-left"}>
            {" "}
            知識庫
          </Link>
        </div>
        <div className={styles["buttons-container"]}>
          <a
            className={classNames(styles["button"], styles["btn-edit"])}
            id="openModalBtn"
            type="button"
            href="/document-editor"
          >
            編輯
          </a>
          <a
            href="/knowledge"
            className={classNames(styles["button"], styles["btn-delete"])}
          >
            刪除
          </a>
          <a
            href="/repairDocument"
            className={classNames(styles["button"], styles["btn-pdf"])}
          >
            PDF
          </a>
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
                  <tr className={styles["row-database"]}>
                    <td>#</td>
                    <td>#</td>
                    <td>#</td>
                    <td>#</td>
                    <td>#</td>
                  </tr>
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
