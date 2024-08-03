import classNames from 'classnames';
import styles from '../scss/global.module.scss';
import { useTranslation } from 'react-i18next'; //語系
import { Link, useNavigate } from 'react-router-dom';
import PdfContent from '../components/PDFContent';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuthToken } from '../utils/TokenUtil';
import { useDatabase } from '../components/useDatabse';
import { apiSaveKnowledgeBase, apiSaveSOP2 } from '../utils/Api';
import {
  apiGetAllKnowledgeBaseByMachineAddId,
  apiGetAllSOPByMachineAddId,
} from '../utils/Api';
import { useEffect, useState } from 'react';
import { useStore } from '../zustand/store';

export default function Database() {
  const location = useLocation();
  const item = location.state?.item; // 訪問傳遞的狀態

  const currentPage = location.state?.currentPage || 1; // 接收當前頁碼，默認為1
  const pageRow = location.state?.pageRow || 5; // 接收每頁行數，默認為5

  const { t } = useTranslation();
  const { setSOPInfo } = useStore();
  const navigate = useNavigate(); // 使用 navigate 來處理導航

  const [knowledgeInfo, setKnowledgeInfo] = useState([]);
  const [SOPData, setSOPData] = useState([]);
  const { nodeId, nodeTopic } = location.state; // 從路由狀態中讀取數據

  const { knowledgeBaseId } = location.state || {}; // 從路由狀態獲取 knowledgeBaseId
  console.log('Database page loaded with ID:', knowledgeBaseId); // 确认 ID 是否被正确传递

  useEffect(() => {
    if (knowledgeBaseId) {
      console.log('Loaded with ID:', knowledgeBaseId);
      // 基於 knowledgeBaseId 加載相應數據
    } else {
      console.log(
        'No knowledgeBaseId provided, load default data or handle case.'
      );
      // 處理沒有 knowledgeBaseId 的情況
    }
  }, [knowledgeBaseId]);

  const handleEdit = async () => {
    let knowledgeBaseModelImageObj = [];
    let knowledgeBaseToolsImageObj = [];
    let knowledgeBasePositionImageObj = [];

    if (knowledgeInfo.knowledgeBaseModelImage) {
      knowledgeBaseModelImageObj = JSON.parse(
        knowledgeInfo.knowledgeBaseModelImage
      );

      for (const item in knowledgeBaseModelImageObj) {
        const res = await fetch(knowledgeBaseModelImageObj[item]);
        const blob = await res.blob();
        const name = JSON.parse(knowledgeInfo.knowledgeBaseModelImageNames)[
          item
        ];
        const file = new File([blob], name, { type: blob.type });

        knowledgeBaseModelImageObj[item] = {
          file: file,
          name: name,
          img: knowledgeBaseModelImageObj[item],
        };
      }
    }

    if (knowledgeInfo.knowledgeBaseToolsImage) {
      knowledgeBaseToolsImageObj = JSON.parse(
        knowledgeInfo.knowledgeBaseToolsImage
      );

      for (const item in knowledgeBaseToolsImageObj) {
        const res = await fetch(knowledgeBaseToolsImageObj[item]);
        const blob = await res.blob();
        const name = JSON.parse(knowledgeInfo.knowledgeBaseToolsImageNames)[
          item
        ];
        const file = new File([blob], name, { type: blob.type });

        knowledgeBaseToolsImageObj[item] = {
          file: file,
          name: name,
          img: knowledgeBaseToolsImageObj[item],
        };
      }
    }

    if (knowledgeInfo.knowledgeBasePositionImage) {
      knowledgeBasePositionImageObj = JSON.parse(
        knowledgeInfo.knowledgeBasePositionImage
      );

      for (const item in knowledgeBasePositionImageObj) {
        const res = await fetch(knowledgeBasePositionImageObj[item]);
        const blob = await res.blob();
        const name = JSON.parse(knowledgeInfo.knowledgeBasePositionImageNames)[
          item
        ];
        const file = new File([blob], name, { type: blob.type });

        knowledgeBasePositionImageObj[item] = {
          file: file,
          name: name,
          img: knowledgeBasePositionImageObj[item],
        };
      }
    }

    for (const sop of SOPData) {
      // 確保每個步驟的影像、備註影像和視頻都被處理
      if (sop.soP2Image) {
        const soP2ImageRes = await fetch(sop.soP2Image);
        const soP2ImageBlob = await soP2ImageRes.blob();
        const soP2ImageName = sop.soP2Image.split('/').pop();
        const soP2ImageFile = new File([soP2ImageBlob], soP2ImageName, {
          type: soP2ImageBlob.type,
        });
        sop.soP2ImageObj = soP2ImageFile;
      }

      if (sop.soP2RemarkImage) {
        const soP2RemarkImageRes = await fetch(sop.soP2RemarkImage);
        const soP2RemarkImageBlob = await soP2RemarkImageRes.blob();
        const soP2RemarkImageName = sop.soP2RemarkImage.split('/').pop();
        const soP2RemarkImageFile = new File(
          [soP2RemarkImageBlob],
          soP2RemarkImageName,
          { type: soP2RemarkImageBlob.type }
        );
        sop.soP2RemarkImageObj = soP2RemarkImageFile;
      }

      if (sop.sopVideo) {
        const sopVideoRes = await fetch(sop.sopVideo);
        const sopVideoBlob = await sopVideoRes.blob();
        const sopVideoName = sop.sopVideo.split('/').pop();
        const sopVideoFile = new File([sopVideoBlob], sopVideoName, {
          type: sopVideoBlob.type,
        });
        sop.sopVideoObj = sopVideoFile;
      }
    }

    setSOPInfo({
      machineAddId: item.machineAddId,
      machineInfo: {
        machineName: knowledgeInfo.machineName,
      },
      knowledgeInfo: {
        ...knowledgeInfo,
        knowledgeBaseModelImageObj: knowledgeBaseModelImageObj,
        knowledgeBaseToolsImageObj: knowledgeBaseToolsImageObj,
        knowledgeBasePositionImageObj: knowledgeBasePositionImageObj,
      },
      sops: SOPData.map((sop) => ({
        ...sop,
        soP2ImageObj: sop.soP2ImageObj,
        soP2RemarkImageObj: sop.soP2RemarkImageObj,
        sopVideoObj: sop.sopVideoObj, // 確保影片檔案也被包括在內
      })),
    });

    navigate('/document-editor', { state: { knowledgeInfo, SOPData } });
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

      if (res?.message === '完全成功') {
        toast.success('刪除成功!', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
        });
        setTimeout(() => {
          window.location.href = '/knowledge';
        }, 500);
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
      console.log(res);
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
    // const getSOPInfo = async () => {
    //   const res = await apiGetAllSOPByMachineAddId({ Id: machineAddId });
    //   if (res?.message === '完全成功') {
    //     const updatedSOPs = res.result.map(sop => ({
    //       ...sop,
    //       soP2ImageObj: new File([], sop.soP2Image),  // 將URL轉為File對象
    //       soP2RemarkImageObj: new File([], sop.soP2RemarkImage),
    //       sopVideoObj: new File([], sop.sopVideo)
    //     }));
    //     setSOPData(updatedSOPs);
    //     setSOPInfo((prev) => ({ ...prev, sops: updatedSOPs }));
    //   }
    // };
    getSOPInfo();
  }, []);

  return (
    <>
      <main>
        <section className="content-header" style={{ marginBottom: '10px' }}>
          <div className="container-fluid">
            <div className="row mb-2 justify-content-between">
              <div />
              <div className="content-header-text-color">
                <h1>
                  <strong>
                    {t('database.content.header')}
                    {/*資料庫*/}
                  </strong>
                </h1>
              </div>
              <div></div>
            </div>
          </div>
        </section>
        <div className={styles['back-page']}>
          <Link to="/knowledge" className={'fas fa-angle-left'}>
            {' '}
            知識庫
          </Link>
        </div>
        <div className={styles['buttons-container']}>
          <div
            type="button"
            className={classNames(styles['button'], styles['btn-edit'])}
            onClick={handleEdit}
          >
            編輯
          </div>
          <div
            className={classNames(styles['button'], styles['btn-delete'])}
            onClick={handleDelete}
          >
            刪除
          </div>
          <div
            className={classNames(styles['button'], styles['btn-pdf'])}
            onClick={() => navigate('/repairDocument', { state: { item } })}
          >
            PDF
          </div>
        </div>

        {/* <!--中間欄位內容--> */}
        <div className={styles['content-box']}>
          <div className={styles['content-box-middle']}>
            <div className={styles['content-wrapper-database']}>
              <p className={styles['mark-text']}>▶ 查詢資訊結果</p>
              <table>
                <thead>
                  <tr className={styles['row-title-database']}>
                    {/* <th>編號</th> */}
                    <th>設備種類</th>
                    <th>設備部件</th>
                    <th>維修項目</th>
                    <th>維修類型</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 根據資料庫內的KnowledgeeBaseId顯示 */}
                  {knowledgeInfo ? (
                    <tr className={styles['row-database']}>
                      {/* <td>{(currentPage - 1) * pageRow + item.index + 1}</td>{' '} */}
                      {/* 自定義序列，顯示自動排序，不因刪除欄位而產生缺口 */}
                      <td>{knowledgeInfo.knowledgeBaseDeviceType}</td>
                      <td>{knowledgeInfo.knowledgeBaseDeviceParts}</td>
                      <td>{knowledgeInfo.knowledgeBaseRepairItems}</td>
                      <td>{knowledgeInfo.knowledgeBaseRepairType}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }}>
                        查無資料
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <p></p>
              <div className={styles['mark-note']}>
                {/* <!-- 調整文字位置 --> */}
                <p
                  className={styles['mark-text']}
                  style={{ marginBottom: '5px' }}
                >
                  ▶ 點擊PDF按鈕即可進行放大預覽 & 印出
                </p>
                {/* <!-- 新增放大按鈕 --> */}
                {/* <a
                  href="repairDocument"
                  className={styles['btn-enlarge']}
                  type="button"
                >
                  點擊放大預覽
                </a> */}
              </div>
              <PdfContent knowledgeInfo={knowledgeInfo} SOPData={SOPData} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
