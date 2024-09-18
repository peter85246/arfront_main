using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class PostSignIn
    {
        public string Account { get; set; } = string.Empty; //帳號
        public string Paw { get; set; } = string.Empty; //密碼
    }
}
