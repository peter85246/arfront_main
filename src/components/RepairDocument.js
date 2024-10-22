import classNames from 'classnames';
import styles from '../scss/global.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import PdfContent from './PDFContent';
import PDFBackUp from './PDFBackUp';
import { useTranslation } from 'react-i18next'; //語系
import Spinner from 'react-bootstrap/Spinner';
import { toast } from 'react-toastify';
import {
  apiGetAllKnowledgeBaseByMachineAddId,
  apiGetAllSOPByMachineAddId,
  apiUploadAndBackupPdf,
} from '../utils/Api';

export function RepairDocument() {
  const location = useLocation();
  const [item, setItem] = useState(location.state?.item);
  const [knowledgeInfo, setKnowledgeInfo] = useState(
    location.state?.knowledgeInfo || {}
  );
  const [SOPData, setSOPData] = useState(location.state?.SOPData || []);

  const navigate = useNavigate(); // 使用 navigate 來處理導航
  console.log('item', item);

  const pdfRef = useRef(null);
  // const pdfRef = React.useRef();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { t } = useTranslation();

  const [imagesLoaded, setImagesLoaded] = useState(0);
  const totalImages = 3; // 假設PDF內容中有5張圖片

  const [isDownloading, setIsDownloading] = useState(false); //轉圈圈
  const [currentFileName, setCurrentFileName] = useState(''); //紀錄PDF備份檔名
  const { generateAndUploadPdf } = PDFBackUp(); //引用PDF備用組件功能

  const handleImageLoad = () => {
    setImagesLoaded((prev) => {
      console.log(`Image loaded: ${prev + 1}`);
      return prev + 1;
    });
  };

  const handleAllImagesLoaded = () => {
    console.log('All images have been loaded, ready to print or generate PDF.');
  };

  const handleDownloadPdf = async () => {
    if (imagesLoaded < totalImages) {
      console.log('等待圖片加載完成...');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      await generateAndUploadPdf(pdfRef, () => {});
      // 移除這裡的成功 toast
      // toast.success('PDF 已成功生成並下載');
    } catch (error) {
      console.error('生成 PDF 時發生錯誤:', error);
      toast.error('生成 PDF 時發生錯誤');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    console.log('Received item:', item);
    console.log('Received knowledgeInfo:', knowledgeInfo);
    console.log('Received SOPData:', SOPData);
  }, []);

  useEffect(() => {
    if (!item || !knowledgeInfo || SOPData.length === 0) {
      // 只有在没有传递数据时才重新获取
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    if (item) {
      // 只在必要时获取数据
      // ... 获取 knowledgeInfo 和 SOPData 的代码 ...
    }
  };

  useEffect(() => {
    return () => {
      // 清理函数
      setItem(null);
      setKnowledgeInfo({});
      setSOPData([]);
    };
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
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className={classNames(styles.button, styles['btn-pdf'])}
        >
          {isGeneratingPdf ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              <span className="ms-2">生成中...</span>
            </>
          ) : (
            '下載 PDF'
          )}
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
            onAllImagesLoaded={handleAllImagesLoaded}
            onImageLoad={handleImageLoad}
          />
        </div>
      </div>
    </main>
  );
}
