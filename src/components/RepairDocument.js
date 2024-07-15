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
      setTimeout(async () => {
        await generatePdf(); // 執行PDF生成的主要邏輯函數
        setIsDownloading(false); // 關閉轉圈圈狀態
    }, 0); // 延遲X秒以等待樣式應用
    } else {
      console.log('Waiting for images to load...');
      setIsDownloading(false); // 若圖片未加載完成也要恢復按鈕
    }
  };

  // 把生成PDF的邏輯單獨放在一个函数中
  const generatePdf = async () => {
    const pageContents = pdfRef.current.children;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [595, 842], // A4 紙張大小, 縱向
    });

    let contentAdded = false; // 跟踪是否已添加内容

    for (let i = 0; i < pageContents.length; i++) {
      const pageContent = pageContents[i];
      pageContent.classList.add('prepare-pdf');

      // 檢查確定是否有可見內容
      if (!pageContent.innerText.trim() && pageContent.querySelectorAll('img').length === 0) {
        continue; // 如果沒有文本或圖片，跳過此頁面 (避免空白頁產生)
      }

      const canvas = await html2canvas(pageContent, {
        scale: 2,
        logging: true,
        useCORS: true,
        width: pageContent.offsetWidth,
        height: pageContent.offsetHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      if (imgData === 'data:,') continue; // 如果吾圖片數據，則跳過此次循環(避免空白頁產生)

      if (contentAdded) {
        pdf.addPage(); // 如果前面已添加内容，則為新內容添加新頁面
      }

      // 添加圖片到 PDF，讓圖片完全佔滿版面
      pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());

      contentAdded = true; // 標記已添加內容
    }

    if (contentAdded) {
      pdf.save('德川維修檔案.pdf'); // 保存PDF文件
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
        {/* <button
          onClick={handlePrint}
          disabled={isPrinting}
          className={classNames(styles.button, styles['btn-pdf'])}
        >
          {isPrinting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : '印出'}
        </button> */}
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