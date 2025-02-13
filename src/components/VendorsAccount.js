import React, { useState } from 'react';
import {
  Card,
  Tab,
  Tabs,
  Form,
  Button,
  FormLabel,
  InputGroup,
  FormControl,
  FormGroup,
  Spinner,
} from 'react-bootstrap';
import { Lock, Mail, Building, User, Phone, CheckSquare } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setAuthToken } from '../utils/TokenUtil';
import {
  apiVendorSignIn,
  apiVendorSignUp,
  apiVendorSendVerificationCode,
  apiVendorVerifyCode,
} from '../utils/Api';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false); // 狀態表示是否正在登錄

  const navigate = useNavigate();

  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const response = await apiVendorSignIn({ email, password });
      console.log('登錄響應:', response);
      const { code, data } = response;
      if (code === '0000' && data) {
        localStorage.setItem('schema_name', data.schemaName);
        localStorage.setItem('vendor_email', data.email);
        localStorage.setItem('userId', data.userId.toString());
        setAuthToken(data.token);

        console.log('登錄成功,使用 schema:', data.schemaName);
        setTimeout(() => {
          toast.success('登錄成功!');
          setTimeout(() => {
            navigate('/login');
            setIsLoggingIn(false);
          }, 1000);
        }, 500);
      } else {
        setTimeout(() => {
          toast.error(
            '登錄失敗: ' + (data && data.message ? data.message : '未知錯誤')
          );
          setIsLoggingIn(false);
        }, 1000);
      }
    } catch (error) {
      console.error('登錄錯誤:', error);
      setTimeout(() => {
        toast.error('登錄失敗: 連接服務器失敗 ' + error.message);
        setIsLoggingIn(false);
      }, 1000);
    }
  };

  return (
    <Form onSubmit={handleLogin} style={{ backgroundColor: 'white' }}>
      <FormGroup className="mb-3">
        <Form.Label>電子郵箱</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <Mail size={16} />
          </InputGroup.Text>
          <FormControl
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </InputGroup>
      </FormGroup>
      <FormGroup className="mb-3">
        <Form.Label>密碼</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <Lock size={16} />
          </InputGroup.Text>
          <FormControl
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </InputGroup>
      </FormGroup>
      <Button
        type="submit"
        variant="primary"
        className="w-100"
        style={{
          backgroundColor: isLoggingIn ? '#4169E1' : 'darkblue', // 原始深藍色為 #4169E1，淺藍色為 darkblue
          transition: 'background-color 0.3s ease',
        }}
        onMouseEnter={(e) => {
          if (!isLoggingIn) {
            e.target.style.backgroundColor = '#4169E1'; // 恢復原始深藍色
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoggingIn) {
            e.target.style.backgroundColor = 'darkblue'; // 鼠標離開始調淺
          }
        }}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <Spinner as="span" animation="border" size="sm" />
        ) : (
          '登入'
        )}
      </Button>
    </Form>
  );
};

