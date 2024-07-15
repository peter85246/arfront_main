import classNames from 'classnames';
import styles from '../scss/global.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import PdfContent from './PDFContent';
import { useTranslation } from 'react-i18next'; //語系
import Spinner from 'react-bootstrap/Spinner';
import {
  apiGetAllKnowledgeBaseByMachineAddId,
  apiGetAllSOPByMachineAddId,
} from '../utils/Api';

export function RepairDocument() {
  const location = useLocation();
  const [item, setItem] = useState(location.state?.item); // 假設通過location.state傳遞item

  const [knowledgeInfo, setKnowledgeInfo] = useState([]);
  const [SOPData, setSOPData] = useState([]);
  const navigate = useNavigate(); // 使用 navigate 來處理導航
  console.log('item', item);

  const pdfRef = useRef(null);
  // const pdfRef = React.useRef();
  const [isPrinting, setIsPrinting] = useState(false);
  const { t } = useTranslation();

  const [imagesLoaded, setImagesLoaded] = useState(0);
  const totalImages = 5; // 假設PDF內容中有5張圖片

  const [isDownloading, setIsDownloading] = useState(false); //轉圈圈

  const handleImageLoad = () => {
    setImagesLoaded((prev) => {
      console.log(`Image loaded: ${prev + 1}`);
      return prev + 1;
    });
  };

  const handleAllImagesLoaded = () => {
    console.log('All images have been loaded, ready to print or generate PDF.');
  };

  const handlePrint = useReactToPrint({
    content: () => pdfRef.current,
    onBeforePrint: () => setIsPrinting(true),
    onAfterPrint: () => {
      setIsPrinting(false);
      // savePdf();  // 確保在列印完成後保存 PDF 文件
    },
  });

  // PDF 下載處理
  const handleDownloadPdf = async () => {
    setIsDownloading(true); // 開始下載，禁用按鈕和顯示轉圈圈
    if (imagesLoaded >= totalImages) {
      const pageContents = pdfRef.current.children;
      let pdf = null;

      for (let i = 0; i < pageContents.length; i++) {
        const pageContent = pageContents[i];
        // 确保在生成PDF之前，页面已正确应用最新的CSS
        pageContent.classList.add('prepare-pdf');

        const canvas = await html2canvas(pageContent, {
          scale: 2,
          logging: true,
          useCORS: true,
          width: pageContent.offsetWidth,
          height: pageContent.offsetHeight,
          windowHeight: document.body.scrollHeight,
          windowWidth: document.body.scrollWidth,
        });

        const imgData = canvas.toDataURL('image/png');
        const format = [595, 842]; // A4纸张大小, 纵向

        if (!pdf) {
          // 创建PDF实例
          pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: format,
          });
        } else {
          // 添加新页面
          pdf.addPage(format, 'portrait');
        }

        // 计算适合的缩放比例
        const scale = Math.min(
          format[0] / canvas.width,
          format[1] / canvas.height
        );
        const newHeight = canvas.height * scale; // 新的高度

        // 计算偏移量以居中图像
        const offsetX = (format[0] - canvas.width * scale) / 2; // 水平居中
        let offsetY = (format[1] - newHeight) / 2; // 垂直居中

        if (canvas.height * scale < format[1]) {
          offsetY = 0; // 从顶部开始放置，避免底部留白
        }

        // 添加图像到PDF
        pdf.addImage(
          imgData,
          'PNG',
          offsetX,
          offsetY,
          canvas.width * scale,
          canvas.height * scale
        );
      }

      pdf.save('download.pdf'); // 保存PDF文件
      setIsDownloading(false); // 完成後恢復按鈕
    } else {
      console.log('Waiting for images to load...');
      setIsDownloading(false); // 若圖片未加載完成也要恢復按鈕
    }
  };

  useEffect(() => {
    if (item) {
      apiGetAllKnowledgeBaseByMachineAddId({ Id: item.machineAddId }).then(
        (res) => {
          if (res?.message === '完全成功') {
            setKnowledgeInfo(
              res.result.find(
                (k) => k.knowledgeBaseId === item.knowledgeBaseId
              ) || {}
            );
          }
        }
      );
      apiGetAllSOPByMachineAddId({ Id: item.machineAddId }).then((res) => {
        if (res?.message === '完全成功') {
          setSOPData(res.result);
        }
      });
    }
  }, [item]);

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
          disabled={isPrinting}
          className={classNames(styles.button, styles['btn-pdf'])}
        >
          {isPrinting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : '印出'}
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className={classNames(styles.button, styles['btn-pdf'])}
        >
          {isDownloading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : '下載 PDF'}
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
            item={item}
            knowledgeInfo={knowledgeInfo}
            SOPData={SOPData}
            onAllImagesLoaded={handleAllImagesLoaded} // 將函數作為 prop 傳遞
            onImageLoad={handleImageLoad}
          />
        </div>
      </div>
    </main>
  );
}
