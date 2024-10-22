// 此文件為utility文件（或稱為工具函數文件）通常是包含可重用函數的JavaScript文件。
// 這些函數不是React組件，而是可以在整個應用程序中共享的通用功能。

// PDF備份，測試點選Knowledge的tr、td欄位進行備份。 (未完成)
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { apiUploadAndBackupPdf } from './Api';
import { toast } from 'react-toastify';

const generateAndUploadPdf = async (pdfRef, setIsDownloading) => {
  setIsDownloading(true);

  try {
    if (!pdfRef.current) {
      throw new Error('PDF content is not ready');
    }

    const pageContents = pdfRef.current.children;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [595, 842],
    });

    let contentAdded = false;

    for (let i = 0; i < pageContents.length; i++) {
      const pageContent = pageContents[i];
      pageContent.classList.add('prepare-pdf');

      if (
        !pageContent.innerText.trim() &&
        pageContent.querySelectorAll('img').length === 0
      ) {
        continue;
      }

      const canvas = await html2canvas(pageContent, {
        scale: 2,
        logging: true,
        useCORS: true,
        width: pageContent.offsetWidth,
        height: pageContent.offsetHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      if (imgData === 'data:,') continue;

      if (contentAdded) {
        pdf.addPage();
      }

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

    if (contentAdded) {
      const pdfBlob = pdf.output('blob');

      const response = await apiUploadAndBackupPdf(
        new File([pdfBlob], '德川維修檔案.pdf', { type: 'application/pdf' })
      );

      console.log('Response from apiUploadAndBackupPdf:', response);

      return pdfBlob;
    } else {
      throw new Error('No content added to PDF');
    }
  } catch (error) {
    console.error('Error generating or uploading PDF:', error);
    toast.error('PDF備份過程中發生錯誤: ' + error.message);
    throw error;
  } finally {
    setIsDownloading(false);
  }
};

export const downloadPdf = (pdfBlob, fileName) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(pdfBlob);
  link.download = fileName || '維修手冊.pdf';
  link.click();
  toast.success(`PDF已成功下載`);
};

export { generateAndUploadPdf };
