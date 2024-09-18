using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class IOTPrimary
    {
        public int MachineIOTId { get; set; } //IOT流水號
    }

    /// <summary>
    /// IOT搜尋條件
    /// </summary>
    public class PostIOTFilter
    {
        public int MachineId { get; set; } //機台流水號
        public string Keyword { get; set; } = string.Empty; //關鍵字
    }

    [BindNever]
    public class IOT
    {
        public int MachineIOTId { get; set; } //IOT流水號
        public short? Deleted { get; set; } //刪除
        public int MachineId { get; set; } //機台流水號
        public string MachineIOTDeviceName { get; set; } = string.Empty; //設備名稱
        public string MachineIOTMQTTBroker { get; set; } = string.Empty; //Server
        public string MachineIOTClientId { get; set; } = string.Empty; //ClientId
        public string MachineIOTUserName { get; set; } = string.Empty; //UserName
        public string MachineIOTPassword { get; set; } = string.Empty; //Password
        public List<MachineIOTTopic> MachineIOTTopics { get; set; } //Topics
    }

    public class MachineIOTTopic
    {
        public int TopicId { get; set; } //Topic流水號
        public short Deleted { get; set; } //是否刪除
        public int MachineIOTId { get; set; } //IOT流水號
        public string TopicValue { get; set; } = string.Empty; //Topic內容
    }
}
