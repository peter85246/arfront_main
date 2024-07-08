import classNames from 'classnames';
import styles from '../scss/global.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PDFDownloadLink, Document, Page, Text, StyleSheet, View } from '@react-pdf/renderer';
import PdfContent from './PDFContent';
import { useTranslation } from 'react-i18next'; //語系
import {
  apiGetAllKnowledgeBaseByMachineAddId,
  apiGetAllSOPByMachineAddId,
} from '../utils/Api';

// 定義 PDF 的樣式
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFF',
    padding: 10,
  },
  text: {
    margin: 10,
    fontSize: 14,
    textAlign: 'justify'
  },
  header: {
    fontSize: 18,
    textAlign: 'center',
    margin: 10,
  }
});

export function RepairDocument() {
  const location = useLocation();
  const item = location.state?.item; // 訪問傳遞的狀態

  const [knowledgeInfo, setKnowledgeInfo] = useState([]);
  const [SOPData, setSOPData] = useState([]);
  const navigate = useNavigate(); // 使用 navigate 來處理導航
  console.log('item', item);

  const pdfRef = React.useRef();
  const [isPrinting, setIsPrinting] = useState(false);
  const { t } = useTranslation();

  const handlePrint = useReactToPrint({
    content: () => pdfRef.current,
    onBeforePrint: () => setIsPrinting(true),
    onAfterPrint: () => {
      setIsPrinting(false);
      savePdf();  // 確保在列印完成後保存 PDF 文件
    },
  });

  const savePdf = () => {
    html2canvas(pdfRef.current, {
      scale: 2, // 提高渲染質量
      useCORS: true // 允許加載跨域圖片
    }).then(canvas => {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('德川維修手冊.pdf');
    });
  };

  const handleDownloadPdf = () => {
    html2canvas(pdfRef.current, {
      scale: 2,  // 提高渲染質量
      useCORS: true,
    }).then(canvas => {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const imgWidth = 210;  // A4 width in mm
      const imgHeight = 297;  // A4 height in mm
      const contentAspectRatio = canvas.width / canvas.height;
      const a4AspectRatio = imgWidth / imgHeight;
  
      let finalWidth, finalHeight;
      if (contentAspectRatio > a4AspectRatio) {
        // Width is the limiting factor
        finalWidth = imgWidth;
        finalHeight = imgWidth / contentAspectRatio;
      } else {
        // Height is the limiting factor
        finalHeight = imgHeight;
        finalWidth = imgHeight * contentAspectRatio;
      }
  
      const xOffset = (imgWidth - finalWidth) / 2;  // Center horizontally
      const yOffset = (imgHeight - finalHeight) / 2; // Center vertically
  
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xOffset, yOffset, finalWidth, finalHeight);
      pdf.save('maintenance-manual.pdf');
    });
  };

  useEffect(() => {
    const machineAddId = item?.machineAddId;
    const knowledgeBaseId = item?.knowledgeBaseId;

    const getKnowledgeInfo = async () => {
      const res = await apiGetAllKnowledgeBaseByMachineAddId({
        Id: machineAddId,
      });
      if (res?.message === '完全成功') {
        const knowledgeInfo = res.result.filter(
          (item) => item.knowledgeBaseId === knowledgeBaseId
        )[0];
        setKnowledgeInfo(knowledgeInfo);
      }
    };
    getKnowledgeInfo();

    const getSOPInfo = async () => {
      const res = await apiGetAllSOPByMachineAddId({ Id: machineAddId });
      if (res?.message === '完全成功') {
        console.log('res.result', res.result);

        const sop = res.result.filter(
          (item) => item.knowledgeBaseId === knowledgeBaseId
        );
        setSOPData(sop);
      }
    };
    getSOPInfo();
  }, []);

  return (
    <main>
      <section className="content-header" style={{ marginBottom: '10px' }}>
        <div className="container-fluid">
          <div className="row mb-2 justify-content-between">
            <div />
            <div className="content-header-text-color">
              <h1>
                <strong>
                  {t('repairDocument.content.header')}
                  {/*維修說明檔案*/}
                </strong>
              </h1>
            </div>
            <div></div>
          </div>
        </div>
      </section>
      <div className={styles['buttons-container']}>
        <button
          onClick={handlePrint}
          className={classNames(styles['button'], styles['btn-pdf'])}
        >
          印出
        </button>
        <button onClick={handleDownloadPdf} className={classNames(styles['button'], styles['btn-pdf'])}>
          下載 PDF
        </button>
      </div>
      <div className={styles['back-page']}>
        <Link to="/knowledge" className={'fas fa-angle-left'}>
          {' '}
          知識庫
        </Link>
        <div
          className={'fas fa-angle-left'}
          onClick={() => navigate('/database', { state: { item } })}
        >
          資料庫
        </div>
      </div>

      {/* <!--中間欄位內容--> */}
      <div className={styles['content-box']}>
        <div className={styles['content-box-middle-bigView']}>
          <PdfContent
            ref={pdfRef}
            knowledgeInfo={knowledgeInfo}
            SOPData={SOPData}
          />
        </div>
      </div>
    </main>
  );
}
