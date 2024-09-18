using Microsoft.AspNetCore.Http;

using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;

namespace Models
{
    /// <summary>
    /// 共用
    /// </summary>
    public class CommonFunction
    {
        /// <summary>
        /// 驗證信箱格式
        /// </summary>
        /// <param name="emailaddress"></param>
        /// <returns></returns>
        public bool IsMailValid(string mail)
        {
            try
            {
                MailAddress m = new MailAddress(mail);

                return true;
            }
            catch (FormatException)
            {
                return false;
            }
        }

        public string GenerateRandCode(int length, bool specialChart = true)
        {
            //產生驗證碼
            Random random = new Random((int)DateTime.Now.Ticks);

            string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

            if (specialChart)
            {
                chars += "!@$^*_";
            }

            string code = new string(Enumerable.Repeat(chars, length).Select(s => s[random.Next(chars.Length)]).ToArray());

            return code;
        }


        /// <summary>
        /// 產生隨機經銷商Code(1個英文 + 11個數字)
        /// </summary>
        /// <returns></returns>
        public static string GenerateFactoryCode()
        {
            var code = string.Empty;

            Random random = new Random((int)DateTime.Now.Ticks);

            string allEnChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";//26個英文字母

            code = new string(Enumerable.Repeat(allEnChars, 1).Select(s => s[random.Next(allEnChars.Length)]).ToArray());

            string allNumChars = "0123456789";

            code += new string(Enumerable.Repeat(allNumChars, 11).Select(s => s[random.Next(allNumChars.Length)]).ToArray());

            return code;
        }

        /// <summary>
        /// 組成新增字串
        /// </summary>
        /// <param name="properties"></param>
        /// <param name="table_name"></param>
        /// <returns></returns>
        public string InsertGenerateString(List<string> properties, string table_name)
        {
            var insertQuery = new StringBuilder($"INSERT INTO {table_name} ");

            insertQuery.Append("(");

            properties.ForEach(prop => { insertQuery.Append($"{table_name}.{prop.Replace("@", "")},"); });

            insertQuery
                .Remove(insertQuery.Length - 1, 1)
                .Append(") VALUES (");

            properties.ForEach(prop => { insertQuery.Append($"{prop},"); });

            insertQuery
                .Remove(insertQuery.Length - 1, 1)
                .Append(");");

            return insertQuery.ToString();
        }
        /// <summary>
        /// 組成更新字串
        /// </summary>
        /// <param name="properties"></param>
        /// <param name="table_name"></param>
        /// <param name="sWhere"></param>
        /// <returns></returns>
        public string UpdateGenerateString(List<string> properties, string table_name, string sWhere)
        {
            var updateQuery = new StringBuilder($"UPDATE {table_name} SET ");

            properties.ForEach(property =>
            {
                if (property.Contains("@"))
                {
                    updateQuery.Append($"{property.Replace("@", "")}={property},");
                }
            });

            updateQuery.Remove(updateQuery.Length - 1, 1); //remove last comma
            updateQuery.Append($" WHERE {sWhere}");

            return updateQuery.ToString();
        }
    }

    /// <summary>
    /// 加/解密
    /// </summary>
    public class EDFunction
    {
        const string SHA256_KEY = "U@N#Taiwane"; //自訂金鑰
        const string AES_KEY = "iaT#N@U";
        const string AES_IV = "iaT#N@U";

        /// <summary>
        /// 單向加密SHA256
        /// </summary>
        /// <param name="text">加密字串</param>
        /// <returns></returns>
        public string GetSHA256Encryption(string text)
        {
            string signRet = string.Empty;
            byte[] key_byte = Encoding.Default.GetBytes(SHA256_KEY);

            using (HMACSHA256 mac = new HMACSHA256(key_byte))
            {
                byte[] source = Encoding.Default.GetBytes(text);//將字串轉為Byte[]
                byte[] crypto = mac.ComputeHash(source);//進行SHA256加密
                signRet = Convert.ToBase64String(crypto);//把加密後的字串從Byte[]轉為字串
            }

            return signRet;
        }

