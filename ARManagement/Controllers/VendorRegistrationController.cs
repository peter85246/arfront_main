using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Data;
using Npgsql;
using System.Security.Cryptography;
using System.Text;
using Models;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Net;
using System.Net.Mail;
using System.Net.Http.Headers;
using System.Net.Http;
using Newtonsoft.Json;  // 用於JSON反序列化
using ARManagement.BaseRepository.Interface;

// 定義API路由前綴，用於處理供應商註冊相關的請求
[Route("api/[controller]")]
[ApiController]
public class VendorRegistrationController : ControllerBase
{
    // 資料庫連接字串
    private readonly string _connectionString;
    private readonly SmtpSettings _smtpSettings;
    private readonly IBaseRepository _baseRepository;

    // 透過依賴注入獲取資料庫配置
    public VendorRegistrationController(IOptions<SmtpSettings> smtpSettings, IOptions<PostgreSqlDBConfig> dbConfig, IBaseRepository baseRepository)
    {
        _smtpSettings = smtpSettings.Value;
        _connectionString = dbConfig.Value.ConnectionString;
        _baseRepository = baseRepository;
        // 使用環境變量來獲取SMTP密碼
        //_smtpSettings.Password = Environment.GetEnvironmentVariable("SMTP_PASSWORD");
    }

