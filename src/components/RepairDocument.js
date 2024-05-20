import classNames from "classnames";
import styles from "../scss/global.module.scss";
import { Link } from "react-router-dom";

import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from "jspdf";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import PdfContent from "./PDFContent";

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
  const pdfRef = React.useRef();
  const [isPrinting, setIsPrinting] = useState(false);

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

  return (
    <main>
      <h2>維修說明檔案</h2>
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
        <Link to="/database" className={"fas fa-angle-left"}>
          {" "}
          資料庫
        </Link>
      </div>

      {/* <!--中間欄位內容--> */}
      <div className={styles["content-box"]}>
        <div className={styles["content-box-middle-bigView"]}>
          <PdfContent ref={pdfRef} />
        </div>
      </div>
    </main>
  );
}
