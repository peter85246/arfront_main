﻿import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next'; //語系
import { useParams, useNavigate } from 'react-router-dom';
import { setWindowClass, removeWindowClass } from '../utils/helpers';
import { ToastContainer, toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

import { apiGetAllSOPByMachineAlarmId, apiSaveSOP } from '../utils/Api';

function SOP() {
  const { t } = useTranslation();

  const { machineId, machineAlarmId } = useParams();

  const [tempModelNumbers, setTempModelNumbers] = useState(
    Array.from({ length: 12 }, (_, index) => index + 1)
  ); //建立12格3D Model List
  const [tempModels, setTempModels] = useState([]); //暫存 3D Model List的資料
  const [selectTempModelIndex, setSelectTempModelIndex] = useState(-1); //選擇暫存 3D Model的index
  const [selectTempModel, setSelectTempModel] = useState(null); //選擇暫存 3D Model的物件
  const [selectTempModelErrors, setSelectTempModelErrors] = useState({
    //選擇暫存 3D Model的錯誤訊息
    tempModelImage: '',
    tempModelFile: '',
  });
  const [showSaveTempModelModal, setShowSaveTempModelModal] = useState(false);
  const inputTempModelImageRef = useRef(null); //input File類型的 3D Model圖片

  const [sops, setSOPs] = useState([]); //SOP列表
  const [selectSOP, setSelectSOP] = useState(null); //選擇的SOP

  const inputImageRef = useRef(null); //input File類型的圖片
  const [imageError, setImageError] = useState(''); //圖片格式錯誤
  const inputVideoRef = useRef(null); //input File類型的影片
  const videoSrcRef = useRef(null); //input File類型的影片
  const [videoError, setVideoError] = useState(''); //影片格式錯誤

  const [saveSOPLoading, setSaveSOPLoading] = useState(false); //SOP儲存的轉圈圈

  const [selectDeleteSOPIndex, setSelectDeleteSOPIndex] = useState(-1); //要刪除的topic的index
  const [showDeleteSOPModal, setShowDeleteSOPModal] = useState(false); //顯示"刪除SOP modal"

  //#region 初始載入
  useEffect(() => {
    removeWindowClass('login-page');

    //建立12個待存放3D Model
    let newTempModels = [...tempModels];
    for (var i = 0; i < tempModelNumbers.length; i++) {
      newTempModels.push({
        tempModelImageName: '',
        tempModelImageObj: null,
        tempModelFileName: '',
        tempModelFileObj: null,
      });
    }
    setTempModels(newTempModels);

    const fetchData = async () => {
      await refreshSOP();
    };

    fetchData();
  }, []);
  //#endregion

  //#region 刷新SOP
  const refreshSOP = async () => {
    var sendData = {
      id: machineAlarmId,
      isCommon: 0,
    };

    let getAllSOPResponse = await apiGetAllSOPByMachineAlarmId(sendData);
    if (getAllSOPResponse) {
      if (getAllSOPResponse.code == '0000') {
        setSOPs(getAllSOPResponse.result);
        if (getAllSOPResponse.result.length > 0) {
          setSelectSOP(getAllSOPResponse.result[0]);
        }
      }
    }
  };
  //#endregion

  //#region 新增SOP
  const handleAddSOP = (e) => {
    let lastSOP = sops[sops.length - 1];
    let newSOPs = [...sops];
    let sop = {
      sopId: 0,
      deleted: 0,
      machineAlarmId: machineAlarmId,
      sopStep: lastSOP != null ? lastSOP.sopStep + 1 : 1,
      sopMessage: '',
      sopImage: '',
      sopImageObj: null,
      isDeletedSOPImage: false,
      sopVideo: '',
      sopVideoObj: null,
      isDeletedSOPVideo: false,
      sopplC1: '',
      sopplC2: '',
      sopplC3: '',
      sopplC4: '',
      sopModels: [],
    };

    newSOPs.push(sop);

    setSOPs(newSOPs);
    if (newSOPs.length == 1) {
      setSelectSOP(sop);
    }
  };
  //#endregion

  //#region 選擇SOP / 開啟刪除SOP modal
  const handleSelectSOP = (event, index) => {
    const target = event.target;

    if (target.classList.contains('fa-trash')) {
      setSelectDeleteSOPIndex(index);
      setShowDeleteSOPModal(true);
    } else {
      let tempSOP = sops[index];
      setSelectSOP(tempSOP);
      inputImageRef.current.value = '';
      inputVideoRef.current.value = '';
    }
  };
  //#endregion

  //#region 拖曳選單步驟
  const onDragEnd = (event) => {
    const { source, destination } = event; //source：被拖曳的卡片原先的 DroppableId 與順序；destination：被拖曳的卡片最終的 DroppableId 與順序

    if (!destination) {
      return;
    }

    let newSOPs = [...sops];
    const [remove] = newSOPs.splice(source.index, 1);
    newSOPs.splice(destination.index, 0, remove);

    //重新排序sopStep
    var i = 0;
    newSOPs.map((item, index) => {
      if (item.deleted != 1) {
        i++;
        return (item.sopStep = i);
      } else {
        return item;
      }
    });

    setSOPs(newSOPs);
  };
  //#endregion

  //#region 修改SOP 改變Input的欄位
  const handleSelectSOPChange = (e) => {
    const { name, value } = e.target;
    setSelectSOP({ ...selectSOP, [name]: value });
  };
  //#endregion

  //#region 上傳圖片按鈕
  const handleUploadImageBtn = (e) => {
    e.preventDefault();
    inputImageRef.current.click();
  };
  //#endregion

  //#region 上傳圖片Change事件
  const onImageChange = (e) => {
    var file, img;
    file = e.target.files[0];
    let newSelectSOP = { ...selectSOP };
    if (file != null) {
      var fileExtension = file.name
        .substr(file.name.lastIndexOf('.') + 1 - file.name.length)
        .toLowerCase();
      if (
        !(
          fileExtension == 'png' ||
          fileExtension == 'jpg' ||
          fileExtension == 'jpeg'
        )
      ) {
        setImageError('format');
      } else {
        var img = new Image();
        var objectUrl = URL.createObjectURL(file);
        img.onload = function () {
          newSelectSOP.sopImageObj = file;
          if (newSelectSOP.sopImage != '') {
            newSelectSOP.isDeletedSOPImage = true;
          }
          setSelectSOP(newSelectSOP);
        };
        img.src = objectUrl;
      }
    }
  };
  //#endregion

  //#region 移除圖片按鈕
  const handleRemoveImageBtn = (e) => {
    e.preventDefault();
    let newSelectSOP = { ...selectSOP };

    newSelectSOP.sopImage = '';
    newSelectSOP.sopImageObj = null;
    newSelectSOP.isDeletedSOPImage = true;

    setSelectSOP(newSelectSOP);
  };
  //#endregion

  //#region 上傳影片按鈕
  const handleUploadVideoBtn = (e) => {
    e.preventDefault();
    inputVideoRef.current.click();
  };
  //#endregion

  //#region 上傳影片Change事件
  const onVideoChange = (e) => {
    var file;
    file = e.target.files[0];
    let newSelectSOP = { ...selectSOP };
    if (file != null) {
      var fileExtension = file.name
        .substr(file.name.lastIndexOf('.') + 1 - file.name.length)
        .toLowerCase();
      if (!fileExtension == 'mp4') {
        setVideoError('format');
      } else {
        newSelectSOP.sopVideoObj = file;
        if (newSelectSOP.sopVideo != '') {
          newSelectSOP.isDeletedSOPVideo = true;
        }
        setSelectSOP(newSelectSOP);
      }
    }
  };
  //#endregion

  //#region 移除影片按鈕
  const handleRemoveVideoBtn = (e) => {
    e.preventDefault();
    let newSelectSOP = { ...selectSOP };

    newSelectSOP.sopVideo = '';
    newSelectSOP.sopVideoObj = null;
    newSelectSOP.isDeletedSOPVideo = true;

    setSelectSOP(newSelectSOP);
  };
  //#endregion

  //#region 更新SOPs
  useEffect(() => {
    console.log(selectSOP);
    if (selectSOP != null) {
      let index = -1;
      let newSOPs = [...sops];
      if (selectSOP.sopId > 0) {
        index = newSOPs.findIndex((x) => x.sopId == selectSOP.sopId);
      } else {
        index = newSOPs.findIndex((x) => x.sopStep == selectSOP.sopStep);
      }

      newSOPs[index] = selectSOP;
      setSOPs(newSOPs);
    }
  }, [selectSOP]);
  //#endregion

  useEffect(() => {
    console.log(sops);
  }, [sops]);

  //#region 關閉刪除SOP Modal
  const handleCloseDeleteSOPModal = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setSelectDeleteSOPIndex(-1);
    setShowDeleteSOPModal(false);
  };
  //#endregion

  //#region 刪除SOP
  const handleSaveDeleteSOP = async (e) => {
    let newSOPs = [...sops];
    let tempSOP = newSOPs[selectDeleteSOPIndex];

    if (tempSOP.sopId > 0) {
      tempSOP.deleted = 1;
      newSOPs[selectDeleteSOPIndex] = tempSOP;
    } else {
      newSOPs.splice(selectDeleteSOPIndex, 1);
    }

    var i = 0;
    newSOPs.map((item, index) => {
      if (item.deleted != 1) {
        i++;
        return (item.sopStep = i);
      } else {
        return item;
      }
    });

    setSOPs(newSOPs);
    if (tempSOP.sopStep == selectSOP.sopStep) {
      setSelectSOP(newSOPs[selectDeleteSOPIndex - 1]);
    }
    setShowDeleteSOPModal(false);
  };
  //#endregion

  //#region 儲存SOP
  const handleSaveSOP = async (e) => {
    e.preventDefault();

    setSaveSOPLoading(true);

    var formData = new FormData();
    formData.append(`machineAlarmId`, machineAlarmId);

    for (var i = 0; i < sops.length; i++) {
      formData.append(`sops[${i}].sopId`, sops[i].sopId);
      formData.append(`sops[${i}].deleted`, sops[i].deleted);
      formData.append(`sops[${i}].MachineAlarmId`, sops[i].machineAlarmId);
      formData.append(`sops[${i}].sopStep`, sops[i].sopStep);
      formData.append(`sops[${i}].sopMessage`, sops[i].sopMessage);
      formData.append(`sops[${i}].sopImage`, sops[i].sopImage);
      formData.append(`sops[${i}].sopImageObj`, sops[i].sopImageObj);
      formData.append(
        `sops[${i}].isDeletedSOPImage`,
        sops[i].isDeletedSOPImage
      );
      formData.append(`sops[${i}].sopVideo`, sops[i].sopVideo);
      formData.append(`sops[${i}].sopVideoObj`, sops[i].sopVideoObj);
      formData.append(
        `sops[${i}].isDeletedSOPVideo`,
        sops[i].isDeletedSOPVideo
      );
      formData.append(`sops[${i}].sopPLC1`, sops[i].sopplC1);
      formData.append(`sops[${i}].sopPLC2`, sops[i].sopplC2);
      formData.append(`sops[${i}].sopPLC3`, sops[i].sopplC3);
      formData.append(`sops[${i}].sopPLC4`, sops[i].sopplC4);

      for (var j = 0; j < sops[i].sopModels.length; j++) {
        formData.append(
          `sops[${i}].sopModels[${j}].sopModelId`,
          sops[i].sopModels[j].sopModelId
        );
        formData.append(
          `sops[${i}].sopModels[${j}].deleted`,
          sops[i].sopModels[j].deleted
        );
        formData.append(
          `sops[${i}].sopModels[${j}].sopId`,
          sops[i].sopModels[j].sopId
        );
        formData.append(
          `sops[${i}].sopModels[${j}].sopModelImage`,
          sops[i].sopModels[j].sopModelImage
        );
        formData.append(
          `sops[${i}].sopModels[${j}].sopModelImageObj`,
          sops[i].sopModels[j].sopModelImageObj
        );
        formData.append(
          `sops[${i}].sopModels[${j}].sopModelFile`,
          sops[i].sopModels[j].sopModelFile
        );
        formData.append(
          `sops[${i}].sopModels[${j}].sopModelFileObj`,
          sops[i].sopModels[j].sopModelFileObj
        );
      }
    }

    let saveSOPResponse = await apiSaveSOP(formData);
    if (saveSOPResponse) {
      if (saveSOPResponse.code == '0000') {
        refreshSOP();
        toast.success(t('toast.save.success'), {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
          onClose: () => {},
        });
      } else {
        toast.error(saveSOPResponse.message, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
        });
      }
      setSaveSOPLoading(false);
    } else {
      setSaveSOPLoading(false);
    }
  };
  //#endregion

  //#region 開啟上傳暫存3DModel Modal / 清空暫存3DModel
  const handleOpenSaveTempModelBtn = (event, index) => {
    const target = event.target;

    if (target.classList.contains('fa-times')) {
      let newTempModels = [...tempModels];
      newTempModels[index] = {
        tempModelImageName: '',
        tempModelImageObj: null,
        tempModelFileName: '',
        tempModelFileObj: null,
      };
      setTempModels(newTempModels);
    } else {
      setSelectTempModelIndex(index);
      setSelectTempModel(tempModels[index]);
      setSelectTempModelErrors({
        tempModelImage: '',
        tempModelFile: '',
      });
      setShowSaveTempModelModal(true);
    }
  };
  //#endregion

  //#region 關閉上傳暫存3DModel Modal
  const handleCloseSaveTempModelModal = () => {
    setSelectTempModelIndex(-1);
    setSelectTempModel(null);
    setShowSaveTempModelModal(false);
  };
  //#endregion

  //#region 上傳3DModel圖片按鈕
  const handleUploadTempModelImageBtn = (e) => {
    e.preventDefault();
    inputTempModelImageRef.current.click();
  };
  //#endregion

  //#region 上傳3DModel圖片Change事件
  const onTempModelImageChange = (e) => {
    var file, img;
    file = e.target.files[0];
    let newSelectTempModel = { ...selectTempModel };
    let newSelectTempModelErrors = { ...selectTempModelErrors };
    if (file != null) {
      let newSelectTempModelErrors = { ...selectTempModelErrors };
      var fileExtension = file.name
        .substr(file.name.lastIndexOf('.') + 1 - file.name.length)
        .toLowerCase();
      if (
        !(
          fileExtension == 'png' ||
          fileExtension == 'jpg' ||
          fileExtension == 'jpeg'
        )
      ) {
        newSelectTempModelErrors.tempModelImage = 'format';

        newSelectTempModel.tempModelImageName = '';
        newSelectTempModel.tempModelImageObj = null;

        setSelectTempModel(newSelectTempModel);
        setSelectTempModelErrors(newSelectTempModelErrors);
      } else {
        var img = new Image();
        var objectUrl = URL.createObjectURL(file);
        img.onload = function () {
          newSelectTempModelErrors.tempModelImage = '';

          newSelectTempModel.tempModelImageName = file.name;
          newSelectTempModel.tempModelImageObj = file;

          setSelectTempModel(newSelectTempModel);
          setSelectTempModelErrors(newSelectTempModelErrors);
        };
        img.src = objectUrl;
      }
    } else {
      newSelectTempModelErrors.tempModelImage = '';
      setSelectTempModelErrors(newSelectTempModelErrors);
    }
  };
  //#endregion

  //#region 上傳檔案Change事件
  const onFileChange = (e) => {
    let newSelectTempModel = { ...selectTempModel };
    let newSelectTempModelErrors = { ...selectTempModelErrors };
    var file = e.target.files[0];
    if (file != null) {
      var fileExtension = file.name
        .substr(file.name.lastIndexOf('.') + 1 - file.name.length)
        .toLowerCase();
      if (!(fileExtension == 'zip')) {
        newSelectTempModelErrors.tempModelFile = 'format';
        newSelectTempModel.tempModelFileObj = null;
      } else {
        newSelectTempModelErrors.tempModelFile = '';
        newSelectTempModel.tempModelFileObj = file;
      }
      setSelectTempModelErrors(newSelectTempModelErrors);
      setSelectTempModel(newSelectTempModel);
    } else {
      newSelectTempModelErrors.tempModelFile = '';
      setSelectTempModelErrors(newSelectTempModelErrors);
    }
  };
  //#endregion

  //#region 儲存暫存 3DModel
  const handleSaveTempModel = async (e) => {
    e.preventDefault();
    let newTempModels = [...tempModels];

    //判斷圖片/檔案是否為空
    if (
      selectTempModel &&
      (selectTempModel.tempModelImageObj == null ||
        selectTempModel.tempModelFileObj == null)
    ) {
      let newSelectTempModelErrors = { ...selectTempModelErrors };
      if (selectTempModel.tempModelImageObj == null) {
        newSelectTempModelErrors.tempModelImage = 'required';
      }

      if (selectTempModel.tempModelFileObj == null) {
        newSelectTempModelErrors.tempModelFile = 'required';
      }

      setSelectTempModelErrors(newSelectTempModelErrors);
    } else {
      if (
        selectTempModelErrors.tempModelImage == '' &&
        selectTempModelErrors.tempModelFile == ''
      ) {
        newTempModels[selectTempModelIndex] = selectTempModel;

        setTempModels(newTempModels);
        setShowSaveTempModelModal(false);
      }
    }
  };
  //#endregion

  //#region 拖曳Modle
  const onModelDragEnd = (event) => {
    const { source, destination } = event; //source：被拖曳的卡片原先的 DroppableId 與順序；destination：被拖曳的卡片最終的 DroppableId 與順序

    if (!destination) {
      return;
    }

    if (
      source.droppableId == '3DModel' &&
      destination.droppableId == '3DModel'
    ) {
      return;
    }

    let newSOPs = [...sops];
    let newTempModels = [...tempModels];
    let newSelectSOP = { ...selectSOP };

    const [remove] = newTempModels.splice(source.index, 1);

    if (remove.tempModelImageObj == null || remove.tempModelFileObj == null) {
      return;
    }

    if (destination.droppableId == '3DModel') {
      var newModel = {
        sopModelId: 0,
        deleted: 0,
        sopId: newSelectSOP.sopId,
        sopModelImage: remove.tempModelImageName,
        sopModelImageObj: remove.tempModelImageObj,
        sopModelFile: remove.tempModelFileName,
        sopModelFileObj: remove.tempModelFileObj,
      };

      newSelectSOP.sopModels.splice(destination.index, 0, newModel);
    }

    //更新整個sops
    var index = newSOPs.findIndex((x) => x.sopStep == selectSOP.sopStep);
    newSOPs[index] = newSelectSOP;

    setSelectSOP(newSelectSOP);
    setSOPs(newSOPs);
  };
  //#endregion

  //#region 清空3DModel
  const handleCleanModelBtn = (index) => {
    let newSOPs = [...sops];
    let newSelectSOP = { ...selectSOP };

    if (newSelectSOP.sopModels[index].sopModelId != 0) {
      newSelectSOP.sopModels[index].deleted = 1;
    } else {
      const [remove] = newSelectSOP.sopModels.splice(index, 1);
    }

    //更新整個sops
    var sopIndex = newSOPs.findIndex((x) => x.sopStep == selectSOP.sopStep);
    newSOPs[sopIndex] = newSelectSOP;

    setSelectSOP(newSelectSOP);
    setSOPs(newSOPs);
  };
  //#endregion

  return (
    <>
      <section className="content-header">
        <div className="container-fluid">
          <div className="d-flex mb-2 justify-content-between align-items-center">
            <div>
              <a
                href={`/machine/${machineId}/machineAlarm`}
                className="d-flex align-items-center"
              >
                <i className="fas fa-angle-left"></i>&nbsp;&nbsp;
                {t('machineAlarm.content.header')}
                {/*Alarm管理*/}
              </a>
            </div>
            <div className="content-header-text-color">
              <h1>
                <strong>
                  {t('sop.content.header')}
                  {/*SOP*/}
                </strong>
              </h1>
            </div>
            <div>
              <button
                type="button"
                className="btn btn-primary btn-add"
                disabled={saveSOPLoading}
                onClick={(e) => handleSaveSOP(e)}
              >
                {saveSOPLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus"></i> {t('machineIOT.btn.save')}
                    {/*儲存設定*/}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-12 col-md-2 mb-2">
              <div className="sop-col-border-l">
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="sop-step">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                      >
                        {sops.map((item, index) => {
                          if (item.deleted == 0) {
                            return (
                              <Draggable
                                key={index}
                                draggableId={item.sopStep.toString()}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    ref={provided.innerRef}
                                  >
                                    <div
                                      className={`card ${item.sopStep == selectSOP.sopStep ? 'bg-info' : ''}`}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <div
                                        className="card-body"
                                        onClick={(e) =>
                                          handleSelectSOP(e, index)
                                        }
                                      >
                                        <div className="row">
                                          <div className="col-10">
                                            <span>Step {item.sopStep}</span>
                                          </div>
                                          {index != 0 ? (
                                            <div className="col-2">
                                              <i className="fas fa-trash"></i>
                                            </div>
                                          ) : (
                                            <></>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          }
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <div
                  className="card"
                  style={{ cursor: 'pointer', marginBottom: 0 }}
                  onClick={() => handleAddSOP()}
                >
                  <div className="card-body text-center text-info">
                    <i className="fas fa-plus"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-12 col-md-10 mb-2">
              <div className="sop-col-border-r">
                {selectSOP != null ? (
                  <div className="row">
                    <div className="col-sm-12 col-md-8 mb-2">
                      <div className="row mb-3">
                        <div className="col-12">
                          <div className="form-group">
                            <label>
                              {t('sop.sopMessage')}
                              {/*步驟資訊*/}
                            </label>
                            <textarea
                              className="form-control"
                              rows="8"
                              name="sopMessage"
                              maxLength="1000"
                              value={selectSOP.sopMessage}
                              onChange={(e) => handleSelectSOPChange(e)}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-sm-12 col-md-6">
                          <div
                            className="form-group"
                            style={{ minHeight: '300px' }}
                          >
                            <label>
                              {t('sop.sopVideo')}
                              {/*影片*/}
                            </label>
                            <div className="d-flex align-items-center justify-content-center sop-file-view">
                              {selectSOP.sopVideo != '' ||
                              selectSOP.sopVideoObj != null ? (
                                <video
                                  ref={videoSrcRef}
                                  width="100%"
                                  controls
                                  src={
                                    selectSOP.sopVideoObj != null
                                      ? URL.createObjectURL(
                                          selectSOP.sopVideoObj
                                        )
                                      : selectSOP.sopVideo
                                  }
                                ></video>
                              ) : (
                                <></>
                              )}
                            </div>
                            {(() => {
                              switch (videoError) {
                                case 'format':
                                  return (
                                    <div className="invalid-feedback d-block">
                                      <i className="fas fa-exclamation-circle"></i>{' '}
                                      {t('helpWord.imageFormat')}
                                      {/*圖片格式不正確*/}
                                    </div>
                                  );
                                default:
                                  return null;
                              }
                            })()}
                          </div>
                          <div className="mt-3">
                            <button
                              className="btn btn-primary"
                              onClick={(e) => handleUploadVideoBtn(e)}
                            >
                              {t('sop.btn.uploadSopVideo')}
                              {/*上傳影片*/}
                            </button>
                            <input
                              type="file"
                              className="form-control d-none"
                              name="sopImage"
                              ref={inputVideoRef}
                              onChange={(e) => onVideoChange(e)}
                              autoComplete="off"
                              accept="video/mp4"
                            />{' '}
                            <button
                              className="btn btn-danger"
                              onClick={(e) => handleRemoveVideoBtn(e)}
                            >
                              {t('sop.btn.removeSopVideo')}
                              {/*移除影片*/}
                            </button>
                          </div>
                        </div>
                        <div className="col-sm-12 col-md-6">
                          <div
                            className="form-group"
                            style={{ minHeight: '300px' }}
                          >
                            <label>
                              {t('sop.sopImage')}
                              {/*圖片*/}
                            </label>
                            <div className="d-flex align-items-center justify-content-center sop-file-view">
                              {selectSOP.sopImage != '' ||
                              selectSOP.sopImageObj != null ? (
                                <img
                                  alt="not found"
                                  src={
                                    selectSOP.sopImageObj != null
                                      ? URL.createObjectURL(
                                          selectSOP.sopImageObj
                                        )
                                      : selectSOP.sopImage
                                  }
                                  style={{ width: '100%' }}
                                />
                              ) : (
                                <></>
                              )}
                            </div>
                            {(() => {
                              switch (imageError) {
                                case 'format':
                                  return (
                                    <div className="invalid-feedback d-block">
                                      <i className="fas fa-exclamation-circle"></i>{' '}
                                      {t('helpWord.imageFormat')}
                                      {/*圖片格式不正確*/}
                                    </div>
                                  );
                                default:
                                  return null;
                              }
                            })()}
                          </div>
                          <div className="mt-3">
                            <button
                              className="btn btn-primary"
                              onClick={(e) => handleUploadImageBtn(e)}
                            >
                              {t('sop.btn.uploadSopImage')}
                              {/*上傳圖片*/}
                            </button>
                            <input
                              type="file"
                              className="form-control d-none"
                              name="sopImage"
                              ref={inputImageRef}
                              onChange={(e) => onImageChange(e)}
                              autoComplete="off"
                              accept="image/png, image/jpeg"
                            />{' '}
                            <button
                              className="btn btn-danger"
                              onClick={(e) => handleRemoveImageBtn(e)}
                            >
                              {t('sop.btn.removeSopImage')}
                              {/*移除圖片*/}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12">
                          <div className="form-group">
                            <label>PLC</label>
                            <div className="row">
                              <div className="col">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="PLC1"
                                  name="sopplC1"
                                  maxLength="10"
                                  value={selectSOP.sopplC1}
                                  onChange={(e) => handleSelectSOPChange(e)}
                                />
                              </div>
                              <div className="col">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="PLC2"
                                  name="sopplC2"
                                  maxLength="10"
                                  value={selectSOP.sopplC2}
                                  onChange={(e) => handleSelectSOPChange(e)}
                                />
                              </div>
                              <div className="col">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="PLC3"
                                  name="sopplC3"
                                  maxLength="10"
                                  value={selectSOP.sopplC3}
                                  onChange={(e) => handleSelectSOPChange(e)}
                                />
                              </div>
                              <div className="col">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="PLC4"
                                  name="sopplC4"
                                  maxLength="10"
                                  value={selectSOP.sopplC4}
                                  onChange={(e) => handleSelectSOPChange(e)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-12 col-md-4 mb-2">
                      <DragDropContext onDragEnd={onModelDragEnd}>
                        <div className="row">
                          <div className="col-12">
                            <div className="form-group">
                              <label>3D Model List</label>

                              <Droppable droppableId="3DModelList">
                                {(provided) => (
                                  <div
                                    className="row"
                                    {...provided.droppableProps}
                                    {...provided.dragHandleProps}
                                    ref={provided.innerRef}
                                  >
                                    {tempModelNumbers.map((item, index) => {
                                      return (
                                        <Draggable
                                          key={index}
                                          draggableId={`3DModelList-index-${index}`}
                                          index={index}
                                        >
                                          {(provided) => (
                                            <div
                                              className="col-sm-6 col-md-3 mb-2 d-flex justify-content-center"
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              ref={provided.innerRef}
                                            >
                                              <div
                                                className="sop-model-col"
                                                onClick={(e) =>
                                                  handleOpenSaveTempModelBtn(
                                                    e,
                                                    index
                                                  )
                                                }
                                              >
                                                {tempModels[index]
                                                  .tempModelImageObj != null ? (
                                                  <img
                                                    src={URL.createObjectURL(
                                                      tempModels[index]
                                                        .tempModelImageObj
                                                    )}
                                                    style={{
                                                      width: '100%',
                                                      height: '100%',
                                                    }}
                                                  />
                                                ) : (
                                                  <></>
                                                )}
                                                {tempModels[index]
                                                  .tempModelImageObj != null ? (
                                                  <div
                                                    className="remove-temp-model"
                                                    style={{
                                                      position: 'absolute',
                                                      top: '0px',
                                                      right: '7px',
                                                    }}
                                                  >
                                                    <i className="fas fa-times"></i>
                                                  </div>
                                                ) : (
                                                  <></>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      );
                                    })}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex justify-content-center">
                          <i className="fas fa-angle-double-down"></i>
                        </div>
                        <div className="row">
                          <div className="col-12">
                            <div className="form-group">
                              <label>3D Model</label>
                              <Droppable droppableId="3DModel">
                                {(provided) => (
                                  <div
                                    className="row w-100"
                                    style={{ minHeight: '345px' }}
                                    {...provided.droppableProps}
                                    {...provided.dragHandleProps}
                                    ref={provided.innerRef}
                                  >
                                    {selectSOP &&
                                      selectSOP.sopModels.map((item, index) => {
                                        if (item.deleted == 0) {
                                          return (
                                            <Draggable
                                              key={index}
                                              draggableId={`3DModel-index-${index}`}
                                              index={index}
                                            >
                                              {(provided) => (
                                                <div
                                                  className="col-sm-6 col-md-3 mb-2 d-flex justify-content-center"
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                  ref={provided.innerRef}
                                                >
                                                  {item.sopModelImage != '' ||
                                                  item.sopModelImageObj !=
                                                    null ? (
                                                    <div className="sop-model-col">
                                                      <img
                                                        src={
                                                          item.sopModelImageObj !=
                                                          null
                                                            ? URL.createObjectURL(
                                                                item.sopModelImageObj
                                                              )
                                                            : item.sopModelImage
                                                        }
                                                        style={{
                                                          width: '100%',
                                                          height: '100%',
                                                        }}
                                                      />
                                                      <div
                                                        className="remove-temp-model"
                                                        style={{
                                                          position: 'absolute',
                                                          top: '0px',
                                                          right: '7px',
                                                        }}
                                                        onClick={() =>
                                                          handleCleanModelBtn(
                                                            index
                                                          )
                                                        }
                                                      >
                                                        <i className="fas fa-times"></i>
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <></>
                                                  )}
                                                </div>
                                              )}
                                            </Draggable>
                                          );
                                        }
                                      })}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </div>
                        </div>
                      </DragDropContext>
                    </div>
                  </div>
                ) : (
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: '80vh' }}
                  >
                    <div>
                      <strong>
                        {t('sop.emptySelectSOP')}
                        {/*尚未選擇SOP*/}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ToastContainer />

      {/*save temp model modal - start*/}
      <Modal
        show={showSaveTempModelModal}
        onHide={(e) => handleCloseSaveTempModelModal(e)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>3D Model List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="row">
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t('sop.tempModelImage')}
                  {/*3D模型圖片*/}
                </label>
                <input
                  type="file"
                  className="form-control d-none"
                  name="machineImage"
                  ref={inputTempModelImageRef}
                  onChange={(e) => onTempModelImageChange(e)}
                  autoComplete="off"
                  accept="image/png, image/jpeg"
                />
                <div
                  style={{
                    borderStyle: 'dotted',
                    cursor: 'pointer',
                    minHeight: '240px',
                  }}
                  className="d-flex justify-content-center align-items-center"
                  onClick={(e) => handleUploadTempModelImageBtn(e)}
                >
                  {selectTempModel &&
                  selectTempModel.tempModelImageObj != null ? (
                    <img
                      alt="not found"
                      style={{ width: '100px', height: '100px' }}
                      src={
                        selectTempModel.tempModelImageObj != null
                          ? URL.createObjectURL(
                              selectTempModel.tempModelImageObj
                            )
                          : null
                      }
                    />
                  ) : (
                    <span>
                      {t('machine.uploadImage')}
                      {/*上傳圖片*/}
                    </span>
                  )}
                </div>
                {(() => {
                  switch (selectTempModelErrors.tempModelImage) {
                    case 'required':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.required')}
                          {/*不得空白*/}
                        </div>
                      );
                    case 'format':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.imageFormat')}
                          {/*圖片格式不正確*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t('sop.tempModelFile')}
                  {/*3D模型檔案*/}
                </label>
                <br />
                {(() => {
                  var fileExtension = '';
                  if (
                    selectTempModel &&
                    selectTempModel.tempModelFileObj != null
                  ) {
                    fileExtension = selectTempModel.tempModelFileObj.name
                      .substr(
                        selectTempModel.tempModelFileObj.name.lastIndexOf('.') +
                          1 -
                          selectTempModel.tempModelFileObj.name.length
                      )
                      .toLowerCase();
                  }

                  return fileExtension != '' ? (
                    <img src={`/${fileExtension}.png`} />
                  ) : null;
                })()}
                <input
                  type="file"
                  className="form-control"
                  name="tempModelFile"
                  onChange={(e) => onFileChange(e)}
                  autoComplete="off"
                  accept=".zip"
                />
                {(() => {
                  switch (selectTempModelErrors.tempModelFile) {
                    case 'required':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.required')}
                          {/*不得空白*/}
                        </div>
                      );
                    case 'format':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.imageFormat')}
                          {/*檔案格式不正確*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={(e) => handleCloseSaveTempModelModal(e)}
          >
            {t('btn.cancel')}
            {/*取消*/}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => handleSaveTempModel(e)}
          >
            <span>
              {t('btn.confirm')}
              {/*確定*/}
            </span>
          </button>
        </Modal.Footer>
      </Modal>
      {/*add temp model modal - end*/}

      {/*delete topic modal - start*/}
      <Modal
        show={showDeleteSOPModal}
        onHide={(e) => handleCloseDeleteSOPModal(e)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t('sop.deleteSOP')}
            {/*刪除SOP*/}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {t('sop.deleteContent')}
            {/*您確定要刪除該筆資料嗎?*/}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={(e) => handleCloseDeleteSOPModal(e)}
          >
            {t('btn.cancel')}
            {/*取消*/}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => handleSaveDeleteSOP(e)}
          >
            <span>
              {t('btn.confirm')}
              {/*確定*/}
            </span>
          </button>
        </Modal.Footer>
      </Modal>
      {/*delete machine modal - end*/}
    </>
  );
}
export default SOP;
