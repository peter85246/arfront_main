import React, { useState } from 'react';
import {
  Card,
  Tab,
  Tabs,
  Form,
  Button,
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

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false); // 狀態表示是否正在登錄

  const navigate = useNavigate();

  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // const handleLogin = (e) => {
  //   e.preventDefault();
  //   setIsLoggingIn(true); // 開始登錄
  //   console.log('Login attempt with:', { email, password });

  //   // 模擬登錄過程的延遲
  //   setTimeout(() => {
  //     if (email === 'test@example.com' && password === 'password123') {
  //       toast.success('登錄成功!');
  //       navigate('/login'); // 登錄成功後導航到login 或其他您指定的路由
  //     } else {
  //       toast.error('登錄失敗，電子郵件或密碼不正確!');
  //     }
  //     setIsLoggingIn(false);
  //   }, 2000); // 2秒延遲以模擬服務器請求
  // };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    axios
      .post('http://localhost:8098/api/VendorRegistration/login', {
        email: email,
        password: password,
      })
      .then((response) => {
        const { code, message } = response.data;
        if (code === '0000') {
          toast.success('登錄成功!');
          navigate('/login'); // 修改這裡導航到成功登錄後的路由
        } else {
          toast.error(message);
        }
        setIsLoggingIn(false);
      })
      .catch((error) => {
        toast.error('登錄請求失敗: ' + error.message);
        setIsLoggingIn(false);
      });
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

const RegisterForm = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // const handleSendCode = () => {
  //   setIsSendingCode(true);
  //   setTimeout(() => {
  //     toast.info(`驗證碼發送到: ${formData.email}`);
  //     setIsSendingCode(false);
  //   }, 1000); // 模擬發送驗證碼的延遲
  // };
  const handleSendCode = () => {
    setIsSendingCode(true);
    axios
      .post(
        'http://localhost:8098/api/VendorRegistration/send-verification-code',
        {
          email: formData.email,
        }
      )
      .then((response) => {
        const { message } = response.data;
        toast.info(message);
        setIsSendingCode(false);
      })
      .catch((error) => {
        toast.error('發送驗證碼失敗: ' + error.message);
        setIsSendingCode(false);
      });
  };

  // const handleRegister = (e) => {
  //   e.preventDefault();
  //   setIsRegistering(true); // 開始註冊
  //   console.log('Registration attempt with:', formData);

  //   // 模擬註冊過程的延遲
  //   setTimeout(() => {
  //     setIsRegistering(false);
  //     // 註冊成功提示
  //     if (formData.verificationCode === '1234') {
  //       toast.success('註冊成功!');
  //     } else {
  //       toast.error('註冊失敗，驗證碼不正確!');
  //     }
  //   }, 2000); // 註冊完成後解除禁用狀態
  // };
  const handleRegister = (e) => {
    e.preventDefault();
    setIsRegistering(true);
    axios.post('http://localhost:8098/api/VendorRegistration/register', {
      companyName: formData.companyName,
      contactName: formData.contactName,
      email: formData.email,
      phoneNumber: formData.phone,
      industryType: formData.industry,
      password: formData.password,
      confirmPassword: formData.confirmPassword // 確認這個字段是否後端需要
        .then((response) => {
          const { code, message } = response.data;
          if (code === '0000') {
            toast.success('註冊成功!');
          } else {
            toast.error(message);
          }
          setIsRegistering(false);
        })
        .catch((error) => {
          toast.error('註冊失敗: ' + error.message);
          setIsRegistering(false);
        }),
    });
  };

  // const handleVerifyCode = () => {
  //   setIsVerifyingCode(true);
  //   setTimeout(() => {
  //     if (formData.verificationCode === '1234') {
  //       toast.success('驗證成功!');
  //     } else {
  //       toast.error('驗證失敗! 驗證碼輸入錯誤。');
  //     }
  //     setIsVerifyingCode(false);
  //   }, 1000); // 模擬驗證過程的延遲
  // };
  const handleVerifyCode = () => {
    setIsVerifyingCode(true);
    axios
      .post('http://localhost:8098/api/VendorRegistration/verify-email', {
        email: formData.email,
        verificationCode: formData.verificationCode,
      })
      .then((response) => {
        const { code, message } = response.data;
        if (code === '0000') {
          toast.success('驗證成功!');
        } else {
          toast.error(message);
        }
        setIsVerifyingCode(false);
      })
      .catch((error) => {
        toast.error('驗證失敗: ' + error.message);
        setIsVerifyingCode(false);
      });
  };

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
            <option value="it">IT</option>
            <option value="finance">金融</option>
            <option value="education">教育</option>
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
        disabled={isRegistering}
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
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-gradient-to-r from-blue-100 to-purple-100">
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
          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
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
