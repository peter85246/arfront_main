import React, { useContext, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next'; //語系
import { setWindowClass, removeWindowClass } from '../utils/helpers';
import { MyUserContext } from '../contexts/MyUserContext';
import { DebounceInput } from 'react-debounce-input';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import SimpleReactValidator from 'simple-react-validator';
import reactStringReplace from 'react-string-replace';
import Pagination from 'react-bootstrap/Pagination';

import {
  apiGetAllUserinfoByFilter,
  apiAddUserinfo,
  apiEditUserinfo,
  apiDeleteUserinfo,
  apiUserinfoChangePaw,
} from '../utils/Api';

function UserManage() {
  const { t } = useTranslation();
  const { myUser } = useContext(MyUserContext);
  const [keyword, setKeyword] = useState(''); //關鍵字
  const [userinfos, setUserinfos] = useState([]); //使用者列表
  const [showUserinfos, setShowUserinfos] = useState([]); //使用者列表(顯示前端)
  const [showAddUserinfoModal, setShowAddUserinfoModal] = useState(false); //顯示"新增使用者modal"
  const [addUserinfo, setAddUserinfo] = useState({
    //新增單一使用者
    userId: 0,
    userName: '',
    userAccount: '',
    userPaw: '',
    userAgainPaw: '',
    userLevel: 0,
  });
  const [addUserinfoErrors, setAddUserinfoErrors] = useState({
    //新增單一使用者錯誤訊息
    userName: '',
    userAccount: '',
    userPaw: '',
    userAgainPaw: '',
  });
  const [saveUserinfoLoading, setSaveUserinfoLoading] = useState(false);
  const [showEditUserinfoModal, setEditUserinfoModal] = useState(false); //顯示"修改使用者modal"
  const [editUserinfo, setEditUserinfo] = useState({
    //修改單一使用者
    userId: 0,
    userName: '',
    userAccount: '',
    userLevel: 0,
  });
  const [editUserinfoErrors, setEditUserinfoErrors] = useState({
    //修改單一使用者錯誤訊息
    userName: '',
    userLevel: '',
  });
  const [saveEditUserinfoLoading, setSaveEditUserinfoLoading] = useState(false);

  const [selectDeleteId, setSelectDeleteId] = useState(0); //要刪除的使用者id
  const [showDeleteUserinfoModal, setShowDeleteUserinfoModal] = useState(false); //顯示"刪除使用者modal"
  const [saveDeleteUserinfoLoading, setSaveDeleteUserinfoLoading] =
    useState(false);

  const [selectChangePawId, setSelectChangePawId] = useState(0); //要修改密碼的使用者id
  const [showUserinfoChangePawModal, setShowUserinfoChangePawModal] =
    useState(false); //顯示"修改使用者密碼modal"
  const [saveUserinfoChangePawLoading, setSaveUserinfoChangePawLoading] =
    useState(false);
  const [userinfoChangePawErrors, setUserinfoChangePawErrors] = useState({
    //修改密碼錯誤訊息
    newPaw: '',
    againPaw: '',
  });

  const userPaw = useRef(''); //密碼
  const userAgainPaw = useRef(''); //再次輸入密碼

  const newPaw = useRef(''); //新密碼
  const againPaw = useRef(''); //再次輸入密碼

  const validator = new SimpleReactValidator({
    validators: {
      pawFormat: {
        rule: (val, params, validator) => {
          let result = false;

          if (val.length < 6 || val.length > 30) {
            return result;
          }

          let strRep = reactStringReplace(val, /(\d+)/g, (match, i) => '');
          strRep = reactStringReplace(strRep, /([a-zA-Z])/g, (match, i) => '');
          strRep = reactStringReplace(
            strRep,
            /([,.~!@#$%^&*_+-=])/g,
            (match, i) => ''
          );

          if (strRep.join('') == '') {
            result = true;
          }

          return result;
        },
      },
    },
    autoForceUpdate: this,
  });

  //#region 初始載入
  useEffect(() => {
    removeWindowClass('login-page');

    const fetchData = async () => {
      await refreshUserinfos();
    };

    fetchData();
  }, [keyword]);
  //#endregion

  //#region 刷新使用者列表
  const refreshUserinfos = async () => {
    var sendData = {
      keyword: keyword,
    };

    let userinfosResponse = await apiGetAllUserinfoByFilter(sendData);
    if (userinfosResponse) {
      if (userinfosResponse.code == '0000') {
        setUserinfos(userinfosResponse.result);
        setShowUserinfos(
          userinfosResponse.result.slice(
            activePage * pageRow - pageRow,
            activePage * pageRow
          )
        );
      }
    }
  };
  //#endregion

  //#region 頁碼
  let pageRow = 10; //一頁幾筆
  const [activePage, setActivePage] = useState(1); //目前停留頁碼
  let pages = []; //頁碼
  for (
    let number = 1;
    number <= Math.ceil(userinfos.length / pageRow);
    number++
  ) {
    pages.push(
      <Pagination.Item
        key={number}
        active={number === activePage}
        onClick={(e) => handleChangePage(e, number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  const handleChangePage = async (e, number) => {
    setActivePage(number);
    setShowUserinfos(
      userinfos.slice(number * pageRow - pageRow, number * pageRow)
    );
  };
  //#endregion

  //#region 關鍵字
  const handleChangeKeyword = async (e) => {
    const { name, value } = e.target;
    setKeyword(value);
  };
  //#endregion

  //#region 開啟新增使用者Modal
  const handleOpenAddUserinfoModal = async (e) => {
    e.preventDefault();
    setAddUserinfo({
      userId: 0,
      userName: '',
      userAccount: '',
      userPaw: '',
      userAgainPaw: '',
      userLevel: 1,
    });

    setAddUserinfoErrors({
      userName: '',
      userAccount: '',
      userPaw: '',
      userAgainPaw: '',
    });

    setShowAddUserinfoModal(true);
  };
  //#endregion

  //#region 關閉新增使用者Modal
  const handleCloseAddUserinfoModal = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setShowAddUserinfoModal(false);
  };
  //#endregion

  //#region 新增使用者 改變Input的欄位
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddUserinfo({ ...addUserinfo, [name]: value });
  };
  //#endregion

  //#region 新增使用者 失去焦點Input的欄位
  const handleAddBlur = async (e) => {
    const { name, value } = e.target;

    await checkAddValidator(name);
  };
  //#endregion

  //#region 新增使用者 欄位驗證
  const checkAddValidator = async (name = '', val = '') => {
    let result = true;
    let newAddUserinfoErrors = { ...addUserinfoErrors };

    if (name == 'userName' || name == '') {
      if (!validator.check(addUserinfo.userName, 'required')) {
        newAddUserinfoErrors.userName = 'required';
        result = false;
      } else if (!validator.check(addUserinfo.userName, 'max:50')) {
        newAddUserinfoErrors.userName = 'max';
        result = false;
      } else {
        newAddUserinfoErrors.userName = '';
      }
    }

    if (name == 'userAccount' || name == '') {
      if (!validator.check(addUserinfo.userAccount, 'required')) {
        newAddUserinfoErrors.userAccount = 'required';
        result = false;
      } else if (!validator.check(addUserinfo.userAccount, 'max:50')) {
        newAddUserinfoErrors.userAccount = 'max';
        result = false;
      } else {
        newAddUserinfoErrors.userAccount = '';
      }
    }

    var tempPaw = userPaw.current.value;
    var tempAgainPaw = userAgainPaw.current.value;

    if (name == 'userPaw' || name == '') {
      var tempPaw = userPaw.current.value;

      if (!validator.check(tempPaw, 'required')) {
        newAddUserinfoErrors.userPaw = 'required';
        result = false;
      } else if (!validator.check(tempPaw, 'pawFormat')) {
        newAddUserinfoErrors.userPaw = 'pawFormat';
        result = false;
      } else if (
        tempPaw != tempAgainPaw &&
        addUserinfoErrors.userAgainPaw == ''
      ) {
        newAddUserinfoErrors.userAgainPaw = 'again';
        result = false;
      } else {
        newAddUserinfoErrors.userPaw = '';
      }
    }

    if (name == 'userAgainPaw' || name == '') {
      if (!validator.check(tempAgainPaw, 'required')) {
        newAddUserinfoErrors.userAgainPaw = 'required';
        result = false;
      } else if (!validator.check(tempAgainPaw, 'pawFormat')) {
        newAddUserinfoErrors.userAgainPaw = 'pawFormat';
        result = false;
      } else if (tempPaw != tempAgainPaw) {
        newAddUserinfoErrors.userAgainPaw = 'again';
        result = false;
      } else {
        newAddUserinfoErrors.userAgainPaw = '';
      }
    }

    setAddUserinfoErrors(newAddUserinfoErrors);
    return result;
  };
  //#endregion

  //#region 儲存新增使用者Modal
  const handleSaveAddUserinfo = async (e) => {
    e.preventDefault();

    if (await checkAddValidator()) {
      setSaveUserinfoLoading(true);

      var sendData = {
        userName: addUserinfo.userName,
        userAccount: addUserinfo.userAccount,
        userPaw: userPaw.current.value,
        userAgainPaw: userAgainPaw.current.value,
        userLevel: addUserinfo.userLevel,
      };

      let addUserinfoResponse = await apiAddUserinfo(sendData);
      if (addUserinfoResponse) {
        if (addUserinfoResponse.code == '0000') {
          toast.success(t('toast.add.success'), {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
          });

          setShowAddUserinfoModal(false);
          await refreshUserinfos();
        } else {
          toast.error(addUserinfoResponse.message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
          });
        }
        setSaveUserinfoLoading(false);
      } else {
        setSaveUserinfoLoading(false);
      }
    }
  };
  //#endregion

  //#region 開啟修改使用者Modal
  const handleOpenEditUserinfoModal = (userId) => {
    var tempUserinfo = userinfos.find((x) => x.userId == userId);
    setEditUserinfo(tempUserinfo);

    setEditUserinfoModal(true);
  };
  //#endregion

  //#region 關閉修改使用者Modal
  const handleCloseEditUserinfoModal = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setEditUserinfoModal(false);
  };
  //#endregion

  //#region 修改使用者 改變Input的欄位
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUserinfo({ ...editUserinfo, [name]: value });
  };
  //#endregion

  //#region 修改使用者 失去焦點Input的欄位
  const handleEditBlur = async (e) => {
    const { name, value } = e.target;

    await checkEditValidator(name);
  };
  //#endregion

  //#region 修改使用者 欄位驗證
  const checkEditValidator = async (name = '', val = '') => {
    let result = true;
    let newEditUserinfoErrors = { ...editUserinfoErrors };

    if (name == 'userName' || name == '') {
      if (!validator.check(editUserinfo.userName, 'required')) {
        newEditUserinfoErrors.userName = 'required';
        result = false;
      } else {
        newEditUserinfoErrors.userName = '';
      }
    }

    setEditUserinfoErrors(newEditUserinfoErrors);
    return result;
  };
  //#endregion

  //#region 儲存修改使用者
  const handleSaveEditUserinfo = async (e) => {
    e.preventDefault();

    if (await checkEditValidator()) {
      setSaveEditUserinfoLoading(true);

      var sendData = {
        userId: editUserinfo.userId,
        userName: editUserinfo.userName,
        userLevel: editUserinfo.userLevel,
      };

      let editUserinfoResponse = await apiEditUserinfo(sendData);
      if (editUserinfoResponse) {
        if (editUserinfoResponse.code == '0000') {
          toast.success(t('toast.edit.success'), {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
          });

          setEditUserinfoModal(false);
          await refreshUserinfos();
        } else {
          toast.error(editUserinfoResponse.message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
          });
        }
        setSaveEditUserinfoLoading(false);
      } else {
        setSaveEditUserinfoLoading(false);
      }
    }
  };
  //#endregion

  //#region 開啟使用者修改密碼Modal
  const handleOpenUserinfoChangePawModal = (userId) => {
    setSelectChangePawId(userId);
    setShowUserinfoChangePawModal(true);
  };
  //#endregion

  //#region 關閉使用者修改密碼Modal
  const handleCloseUserinfoChangePawModal = (e) => {
    if (e) {
      e.preventDefault();
    }
    setSelectChangePawId(0);
    setShowUserinfoChangePawModal(false);
  };
  //#endregion

  //#region 修改密碼 失去焦點Input的欄位
  const handleChangePawBlur = async (e) => {
    const { name, value } = e.target;

    await checkChangePawValidator(name);
  };
  //#endregion

  //#region 修改密碼 欄位驗證
  const checkChangePawValidator = async (name = '', val = '') => {
    let result = true;
    let newUserinfoChangePawErrors = { ...userinfoChangePawErrors };

    if (name == 'newPaw' || name == '') {
      var tempNewPaw = newPaw.current.value;
      var tempAgainPaw = againPaw.current.value;

      if (!validator.check(tempNewPaw, 'required')) {
        newUserinfoChangePawErrors.newPaw = 'required';
        result = false;
      } else if (!validator.check(tempNewPaw, 'pawFormat')) {
        newUserinfoChangePawErrors.newPaw = 'pawFormat';
        result = false;
      } else if (
        tempNewPaw != tempAgainPaw &&
        userinfoChangePawErrors.againPaw == ''
      ) {
        newUserinfoChangePawErrors.againPaw = 'again';
        result = false;
      } else {
        newUserinfoChangePawErrors.newPaw = '';
      }
    }

    if (name == 'againPaw' || name == '') {
      var tempNewPaw = newPaw.current.value;
      var tempAgainPaw = againPaw.current.value;

      if (!validator.check(tempAgainPaw, 'required')) {
        newUserinfoChangePawErrors.againPaw = 'required';
        result = false;
      } else if (!validator.check(tempAgainPaw, 'pawFormat')) {
        newUserinfoChangePawErrors.againPaw = 'pawFormat';
        result = false;
      } else if (tempNewPaw != tempAgainPaw) {
        newUserinfoChangePawErrors.againPaw = 'again';
        result = false;
      } else {
        newUserinfoChangePawErrors.againPaw = '';
      }
    }

    setUserinfoChangePawErrors(newUserinfoChangePawErrors);
    return result;
  };
  //#endregion

  //#region 儲存修改密碼
  const handleSaveUserinfoChangePaw = async (e) => {
    e.preventDefault();

    if (await checkChangePawValidator()) {
      setSaveUserinfoChangePawLoading(true);

      var sendData = {
        userId: selectChangePawId,
        newPaw: newPaw.current.value,
        againPaw: againPaw.current.value,
      };

      let userinfoChangePawResponse = await apiUserinfoChangePaw(sendData);
      if (userinfoChangePawResponse) {
        if (userinfoChangePawResponse.code == '0000') {
          toast.success(t('toast.edit.success'), {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
          });

          setShowUserinfoChangePawModal(false);
        } else {
          toast.error(userinfoChangePawResponse.message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
          });
        }
        setSaveUserinfoChangePawLoading(false);
      } else {
        setSaveUserinfoChangePawLoading(false);
      }
    }
  };
  //#endregion

  //#region 開啟刪除使用者Modal
  const handleOpenDeleteUserinfoModal = (userId) => {
    setSelectDeleteId(userId);
    setShowDeleteUserinfoModal(true);
  };
  //#endregion

  //#region 關閉刪除使用者Modal
  const handleCloseDeleteUserinfoModal = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setShowDeleteUserinfoModal(false);
  };
  //#endregion

  //#region 儲存刪除使用者Modal
  const handleSaveDeleteUserinfo = async (e) => {
    e.preventDefault();

    setSaveDeleteUserinfoLoading(true);

    var sendData = {
      id: selectDeleteId,
    };

    let deleteUserinfoResponse = await apiDeleteUserinfo(sendData);
    if (deleteUserinfoResponse) {
      if (deleteUserinfoResponse.code == '0000') {
        toast.success(t('toast.delete.success'), {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
        });

        setShowDeleteUserinfoModal(false);
        await refreshUserinfos();
      } else {
        toast.error(deleteUserinfoResponse.message, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
        });
      }
      setSaveDeleteUserinfoLoading(false);
    } else {
      setSaveDeleteUserinfoLoading(false);
    }
  };
  //#endregion

  return (
    <>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 justify-content-between">
            <div />
            <div className="content-header-text-color">
              <h1>
                <strong>
                  {t('userManage.content.header')}
                  {/*使用者管理*/}
                </strong>
              </h1>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-add"
              onClick={(e) => handleOpenAddUserinfoModal(e)}
            >
              <i className="fas fa-plus"></i> {t('userManage.btn.add')}
              {/*新增使用者*/}
            </button>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid container-fluid-border">
          <div className="row justify-content-end mb-3">
            <div className="col-3">
              <div className="from-item search">
                <DebounceInput
                  debounceTimeout={300}
                  type="search"
                  placeholder={t('keyword.placeholder')}
                  onChange={(e) => handleChangeKeyword(e)}
                />
                {/*請輸入關鍵字*/}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body table-responsive p-0">
              <table className="table table-striped table-valign-middle">
                <thead>
                  <tr>
                    <th>
                      {t('userManage.userId')}
                      {/*編號*/}
                    </th>
                    <th>
                      {t('userManage.userName')}
                      {/*名稱*/}
                    </th>
                    <th>
                      {t('userManage.userAccount')}
                      {/*帳號*/}
                    </th>
                    <th>
                      {t('userManage.userLevel')}
                      {/*層級*/}
                    </th>
                    <th>
                      {t('userManage.fun')}
                      {/*功能*/}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {showUserinfos && showUserinfos.length > 0 ? (
                    <>
                      {showUserinfos.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item.userId}</td>
                            <td>{item.userName}</td>
                            <td>{item.userAccount}</td>
                            <td>{item.userLevelText}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() =>
                                  handleOpenEditUserinfoModal(item.userId)
                                }
                              >
                                {t('userManage.btn.edit')}
                                {/*編輯*/}
                              </button>{' '}
                              {myUser && myUser.userId != item.userId ? (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-outline-info"
                                    onClick={() =>
                                      handleOpenUserinfoChangePawModal(
                                        item.userId
                                      )
                                    }
                                  >
                                    {' '}
                                    {t('userManage.changePaw')}
                                    {/*修改密碼*/}
                                  </button>{' '}
                                </>
                              ) : (
                                <></>
                              )}
                              {myUser && myUser.userId != item.userId ? (
                                <button
                                  type="button"
                                  className="btn btn-outline-danger"
                                  onClick={() =>
                                    handleOpenDeleteUserinfoModal(item.userId)
                                  }
                                >
                                  {t('userManage.btn.del')}
                                  {/*刪除*/}
                                </button>
                              ) : (
                                <></>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center' }}>
                          {t('table.empty')}
                          {/*查無資料*/}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination className="d-flex justify-content-center">
            {pages}
          </Pagination>
        </div>
      </section>

      <ToastContainer />

      <Modal
        show={showAddUserinfoModal}
        onHide={(e) => handleCloseAddUserinfoModal(e)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t('userManage.add')}
            {/*新增使用者*/}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="row mb-3">
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t('userManage.userName')}
                  {/*名稱*/}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="userName"
                  value={addUserinfo.userName}
                  onChange={(e) => handleAddChange(e)}
                  onBlur={(e) => handleAddBlur(e)}
                  autoComplete="off"
                />
                {(() => {
                  switch (addUserinfoErrors.userName) {
                    case 'required':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.required')} {/*不得空白*/}
                        </div>
                      );
                    case 'max':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.max', { e: 50 })}
                          {/*超過上限{{e}}個字元*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t('userManage.userAccount')}
                  {/*帳號*/}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="userAccount"
                  value={addUserinfo.userAccount}
                  onChange={(e) => handleAddChange(e)}
                  onBlur={(e) => handleAddBlur(e)}
                  autoComplete="off"
                />
                {(() => {
                  switch (addUserinfoErrors.userAccount) {
                    case 'required':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.required')} {/*不得空白*/}
                        </div>
                      );
                    case 'max':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.max', { e: 50 })}
                          {/*超過上限{{e}}個字元*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t('userManage.userPaw')}
                  {/*密碼*/}
                </label>
                <input
                  type="password"
                  className="form-control"
                  name="userPaw"
                  placeholder={t('pawFormat.placeholder')}
                  onBlur={(e) => handleAddBlur(e)}
                  ref={userPaw}
                  autoComplete="off"
                />
                {(() => {
                  switch (addUserinfoErrors.userPaw) {
                    case 'required':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.required')} {/*不得空白*/}
                        </div>
                      );
                    case 'pawFormat':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.format')} {/*格式有誤*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t('userManage.userAgainPaw')}
                  {/*再次輸入密碼*/}
                </label>
                <input
                  type="password"
                  className="form-control"
                  name="userAgainPaw"
                  placeholder={t('pawFormat.placeholder')}
                  onBlur={(e) => handleAddBlur(e)}
                  ref={userAgainPaw}
                  autoComplete="off"
                />
                {(() => {
                  switch (addUserinfoErrors.userAgainPaw) {
                    case 'required':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.required')} {/*不得空白*/}
                        </div>
                      );
                    case 'pawFormat':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.format')} {/*格式有誤*/}
                        </div>
                      );
                    case 'again':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.pwdIn')} {/*兩次密碼輸入不相同*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t('userManage.userLevel')}
                  {/*層級*/}
                </label>
                <div>
                  <div className="form-check-inline">
                    <div className="custom-control custom-radio">
                      <input
                        id="user_level_0"
                        type="radio"
                        className="custom-control-input"
                        name="userLevel"
                        value="1"
                        checked={1 == addUserinfo.userLevel}
                        onChange={(e) => handleAddChange(e)}
                      />
                      <label
                        htmlFor="user_level_0"
                        className="custom-control-label"
                      >
                        {t('userManage.userLevel.admin')}
                        {/*最高管理者*/}
                      </label>
                    </div>
                  </div>
                  <div className="form-check-inline">
                    <div className="custom-control custom-radio form-check-inline">
                      <input
                        id="user_level_1"
                        type="radio"
                        className="custom-control-input"
                        name="userLevel"
                        value="2"
                        checked={2 == addUserinfo.userLevel}
                        onChange={(e) => handleAddChange(e)}
                      />
                      <label
                        htmlFor="user_level_1"
                        className="custom-control-label"
                      >
                        {t('userManage.userLevel.expert')}
                        {/*專家*/}
                      </label>
                    </div>
                  </div>
                  <div className="form-check-inline">
                    <div className="custom-control custom-radio form-check-inline">
                      <input
                        id="user_level_2"
                        type="radio"
                        className="custom-control-input"
                        name="userLevel"
                        value="4"
                        checked={4 == addUserinfo.userLevel}
                        onChange={(e) => handleAddChange(e)}
                      />
                      <label
                        htmlFor="user_level_2"
                        className="custom-control-label"
                      >
                        {t('userManage.userLevel.user')}
                        {/*一般用戶*/}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={(e) => handleCloseAddUserinfoModal(e)}
          >
            {t('btn.cancel')}
            {/*取消*/}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveAddUserinfo}
          >
            {saveUserinfoLoading ? (
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
              <span>
                {t('btn.save')}
                {/*儲存*/}
              </span>
            )}
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showEditUserinfoModal}
        onHide={(e) => handleCloseEditUserinfoModal(e)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t('userManage.edit')}
            {/*編輯使用者*/}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="row mb-3">
              <div className="col-12 form-group">
                <label className="form-label">
                  {t('userManage.userId')}
                  {/*編號*/}
                </label>
                <span className="form-text">{editUserinfo.userId}</span>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t('userManage.userName')}
                  {/*名稱*/}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="userName"
                  value={editUserinfo.userName}
                  onChange={(e) => handleEditChange(e)}
                  onBlur={(e) => handleEditBlur(e)}
                  autoComplete="off"
                />
                {(() => {
                  switch (editUserinfoErrors.userName) {
                    case 'required':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.required')} {/*不得空白*/}
                        </div>
                      );
                    case 'max':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.max', { e: 50 })}
                          {/*超過上限{{e}}個字元*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-12 form-group">
                <label className="form-label">
                  {t('userManage.userAccount')}
                  {/*帳號*/}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="userAccount"
                  value={editUserinfo.userAccount}
                  disabled
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t('userManage.userLevel')}
                  {/*層級*/}
                </label>
                <div>
                  <div className="form-check-inline">
                    <div className="custom-control custom-radio">
                      <input
                        id="user_level_0"
                        type="radio"
                        className="custom-control-input"
                        name="userLevel"
                        value="1"
                        checked={1 == editUserinfo.userLevel}
                        onChange={(e) => handleEditChange(e)}
                      />
                      <label
                        htmlFor="user_level_0"
                        className="custom-control-label"
                      >
                        {t('userManage.userLevel.admin')}
                        {/*最高管理者*/}
                      </label>
                    </div>
                  </div>
                  <div className="form-check-inline">
                    <div className="custom-control custom-radio form-check-inline">
                      <input
                        id="user_level_1"
                        type="radio"
                        className="custom-control-input"
                        name="userLevel"
                        value="2"
                        checked={2 == editUserinfo.userLevel}
                        onChange={(e) => handleEditChange(e)}
                      />
                      <label
                        htmlFor="user_level_1"
                        className="custom-control-label"
                      >
                        {t('userManage.userLevel.expert')}
                        {/*專家*/}
                      </label>
                    </div>
                  </div>
                  <div className="form-check-inline">
                    <div className="custom-control custom-radio form-check-inline">
                      <input
                        id="user_level_2"
                        type="radio"
                        className="custom-control-input"
                        name="userLevel"
                        value="4"
                        checked={4 == editUserinfo.userLevel}
                        onChange={(e) => handleEditChange(e)}
                      />
                      <label
                        htmlFor="user_level_2"
                        className="custom-control-label"
                      >
                        {t('userManage.userLevel.user')}
                        {/*一般用戶*/}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={(e) => handleCloseEditUserinfoModal(e)}
          >
            {t('btn.cancel')}
            {/*取消*/}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveEditUserinfo}
          >
            {saveEditUserinfoLoading ? (
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
              <span>
                {t('btn.save')}
                {/*儲存*/}
              </span>
            )}
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDeleteUserinfoModal}
        onHide={(e) => handleCloseDeleteUserinfoModal(e)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t('userManage.delete')}
            {/*刪除使用者*/}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {t('userManage.deleteContent')}
            {/*您確定要刪除該筆資料嗎?*/}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={(e) => handleCloseDeleteUserinfoModal(e)}
          >
            {t('btn.cancel')}
            {/*取消*/}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveDeleteUserinfo}
          >
            {saveDeleteUserinfoLoading ? (
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
              <span>
                {t('btn.confirm')}
                {/*確定*/}
              </span>
            )}
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showUserinfoChangePawModal}
        onHide={(e) => handleCloseUserinfoChangePawModal(e)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t('header.changePaw')}
            {/*修改密碼*/}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="row mb-3">
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t('header.newPaw')}
                  {/*新密碼*/}
                </label>
                <input
                  type="password"
                  className="form-control"
                  name="newPaw"
                  placeholder={t('pawFormat.placeholder')}
                  onBlur={(e) => handleChangePawBlur(e)}
                  ref={newPaw}
                  autoComplete="off"
                />
                {(() => {
                  switch (userinfoChangePawErrors.newPaw) {
                    case 'required':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.required')} {/*不得空白*/}
                        </div>
                      );
                    case 'pawFormat':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.format')} {/*格式有誤*/}
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-12 form-group">
                <label className="form-label">
                  <span className="text-danger">*</span>
                  {t('header.againPaw')}
                  {/*再次輸入密碼*/}
                </label>
                <input
                  type="password"
                  className="form-control"
                  name="againPaw"
                  placeholder={t('pawFormat.placeholder')}
                  onBlur={(e) => handleChangePawBlur(e)}
                  ref={againPaw}
                  autoComplete="off"
                />
                {(() => {
                  switch (userinfoChangePawErrors.againPaw) {
                    case 'required':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.required')} {/*不得空白*/}
                        </div>
                      );
                    case 'pawFormat':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.format')} {/*格式有誤*/}
                        </div>
                      );
                    case 'again':
                      return (
                        <div className="invalid-feedback d-block">
                          <i className="fas fa-exclamation-circle"></i>{' '}
                          {t('helpWord.pwdIn')} {/*兩次密碼輸入不相同*/}
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
            onClick={(e) => handleCloseUserinfoChangePawModal(e)}
          >
            {t('btn.cancel')}
            {/*取消*/}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveUserinfoChangePaw}
          >
            {saveUserinfoChangePawLoading ? (
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
              <span>
                {t('btn.save')}
                {/*儲存*/}
              </span>
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default UserManage;
