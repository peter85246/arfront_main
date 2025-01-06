import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next'; //語系
import { useParams, useNavigate } from 'react-router-dom';
import { setWindowClass, removeWindowClass } from '../utils/helpers';
import { ToastContainer, toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { SOPName } from '../components/SOPName';
import styles from '../scss/global.module.scss';
import classNames from 'classnames';

// import styles from "../scss/AlarmDescription.module.scss";
import { Link } from 'react-router-dom';

import {
  apiGetAllSOPByMachineAddId,
  apiSaveSOP,
  apiGetAllKnowledgeBaseByFilter,
} from '../utils/Api';

import { Space, ColorPicker, theme } from 'antd';
import { generate, red, green, blue } from '@ant-design/colors';
import { useStore } from '../zustand/store';
import { useLocation } from 'react-router-dom';

function SOP2() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { knowledgeInfo, SOPData } = location.state;

  useEffect(() => {
    if (location.state?.SOPData) {
      console.log('Received SOP Data:', location.state.SOPData);
      setSOPs(location.state.SOPData);
      if (location.state.SOPData.length > 0) {
        setSelectSOP(location.state.SOPData[0]); // 选择第一个SOP展示
      }
    } else {
      console.log('No SOP Data received, calling refreshSOP');
      refreshSOP(); // 如果没有传递SOPData，则调用refreshSOP获取数据
    }
  }, [location.state?.SOPData]); // 只依赖 SOPData 改变

  const { SOPInfo, setSOPInfo } = useStore();
  console.log(SOPInfo);

  const { machineId, machineAddId } = useParams();

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

  const inputRemarksImageRef = useRef(null); // input File類型的備註圖片
  const [remarksImageError, setRemarksImageError] = useState(''); // 備註圖片格式錯誤

  const [saveSOPLoading, setSaveSOPLoading] = useState(false); //SOP儲存的轉圈圈

  const [selectDeleteSOPIndex, setSelectDeleteSOPIndex] = useState(-1); //要刪除的topic的index
  const [showDeleteSOPModal, setShowDeleteSOPModal] = useState(false); //顯示"刪除SOP modal"

  const [textColor, setTextColor] = useState('#000000'); // 初始文字顏色設為黑色
  const [isSOPName, setIsSOPName] = useState(false);

  const { token } = theme.useToken();
  // 生成顏色組合
  const presets = Object.entries({
    primary: generate('#0052cc'), // 這裡使用一個假設的主要顏色
    red: red,
    green: green,
    blue: blue,
  }).map(([label, colors]) => ({ label, colors }));

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
      id: machineAddId,
      isCommon: 0,
    };

    let getAllSOPResponse = await apiGetAllSOPByMachineAddId(sendData);
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

  // useEffect(() => {
  //   if (SOPInfo.sops) {
  //     const convertedSOPData = SOPInfo.sops?.map(item => ({
  //       ...item, sopModels: []
  //     }))
  //     setSOPs(convertedSOPData);
  //     setSelectSOP(convertedSOPData[0]);
  //   }
  // }, [SOPInfo])

  // useEffect(() => {
  //   if (SOPInfo && SOPInfo.sops) {
  //     const convertedSOPData = SOPInfo.sops.map(item => ({
  //       ...item, sopModels: []
  //     }));
  //     setSOPs(convertedSOPData);
  //     setSelectSOP(convertedSOPData[0]);
  //   }
  // }, [SOPInfo]);

  // useEffect(() => {
  //   if (SOPInfo.sops) {
  //     const convertedSOPData = SOPInfo.sops?.map(item => ({
  //       ...item, sopModels: []
  //     }))
  //     setSOPs(convertedSOPData);
  //     setSelectSOP(convertedSOPData[0]);
  //   }
  // }, [SOPInfo])

  useEffect(() => {
    // 確保 SOPInfo 不是 null 且 SOPInfo.sops 存在
    if (SOPInfo && SOPInfo.sops) {
      const convertedSOPData = SOPInfo.sops.map((item) => ({
        ...item,
        sopModels: [], // 重置或初始化 sopModels
      }));
      setSOPs(convertedSOPData);
      if (convertedSOPData.length > 0) {
        setSelectSOP(convertedSOPData[0]); // 選擇第一個 SOP
      } else {
        setSelectSOP(null); // 沒有 SOPs 時設置為 null
      }
    } else {
      // SOPInfo 為 null 或沒有 sops 時的處理
      setSOPs([]); // 清空 SOPs
      setSelectSOP(null); // 沒有選中的 SOP
    }
  }, [SOPInfo]);

  //#region 新增SOP
  const handleAddSOP = (e) => {
    let lastSOP = sops[sops.length - 1];
    let newSOPs = [...sops];
    let sop = {
      sopId: 0,
      deleted: 0,
      machineAddId: machineAddId,
      soP2Step: lastSOP != null ? lastSOP.soP2Step + 1 : 1,
      soP2Message: '',
      soP2Name: '', //test
      soP2Image: '',
      soP2ImageObj: null,
      isDeletedSOP2Image: false,
      /* 新增：sopRemarksMessage、sopRemarksImage、sopRemarksImageObj 三元素 */
      soP2Remark: '',
      soP2RemarkImage: '',
      soP2RemarkImageObj: null,
      isDeletedSOP2RemarkImage: false,
      sopVideo: '',
      sopVideoObj: null,
      isDeletedSOPVideo: false,
      plC1: '', // 更新字段名稱
      plC2: '', // 更新字段名稱
      plC3: '', // 更新字段名稱
      plC4: '', // 更新字段名稱
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
      const activeSops = sops.filter((sop) => sop.deleted !== 1);
      const actualSop = activeSops[index];
      const actualIndex = sops.findIndex(
        (sop) => sop.soP2Step === actualSop.soP2Step
      );
      setSelectDeleteSOPIndex(actualIndex);
      setShowDeleteSOPModal(true);
    } else {
      const activeSops = sops.filter((sop) => sop.deleted !== 1);
      const selectedSOP = activeSops[index];

      // 防止重複選擇相同的SOP
      if (
        selectedSOP &&
        (!selectSOP || selectSOP.soP2Step !== selectedSOP.soP2Step)
      ) {
        setSelectSOP(selectedSOP);

        // 重置輸入欄位
        if (inputImageRef.current) inputImageRef.current.value = '';
        if (inputVideoRef.current) inputVideoRef.current.value = '';
      }
    }
  };
  //#endregion

  // //#region 拖曳選單步驟
  // const onDragEnd = (event) => {
  //   const { source, destination } = event;

  //   if (!destination) {
  //     return;
  //   }

  //   let newSOPs = [...sops];
  //   const activeSops = newSOPs.filter((sop) => sop.deleted !== 1);
  //   const [removed] = activeSops.splice(source.index, 1);
  //   activeSops.splice(destination.index, 0, removed);

  //   // 重新排序步驟號
  //   activeSops.forEach((sop, index) => {
  //     sop.soP2Step = index + 1;
  //   });

  //   // 更新原始數組
  //   newSOPs = newSOPs.map((sop) => {
  //     if (sop.deleted === 1) return sop;
  //     const updatedSop = activeSops.find(
  //       (activeSop) => activeSop.sopId === sop.sopId
  //     );
  //     return updatedSop || sop;
  //   });

  //   setSOPs(newSOPs);
  // };
  // //#endregion

  //#region 拖曳選單步驟 (加入重新排序 step 的邏輯)
  const onDragEnd = (event) => {
    const { source, destination } = event;

    if (!destination) {
      return;
    }

    let newSOPs = [...sops];
    const [remove] = newSOPs.splice(source.index, 1);
    newSOPs.splice(destination.index, 0, remove);

    // 重新排序未刪除的步驟
    let stepCount = 1;
    newSOPs = newSOPs.map((sop) => {
      if (sop.deleted !== 1) {
        sop.soP2Step = stepCount++;
        return sop;
      }
      return sop;
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

  //#region 上傳步驟片按鈕
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
          newSelectSOP.soP2ImageObj = file;
          if (newSelectSOP.soP2Image != '') {
            newSelectSOP.isDeletedSOP2Image = true;
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

    newSelectSOP.soP2Image = ''; // 保持與後端一致的大小寫
    newSelectSOP.soP2ImageObj = null;
    newSelectSOP.isDeletedSOP2Image = true; // 保持與後端一致的大小寫

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

  //#region 上傳備註圖片按鈕
  const handleUploadRemarksImageBtn = (e) => {
    e.preventDefault();
    inputRemarksImageRef.current.click();
  };
  //#endregion

  //#region 上傳備註圖片Change事件
  const onRemarksImageChange = (e) => {
    var file;
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
        setRemarksImageError('format');
      } else {
        var img = new Image();
        var objectUrl = URL.createObjectURL(file);
        img.onload = function () {
          newSelectSOP.soP2RemarkImageObj = file;
          if (newSelectSOP.soP2RemarkImage != '') {
            newSelectSOP.isDeletedSOP2RemarksImage = true;
          }
          setSelectSOP(newSelectSOP);
        };
        img.src = objectUrl;
      }
    }
  };
  //#endregion

  //#region 移除備註圖片按鈕
  const handleRemoveRemarksImageBtn = (e) => {
    e.preventDefault();
    let newSelectSOP = { ...selectSOP };

    newSelectSOP.soP2RemarkImage = ''; // 保持與後端一致的大小寫
    newSelectSOP.soP2RemarkImageObj = null;
    newSelectSOP.isDeletedSOP2RemarkImage = true; // 保持與後端一致的大小寫

    setSelectSOP(newSelectSOP);
  };
  //#endregion

  //#region 更新SOPs
  useEffect(() => {
    if (selectSOP != null) {
      let newSOPs = [...sops];
      const index = newSOPs.findIndex(
        (sop) => sop.deleted !== 1 && sop.soP2Step === selectSOP.soP2Step
      );

      if (index !== -1) {
        // 確保不會重複添加相同的SOP
        newSOPs = newSOPs.map((sop) => {
          if (sop.deleted !== 1 && sop.soP2Step === selectSOP.soP2Step) {
            return selectSOP;
          }
          return sop;
        });
        setSOPs(newSOPs);
      }
    }
  }, [selectSOP]);
  //#endregion

  // useEffect(() => {
  //   console.log(sops);
  // }, [sops]);

  //#region 關閉刪除SOP Modal
  const handleCloseDeleteSOPModal = () => {
    setShowDeleteSOPModal(false);
    setSelectDeleteSOPIndex(-1);
  };
  //#endregion

  //#region 刪除SOP
  const handleSaveDeleteSOP = async () => {
    if (selectDeleteSOPIndex !== -1) {
      let newSOPs = [...sops];
      const deletedSOP = newSOPs[selectDeleteSOPIndex];

      if (deletedSOP.sopId > 0) {
        deletedSOP.deleted = 1;
        newSOPs[selectDeleteSOPIndex] = deletedSOP;
      } else {
        newSOPs.splice(selectDeleteSOPIndex, 1);
      }

      // 重新排序未刪除的步驟
      const activeSOPs = newSOPs.filter((sop) => sop.deleted !== 1);
      activeSOPs.forEach((sop, index) => {
        sop.soP2Step = index + 1;
      });

      // 更新原始數組中未刪除的SOP的步驟號
      newSOPs = newSOPs.map((sop) => {
        if (sop.deleted === 1) return sop;
        const updatedSop = activeSOPs.find(
          (activeSop) => activeSop.sopId === sop.sopId
        );
        return updatedSop || sop;
      });

      setSOPs(newSOPs);

      // 更新選中的SOP
      if (selectSOP && selectSOP.soP2Step === deletedSOP.soP2Step) {
        const previousSOP = activeSOPs.find(
          (sop) => sop.soP2Step === deletedSOP.soP2Step - 1
        );
        setSelectSOP(previousSOP || activeSOPs[0] || null);
      }

      setShowDeleteSOPModal(false);
      setSelectDeleteSOPIndex(-1);

      toast.success('刪除成功!', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
      });
    }
  };
  //#endregion

  //#region 儲存SOP
  const handleSaveSOP = async () => {
    // e.preventDefault();

    setSaveSOPLoading(true);
    console.log('sops', sops);
    setSOPInfo((prev) => ({ ...prev, sops: sops }));
    setIsSOPName((prev) => !prev);
  };
  //#endregion

  useEffect(() => {
    console.log('SOPs updated:', sops);
  }, [sops]);

  const handlePreview = () => {
    setSOPInfo((prev) => ({ ...prev, sops: sops }));
    // 確保狀態更新完成後再進行導航
    setTimeout(() => {
      navigate('/preview', { state: { step: 'sop2' } });
    }, 0); // 小延時確保狀態更新
  };

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
  // const handleSaveTempModel = async (e) => {
  //   e.preventDefault();
  //   let newTempModels = [...tempModels];

  //   //判斷圖片/檔案是否為空
  //   if (
  //     selectTempModel &&
  //     (selectTempModel.tempModelImageObj == null ||
  //       selectTempModel.tempModelFileObj == null)
  //   ) {
  //     let newSelectTempModelErrors = { ...selectTempModelErrors };
  //     if (selectTempModel.tempModelImageObj == null) {
  //       newSelectTempModelErrors.tempModelImage = 'required';
  //     }

  //     if (selectTempModel.tempModelFileObj == null) {
  //       newSelectTempModelErrors.tempModelFile = 'required';
  //     }

  //     setSelectTempModelErrors(newSelectTempModelErrors);
  //   } else {
  //     if (
  //       selectTempModelErrors.tempModelImage == '' &&
  //       selectTempModelErrors.tempModelFile == ''
  //     ) {
  //       newTempModels[selectTempModelIndex] = selectTempModel;

  //       setTempModels(newTempModels);
  //       setShowSaveTempModelModal(false);
  //     }
  //   }
  // };
  //#endregion

  //#region 儲存暫存 3DModel
  const handleSaveTempModel = async (e) => {
    e.preventDefault();
    let newTempModels = [...tempModels];
    let updatedSops = [...sops];

    // 檢查圖片和檔案是否皆已加載
    if (
      selectTempModel &&
      selectTempModel.tempModelImageObj &&
      selectTempModel.tempModelFileObj
    ) {
      // 更新臨時模型列表
      newTempModels[selectTempModelIndex] = selectTempModel;
      setTempModels(newTempModels);

      // 尋找當前選擇的SOP，並更新其sopModels
      const updatedSopIndex = updatedSops.findIndex(
        (sop) => sop.soP2Step === selectSOP.soP2Step
      );
      if (updatedSopIndex !== -1) {
        updatedSops[updatedSopIndex] = {
          ...updatedSops[updatedSopIndex],
          sopModels: [
            ...updatedSops[updatedSopIndex].sopModels,
            {
              sopModelId: 0, // 根據實際情況可調整
              sopModelImage: selectTempModel.tempModelImageName,
              sopModelImageObj: selectTempModel.tempModelImageObj,
              sopModelFile: selectTempModel.tempModelFileName,
              sopModelFileObj: selectTempModel.tempModelFileObj,
            },
          ],
        };
        setSOPs(updatedSops);
        setSelectSOP(updatedSops[updatedSopIndex]); // 更新當前選擇的SOP
      }

      setShowSaveTempModelModal(false); // 關閉模態窗口
    } else {
      // 處理錯誤情況：更新錯誤狀態
      let errors = {
        tempModelImage: selectTempModel.tempModelImageObj ? '' : 'required',
        tempModelFile: selectTempModel.tempModelFileObj ? '' : 'required',
      };
      setSelectTempModelErrors(errors);
    }
  };
  //#endregion

  //#region 拖曳Model
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
    var index = newSOPs.findIndex((x) => x.soP2Step == selectSOP.soP2Step);
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
    var sopIndex = newSOPs.findIndex((x) => x.soP2Step == selectSOP.soP2Step);
    newSOPs[sopIndex] = newSelectSOP;

    setSelectSOP(newSelectSOP);
    setSOPs(newSOPs);
  };
  //#endregion

  //#region 新增確認刪除的處理函數
  const handleConfirmDeleteSOP = () => {
    if (selectDeleteSOPIndex !== -1) {
      let newSOPs = [...sops];
      const currentStep = newSOPs[selectDeleteSOPIndex].soP2Step;

      // 標記當前步驟為已刪除
      newSOPs[selectDeleteSOPIndex].deleted = 1;

      // 重新排序剩餘步驟
      reorderSOPSteps(newSOPs);

      // 找到前一個未刪除的步驟
      const previousStep = newSOPs
        .filter((sop) => sop.deleted !== 1 && sop.soP2Step < currentStep)
        .pop();

      // 如果找到前一個步驟，則選中它
      if (previousStep) {
        setSelectSOP(previousStep);
      } else {
        // 如果沒有前一個步驟，找第一個未刪除的步驟
        const firstAvailableStep = newSOPs.find((sop) => sop.deleted !== 1);
        setSelectSOP(firstAvailableStep || null);
      }

      setSOPs(newSOPs);
      setShowDeleteSOPModal(false);
      setSelectDeleteSOPIndex(-1);

      // 顯示刪除成功提示
      toast.success('刪除成功!', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
      });
    }
  };
  //#endregion

  //#region 新增重新排序函數
  const reorderSOPSteps = (sops) => {
    let stepCount = 1;
    sops.forEach((sop) => {
      if (sop.deleted !== 1) {
        sop.soP2Step = stepCount++;
      }
    });
    return sops;
  };
  //#endregion

  const validateSOP = (sop) => {
    // 驗證必要字段
    if (!sop.soP2Step || !sop.soP2Message) {
      return false;
    }

    // 驗證圖片刪除標記與實際狀態是否一致
    if (sop.isDeletedSOP2Image && sop.soP2Image !== '') {
      return false;
    }

    if (sop.isDeletedSOP2RemarkImage && sop.soP2RemarkImage !== '') {
      return false;
    }

    return true;
  };

  return (
    <>
      <section className="content-header">
        <div className="container-fluid">
          <div className="d-flex mb-2 justify-content-between align-items-center">
            <div>
              <Link to="/knowledge" className={'fas fa-angle-left'}>
                {' '}
                知識庫
              </Link>
              <Link to="/document-editor" className={'fas fa-angle-left'}>
                {' '}
                故障說明
              </Link>
              {/* <i className="fas fa-angle-left"></i>&nbsp;&nbsp;{t("machineAlarm.content.header")}Alarm管理 */}
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
              <div className={styles['buttons-container']}>
                <button
                  type="button"
                  className={classNames(styles['button'], styles['btn-save'])}
                  onClick={() => handleSaveSOP()}
                >
                  <span>
                    {t('btn.save')}
                    {/*儲存*/}
                  </span>
                  {/* )} */}
                </button>
                <a
                  href="/knowledge"
                  className={classNames(styles['button'], styles['btn-cancel'])}
                >
                  取消
                </a>
                <div
                  className={classNames(
                    styles['button'],
                    styles['btn-preview']
                  )}
                  onClick={handlePreview}
                >
                  預覽
                </div>

                {/* <div className={styles['showMachine']}>
                  <a
                    href="#"
                    className={classNames(
                      styles['button'],
                      styles['btn-showMachine']
                    )}
                  >
                    {SOPInfo?.machineInfo?.machineName}
                  </a>
                </div> */}
              </div>
              {isSOPName && <SOPName onClose={() => setIsSOPName(false)} />}

              {/* <button
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
                    <i className="fas fa-plus"></i> {t("machineIOT.btn.save")}
                    儲存設定
                  </>
                )}
              </button> */}
            </div>
          </div>
        </div>
      </section>
      <section className="content" style={{ marginTop: 5 }}>
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
                        {sops
                          .filter((item) => item.deleted !== 1) // 只顯示未刪除的項目
                          .map((item, index) => (
                            <Draggable
                              key={index}
                              draggableId={item.soP2Step.toString()}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  ref={provided.innerRef}
                                >
                                  <div
                                    className={`card ${
                                      item.soP2Step === selectSOP?.soP2Step
                                        ? 'bg-info'
                                        : ''
                                    }`}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div
                                      className="card-body"
                                      onClick={(e) => handleSelectSOP(e, index)}
                                    >
                                      <div className="row">
                                        <div className="col-10">
                                          <span>Step {item.soP2Step}</span>
                                        </div>
                                        {index !== 0 && (
                                          <div className="col-2">
                                            <i className="fas fa-trash"></i>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
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
                            <div className={styles['text-area-container']}>
                              <label>{t('sop.sopMessage')}</label>
                              <textarea
                                className="form-control"
                                rows="8"
                                name="soP2Message"
                                maxLength="1000"
                                value={selectSOP.soP2Message}
                                onChange={(e) => handleSelectSOPChange(e)}
                                style={{ color: textColor }}
                              ></textarea>
                            </div>
                          </div>
                          <div className="form-group">
                            <div className={styles['text-area-container']}>
                              <label>{t('sop.sopRemarksMessage')}</label>
                              <textarea
                                className="form-control"
                                rows="8"
                                name="soP2Remark"
                                maxLength="1000"
                                value={selectSOP.soP2Remark}
                                onChange={(e) => handleSelectSOPChange(e)}
                                style={{ color: textColor }}
                              ></textarea>

                              {/* <div
                                className={styles['color-picker-container-sop']}
                              >
                                <Space direction="vertical">
                                  <ColorPicker
                                    defaultValue={textColor}
                                    size="small"
                                    onChange={(color) =>
                                      setTextColor(color.hex)
                                    }
                                  />
                                </Space>
                              </div> */}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-sm-12 col-md-6">
                          <div
                            className="form-group"
                            style={{ minHeight: '150px' }}
                          >
                            <label>
                              {t('sop.sopVideo')}
                              {/*步驟影片*/}
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
                              name="soP2Image"
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
                            style={{ minHeight: '150px' }}
                          >
                            <label>
                              {t('sop.sopImage')}
                              {/*步驟圖片*/}
                            </label>
                            <div className="d-flex align-items-center justify-content-center sop-file-view">
                              {selectSOP.soP2Image != '' ||
                              selectSOP.soP2ImageObj != null ? (
                                <img
                                  src={
                                    selectSOP.soP2ImageObj != null
                                      ? URL.createObjectURL(
                                          selectSOP.soP2ImageObj
                                        )
                                      : selectSOP.soP2Image
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
                              name="soP2Image"
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
                        <div className="col-sm-12 col-md-6">
                          <div
                            className="form-group"
                            style={{ minHeight: '150px', marginTop: '20px' }}
                          >
                            <label>
                              {t('sop.sopRemarksImage')}
                              {/*備註圖片*/}
                            </label>
                            <div className="d-flex align-items-center justify-content-center sop-file-view">
                              {selectSOP.soP2RemarkImage != '' ||
                              selectSOP.soP2RemarkImageObj != null ? (
                                <img
                                  src={
                                    selectSOP.soP2RemarkImageObj != null
                                      ? URL.createObjectURL(
                                          selectSOP.soP2RemarkImageObj
                                        )
                                      : selectSOP.soP2RemarkImage
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
                              onClick={(e) => handleUploadRemarksImageBtn(e)}
                            >
                              {t('sop.btn.uploadSopRemarksImage')}
                              {/*上傳圖片*/}
                            </button>
                            <input
                              type="file"
                              className="form-control d-none"
                              name="soP2Image"
                              ref={inputRemarksImageRef}
                              onChange={(e) => onRemarksImageChange(e)}
                              autoComplete="off"
                              accept="image/png, image/jpeg"
                            />{' '}
                            <button
                              className="btn btn-danger"
                              onClick={(e) => handleRemoveRemarksImageBtn(e)}
                            >
                              {t('sop.btn.removeSopRemarksImage')}
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
                                  name="plC1" // 修改為與後端一致的名稱
                                  maxLength="10"
                                  value={selectSOP.plC1} // 修改為與後端一致的名稱
                                  onChange={(e) => handleSelectSOPChange(e)}
                                />
                              </div>
                              <div className="col">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="PLC2"
                                  name="plC2"
                                  maxLength="10"
                                  value={selectSOP.plC2}
                                  onChange={(e) => handleSelectSOPChange(e)}
                                />
                              </div>
                              <div className="col">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="PLC3"
                                  name="plC3"
                                  maxLength="10"
                                  value={selectSOP.plC3}
                                  onChange={(e) => handleSelectSOPChange(e)}
                                />
                              </div>
                              <div className="col">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="PLC4"
                                  name="plC4"
                                  maxLength="10"
                                  value={selectSOP.plC4}
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
                    borderWidth: '3px', // 調整虛線的大小
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
        onHide={handleCloseDeleteSOPModal}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('sop.deleteSOP')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t('sop.deleteContent')}</p>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCloseDeleteSOPModal}
          >
            {t('btn.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirmDeleteSOP}
          >
            <span>{t('btn.confirm')}</span>
          </button>
        </Modal.Footer>
      </Modal>

      {isSOPName && <SOPName onClose={() => setIsSOPName(false)} />}
      <ToastContainer />
    </>
  );
}
export default SOP2;
