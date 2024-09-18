using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Models
{
    public enum UserLevelEnum: byte
    {
        Admin = 1 << 0, //最高管理員
        Expert = 1 << 1, //專家
        User = 1 << 2, //一般使用者
    }


    /// <summary>
    /// 使用者資訊
    /// </summary>
    public class Userinfo
    {
        private string text = string.Empty;

        public int UserId { get; set; } //使用者id
        public byte Deleted { get; set; } //是否刪除
        public int CompanyId { get; set; } //廠商id
        public string UserName { get; set; } = string.Empty; //使用者名稱
        public string UserAccount { get; set; } = string.Empty; //使用者帳號
        public string UserPassword { get; set; } = string.Empty; //使用者密碼
        public string SchemaName { get; set; }
        public byte UserLevel { get; set; } //使用者層級
        public string UserLevelText
        {
            get
            {
                switch (UserLevel)
                {
                    case 1:
                        text = "最高管理員";
                        break;
                    case 2:
                        text = "專家";
                        break;
                    case 4:
                        text = "一般使用者";
                        break;

                }

                return text;
            }
        } //使用者層級文字名稱
    }

    /// <summary>
    /// 查詢使用者條件
    /// </summary>
    [BindNever]
    public class PostUserinfoFilter
    {
        public string Keyword { get; set; } = string.Empty; //關鍵字
    }

    /// <summary>
    /// 新增使用者資料
    /// </summary>
    [BindNever]
    public class PostAddUserinfo
    {
        public string UserName { get; set; } = string.Empty; //使用者名稱
        public string UserAccount { get; set; } = string.Empty; //使用者帳號
        public string UserPaw { get; set; } = string.Empty; //使用者密碼
        public string UserAgainPaw { get; set; } = string.Empty; //使用者再次輸入密碼
        public byte UserLevel { get; set; } //使用者層級
    }

    /// <summary>
    /// 修改使用者資訊
    /// </summary>
    [BindNever]
    public class PostEditUserinfo
    {
        public int UserId { get; set; } //使用者id
        public string UserName { get; set; } = string.Empty; //使用者名稱
        public byte UserLevel { get; set; } //使用者層級
    }

    /// <summary>
    /// 使用者修改密碼
    /// </summary>
    [BindNever]
    public class PostUserinfoChangePaw
    {
        public int UserId { get; set; } //使用者id
        public string NewPaw { get; set; } = string.Empty; //新密碼
        public string AgainPaw { get; set; } = string.Empty; //再次輸入密碼
    }

    /// <summary>
    /// 變更密碼
    /// </summary>
    [BindNever]
    public class PostChangePaw
    {
        public string OldPaw { get; set; } = string.Empty; //舊密碼
        public string NewPaw { get; set; } = string.Empty; //新密碼
        public string AgainPaw { get; set; } = string.Empty; //再次輸入密碼
    }

    public class EmailRequestModel
    {
        public string Email { get; set; }
    }

    public class VerifyEmailRequestModel
    {
        public string Email { get; set; }
        public string Code { get; set; }
    }

    public class RegisterUserModel
    {
        public string UserName { get; set; }
        public string UserAccount { get; set; }
        public string UserPassword { get; set; }
        public string Email { get; set; }
        public bool EmailVerified { get; set; }
        public byte UserLevel { get; set; }
    }
}