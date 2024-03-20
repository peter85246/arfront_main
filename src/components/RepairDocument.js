
import classNames from "classnames";
import styles from "../scss/global.module.scss";
import { Link } from "react-router-dom";

import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import PdfContent from './PDFContent';


export function RepairDocument() {

  const pdfRef = React.useRef();
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useReactToPrint({
    content: () => pdfRef.current,
    onBeforePrint: () => setIsPrinting(true),
    onAfterPrint: () => {
      setIsPrinting(false);
      if (isPrinting) {
        savePdf();
      }
    },
  });

  const savePdf = () => {
    const pdf = new jsPDF();
    pdf.html(pdfRef.current, {
      callback: function (doc) {
          doc.save('德川維修手冊.pdf');
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

      <PdfContent ref={pdfRef} />
    </main>
  );
}
