import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { useTranslation } from "react-i18next";

import { apiGetMachineOptions } from "../utils/Api";

export function AddingKnowledge({ onClose }) {
  const [showModal, setShowModal] = useState(true);
  const [machineInfo, setMachineInfo] = useState({
    machineType: "",
    modelSeries: "",
    machineName: "",
  });
  const [options, setOptions] = useState({
    machineType: [],
    modelSeries: [],
    machineName: [],
    completeMachineOptions: [],
  });

  const [errors, setErrors] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    fetchMachineOptions();
  }, []);

  const fetchMachineOptions = async () => {
    try {
      const response = await apiGetMachineOptions();
      console.log("API Response:", response); // 確認 API 回應
      if (response && response.code === "0000" && response.result) {
        const formattedOptions = {
          machineType: response.result.map((item) => ({
            value: item.machineType,
            label: item.machineType,
          })),
          modelSeries: response.result.map((item) => ({
            value: item.modelSeries,
            label: item.modelSeries,
          })),
          machineName: response.result.map((item) => ({
            value: item.machineName,
            label: item.machineName,
          })),
          completeMachineOptions: response.result, // 儲存完整機台信息
        };
        setOptions(formattedOptions);
      } else {
        console.error("Failed to load options:", response);
      }
    } catch (error) {
      console.error("Failed to fetch machine options:", error);
    }
  };

  useEffect(() => {
    fetchMachineOptions();
  }, []);

  // 處理模態窗關閉事件
  const handleCloseModal = () => {
    setShowModal(false);
    if (onClose) onClose();
  };

  // 驗證選擇的機台種類和型號系列是否符合機台名稱的前綴
  const validateSelection = (name, type, series) => {
    const typePrefix = type.substring(0, Math.min(3, type.length)); // 取前三個字符或更少，避免越界
    const seriesPrefix = series.substring(0, Math.min(3, series.length));
    return name.startsWith(typePrefix) && name.startsWith(seriesPrefix);
  };

  // 處理下拉選單選擇變更事件
  const handleEditChange = (option, key) => {
    setMachineInfo((prevState) => {
      const newState = { ...prevState, [key]: option.value };

      if (key === "machineName") {
        // 當選擇機台名稱時自動填入對應的機台種類和型號系列
        const selectedMachine = options.completeMachineOptions.find(
          (m) => m.machineName === option.value,
        );
        if (selectedMachine) {
          newState.machineType = selectedMachine.machineType || "";
          newState.modelSeries = selectedMachine.modelSeries || "";
        } else {
          newState.machineType = "";
          newState.modelSeries = "";
        }
      } else {
        // 當機台種類或型號系列被改變時，重新驗證機台名稱的前綴
        const { machineType, modelSeries, machineName } = newState;
        if (
          machineName &&
          !validateSelection(machineName, machineType, modelSeries)
        ) {
          newState.machineName = ""; // 如果不匹配，清空機台名稱
        }
      }

      return newState;
    });

    setErrors((prevErrors) => ({
      ...prevErrors,
      [key]: option.value ? null : "required",
    }));
  };

  // 處理欄位失焦事件，確認選項的完整性和正確性
  const handleEditBlur = (key) => {
    if (!machineInfo[key].trim()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [key]: "required",
      }));
    } else if (key === "machineName") {
      if (
        !validateSelection(
          machineInfo.machineName,
          machineInfo.machineType,
          machineInfo.modelSeries,
        )
      ) {
        alert("機台種類和型號系列必須與機台名稱匹配");
      }
    }
  };

  // 處理表單儲存事件
  const handleSave = () => {
    let hasError = false;
    const newErrors = {};

    Object.keys(machineInfo).forEach((key) => {
      if (!machineInfo[key] || machineInfo[key] === "") {
        newErrors[key] = "required";
        hasError = true;
      }
    });

    if (
      !validateSelection(
        machineInfo.machineName,
        machineInfo.machineType,
        machineInfo.modelSeries,
      )
    ) {
      alert("儲存失敗：機台種類和型號系列必須與機台名稱匹配");
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      console.log("全部有效，執行保存!");
      window.location.href = "/document-editor";
    }
  };

  // 下拉選單的選項數據
  // const options = {
  //   machineType: [
  //     { value: "CNC車床", label: "CNC車床" },
  //     { value: "AAC銑床", label: "AAC銑床" },
  //     { value: "GXA數控旋轉工作台", label: "GXA數控旋轉工作台" },
  //     { value: "BXG自動磨床", label: "BXG自動磨床" },
  //   ],
  //   modelSeries: [
  //     { value: "CNC", label: "CNC" },
  //     { value: "AAC", label: "AAC" },
  //     { value: "GXA", label: "GXA" },
  //     { value: "BXG", label: "BXG" },
  //   ],
  //   machineName: [
  //     { value: "CNC-55688", label: "CNC-55688" },
  //     { value: "AAC-00847", label: "AAC-00847" },
  //     { value: "GXA-63008", label: "GXA-63008" },
  //     { value: "BXG-1330097", label: "BXG-1330097" },
  //   ],
  // };

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
            {Object.entries({
              machineType: "機台種類",
              modelSeries: "型號系列",
              machineName: "機台名稱",
            }).map(([key, label]) => (
              <Form.Group className="mb-3" key={key}>
                <Form.Label>
                  <span className="text-danger">*</span> {label}
                </Form.Label>
                <Select
                  options={options[key]}
                  className="basic-single"
                  classNamePrefix="select"
                  onChange={(option) => handleEditChange(option, key)}
                  onBlur={() => handleEditBlur(key)}
                  onFocus={() => fetchMachineOptions()} // 加載數據
                  value={options[key].find(
                    (option) => option.value === machineInfo[key],
                  )}
                />
                {errors[key] && (
                  <div className="invalid-feedback d-block">
                    <i className="fas fa-exclamation-circle"></i>{" "}
                    {t("helpWord.required")}
                  </div>
                )}
              </Form.Group>
            ))}
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
