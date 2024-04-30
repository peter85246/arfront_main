import { useCallback, useState } from "react";
import classNames from "classnames";
import styles from "../scss/global.module.scss";
import { MindMap } from "../components/MindMap";
import { Link } from "react-router-dom";

export default function Alarm() {
  const [alarmValue, setAlarmValue] = useState("待新增");
  const [dropMenuOpen, setDropMenuOpen] = useState(false);

  return (
    <main>
      <h2 id="title-alarm">故障庫</h2>
      <div>
        <div className={styles["buttons-container-item"]}>
          <div className={styles["buttons-alarm"]}>
            <a
              href="#"
              className={classNames(styles["button"], styles["btn-new"])}
              style={{ color: alarmValue === "待新增" ? "#8F8F8F" : "#266DF7" }}
            >
              {alarmValue}
            </a>
            <span
              className={styles["drop-down-arrow-alarm"]}
              onClick={() => setDropMenuOpen((prev) => !prev)}
            >
              ▼
            </span>
            {dropMenuOpen && (
              <ul className={styles["custom-datalist-alarm"]}>
                <li
                  onClick={() =>
                    setAlarmValue(
                      "GXA-S GXA-H GVA GFA-S GFA-H GTF GTFAE Series",
                    )
                  }
                >
                  GXA-S GXA-H GVA GFA-S GFA-H GTF GTFAE Series
                </li>
                <li
                  onClick={() =>
                    setAlarmValue(
                      "GXA-S GXA-H GVA GFA-S GFA-H GTF GTFAE Series",
                    )
                  }
                >
                  GXA-S GXA-H GVA GFA-S GFA-H GTF GTFAE Series
                </li>
              </ul>
            )}
          </div>
          {/* <!-- <span id="addMachineBtn" className={styles["alarm-add-machine">&#43;</span> --> */}
        </div>
      </div>

      <div
        className={styles["content-box"]}
        style={{ paddingTop: 0, gap: "5px" }}
      >
        {/* <!-- 編輯按鈕容器 --> */}
        <div className={styles["edit-container"]}>
          <button className={styles["edit-button"]}>編輯</button>
        </div>
        <div className={styles["content-box-left-alarm"]}>
          {/* <!-- 標題 --> */}
          <div className={styles["title-bar"]}>
            <h3 style={{ padding: "0", marginTop: "20px" }}>機台種類型號</h3>
          </div>
          {/* <!-- 列表開始 --> */}
          <div className={styles["menu"]}>
            {/* <!-- 項目 --> */}
            <div className={styles["menu-item-alarm"]}>
              <div
                className={styles["collapsible"]}
                onclick="toggleContent(event, this)"
              >
                {/* <span className={styles["arrow"]}>{">"}</span> */}
              </div>
              <div className={styles["content-alarm"]}>
                {/* <!-- 子項目 --> */}
                <div className={styles["sub-menu-item"]}>
                  <div
                    className={styles["collapsible"]}
                    onclick="toggleContent(event, this)"
                  >
                    {/* <span className={styles["arrow"]}>{">"}</span> */}
                  </div>
                  <div className={styles["content-alarm"]}>
                    {/* <div className={styles["final-item"]}>
                      <span className={styles["dot"]}></span>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <!-- 列表結束 --> */}
        </div>
        {/* <!--右側欄位內容--> */}
        <div className={styles["content-box-right-alarm"]} id="alarm-mindMap">
          <Link to="/pageMindMap">
            <p className={styles["mark-text"]}>▶ 點擊即可展開心智圖</p>
            {/* <!-- 內容待添加 --> */}
            <div className={styles["mindmap"]}>
              {/* <div className={styles["node central-node"]} id="central-node"> */}
              {/* <!-- <div className={styles["add-btn left">+</div> --> */}
              {/* <span>心智圖</span> */}
              {/* <!-- <div className={styles["add-btn right">+</div> --> */}
              {/* </div> */}
              <MindMap />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
