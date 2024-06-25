import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useStore } from "../zustand/store";
import { fetchDataCallFile } from "../utils/Api";

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

    if (!sopName || sopName.trim() === "") {
      newErrors.sopName = "必填项";
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      const formData = new FormData();
      formData.append("MachineAddId", SOPInfo.machineAddId.toString());
      formData.append("machineName", SOPInfo.machineInfo.machineName);

      // 確保knowledgeInfo是一個陣列，並提供默認值
      const knowledgeInfoArray = SOPInfo.knowledgeInfo
        ? Array.isArray(SOPInfo.knowledgeInfo)
          ? SOPInfo.knowledgeInfo
          : [SOPInfo.knowledgeInfo]
        : [];

      const allowedExtensions = ["png", "jpg", "jpeg"];
      let fileIncluded = false; // 標記是否包含至少一個文件

      knowledgeInfoArray.forEach((info, index) => {
        Object.keys(info).forEach((key) => {
          if (key.includes("ImageObj")) {
            // 檢查info[key]是否存在並具有forEach方法
            if (info[key] && info[key].forEach) {
              info[key].forEach((fileObj) => {
                const file = fileObj.file; // 確保使用的是原始文件對象
                const fileExtension = file.name.split(".").pop().toLowerCase();
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
              });
            }
          } else {
            formData.append(`KnowledgeBases[${index}].${key}`, info[key]);
          }
        });
      });

      // 檢查是否有文件被添加
      if (!fileIncluded) {
        toast.error("請添加至少一個圖片文件。", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
        });
        return;
      }

      try {
        const saveKnowledgeBaseRes = await fetchDataCallFile(
          "SaveKnowledgeBase",
          "PUT",
          formData,
        );

        if (saveKnowledgeBaseRes.message !== "完全成功") {
          toast.error(saveKnowledgeBaseRes.message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
          });
          return;
        }

        toast.success("保存成功", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
        });
        setSOPInfo(null); // Reset or update SOP information
        // setTimeout(() => { window.location.href = "/knowledge"}, 2000);
      } catch (err) {
        console.error("保存知识库失败:", err);
        toast.error(`保存失败，请稍后重试。错误详情: ${err.message}`, {
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
