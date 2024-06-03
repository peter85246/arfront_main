import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { apiGetMachineOptions, apiMachineAddOverview } from "../utils/Api";
import { useStore } from "../zustand/store";
import { useNavigate } from "react-router-dom";

export function AddingKnowledge({ onClose }) {
  const navigate = useNavigate();
  const { setIsCreatingSOP, setSOPInfo } = useStore();

  const { t } = useTranslation();
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(true);
  const [existsMachines, setExistsMachines] = useState(null);
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

  const fetchMachineOptions = async () => {
    try {
      const res = await apiMachineAddOverview({
        keyword: "",
        ...(machineInfo.machineType
          ? { machineType: machineInfo.machineType }
          : {}),
        ...(machineInfo.modelSeries
          ? { modelSeries: machineInfo.modelSeries }
          : {}),
        ...(machineInfo.machineName
          ? { machineName: machineInfo.machineName }
          : {}),
      });

      if (res?.code === "0000" && res?.result) {
        console.log(res);
        setOptions({
          machineType: res.machineType.map((label) => ({
            value: label,
            label: label,
          })),
          modelSeries: res.modelSeries.map((label) => ({
            value: label,
            label: label,
          })),
          machineName: res.machineName.map((label) => ({
            value: label,
            label: label,
          })),
          completeMachineOptions: res.result,
        });
      } else {
        console.error("Failed to load options:", res);
      }
    } catch (error) {
      console.error("Failed to fetch machine options:", error);
    }
  };

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
      const machineAddId = existsMachines.filter(
        (item) => item.machineName === machineInfo.machineName,
      )[0].machineAddId;
      setIsCreatingSOP(true);
      setSOPInfo({
        machineInfo: machineInfo,
        machineAddId: machineAddId,
      });
      navigate("/document-editor");
    }
  };

  useEffect(() => {
    const getExistsMachines = async () => {
      const res = await apiMachineAddOverview({ keyword: "" });
      if (res?.code === "0000" && res?.result) {
        setExistsMachines(res.result);
      } else {
        console.error("Failed to load existing machines:", res);
      }
    };
    getExistsMachines();
  }, []);

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
