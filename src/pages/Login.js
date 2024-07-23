import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, InputGroup, Row, Col, Modal } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { setWindowClass } from '../utils/helpers';
import { ToastContainer, toast } from 'react-toastify';
import SimpleReactValidator from 'simple-react-validator';
import reactStringReplace from 'react-string-replace';
import { setAuthToken } from '../utils/TokenUtil';
import { apiSignIn } from '../utils/Api';

function Login() {
  const navigate = useNavigate();
  const [isAuthLoading, setAuthLoading] = useState(false);
  const [account, setAccount] = useState(''); //帳號
  const paw = useRef(''); //密碼

  const [errors, setErrors] = useState({
    account: '',
    paw: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [verificationCode, setVerificationCode] = useState(''); // 添加這行來初始化驗證碼狀態
  const [verificationCodeSent, setVerificationCodeSent] = useState(false); // 追蹤驗證碼是否已發送
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    // 重置所有與註冊相關的狀態
    setShowModal(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setVerificationCodeSent(false);
    setVerificationSuccess(false);
    setErrors({});
  };

  function isValidEmail(email) {
    const re = /^[^\s@]+@(?:[^\s@]+\.)?(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|yahoo\.co\.uk|googlemail\.com|msn\.com|aol\.com|live\.com|icloud\.com)$/;
    return re.test(String(email).toLowerCase());
  }
  
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
  
    if (!isValidEmail(newEmail)) {
      setErrors(prevErrors => ({ ...prevErrors, email: '請輸入有效的電子郵件地址' }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, email: '' }));
    }
  };

  const handleRegister = (e) => {
  e.preventDefault();
  const newErrors = {};
  
  if (!email) {
    newErrors.email = '電子郵件不能為空';
  } else if (!isValidEmail(email)) {
    newErrors.email = '請輸入有效的電子郵件地址';
  }

  if (!password) {
    newErrors.password = '密碼不能為空';
  } else if (password.length < 6) {
    newErrors.password = '密碼至少需要6個字符';
  }

  if (password !== confirmPassword) {
    newErrors.confirmPassword = '輸入的密碼不一致';
  }

  if (!verificationCode) {
    newErrors.verificationCode = '驗證碼不能為空';
  } else if (!verificationCodeSent) {
    newErrors.verificationCode = '驗證碼未發送或已過期';
  }

  // if (!verificationCode) {
  //   newErrors.verificationCode = '驗證碼不能為空';
  // } else {
  //   // const verificationResult = await checkVerificationCode(email, verificationCode);
  //   if (!verificationResult.isValid) {
  //     newErrors.verificationCode = '驗證碼錯誤或已過期';
  //   }
  // }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

    // 如果沒有錯誤，執行註冊邏輯
    console.log('Registering:', email, password);
    handleCloseModal();
    toast.success('註冊成功！');
  };

  const handleSendVerificationCode = () => {
    if (isValidEmail(email)) {
      setVerificationCodeSent(true);
      toast.success('驗證碼已發送到您的郵箱');
    } else {
      toast.error('請輸入有效的電子郵件地址');
    }
  };  

  const handleVerifyCode = () => {
    // 模擬檢查，例如假設"1234"是我們發送到用戶郵箱的驗證碼
    if (verificationCode === "1234") {
      setVerificationSuccess(true);
      toast.success("驗證碼正確，現在您可以完成註冊。");
    } else {
      setVerificationSuccess(false);
      toast.error("驗證碼錯誤，請重新輸入或重新獲取。");
    }
  };
  
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
          strRep = reactStringReplace(strRep, /([-)(*#+])/g, (match, i) => '');

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
  //useEffect(() => {
  //    paw.current.value = "123456";
  //}, []);
  //#endregion

  //#region 改變Input的欄位
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount(value);
  };
  //#endregion

  //#region 失去焦點Input的欄位
  const handleBlur = async (e) => {
    const { name, value } = e.target;

    await checkValidator(name);
  };
  //#endregion

  //#region 欄位驗證
  const checkValidator = async (name = '', val = '') => {
    let result = true;
    let newErrors = { ...errors };

    if (name == 'account' || name == '') {
      if (!validator.check(account, 'required')) {
        newErrors.account = 'required';
        result = false;
      } else {
        newErrors.account = '';
      }
    }

    if (name == 'password' || name == '') {
      var tempPaw = paw.current.value;

      if (!validator.check(tempPaw, 'required')) {
        newErrors.paw = 'required';
        result = false;
      } else if (!validator.check(tempPaw, 'pawFormat')) {
        newErrors.paw = 'pawFormat';
        result = false;
      } else {
        newErrors.paw = '';
      }
    }

    setErrors(newErrors);
    return result;
  };
  //#endregion

  //#region 登入
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await checkValidator()) {
      setAuthLoading(true);

      var sendData = {
        account: account,
        paw: paw.current.value,
      };

      let signInResponse = await apiSignIn(sendData);
      if (signInResponse) {
        if (signInResponse.code == '0000') {
          setAuthToken(signInResponse.result);
          navigate('machine');
        } else {
          toast.error(signInResponse.message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
          });
          setAuthLoading(false);
        }
      } else {
        setAuthLoading(false);
      }
    }
  };
  //#endregion

  setWindowClass('login-page');

  return (
    <>
      <div className="login-box">
        <div className="card card-outline card-primary">
          <div className="card-header text-center">
            <h1 style={{ fontSize: '25px' }}>AR管理系統</h1>
          </div>
          <div className="card-body">
            <p className="login-box-msg">登入</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <InputGroup className="mb-3">
                  <Form.Control
                    id="account"
                    name="account"
                    type="text"
                    placeholder="帳號"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={account}
                  />
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-user" />
                    </InputGroup.Text>
                  </InputGroup.Append>
                  {(() => {
                    switch (errors.account) {
                      case 'required':
                        return (
                          <div className="invalid-feedback d-block">
                            <i className="fas fa-exclamation-circle"></i>{' '}
                            不得空白
                          </div>
                        );
                      default:
                        return null;
                    }
                  })()}
                </InputGroup>
              </div>
              <div className="mb-3">
                <InputGroup className="mb-3">
                  <Form.Control
                    id="password"
                    name="password"
                    type="password"
                    placeholder="密碼"
                    onBlur={handleBlur}
                    ref={paw}
                  />
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-lock" />
                    </InputGroup.Text>
                  </InputGroup.Append>
                  {(() => {
                    switch (errors.paw) {
                      case 'required':
                        return (
                          <div className="invalid-feedback d-block">
                            <i className="fas fa-exclamation-circle"></i>{' '}
                            不得空白
                          </div>
                        );
                      case 'pawFormat':
                        return (
                          <div className="invalid-feedback d-block">
                            <i className="fas fa-exclamation-circle"></i>{' '}
                            格式有誤
                          </div>
                        );
                      default:
                        return null;
                    }
                  })()}
                </InputGroup>
              </div>

              <div className="d-flex justify-content-end">
                <Button type="submit" disabled={isAuthLoading}>
                  {isAuthLoading ? (
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
                    <span>登入</span>
                  )}
                </Button>
              </div>
            </form>
            <Row className="mt-3">
              <Col className="text-center">
              <Button variant="link" onClick={handleShowModal} style={{ textDecoration: 'none' }}>
                創建Mail帳號
                (Click Me)
              </Button>
              </Col>
            </Row>
          </div>
        </div>
      </div>

      <ToastContainer />

      {/* 新增的 Modal 組件 */}
      <Modal show={showModal} onHide={handleCloseModal} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>註冊帳號</Modal.Title>
        </Modal.Header>
          <Modal.Body>
          <Form onSubmit={handleRegister}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>
                <span className="text-danger">*</span>電子郵件
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="輸入電子郵件"
                required
                onChange={handleEmailChange}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Row className="mb-3">
              <Col xs="auto">
                <Button variant="outline-secondary" size="sm" onClick={handleSendVerificationCode} disabled={!isValidEmail(email)}>
                  發送驗證碼
                </Button>
              </Col>
              <Col xs="auto">
                <Button variant="outline-primary" size="sm" onClick={handleVerifyCode} disabled={!verificationCode}>
                  確認驗證碼
                </Button>
              </Col>
            </Row>
            {/* Verification code input */}
            <Form.Group controlId="formVerificationCode">
              <Form.Label><span className="text-danger">*</span>驗證碼</Form.Label>
              <InputGroup className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="輸入驗證碼"
                  required
                  onChange={(e) => setVerificationCode(e.target.value)}
                  isInvalid={!!errors.verificationCode}
                />
              </InputGroup>
              <Form.Control.Feedback type="invalid">
                {errors.verificationCode}
              </Form.Control.Feedback>
              {verificationSuccess && <div className="text-success">驗證成功！</div>}
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
              <Form.Label><span className="text-danger">*</span>密碼</Form.Label>
              <Form.Control
                type="password"
                placeholder="密碼"
                required
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formBasicConfirmPassword">
              <Form.Label><span className="text-danger">*</span>再次輸入密碼</Form.Label>
              <Form.Control
                type="password"
                placeholder="再次輸入密碼"
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                isInvalid={!!errors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Button variant="primary" type="submit">
              註冊
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Login;