        /// <summary>
        /// AES加密
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public string AESEncrypt(string text)
        {
            var encrypt = "";
            try
            {
                AesCryptoServiceProvider aes = new AesCryptoServiceProvider();
                MD5CryptoServiceProvider md5 = new MD5CryptoServiceProvider();
                SHA256CryptoServiceProvider sha256 = new SHA256CryptoServiceProvider();


                byte[] keyData = sha256.ComputeHash(Encoding.UTF8.GetBytes(AES_KEY));
                byte[] ivData = md5.ComputeHash(Encoding.UTF8.GetBytes(AES_IV));
                byte[] dataByteArray = Encoding.UTF8.GetBytes(text);

                using (MemoryStream ms = new MemoryStream())
                {
                    using (
                        CryptoStream cs = new CryptoStream(ms, aes.CreateEncryptor(keyData, ivData), CryptoStreamMode.Write)
                    )
                    {
                        cs.Write(dataByteArray, 0, dataByteArray.Length);
                        cs.FlushFinalBlock();
                        encrypt = Convert.ToBase64String(ms.ToArray());
                    }
                }

                return encrypt;
            }
            catch
            {
                return text;
            }
        }

        /// <summary>
        /// AES解密
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public string AESDecrypt(string text)
        {
            var decrypt = "";
            try
            {
                SymmetricAlgorithm aes = new AesCryptoServiceProvider();
                MD5CryptoServiceProvider md5 = new MD5CryptoServiceProvider();
                SHA256CryptoServiceProvider sha256 = new SHA256CryptoServiceProvider();
                byte[] keyData = sha256.ComputeHash(Encoding.UTF8.GetBytes(AES_KEY));
                byte[] ivData = md5.ComputeHash(Encoding.UTF8.GetBytes(AES_IV));
                byte[] dataByteArray = Convert.FromBase64String(text);

                using (MemoryStream ms = new MemoryStream())
                {
                    using (
                        CryptoStream cs = new CryptoStream(ms, aes.CreateDecryptor(keyData, ivData), CryptoStreamMode.Write)
                    )
                    {
                        cs.Write(dataByteArray, 0, dataByteArray.Length);
                        cs.FlushFinalBlock();
                        decrypt = Encoding.UTF8.GetString(ms.ToArray());
                    }
                }

                return decrypt;
            }
            catch
            {
                return text;
            }
        }

    }

    public class SpkitaUrlConfig
    {
        public string SpkitaUrl { get; set; }
    }

    public class SocialEngineeringConfig
    {
        public uint CommercialEffectiveHour { get; set; } //企業版子帳號有效邀請時效(小時為單位)
        public string SendEmail { get; set; } //寄送邀請信的信箱
        public string SendName { get; set; } //寄送邀請信的寄件人
        public int Test_Fu_Id { get; set; }
        public string ApiUrl { get; set; }//當前APIurl
    }

    /// <summary>
    /// 資料夾
    /// </summary>
    public class FolderFunction
    {
        /// <summary>
        /// 創建資料夾
        /// </summary>
        /// <param name="folderPath"></param>
        /// <param name="type">0:找到資料夾也不刪除 1:找到資料夾並且刪除</param>
        public void CreateFolder(string folderPath, int type)
        {
            DirectoryInfo dInfo = new DirectoryInfo(folderPath);

            if (dInfo.Exists) //找到
            {
                if (type == 1)
                {
                    dInfo.Delete(true); //如果資料夾裡面有檔案給bool參數就可以直接刪除，沒給bool參數會報錯誤
                }

                dInfo.Create();
            }
            else //沒找到
            {
                dInfo.Create(); //建立新的資料夾
            }
        }

        /// <summary>
        /// 刪除檔案
        /// </summary>
        /// <param name="filePath"></param>
        public void DeleteFile(string filePath)
        {
            System.IO.FileInfo file = new System.IO.FileInfo(filePath);
            if (File.Exists(filePath)) //找到
            {
                //do something
                file.Delete();
            }
            else //沒找到
            {
                //do something
            }
        }

        /// <summary>
        /// 判斷檔案存不存在
        /// </summary>
        /// <param name="filePath"></param>
        /// <returns></returns>
        public bool ExistsFile(string filePath)
        {
            System.IO.FileInfo file = new System.IO.FileInfo(filePath);

            return File.Exists(filePath);
        }

        /// <summary>
        /// 檢查這個路徑有幾個檔案
        /// </summary>
        /// <param name="filePath"></param>
        /// <returns></returns>
        public long FileNum(string filePath)
        {
            DirectoryInfo dInfo = new DirectoryInfo(filePath);
            if (dInfo.Exists)
            {
                return dInfo.GetFiles().Length;
            }
            else
            {
                return 0;
            }
        }

