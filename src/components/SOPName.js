import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useStore } from '../zustand/store';
import { fetchDataCallFile } from '../utils/Api';
import { apiSaveSOP2 } from '../utils/Api';

export function SOPName({ onClose }) {
  const { SOPInfo, setSOPInfo } = useStore();
  const [showModal, setShowModal] = useState(true);
  const [sop2Name, setSopName] = useState('');
  const [errors, setErrors] = useState({});
  const { t } = useTranslation();

  // 這個 useEffect 會在 SOPInfo 變更時更新，包括組件初次渲染
  useEffect(() => {
    // 如果存在 SOPInfo 且其內有 knowledgeInfo，則從中提取 knowledgeBaseSOPName
    if (
      SOPInfo &&
      SOPInfo.knowledgeInfo &&
      SOPInfo.knowledgeInfo.knowledgeBaseSOPName
    ) {
      setSopName(SOPInfo.knowledgeInfo.knowledgeBaseSOPName);
    } else {
      // 如果沒有提供有效的 SOP 名稱，設置為空以便新建
      setSopName('');
    }
  }, [SOPInfo]);

  // 處理模態窗關閉事件
  const handleCloseModal = () => {
    setShowModal(false);
    if (onClose) onClose();
  };

  // 處理欄位變更事件
  const handleEditChange = (e) => {
    setSopName(e.target.value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      sop2Name: e.target.value ? null : 'required',
    }));
  };

  // 處理欄位失焦事件
  const handleEditBlur = () => {
    if (!sop2Name.trim()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        sop2Name: 'required',
      }));
    }
  };

  // 處理表單儲存事件
  const handleSave = async () => {
    console.log('handleSave is triggered');
    console.log({ ...SOPInfo, sop2Name });
    let hasError = false;
    const newErrors = {};

    const SOPFormData = new FormData();
    SOPFormData.append(`MachineAddId`, SOPInfo.machineAddId.toString());

    if (!sop2Name || sop2Name.trim() === '') {
      newErrors.sop2Name = '必填项';
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      const modelImageObj =
        SOPInfo.knowledgeInfo?.knowledgeBaseModelImageObj?.map(
          (item) => item.name
        );
      const toolsImageObj =
        SOPInfo.knowledgeInfo?.knowledgeBaseToolsImageObj?.map(
          (item) => item.name
        );
      const positionImageObj =
        SOPInfo.knowledgeInfo?.knowledgeBasePositionImageObj?.map(
          (item) => item.name
        );

      const formData = new FormData();
      formData.append('MachineAddId', SOPInfo.machineAddId.toString());
      // formData.append('machineName', SOPInfo.machineInfo.machineName);
      formData.append('KnowledgeBases[0].KnowledgeBaseSOPName', sop2Name);

      // // 只有在創建新條目時，才添加3D模型相關字段
      // if (!SOPInfo.knowledgeBaseId) {
      //   formData.append('KnowledgeBases[0].knowledgeBase3DModelImage', []);
      //   formData.append('KnowledgeBases[0].knowledgeBase3DModelFile', []);
      //   formData.append('KnowledgeBases[0].knowledgeBase3DModelFileObj', null);
      // }

      // 如果有 KnowledgeBaseId，加入到 formData (編輯CRUD)
      if (SOPInfo.knowledgeBaseId) {
        formData.append('KnowledgeBaseId', SOPInfo.knowledgeBaseId);
      }

      // 確保knowledgeInfo是一個陣列，並提供默認值
      const knowledgeInfoArray = SOPInfo.knowledgeInfo
        ? Array.isArray(SOPInfo.knowledgeInfo)
          ? SOPInfo.knowledgeInfo
          : [SOPInfo.knowledgeInfo]
        : [];

      const allowedExtensions = ['png', 'jpg', 'jpeg'];
      let fileIncluded = false; // 標記是否包含至少一個文件

      knowledgeInfoArray.forEach((info, index) => {
        Object.keys(info).forEach((key) => {
          if (key.includes('ImageObj')) {
            // 檢查info[key]是否存在並具有forEach方法
            if (info[key] && info[key].forEach) {
              info[key].forEach((fileObj) => {
                if (fileObj && fileObj.file) {
                  // 添加這一行來進行檢查
                  const file = fileObj.file; // 確保使用的是原始文件對象
                  const fileExtension = file.name
                    .split('.')
                    .pop()
                    .toLowerCase();
                  if (!allowedExtensions.includes(fileExtension)) {
                    toast.error(`不支持的文件類型: ${file.name}`, {
                      position: toast.POSITION.TOP_CENTER,
                      autoClose: 2000,
                      hideProgressBar: true,
                      closeOnClick: false,
                      pauseOnHover: true,
                    });
                  } else {
                    formData.append(`KnowledgeBases[${index}].${key}`, file);
                    fileIncluded = true;
                  }
                }
              });
            }
          } else {
            formData.append(`KnowledgeBases[${index}].${key}`, info[key]);
          }
        });
      });

      modelImageObj.forEach((name, idx) => {
        formData.append(
          `KnowledgeBases[0].KnowledgeBaseModelImageNames[${idx}]`,
          name
        );
      });
      toolsImageObj.forEach((name, idx) => {
        formData.append(
          `KnowledgeBases[0].KnowledgeBaseToolsImageNames[${idx}]`,
          name
        );
      });
      positionImageObj.forEach((name, idx) => {
        formData.append(
          `KnowledgeBases[0].KnowledgeBasePositionImageNames[${idx}]`,
          name
        );
      });

      // 檢查是否有文件被添加
      if (!fileIncluded) {
        toast.error('故障說明 & SOP請添加至少更新圖片文件。', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
        });
        return;
      }

      try {
        // 查看 formData 內的檔案內容
        for (let pair of formData.entries()) {
          console.log(`${pair[0]}, ${pair[1]}`);
        }

        for (let pair of SOPFormData.entries()) {
          console.log(`${pair[0]}: ${pair[1]}`);
        }

        const saveKnowledgeBaseRes = await fetchDataCallFile(
          'SaveKnowledgeBase',
          'PUT',
          formData
        );

        // const saveKnowledgeBaseRes = await fetchDataCallFile(
        //   SOPInfo.knowledgeBaseId ? 'UpdateKnowledgeBase' : 'SaveKnowledgeBase',
        //   'PUT',
        //   formData
        // );

        if (saveKnowledgeBaseRes.message !== '完全成功') {
          toast.error(saveKnowledgeBaseRes.message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
          });
          return;
        }

        SOPFormData.append(`KnowledgeBaseId`, saveKnowledgeBaseRes.result);

        SOPInfo.sops.forEach((sop, idx) => {
          SOPFormData.append(`SOP2s[${idx}].deleted`, sop.deleted);
          SOPFormData.append(
            `SOP2s[${idx}].isDeletedSOPImage`,
            sop.isDeletedSOPImage
          );
          SOPFormData.append(
            `SOP2s[${idx}].isDeletedSOPRemarksImage`,
            sop.isDeletedSOPRemarksImage
          );
          SOPFormData.append(
            `SOP2s[${idx}].isDeletedSOPVideo`,
            sop.isDeletedSOPVideo
          );
          SOPFormData.append(`SOP2s[${idx}].sopId`, sop.sopId);
          SOPFormData.append(`SOP2s[${idx}].soP2Image`, sop.soP2Image);
          SOPFormData.append(`SOP2s[${idx}].soP2ImageObj`, sop.soP2ImageObj);
          SOPFormData.append(
            `SOP2s[${idx}].soP2RemarkImage`,
            sop.soP2RemarkImage
          );
          SOPFormData.append(
            `SOP2s[${idx}].soP2RemarkImageObj`,
            sop.soP2RemarkImageObj
          );
          SOPFormData.append(`SOP2s[${idx}].soP2Message`, sop.soP2Message);
          SOPFormData.append(`SOP2s[${idx}].soP2Remark`, sop.soP2Remark);
          SOPFormData.append(`SOP2s[${idx}].soP2Step`, sop.soP2Step);
          SOPFormData.append(`SOP2s[${idx}].soP2Name`, sop.soP2Name);
          SOPFormData.append(`SOP2s[${idx}].sopVideo`, sop.sopVideo);
          SOPFormData.append(`SOP2s[${idx}].sopVideoObj`, sop.sopVideoObj);
          SOPFormData.append(`SOP2s[${idx}].PL1`, sop.sopplC1);
          SOPFormData.append(`SOP2s[${idx}].PL2`, sop.sopplC2);
          SOPFormData.append(`SOP2s[${idx}].PL3`, sop.sopplC3);
          SOPFormData.append(`SOP2s[${idx}].PL4`, sop.sopplC4);

          sop.sopModels.forEach((sopModel, j) => {
            SOPFormData.append(
              `SOP2s[${idx}].sopModels[${j}].sopModelId`,
              sopModel.sopModelId
            );
            SOPFormData.append(
              `SOP2s[${idx}].sopModels[${j}].deleted`,
              sopModel.deleted
            );
            SOPFormData.append(
              `SOP2s[${idx}].sopModels[${j}].sopId`,
              sopModel.sopId
            );
            SOPFormData.append(
              `SOP2s[${idx}].sopModels[${j}].sopModelImage`,
              sopModel.sopModelImage
            );
            SOPFormData.append(
              `SOP2s[${idx}].sopModels[${j}].sopModelImageObj`,
              sopModel.sopModelImageObj
            );
            SOPFormData.append(
              `SOP2s[${idx}].sopModels[${j}].sopModelFile`,
              sopModel.sopModelFile
            );
            SOPFormData.append(
              `SOP2s[${idx}].sopModels[${j}].sopModelFileObj`,
              sopModel.sopModelFileObj
            );
            // 此處確保即使sopT3DModels為空也能傳遞空數組[]
            // SOPFormData.append(`SOP2s[${idx}].sopModels[${j}].sopT3DModels`, JSON.stringify(sopModel.sopT3DModels || []));
            // 处理 3D 模型数据，使用 JSON.stringify 确保格式正确
            const t3dModelsData =
              sop.T3DModels && Array.isArray(sop.T3DModels)
                ? sop.T3DModels
                : [];
            formData.append(
              `SOP2s[${idx}].T3DModels`,
              JSON.stringify(t3dModelsData)
            );
          });
        });

        const saveSOPInfoRes = await apiSaveSOP2(SOPFormData);

        if (saveSOPInfoRes.message === '完全成功') {
          const successMessage = SOPInfo.knowledgeBaseId
            ? '編輯保存成功!'
            : '知識保存成功!';
          toast.success(successMessage, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
          });
        }

        setSOPInfo(null); // Reset or update SOP information
        // setTimeout(() => {
        //   window.location.href = '/knowledge';
        // }, 2000);
      } catch (err) {
        console.error('保存知識庫失败:', err);
        toast.error(`保存失败，請稍后重试。錯誤詳情: ${err.message}`, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
        });
      }
    }
  };

  return (
    <div>
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>新增知識</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>帳號</Form.Label>
            <Form.Control placeholder="最高管理員" disabled />
          </Form.Group>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <span className="text-danger">*</span> SOP名稱
              </Form.Label>
              <input
                type="text"
                className="form-control"
                name="knowledgeBaseSOPName"
                value={sop2Name}
                onChange={handleEditChange}
                onBlur={handleEditBlur}
                autoComplete="off"
              />
              {errors.sop2Name && (
                <div className="invalid-feedback d-block">
                  <i className="fas fa-exclamation-circle"></i>{' '}
                  {t('helpWord.required')}
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSave}>
            儲存
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
