import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useStore } from "../zustand/store";
import {
  apiMachineInfo,
  apiSaveKnowledgeBase,
  apiSaveSOP2,
} from "../utils/Api";

export function SOPName({ onClose }) {
  const { SOPInfo, setSOPInfo } = useStore();
  const [showModal, setShowModal] = useState(true);
  const [sopName, setSopName] = useState("");
  const [errors, setErrors] = useState({});
  const { t } = useTranslation();

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
      sopName: e.target.value ? null : "required",
    }));
  };

  // 處理欄位失焦事件
  const handleEditBlur = () => {
    if (!sopName.trim()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        sopName: "required",
      }));
    }
  };

  // 處理表單儲存事件
  const handleSave = async () => {
    console.log({ ...SOPInfo, sopName });
    let hasError = false;
    const newErrors = {};

    if (!sopName || sopName === "") {
      newErrors.sopName = "required";
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      try {
        console.log('SOPInfo', SOPInfo);
        const knowledgeBaseModelImageObj = SOPInfo.knowledgeInfo?.knowledgeBaseModelImageObj?.map(item => item.file)
        const knowledgeBaseToolsImageObj = SOPInfo.knowledgeInfo?.knowledgeBaseToolsImageObj?.map(item => item.file)
        const knowledgeBasePositionImageObj = SOPInfo.knowledgeInfo?.knowledgeBasePositionImageObj?.map(item => item.file)
        
        const saveKnowledgeBaseRes = await apiSaveKnowledgeBase({
          MachineAddId: SOPInfo.machineAddId,
          machineName: SOPInfo.machineInfo.machineName,
          KnowledgeBases: [{ 
            ...SOPInfo.knowledgeInfo,
            knowledgeBaseModelImageObj,
            knowledgeBaseToolsImageObj,
            knowledgeBasePositionImageObj
          }],
        });

        if (saveKnowledgeBaseRes.message !== '完全成功') {
          return toast.error(saveKnowledgeBaseRes.message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
          });
        }
  
        const saveSOPInfoRes = await apiSaveSOP2({
          KnowledgeBaseId: saveKnowledgeBaseRes.result,
          MachineAddId: SOPInfo.machineAddId,
          SOP2s: SOPInfo.sops,
        });
  
        if (saveSOPInfoRes.message === '完全成功') {
          toast.success('保存成功', {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
          });
          setSOPInfo(null);
<<<<<<< HEAD
          setTimeout(() => { window.location.href = "/knowledge"}, 2000)
=======
          // setTimeout(() => { window.location.href = "/knowledge"}, 2000)
>>>>>>> 4f1310cf1b535add3ff6a7a5fa68842667e68b80
        } 
        else {
          return toast.error(saveSOPInfoRes.message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
          });
        }
      } catch (err) {
        console.log(err)
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
                name="sopName"
                value={sopName}
                onChange={handleEditChange}
                onBlur={handleEditBlur}
                autoComplete="off"
              />
              {errors.sopName && (
                <div className="invalid-feedback d-block">
                  <i className="fas fa-exclamation-circle"></i>{" "}
                  {t("helpWord.required")}
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