        /// <summary>
        /// 產生檔名格式(Guid+副檔名)=>單一檔案
        /// 回傳格式=>若正確直接回傳檔名 相反的 回傳Fail
        /// </summary>
        /// <param name="fileName"></param>
        public string FileProduceName(IFormFile file, List<string>? validateExtension = null)
        {
            string result = string.Empty;

            var split = file.FileName.Split(".");
            var fileNameEx = split[split.Length - 1]; //副檔名

            if (validateExtension != null)
            {
                if (!validateExtension.Contains(fileNameEx.ToLower()))
                {
                    result = "Fail";
                }
            }

            string guidFile = Guid.NewGuid().ToString("N");
            string FileName = $@"{guidFile}.{fileNameEx}";
            FileName = FileName.Replace("/", "").Replace("..", "");
            result = FileName;

            return result;
        }

        /// <summary>
        /// 產生檔名格式(Guid+副檔名)=>多個檔案
        /// 回傳格式=>若正確直接回傳檔名 相反的 回傳Fail
        /// </summary>
        /// <param name="fileName"></param>
        public List<string> FileProduceName(IFormFile[] file, List<string>? validateExtension = null)
        {
            List<string> result = new List<string>();

            foreach (IFormFile f in file)
            {
                var split = f.FileName.Split(".");
                var fileNameEx = split[split.Length - 1]; //副檔名

                if (validateExtension != null)
                {
                    if (!validateExtension.Contains(fileNameEx.ToLower()))
                    {
                        result.Add("Fail");
                        continue;
                    }
                }

                string guidFile = Guid.NewGuid().ToString("N");
                string FileName = $@"{guidFile}.{fileNameEx}";
                FileName = FileName.Replace("/", "").Replace("..", "");
                result.Add(FileName);
            }

            return result;
        }

        /// <summary>
        /// 儲存檔案=>單一檔案
        /// </summary>
        /// <param name="file"></param>
        /// <param name="path"></param>
        /// <param name="newFileName"></param>
        /// <returns></returns>
        public void SavePathFile(IFormFile file, string filePath, string fileName)
        {
            DirectoryInfo directoryInfo = new DirectoryInfo(filePath);
            if (!directoryInfo.Exists)
            {
                directoryInfo.Create();
            }
            string fullPath = Path.Combine(filePath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                file.CopyTo(stream);
            }
        }

        /// <summary>
        /// 儲存檔案=>多個檔案
        /// </summary>
        /// <param name="file"></param>
        /// <param name="path"></param>
        /// <param name="newFileName"></param>
        /// <returns></returns>
        public void SavePathFile(List<IFormFile> files, string filePath, List<string> fileName)
        {
            int currentIndex = 0;
            foreach (IFormFile f in files)
            {
                DirectoryInfo directoryInfo = new DirectoryInfo(filePath);
                if (!directoryInfo.Exists)
                {
                    directoryInfo.Create();
                }
                string fullPath = Path.Combine(filePath, fileName[currentIndex]);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    f.CopyTo(stream);
                }
                currentIndex++;
            }
        }
    }

    /// <summary>
    /// 回傳結果
    /// </summary>
    /// <typeparam name="T">資料型別</typeparam>
    public class ApiResult<T>
    {
        public ApiResult(string token = null)
        {
            if (!string.IsNullOrEmpty(token))
            {
                this.Token = token;
            }
            else
            {
                this.Token = null;
            }
        }
        public string Token { get; set; }
        public string Code { get; set; }
        public string Message { get; set; }
        public T Result { get; set; }
        public List<string> Results { get; set; }
        public List<string> MachineType { get; set; }
        public List<string> MachineName { get; set; }
        public List<string> ModelSeries { get; set; }
    }

    /// <summary>
    /// 回傳結果
    /// </summary>
    /// <typeparam name="T">資料型別</typeparam>
    public class ApiResultKnowledgeBase<T>
    {
        public ApiResultKnowledgeBase(string token = null)
        {
            if (!string.IsNullOrEmpty(token))
            {
                this.Token = token;
            }
            else
            {
                this.Token = null;
            }
        }
        public string Token { get; set; }
        public string Code { get; set; }
        public string Message { get; set; }
        public T Result { get; set; }
        public List<string> DeviceType { get; set; }
        public List<string> DeviceParts { get; set; }
        public List<string> RepairItems { get; set; }
        public List<string> RepairType { get; set; }
    }
}
