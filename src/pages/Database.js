import classNames from "classnames";
import styles from "../scss/global.module.scss";
import { useTranslation } from "react-i18next"; //語系
import { Link, useNavigate } from "react-router-dom";
import PdfContent from "../components/PDFContent";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useDatabase } from "../components/useDatabse";
import { apiSaveKnowledgeBase, apiSaveSOP2 } from "../utils/Api";
import {
  apiGetAllKnowledgeBaseByMachineAddId,
  apiGetAllSOPByMachineAddId,
} from "../utils/Api";
import { useEffect, useState } from "react";
import { useStore } from "../zustand/store";

export default function Database() {
  const location = useLocation();
  const item = location.state?.item; // 訪問傳遞的狀態

  const { t } = useTranslation();
  const { setSOPInfo } = useStore();
  const navigate = useNavigate(); // 使用 navigate 來處理導航

  const [knowledgeInfo, setKnowledgeInfo] = useState([]);
  const [SOPData, setSOPData] = useState([]);

  const handleEdit = () => {
    setSOPInfo({
      machineAddId: item.machineAddId,
      machineInfo: {
        machineName: knowledgeInfo.machineName,
      },
      knowledgeInfo: knowledgeInfo,
      sops: SOPData,
    });
    navigate("/document-editor");
  };

  const handleDelete = async () => {
    try {
      if (SOPData.length) {
        await apiSaveSOP2({
          machineAddId: item.machineAddId,
          knowledgeBaseId: item.knowledgeBaseId,
          deleted: 1,
        });
      }
      
      const res = await apiSaveKnowledgeBase({
        machineAddId: item.machineAddId,
        KnowledgeBases: [
          {
            knowledgeBaseId: item.knowledgeBaseId,
            deleted: 1,
          },
        ],
      });

      if (res?.message === "完全成功") {
        toast.success('保存成功', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
        });
        setTimeout(() => { window.location.href = "/knowledge"}, 1000);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const machineAddId = item?.machineAddId;
    const knowledgeBaseId = item?.knowledgeBaseId;

    const getKnowledgeInfo = async () => {
      const res = await apiGetAllKnowledgeBaseByMachineAddId({
        Id: machineAddId,
      });
      if (res?.message === "完全成功") {
        const knowledgeInfo = res.result.filter(
          (item) => item.knowledgeBaseId === knowledgeBaseId,
        )[0];
        setKnowledgeInfo(knowledgeInfo);
      }
    };
    getKnowledgeInfo();

    const getSOPInfo = async () => {
      const res = await apiGetAllSOPByMachineAddId({ Id: machineAddId });
      if (res?.message === "完全成功") {
        console.log('res.result', res.result)
        const sop = res.result.filter(
          (item) => item.knowledgeBaseId === knowledgeBaseId,
        );
        setSOPData(sop);
      }
    };
    getSOPInfo();
  }, []);

  return (
    <>
      <main>
        <section className="content-header" style={{ marginBottom: "10px" }}>
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
              <div></div>
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
          <div
            type="button"
            className={classNames(styles["button"], styles["btn-edit"])}
            onClick={handleEdit}
          >
            編輯
          </div>
          <div
            className={classNames(styles["button"], styles["btn-delete"])}
            onClick={handleDelete}
          >
            刪除
          </div>
          <div
            className={classNames(styles["button"], styles["btn-pdf"])}
            onClick={() => navigate("/repairDocument", { state: { item } })}
          >
            PDF
          </div>
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
              <PdfContent knowledgeInfo={knowledgeInfo} SOPData={SOPData} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
