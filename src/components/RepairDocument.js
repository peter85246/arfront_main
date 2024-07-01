import classNames from "classnames";
import styles from "../scss/global.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from "jspdf";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import PdfContent from "./PDFContent";
import { useTranslation } from "react-i18next"; //語系
<<<<<<< HEAD
import {
  apiGetAllKnowledgeBaseByMachineAddId,
  apiGetAllSOPByMachineAddId,
} from "../utils/Api";
=======
import { apiGetAllKnowledgeBaseByMachineAddId, apiGetAllSOPByMachineAddId } from "../utils/Api";
>>>>>>> 45944680588431b3e71825cd3cbddf5ad78dd61f

// React PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

export function RepairDocument() {
  const location = useLocation();
  const item = location.state?.item; // 訪問傳遞的狀態

  const [knowledgeInfo, setKnowledgeInfo] = useState([]);
  const [SOPData, setSOPData] = useState([]);
  const navigate = useNavigate(); // 使用 navigate 來處理導航
  console.log("item", item);

  const pdfRef = React.useRef();
  const [isPrinting, setIsPrinting] = useState(false);
  const { t } = useTranslation();

  const handlePrint = useReactToPrint({
    content: () => pdfRef.current,
    onBeforePrint: () => setIsPrinting(true),
    onAfterPrint: () => {
      setIsPrinting(false);
      // savePdf();  // 確保在列印完成後保存 PDF 文件
    },
  });

  const savePdf = () => {
    const pdf = new jsPDF();
    pdf.html(pdfRef.current, {
      callback: function (doc) {
        doc.save("德川維修手冊.pdf");
      },
      // Adjust these options as needed to improve formatting
      x: 10,
      y: 10,
      width: 180,
    });
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
<<<<<<< HEAD
        console.log("res.result", res.result);
=======
        console.log('res.result', res.result)
>>>>>>> 45944680588431b3e71825cd3cbddf5ad78dd61f
        const sop = res.result.filter(
          (item) => item.knowledgeBaseId === knowledgeBaseId,
        );
        setSOPData(sop);
      }
    };
    getSOPInfo();
  }, []);

  return (
    <main>
      <section className="content-header" style={{ marginBottom: "10px" }}>
        <div className="container-fluid">
          <div className="row mb-2 justify-content-between">
            <div />
            <div className="content-header-text-color">
              <h1>
                <strong>
                  {t("repairDocument.content.header")}
                  {/*維修說明檔案*/}
                </strong>
              </h1>
            </div>
            <div></div>
          </div>
        </div>
      </section>
      <div className={styles["buttons-container"]}>
        <button
          onClick={handlePrint}
          className={classNames(styles["button"], styles["btn-pdf"])}
        >
          印出
        </button>
      </div>
      <div className={styles["back-page"]}>
        <Link to="/knowledge" className={"fas fa-angle-left"}>
          {" "}
          知識庫
        </Link>
        <div
          className={"fas fa-angle-left"}
          onClick={() => navigate("/database", { state: { item } })}
        >
          資料庫
        </div>
      </div>

      {/* <!--中間欄位內容--> */}
      <div className={styles["content-box"]}>
        <div className={styles["content-box-middle-bigView"]}>
<<<<<<< HEAD
          <PdfContent
            ref={pdfRef}
            knowledgeInfo={knowledgeInfo}
            SOPData={SOPData}
          />
=======
          <PdfContent ref={pdfRef} knowledgeInfo={knowledgeInfo} SOPData={SOPData} />
>>>>>>> 45944680588431b3e71825cd3cbddf5ad78dd61f
        </div>
      </div>
    </main>
  );
}
