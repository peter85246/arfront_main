import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, InputGroup } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { setWindowClass } from "../utils/helpers";
import { ToastContainer, toast } from "react-toastify";
import SimpleReactValidator from "simple-react-validator";
import reactStringReplace from "react-string-replace";
import { setAuthToken } from "../utils/TokenUtil";
import { apiSignIn } from "../utils/Api";

function Login() {
  const navigate = useNavigate();
  const [isAuthLoading, setAuthLoading] = useState(false);
  const [account, setAccount] = useState(""); //帳號
  const paw = useRef(""); //密碼

  const [errors, setErrors] = useState({
    account: "",
    paw: "",
  });

  const validator = new SimpleReactValidator({
    validators: {
      pawFormat: {
        rule: (val, params, validator) => {
          let result = false;

          if (val.length < 6 || val.length > 30) {
            return result;
          }

          let strRep = reactStringReplace(val, /(\d+)/g, (match, i) => "");
          strRep = reactStringReplace(strRep, /([a-zA-Z])/g, (match, i) => "");
          strRep = reactStringReplace(strRep, /([-)(*#+])/g, (match, i) => "");

          if (strRep.join("") == "") {
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
  const checkValidator = async (name = "", val = "") => {
    let result = true;
    let newErrors = { ...errors };

    if (name == "account" || name == "") {
      if (!validator.check(account, "required")) {
        newErrors.account = "required";
        result = false;
      } else {
        newErrors.account = "";
      }
    }

    if (name == "password" || name == "") {
      var tempPaw = paw.current.value;

      if (!validator.check(tempPaw, "required")) {
        newErrors.paw = "required";
        result = false;
      } else if (!validator.check(tempPaw, "pawFormat")) {
        newErrors.paw = "pawFormat";
        result = false;
      } else {
        newErrors.paw = "";
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
        if (signInResponse.code == "0000") {
          setAuthToken(signInResponse.result);
          navigate("machine");
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

  setWindowClass("login-page");

  return (
    <>
      <div className="login-box">
        <div className="card card-outline card-primary">
          <div className="card-header text-center">
            <h1 style={{fontSize:'25px'}}>AR管理系統</h1>
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
                      case "required":
                        return (
                          <div className="invalid-feedback d-block">
                            <i className="fas fa-exclamation-circle"></i>{" "}
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
                      case "required":
                        return (
                          <div className="invalid-feedback d-block">
                            <i className="fas fa-exclamation-circle"></i>{" "}
                            不得空白
                          </div>
                        );
                      case "pawFormat":
                        return (
                          <div className="invalid-feedback d-block">
                            <i className="fas fa-exclamation-circle"></i>{" "}
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
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  );
}

export default Login;
