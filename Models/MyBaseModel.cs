using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Models
{
    /// <summary>
    /// 是否被刪除
    /// </summary>
    public enum DeletedDataEnum
    {
        False = 0, //否
        True = 1, //是
    }

    public class IgnoreControllerAction
    {
        public string Controller { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string? Method { get; set; }
    }

    public class PostId
    {
        public int Id { get; set; } //編號
    }

    public class PostIds
    {
        public List<int> Ids { get; set; } //編號列表
    }

    public class Variable
    {
        public string VariableKey { get; set; }
        public string VariableValue { get; set; }
    }

    public class KeyValue
    {
        public string Name { get; set; }
        public string Value { get; set; }
    }
}
