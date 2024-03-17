import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; //語系
import classNames from "classnames";
import styles from "../scss/global.module.scss";
import stylesAlarm from "../scss/Alarm.module.scss";
import { MindMap } from "../components/MindMap";
import { Link } from "react-router-dom";

export default function PageMindMap() {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className={stylesAlarm.content}>
      <div className={stylesAlarm.buttonsContainerMindMap}>
        {/* <button type="button" id="btn-save-js" className={styles.btnSave}>儲存</button> */}
        <Link
          to="/alarm"
          className={classNames(styles.button, stylesAlarm.btnCancelMindMap)}
        >
          刪除
        </Link>
        <Link
          to="/document-editor"
          className={classNames(styles.button, stylesAlarm.btnEditMindMap)}
        >
          編輯
        </Link>
        {/* 設定編輯按鈕權限，只有權限夠高的管理員才能導向"故障說明"，否則跳出alert提示"權限不足無法編輯" */}
      </div>
      <div className={styles.backPage}>
        <Link to="/alarm" className={"fas fa-angle-left"}>
          {" "}
          故障庫
        </Link>
      </div>
      <main>
        <h2>
          <strong>{t("系列")}</strong>
        </h2>

        <div className={stylesAlarm.contentBoxAlarm}>
          <div className={stylesAlarm.contentBoxMindMap}>
            <div className={styles["mindmap"]}>
              <MindMap />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
