using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class EmailModel
    {
        public string Email { get; set; } // 電子郵箱
    }

    // 供應商註冊資訊模型
    public class VendorRegistration
    {
        public string CompanyName { get; set; } // 公司名稱
        public string ContactName { get; set; } // 聯絡人姓名
        public string Email { get; set; } // 電子郵箱
        [RegularExpression(@"^[0-9]{10}$", ErrorMessage = "聯繫電話必須是10位數字")]
        public string PhoneNumber { get; set; } // 聯絡電話
        public string IndustryType { get; set; } // 行業類型
        public string Password { get; set; } // 密碼
    }

    // 登錄資訊模型
    public class LoginModel
    {
        public string Email { get; set; } // 電子郵箱
        public string Password { get; set; } // 密碼
    }

    // 郵箱驗證模型
    public class VerificationModel
    {
        public string Email { get; set; } // 電子郵箱
        public string VerificationCode { get; set; } // 驗證碼
    }

    // API回應模型
    public class ApiResponse<T>
    {
        public string Code { get; set; } // 回應代碼
        public string Message { get; set; } // 回應消息
        public T Data { get; set; } // 回應資料

        public ApiResponse(string code, string message, T data = default)
        {
            Code = code;
            Message = message;
            Data = data;
        }
    }

    // 電子郵件驗證回應模型
    public class EmailVerificationResponse
    {
        public string Status { get; set; } // 郵箱驗證狀態
        // 根据Emailable API的返回添加更多属性
    }

    public class SmtpSettings
    {
        public string Server { get; set; } // SMTP 服務器地址
        public int Port { get; set; } // SMTP 服務器端口
        public string Username { get; set; } // SMTP 服務器用戶名
        public string Password { get; set; } // SMTP 服務器密碼
        public bool EnableSSL { get; set; } // 是否啟用SSL
        public string SenderEmail { get; set; } // 發件人郵箱地址
    }

}