const RegisterForm = ({ setActiveTab }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    industry: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });

  // 分開的狀態管理
  const [isSendingCode, setIsSendingCode] = useState(false); // "發送驗證碼" 按鈕的狀態
  const [isVerifyingCode, setIsVerifyingCode] = useState(false); // "驗證" 按鈕的狀態
  const [isRegistering, setIsRegistering] = useState(false); // "立即註冊" 按鈕的狀態
  const [verificationPassed, setVerificationPassed] = useState(false); // 定義 註冊驗證碼 狀態及其設置函數
  const [showTooltip, setShowTooltip] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  //#region 驗證密碼和電子郵箱格式
  const validateForm = () => {
    const { password, confirmPassword, email, phone } = formData;
    const emailLocalPart = email.split('@')[0];
    const phonePattern = /^[0-9]{10}$/; // 正則表達式，檢查是否為10位數字(聯繫電話)

    if (password.length < 6) {
      toast.error('密碼長度至少為6個字符!');
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('密碼和確認密碼不匹配!');
      return false;
    }

    if (emailLocalPart.length < 4) {
      toast.error('電子郵箱@之前至少為4個字符!');
      return false;
    }

    if (!phonePattern.test(phone)) {
      toast.error('聯繫電話必須是10位數字!');
      return false;
    }

    return true;
  };
  //#endregion

  //#region 信箱驗證方法 & API
  const handleSendCode = async () => {
    setIsSendingCode(true);
    try {
      const response = await apiVendorSendVerificationCode({
        email: formData.email,
      });
      const { message } = response;
      toast.info(message);
    } catch (error) {
      toast.error('發送驗證碼失敗: ' + error.message);
    } finally {
      setIsSendingCode(false);
    }
  };
  //#endregion

  //#region 註冊方法 & API
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm() || !verificationPassed) {
      return;
    }

    setIsRegistering(true);
    try {
      const response = await apiVendorSignUp({
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.email,
        phoneNumber: formData.phone,
        industryType: formData.industry,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      const { code, message } = response;
      if (code === '0000') {
        setTimeout(() => {
          toast.success('註冊成功!');
          setTimeout(() => {
            setActiveTab('login');
            setIsRegistering(false);
          }, 1500);
        }, 500);
      } else if (code === '1002') {
        toast.error('該聯繫人姓名和電話已存在，請使用不同的聯繫人資料。');
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error('註冊失敗: ' + error.message);
    } finally {
      setIsRegistering(false);
    }
  };
  //#endregion

  //#region 提交Mail信箱收取到的驗證碼方法 & API
  const handleVerifyCode = async () => {
    setIsVerifyingCode(true);
    try {
      const response = await apiVendorVerifyCode({
        email: formData.email,
        verificationCode: formData.verificationCode,
      });
      const { code, message } = response;
      if (code === '0000') {
        toast.success('驗證成功!');
        setVerificationPassed(true);
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error('驗證失敗: ' + error.message);
    } finally {
      setTimeout(() => {
        setIsVerifyingCode(false);
      }, 1000);
    }
  };
  //#endregion

  return (
    <Form onSubmit={handleRegister} style={{ backgroundColor: 'white' }}>
      <FormGroup className="mb-3">
        <Form.Label>公司名稱</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <Building size={16} />
          </InputGroup.Text>
          <FormControl
            type="text"
            placeholder="您的公司"
            value={formData.companyName}
            name="companyName"
            onChange={handleChange}
            required
          />
        </InputGroup>
      </FormGroup>
      <FormGroup className="mb-3">
        <Form.Label>聯繫人姓名</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <User size={16} />
          </InputGroup.Text>
          <FormControl
            type="text"
            placeholder="您的姓名"
            value={formData.contactName}
            name="contactName"
            onChange={handleChange}
            required
          />
        </InputGroup>
      </FormGroup>
      <FormGroup className="mb-3">
        <Form.Label>電子郵箱</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <Mail size={16} />
          </InputGroup.Text>
          <FormControl
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            name="email"
            onChange={handleChange}
            required
          />
          <Button
            variant="outline-secondary"
            onClick={handleSendCode}
            disabled={isSendingCode}
            style={{
              backgroundColor: 'grey',
              color: 'white',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#3f3f3f')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = 'grey')}
          >
            {isSendingCode ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              '發送驗證碼'
            )}
          </Button>
        </InputGroup>
      </FormGroup>
      <FormGroup className="mb-3">
        <Form.Label>驗證碼</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <Mail size={16} />
          </InputGroup.Text>
          <FormControl
            type="text"
            placeholder="輸入驗證碼"
            value={formData.verificationCode}
            name="verificationCode"
            onChange={handleChange}
            required
          />
          <Button
            variant="outline-secondary"
            onClick={handleVerifyCode}
            disabled={isVerifyingCode}
            style={{
              backgroundColor: 'grey',
              color: 'white',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#3f3f3f')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = 'grey')}
          >
            {isVerifyingCode ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              '驗證'
            )}
          </Button>
        </InputGroup>
      </FormGroup>
      <FormGroup className="mb-3">
        <Form.Label>聯繫電話</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <Phone size={16} />
          </InputGroup.Text>
          <FormControl
            type="tel"
            placeholder="0912345678"
            value={formData.phone}
            name="phone"
            onChange={handleChange}
            required
          />
        </InputGroup>
      </FormGroup>
      <FormGroup className="mb-3">
        <Form.Label>行業類型</Form.Label>
        <InputGroup>
          <FormControl
            as="select"
            value={formData.industry}
            name="industry"
            onChange={handleChange}
            required
          >
            <option value="">選擇行業</option>
            <option value="traditional_machining">傳統工具機</option>
            <option value="ai_machine_tools">AI工具機</option>
            <option value="smart_manufacturing">智能製造</option>
            <option value="precision_engineering">精密工程</option>
            <option value="industrial_automation">工業自動化</option>
            <option value="robotics">機器人技術</option>
            <option value="ai">AI相關</option>
            <option value="other">其他</option>
          </FormControl>
        </InputGroup>
      </FormGroup>
      <FormGroup className="mb-3">
        <Form.Label>設置密碼</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <Lock size={16} />
          </InputGroup.Text>
          <FormControl
            type="password"
            placeholder="••••••••"
            value={formData.password}
            name="password"
            onChange={handleChange}
            required
          />
        </InputGroup>
      </FormGroup>
      <FormGroup className="mb-3">
        <Form.Label>確認密碼</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <Lock size={16} />
          </InputGroup.Text>
          <FormControl
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            name="confirmPassword"
            onChange={handleChange}
            required
          />
        </InputGroup>
      </FormGroup>
      <Button
        type="submit"
        variant="success"
        className="w-100"
        title="註冊需先驗證電子郵件" // 當滑鼠懸停時會顯示這段文字
        style={{
          backgroundColor: isRegistering ? '#4169E1' : 'darkblue', // 原始深藍色為 #4169E1，淺藍色為 darkblue
          transition: 'background-color 0.3s ease',
        }}
        onMouseEnter={(e) => {
          if (!isRegistering) {
            e.target.style.backgroundColor = '#4169E1'; // 恢復原始深藍色
          }
        }}
        onMouseLeave={(e) => {
          if (!isRegistering) {
            e.target.style.backgroundColor = 'darkblue'; // 鼠標離開時調淺
          }
        }}
        disabled={!verificationPassed || isRegistering} // 確保在電子郵件驗證通過前不可點擊
      >
        {isRegistering ? (
          <Spinner as="span" animation="border" size="sm" />
        ) : (
          '立即註冊'
        )}
      </Button>
    </Form>
  );
};

export default function VendorsAccount() {
  const [activeTab, setActiveTab] = useState('login');

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 min-vw-100"
      style={{
        background: 'linear-gradient(to right, #cce4f7, #d5c4f7)', // 原始的紫藍漸變顏色
      }}
    >
      <Card style={{ width: '400px' }} className="shadow-lg">
        <Card.Header
          className="text-center"
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Card.Title
            style={{
              fontSize: '25px',
              fontWeight: 'bold',
              textAlign: 'center',
              margin: '10px',
            }}
          >
            歡迎使用
            <br />
            <p
              style={{
                fontSize: '15px',
                textAlign: 'center',
                fontWeight: 'normal',
              }}
            >
              登錄或創建您的帳戶
              <br />
            </p>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <div
            className="w-full d-flex justify-content-center mb-3"
            style={{
              border: 'none',
              borderRadius: '5px',
              backgroundColor: '#e9ecef',
              overflow: 'hidden',
            }}
          >
            <Button
              variant={activeTab === 'login' ? 'primary' : 'light'}
              onClick={() => handleTabSelect('login')}
              style={{
                width: '50%',
                borderRadius: '5px', // 左邊圓角
                backgroundColor:
                  activeTab === 'login' ? 'white' : 'transparent',
                color: activeTab === 'login' ? 'black' : '#6c757d', // 非選中狀態狀態顏色淡
                boxShadow:
                  activeTab === 'login' ? '0 0 5px rgba(0, 0, 0, 0.1)' : 'none', // 選中狀態有陰影
                border: 'none',
                borderRight: '1px solid #ddd',
                transition: 'background-color 0.3s ease',
                margin: '4px',
              }}
            >
              登錄
            </Button>
            <Button
              variant={activeTab === 'register' ? 'primary' : 'light'}
              onClick={() => handleTabSelect('register')}
              style={{
                width: '50%',
                borderRadius: '5px', // 右邊圓角
                backgroundColor:
                  activeTab === 'register' ? 'white' : 'transparent',
                color: activeTab === 'register' ? 'black' : '#6c757d',
                boxShadow:
                  activeTab === 'register'
                    ? '0 0 5px rgba(0, 0, 0, 0.1)'
                    : 'none',
                border: 'none',
                transition: 'background-color 0.3s ease',
                margin: '4px 4px 4px 0px',
              }}
            >
              註冊
            </Button>
          </div>
          {activeTab === 'login' ? (
            <LoginForm />
          ) : (
            <RegisterForm setActiveTab={setActiveTab} />
          )}
        </Card.Body>
      </Card>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