    // 生成六位數的隨機驗證碼
    private string GenerateVerificationCode()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }

    // 處理註冊請求
    [HttpPost]
    [Route("register")]
    public async Task<IActionResult> Register([FromBody] VendorRegistration registration)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState); // 返回所有驗證錯誤
        }

        // 檢查必要字段是否填寫
        if (string.IsNullOrWhiteSpace(registration.Email) || string.IsNullOrWhiteSpace(registration.Password))
        {
            return Ok(new ApiResponse<string>("1001", "Email和密碼是必填的。"));
        }

        using (var conn = new NpgsqlConnection(_connectionString))
        {
            conn.Open();

            // 首先確認此郵箱是否已經通過驗證
            using (var checkVerificationCmd = new NpgsqlCommand("SELECT is_verified FROM \"EmailVerifications\" WHERE email = @Email", conn))
            {
                checkVerificationCmd.Parameters.AddWithValue("Email", registration.Email);
                bool isVerified = (bool?)await checkVerificationCmd.ExecuteScalarAsync() ?? false;

                if (!isVerified)
                {
                    return Ok(new ApiResponse<string>("1004", "郵箱未驗證。請先驗證您的郵箱。"));
                }
            }

            // 查詢郵箱是否已被註冊
            using (var checkCmd = new NpgsqlCommand("SELECT COUNT(*) FROM \"Vendors\" WHERE email = @Email", conn))
            {
                checkCmd.Parameters.AddWithValue("Email", registration.Email);
                long exists = (long)await checkCmd.ExecuteScalarAsync();
                if (exists > 0)
                {
                    return Ok(new ApiResponse<string>("1001", "郵箱已被註冊。"));
                }
            }

            // 查詢聯繫人姓名和電話是否已存在
            using (var checkContactCmd = new NpgsqlCommand("SELECT COUNT(*) FROM \"Vendors\" WHERE contact_name = @ContactName AND phone_number = @PhoneNumber", conn))
            {
                checkContactCmd.Parameters.AddWithValue("ContactName", registration.ContactName);
                checkContactCmd.Parameters.AddWithValue("PhoneNumber", registration.PhoneNumber);
                long contactExists = (long)await checkContactCmd.ExecuteScalarAsync();
                if (contactExists > 0)
                {
                    return Ok(new ApiResponse<string>("1002", "該聯繫人姓名和電話已存在，請使用不同的聯繫人資料。"));
                }
            }

            // 插入新供應商資料
            var passwordHash = ComputeSha256Hash(registration.Password);
            using (var cmd = new NpgsqlCommand("INSERT INTO \"Vendors\" (company_name, contact_name, email, phone_number, industry_type, password_hash, \"Creator\", \"CreatedTime\", \"Updater\", \"UpdateTime\") VALUES (@CompanyName, @ContactName, @Email, @PhoneNumber, @IndustryType, @PasswordHash, 1, NOW(), NULL, NULL) RETURNING userid", conn))
            {
                cmd.Parameters.AddWithValue("CompanyName", registration.CompanyName);
                cmd.Parameters.AddWithValue("ContactName", registration.ContactName);
                cmd.Parameters.AddWithValue("Email", registration.Email);
                cmd.Parameters.AddWithValue("PhoneNumber", registration.PhoneNumber);
                cmd.Parameters.AddWithValue("IndustryType", registration.IndustryType);
                cmd.Parameters.AddWithValue("PasswordHash", passwordHash);

                var newUserId = await cmd.ExecuteScalarAsync();
                if (newUserId != null)
                {
                    return Ok(new ApiResponse<string>("0000", "註冊成功!"));
                }
                else
                {
                    return Ok(new ApiResponse<string>("9999", "註冊失敗!註冊過程中發生錯誤。"));
                }
            }
        }
    }


    // 處理登錄請求
    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        if (string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
        {
            return Ok(new ApiResponse<string>("1001", "Email和密碼是必填的。"));
        }

        var passwordHash = ComputeSha256Hash(model.Password);
        Console.WriteLine($"Login attempt for email: {model.Email}");
        Console.WriteLine($"Computed password hash: {passwordHash}");

        using (var conn = new NpgsqlConnection(_connectionString))
        {
            try
            {
                await conn.OpenAsync();

                // 擴展查詢以包括 schema_name
                using (var cmd = new NpgsqlCommand("SELECT id, userid, password_hash, schema_name FROM public.\"Vendors\" WHERE email = @Email", conn))
                {
                    cmd.Parameters.AddWithValue("Email", model.Email);

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            var id = reader.GetInt32(0);
                            var userId = reader.GetInt32(1);
                            var storedHash = reader.GetString(2);
                            var schemaName = reader.IsDBNull(3) ? null : reader.GetString(3);

                            Console.WriteLine($"Found vendor - ID: {id}, UserID: {userId}");
                            Console.WriteLine($"Stored hash: {storedHash}");

                            if (storedHash == passwordHash)
                            {
                                // 設置當前 Schema
                                _baseRepository.SetSchema(schemaName);  // 確保這個方法能夠將 schema 設置為動態
                                HttpContext.Items["SchemaName"] = schemaName;

                                var userInfo = new
                                {
                                    UserId = userId,
                                    Email = model.Email,
                                    SchemaName = schemaName  // 確保此值傳遞給前端
                                };
                                return Ok(new ApiResponse<object>("0000", "登錄成功!", userInfo));
                            }
                            else
                            {
                                Console.WriteLine("Password hash mismatch");
                            }
                        }
                        else
                        {
                            Console.WriteLine("No vendor found with the provided email");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during login: {ex.Message}");
                return StatusCode(500, new ApiResponse<string>("9999", "登錄過程中發生錯誤。"));
            }
        }

        return Ok(new ApiResponse<string>("1001", "登錄失敗，無效的帳號或密碼!"));
    }

    // 生成SHA256哈希
    private static string ComputeSha256Hash(string rawData)
    {
        using (SHA256 sha256Hash = SHA256.Create())
        {
            byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            StringBuilder builder = new StringBuilder();
            for (int i = 0; i < bytes.Length; i++)
            {
                builder.Append(bytes[i].ToString("x2"));
            }
            return builder.ToString();
        }
    }

    private async Task<bool> SendVerificationEmail(string email, string verificationCode)
    {

        if (string.IsNullOrWhiteSpace(email))
        {
            Console.WriteLine("Email address is null or empty, cannot send verification email.");
            return false;
        }

        try
        {
            using (var client = new SmtpClient(_smtpSettings.Server, _smtpSettings.Port))
            {
                client.EnableSsl = _smtpSettings.EnableSSL;
                client.Credentials = new NetworkCredential(_smtpSettings.Username, _smtpSettings.Password);

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_smtpSettings.SenderEmail, "生成式AR售服平台"), //修改"" 信封Title
                    Subject = "生成式AR售服平台系統驗證郵件", // 更改此處以設定郵件標題
                    Body = $"您在生成式AR售服平台系統中，所需要註冊的Mail信箱驗證碼是: {verificationCode}",
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(email);

                await client.SendMailAsync(mailMessage);
                return true;
            }
        }
        catch (SmtpException ex)
        {
            Console.WriteLine($"SMTP server error: {ex.StatusCode} - {ex.Message}");
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send email: {ex.Message}");
            return false;
        }
    }


    private async Task<bool> SendVerificationCodeEmail(string email, string verificationCode)
    {
        Console.WriteLine("Starting SendVerificationCodeEmail");
        try
        {
            SmtpClient client = new SmtpClient("smtp.yourserver.com")
            {
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential("username", "password"),
                EnableSsl = true,
                Port = 587 // 根據您的郵件服務商要求調整
            };

            MailMessage mailMessage = new MailMessage
            {
                From = new MailAddress("no-reply@yourdomain.com"),
                Subject = "Your Verification Code",
                Body = $"Your verification code is: {verificationCode}",
                IsBodyHtml = true
            };
            mailMessage.To.Add(email);

            await client.SendMailAsync(mailMessage);
            Console.WriteLine("Email sent successfully");
            return true;
        }
        catch (SmtpException ex)
        {
            Console.WriteLine($"SMTP server error: {ex.StatusCode} - {ex.Message}");
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"General email send failed: {ex.Message}");
            return false;
        }
        finally
        {
            Console.WriteLine("Exiting SendVerificationCodeEmail");
        }
    }


    // POST: api/VendorRegistration/send-verification-code
    [HttpPost("send-verification-code")]
    public async Task<IActionResult> SendVerificationCode([FromBody] EmailModel model)
    {
        var verificationCode = GenerateVerificationCode();

        using (var conn = new NpgsqlConnection(_connectionString))
        {
            conn.Open();

            // 檢查該郵箱是否已存在於驗證表中
            using (var checkCmd = new NpgsqlCommand("SELECT COUNT(*) FROM \"EmailVerifications\" WHERE email = @Email", conn))
            {
                checkCmd.Parameters.AddWithValue("Email", model.Email);
                long exists = (long)await checkCmd.ExecuteScalarAsync();

                if (exists > 0)
                {
                    // 如果郵箱已經存在，更新驗證碼和過期時間
                    using (var updateCmd = new NpgsqlCommand("UPDATE \"EmailVerifications\" SET verification_code = @VerificationCode, verification_code_expiry = @Expiry, is_verified = FALSE WHERE email = @Email", conn))
                    {
                        updateCmd.Parameters.AddWithValue("VerificationCode", verificationCode);
                        updateCmd.Parameters.AddWithValue("Expiry", DateTime.UtcNow.AddMinutes(2)); // 確保過期時間正確設置
                        updateCmd.Parameters.AddWithValue("Email", model.Email);
                        int rowsAffected = await updateCmd.ExecuteNonQueryAsync();
                        if (rowsAffected == 0)
                        {
                            // 如果沒有更新任何行，則返回錯誤
                            return StatusCode(500, new ApiResponse<string>("1001", "更新資料庫失敗。"));
                        }
                    }
                }
                else
                {
                    // 如果郵箱不存在，插入新的記錄
                    using (var insertCmd = new NpgsqlCommand("INSERT INTO \"EmailVerifications\" (email, verification_code, verification_code_expiry) VALUES (@Email, @VerificationCode, @Expiry)", conn))
                    {
                        insertCmd.Parameters.AddWithValue("Email", model.Email);
                        insertCmd.Parameters.AddWithValue("VerificationCode", verificationCode);
                        insertCmd.Parameters.AddWithValue("Expiry", DateTime.UtcNow.AddMinutes(5));
                        int rowsAffected = await insertCmd.ExecuteNonQueryAsync();
                        if (rowsAffected == 0)
                        {
                            // 如果沒有插入任何行，則返回錯誤
                            return StatusCode(500, new ApiResponse<string>("1001", "插入資料庫失敗。"));
                        }
                    }
                }
            }
        }

        // 發送驗證碼
        bool emailSent = await SendVerificationEmail(model.Email, verificationCode);
        if (!emailSent)
        {
            return StatusCode(500, new ApiResponse<string>("1001", "驗證碼郵件發送失敗。"));
        }

        return Ok(new ApiResponse<string>("0000", $"驗證碼已發送至您的郵箱：{model.Email}。"));
    }


    // 處理郵箱驗證請求
    [HttpPost]
    [Route("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerificationModel model)
    {
        using (var conn = new NpgsqlConnection(_connectionString))
        {
            conn.Open();

            using (var cmd = new NpgsqlCommand("SELECT verification_code, verification_code_expiry FROM \"EmailVerifications\" WHERE email = @Email AND is_verified = FALSE", conn))
            {
                cmd.Parameters.AddWithValue("Email", model.Email);
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (reader.Read())
                    {
                        var storedCode = reader["verification_code"]?.ToString();
                        if (DateTime.TryParse(reader["verification_code_expiry"]?.ToString(), out var expiry))
                        {
                            if (DateTime.UtcNow > expiry)
                            {
                                return Ok(new ApiResponse<string>("1003", "驗證碼已過期。"));
                            }
                        }

                        if (storedCode == model.VerificationCode)
                        {
                            reader.Close();
                            using (var updateCmd = new NpgsqlCommand("UPDATE \"EmailVerifications\" SET is_verified = TRUE, \"Updater\" = 1, \"UpdateTime\" = NOW() WHERE email = @Email", conn))
                            {
                                updateCmd.Parameters.AddWithValue("Email", model.Email);
                                await updateCmd.ExecuteNonQueryAsync();
                                return Ok(new ApiResponse<string>("0000", "郵箱驗證成功!"));
                            }
                        }
                        else
                        {
                            return Ok(new ApiResponse<string>("1001", "驗證碼輸入錯誤。"));
                        }
                    }
                    else
                    {
                        return Ok(new ApiResponse<string>("1004", "驗證碼無效，請確認填入的內容是否與信箱收取的驗整碼一致。"));
                    }
                }
            }
        }
    }



    private async Task<bool> SendConfirmationEmail(string email)
    {
        var message = "恭喜！您的郵箱已經成功驗證。";
        return await SendEmail(email, "郵箱驗證成功", message);
    }

    // 假設以下為發送郵件的方法
    private async Task<bool> SendEmail(string email, string subject, string message)
    {
        try
        {
            using (var client = new SmtpClient(_smtpSettings.Server, _smtpSettings.Port))
            {
                client.EnableSsl = _smtpSettings.EnableSSL;
                client.Credentials = new NetworkCredential(_smtpSettings.Username, _smtpSettings.Password);

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_smtpSettings.SenderEmail),
                    Subject = subject,
                    Body = message,
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(email);

                await client.SendMailAsync(mailMessage);
                return true;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send email: {ex.Message}");
            return false;
        }
    }


}
