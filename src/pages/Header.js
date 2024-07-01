import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next'; //語系
import { useNavigate } from 'react-router-dom';
import { MyUserContext } from '../contexts/MyUserContext';
import {
  hasWindowClass,
  addWindowClass,
  removeWindowClass,
} from '../utils/helpers';
import { removeAuthToken } from '../utils/TokenUtil';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import SimpleReactValidator from 'simple-react-validator';
import reactStringReplace from 'react-string-replace';

import { apiChangePaw } from '../utils/Api';

function Header() {
  const { myUser } = useContext(MyUserContext);
  const { t } = useTranslation();
  const navigate = useNavigate(); //跳轉Router
  const [toggleUser, setToggleUser] = useState(false);
  const wrapperRef = useRef();

  const closeOpenMenus = useCallback(
    (e) => {
      if (
        wrapperRef.current &&
        toggleUser &&
        !wrapperRef.current.contains(e.target)
      ) {
        setToggleUser(false);
      }
    },
    [toggleUser]
  );

  const [showChangePawModal, setShowChangePawModal] = useState(false); //顯示"修改密碼modal"

  const [changePawErrors, setChangePawErrors] = useState({
    //修改密碼錯誤訊息
    oldPaw: '',
    newPaw: '',
    againPaw: '',
  });

  const [saveChangePawLoading, setSaveChangePawLoading] = useState(false);

  const oldPaw = useRef(''); //舊密碼
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

  useEffect(() => {
    document.addEventListener('mousedown', closeOpenMenus);
  }, [closeOpenMenus]);

  //#region 開關側邊Nav
  const handleToggleNav = (e) => {
    e.preventDefault();
    if (hasWindowClass('sidebar-collapse')) {
      removeWindowClass('sidebar-collapse');
    } else {
      addWindowClass('sidebar-collapse');
    }
  };
  //#endregion

  //#region 開關使用者 Dropdown
  const handleToggleUserDropdown = (e) => {
    e.preventDefault();
    setToggleUser(!toggleUser);
  };
  //#endregion

  //#region 開啟修改密碼 modal
  const handleOpenChangePawModal = (e) => {
    e.preventDefault();
    setShowChangePawModal(true);
    setToggleUser(false);
  };
  //#endregion

  //#region 關閉修改密碼 modal
  const handleCloseChangePawModal = (e) => {
    if (e) {
      e.preventDefault();
    }
    setShowChangePawModal(false);
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
    let newChangePawErrors = { ...changePawErrors };

    if (name == 'oldPaw' || name == '') {
      var tempOldPaw = oldPaw.current.value;

      if (!validator.check(tempOldPaw, 'required')) {
        newChangePawErrors.oldPaw = 'required';
        result = false;
      } else if (!validator.check(tempOldPaw, 'pawFormat')) {
        newChangePawErrors.oldPaw = 'pawFormat';
        result = false;
      } else {
        newChangePawErrors.oldPaw = '';
      }
    }

    if (name == 'newPaw' || name == '') {
      var tempNewPaw = newPaw.current.value;
      var tempAgainPaw = againPaw.current.value;

      if (!validator.check(tempNewPaw, 'required')) {
        newChangePawErrors.newPaw = 'required';
        result = false;
      } else if (!validator.check(tempNewPaw, 'pawFormat')) {
        newChangePawErrors.newPaw = 'pawFormat';
        result = false;
      } else if (tempNewPaw != tempAgainPaw && changePawErrors.againPaw == '') {
        newChangePawErrors.againPaw = 'again';
        result = false;
      } else {
        newChangePawErrors.newPaw = '';
      }
    }

    if (name == 'againPaw' || name == '') {
      var tempNewPaw = newPaw.current.value;
      var tempAgainPaw = againPaw.current.value;

      if (!validator.check(tempAgainPaw, 'required')) {
        newChangePawErrors.againPaw = 'required';
        result = false;
      } else if (!validator.check(tempAgainPaw, 'pawFormat')) {
        newChangePawErrors.againPaw = 'pawFormat';
        result = false;
      } else if (tempNewPaw != tempAgainPaw) {
        newChangePawErrors.againPaw = 'again';
        result = false;
      } else {
        newChangePawErrors.againPaw = '';
      }
    }

    setChangePawErrors(newChangePawErrors);
    return result;
  };
  //#endregion

  //#region 儲存修改密碼
  const handleSaveChangePaw = async (e) => {
    e.preventDefault();

    if (await checkChangePawValidator()) {
      setSaveChangePawLoading(true);

      var sendData = {
        oldPaw: oldPaw.current.value,
        newPaw: newPaw.current.value,
        againPaw: againPaw.current.value,
      };

      let changePawResponse = await apiChangePaw(sendData);
      if (changePawResponse) {
        if (changePawResponse.code == '0000') {
          toast.success(t('toast.edit.success'), {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
          });

          setShowChangePawModal(false);
        } else {
          toast.error(changePawResponse.message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
          });
        }
        setSaveChangePawLoading(false);
      } else {
        setSaveChangePawLoading(false);
      }
    }
  };
  //#endregion

  //#region 登出
  const handleSignOut = (e) => {
    e.preventDefault();
    removeAuthToken();
    navigate('/');
  };
  //#endregion

  return (
    <>
      <nav className="main-header navbar navbar-expand navbar-light">
        <ul className="navbar-nav">
          <li className="nav-item">
            <button
              type="button"
              className="nav-link"
              onClick={(e) => handleToggleNav(e)}
            >
              <i className="fas fa-bars" />
            </button>
          </li>
        </ul>
        <ul className="navbar-nav ml-auto" ref={wrapperRef}>
          <li className={`nav-item dropdown ${toggleUser ? 'show' : ''}`}>
            <a
              href={void 0}
              className="nav-link"
              onClick={(e) => handleToggleUserDropdown(e)}
            >
              {t('header.user', { e: myUser ? myUser.userName : '' })}&nbsp;
              <i className="fas fa-user"></i>
            </a>
            <div
              className={`dropdown-menu dropdown-menu-right ${toggleUser ? 'show' : ''}`}
            >
              <a
                href={void 0}
                className="dropdown-item"
                onClick={(e) => handleOpenChangePawModal(e)}
              >
                <i className="fas fa-lock"></i> {t('header.changePaw')}
                {/*修改密碼*/}
              </a>
              <a
                href={void 0}
                className="dropdown-item"
                onClick={(e) => handleSignOut(e)}
              >
                <i className="fas fa-sign-out-alt"></i> {t('header.logout')}
                {/*登出*/}
              </a>
            </div>
          </li>
        </ul>
      </nav>

      <ToastContainer />

      <Modal
        show={showChangePawModal}
        onHide={(e) => handleCloseChangePawModal(e)}
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
                  {t('header.oldPaw')}
                  {/*舊密碼*/}
                </label>
                <input
                  type="password"
                  className="form-control"
                  name="oldPaw"
                  placeholder={t('pawFormat.placeholder')}
                  onBlur={(e) => handleChangePawBlur(e)}
                  ref={oldPaw}
                  autoComplete="off"
                />
                {(() => {
                  switch (changePawErrors.oldPaw) {
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
                  switch (changePawErrors.newPaw) {
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
                  switch (changePawErrors.againPaw) {
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
            onClick={(e) => handleCloseChangePawModal(e)}
          >
            {t('btn.cancel')}
            {/*取消*/}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveChangePaw}
          >
            {saveChangePawLoading ? (
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

export default Header;
