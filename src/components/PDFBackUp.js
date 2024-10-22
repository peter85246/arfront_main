import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { apiUploadAndBackupPdf } from '../utils/Api';
import { toast } from 'react-toastify';

const PDFBackUp = () => {
  const generateAndUploadPdf = async (pdfRef, setIsDownloading) => {
    // 開始下載，設置狀態為 true
    setIsDownloading(true);

    try {
      // 獲取 PDF 內容的所有子元素
      const pageContents = pdfRef.current.children;
      // 創建新的 jsPDF 實例，設置為 A4 大小
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [595, 842], // A4 尺寸
      });

      let contentAdded = false;

      // 遍歷每個內容元素
      for (let i = 0; i < pageContents.length; i++) {
        const pageContent = pageContents[i];
        // 添加 CSS 類，為 PDF 生成做準備
        pageContent.classList.add('prepare-pdf');

        // 檢查內容是否為空
        if (
          !pageContent.innerText.trim() &&
          pageContent.querySelectorAll('img').length === 0
        ) {
          continue; // 跳過空白內容
        }

        // 使用 html2canvas 將內容轉換為圖像
        const canvas = await html2canvas(pageContent, {
          scale: 2,
          logging: true,
          useCORS: true,
          width: pageContent.offsetWidth,
          height: pageContent.offsetHeight,
        });

        // 將 canvas 轉換為圖像數據
        const imgData = canvas.toDataURL('image/png');
        if (imgData === 'data:,') continue; // 跳過無效的圖像數據

        // 如果已經添加了內容，則新增一頁
        if (contentAdded) {
          pdf.addPage();
        }

        // 將圖像添加到 PDF
        pdf.addImage(
          imgData,
          'PNG',
          0,
          0,
          pdf.internal.pageSize.getWidth(),
          pdf.internal.pageSize.getHeight()
        );

        contentAdded = true;
      }

      // 如果成功添加了內容
      if (contentAdded) {
        // 生成 PDF blob
        const pdfBlob = pdf.output('blob');

        // 調用 API 上傳和備份 PDF
        const response = await apiUploadAndBackupPdf(
          new File([pdfBlob], '維修檔案.pdf', { type: 'application/pdf' })
        );

        console.log('從 apiUploadAndBackupPdf 收到的回應:', response);

        // 創建下載鏈接
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);

        // 使用回應中的文件名，或默認名稱
        const fileName = response.fileName || '維修手冊.pdf';
        link.download = fileName;

        // 觸發下載
        link.click();

        // 顯示成功訊息
        toast.success(`PDF 已成功下載`);
      }
    } catch (error) {
      // 錯誤處理
      console.error('生成或上傳 PDF 時發生錯誤:', error);
      toast.error('PDF 上傳過程中發生錯誤: ' + error.message);
    } finally {
      // 無論成功與否，都結束下載狀態
      setIsDownloading(false);
    }
  };

  return { generateAndUploadPdf };

  //#region 只有下載功能 (無備份功能)
  //   const generateAndUploadPdf = async (pdfRef, setIsDownloading) => {
  //     setIsDownloading(true);
  //     try {
  //       const canvas = await html2canvas(pdfRef.current, {
  //         scale: 2,
  //         logging: true,
  //         useCORS: true,
  //       });

  //       const pdf = new jsPDF({
  //         orientation: 'portrait',
  //         unit: 'px',
  //         format: [canvas.width, canvas.height]
  //       });

  //       pdf.addImage(
  //         canvas.toDataURL('image/png'),
  //         'PNG',
  //         0,
  //         0,
  //         pdf.internal.pageSize.getWidth(),
  //         pdf.internal.pageSize.getHeight()
  //       );

  //       // 直接下載 PDF
  //       pdf.save('維修檔案.pdf');

  //       toast.success('PDF 已下載完成');
  //     } catch (error) {
  //       console.error('生成 PDF 時發生錯誤:', error);
  //       toast.error('生成 PDF 時發生錯誤');
  //     } finally {
  //       setIsDownloading(false);
  //     }
  //   };

  //   return { generateAndUploadPdf };
  //#endregion
};

export default PDFBackUp;
