import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export function SOPName({ onClose }) {
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
  const handleSave = () => {
    let hasError = false;
    const newErrors = {};

    if (!sopName || sopName === "") {
      newErrors.sopName = "required";
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      console.log("全部有效，執行保存!");
      window.location.href = "/sop2";
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
