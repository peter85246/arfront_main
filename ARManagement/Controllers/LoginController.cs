using ARManagement.BaseRepository.Interface;
using ARManagement.Helpers;
using Microsoft.AspNetCore.Mvc;
using Models;
using System;
using System.Diagnostics;
using System.Text;
using System.Text.RegularExpressions;
using System.Security.Cryptography;


namespace ARManagement.Controllers
{
    public class LoginController : MyBaseApiController
    {
        private readonly JwtHelper _jwtHelper;
        private readonly IBaseRepository _baseRepository;
        private readonly ResponseCodeHelper _responseCodeHelper;

        public LoginController(
            JwtHelper jwtHelper,
           IBaseRepository baseRepository,
           ResponseCodeHelper responseCodeHelper)
        {
            _jwtHelper = jwtHelper;
            _baseRepository = baseRepository;
            _responseCodeHelper = responseCodeHelper;
        }

        /// <summary>
        /// 1. 登入
        /// </summary>
        /// <param name="post"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<ApiResult<string>>> SignIn(PostSignIn post)
        {
            _baseRepository.SetSchemaFromContext();  // 確保在數據庫操作前設置 schema

            ApiResult<string> apiResult = new ApiResult<string>();

            try
            {
                #region 欄位驗證

                #region 判斷必填欄位
                if (string.IsNullOrEmpty(post.Account) ||  //帳號
                    string.IsNullOrEmpty(post.Paw) //密碼
                    )
                {
                    apiResult.Code = "2003"; //有必填欄位尚未填寫
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }
                #endregion

                #region 密碼是否合法
                //判斷是否有不合法的特殊符號
                var tempMailTooken = post.Paw;

                //取代字串
                tempMailTooken = Regex.Replace(tempMailTooken, "\\d", "");
                tempMailTooken = Regex.Replace(tempMailTooken, "[A-Z]", "");
                tempMailTooken = Regex.Replace(tempMailTooken, "[a-z]", "");
                tempMailTooken = Regex.Replace(tempMailTooken, "[,.~!@#$%^&*_+\\-=]", "");

                if (tempMailTooken.Length > 0)
                {
                    apiResult.Code = "2004"; //不合法的欄位
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }
                #endregion

                #endregion

                #region 判斷帳號是否存在
                var where = $@"""Deleted"" = 0 AND ""UserAccount"" = @UserAccount ";

                var userinfo = await _baseRepository.GetOneAsync<Userinfo>("Userinfo", where, new { UserAccount = post.Account });

                Console.WriteLine($"Debug - User info fetched: {userinfo?.UserName}");  // Log the fetched user info to verify

                if (userinfo == null)
                {
                    apiResult.Code = "4003"; //該帳號不存在
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }
                #endregion

                #region 判斷密碼是否正確
                // 輸出資料庫中的密碼和計算後的密碼哈希值
                Console.WriteLine($"Database Password: {userinfo.UserPassword}");
                EDFunction edFunction = new EDFunction();
                /*var userPaw = edFunction.GetSHA256Encryption(post.Paw);*/  // 確保這裡加密後的密碼與資料庫中的密碼格式一致
                string userPaw = ComputeSha256Hash(post.Paw);
                Console.WriteLine($"Computed Hash: {userPaw}");

                Console.WriteLine($"Debug - Encrypted Password: {userPaw}");  // 輸出加密後的密碼，檢查

                if (userPaw != userinfo.UserPassword)
                {
                    apiResult.Code = "1004"; //帳號或密碼錯誤
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }
                #endregion

                var jwtToken = _jwtHelper.GenerateToken(userinfo);

                apiResult.Code = "0000";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                apiResult.Result = jwtToken.Token;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during login: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                apiResult.Code = "9999";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                exceptionMsg = ex.ToString();
                stackTrace = new StackTrace(ex);
            }

            return Ok(apiResult);
        }

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

        // Method to get user details
        [HttpGet("user/details/{userId}")]
        public async Task<ActionResult<Userinfo>> GetUserDetails(int userId)
        {
            string schemaName = HttpContext.Items["SchemaName"] as string;
            if (!string.IsNullOrEmpty(schemaName))
            {
                _baseRepository.SetSchema(schemaName);  // Assuming you have a method to set the schema dynamically
            }

            var userInfo = await _baseRepository.GetOneAsync<Userinfo>("Userinfo", new { UserId = userId });
            if (userInfo == null)
            {
                return NotFound("User not found.");
            }
            return Ok(userInfo);
        }
    }
}
