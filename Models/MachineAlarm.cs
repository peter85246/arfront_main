using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class PostAlarmFilter
    {
        public int MachineId { get; set; } //機台流水號
        public string Keyword { get; set; } = string.Empty; //關鍵字
    }

    public class MachineAlarm
    {
        public int MachineAlarmId { get; set; } //機台故障流水號
        public short Deleted { get; set; } //是否刪除
        public int MachineId { get; set; } //機台流水號
        public string MachineAlarmCode { get; set; } = string.Empty; //故障代碼
        public string MachineAlarmAbstract { get; set; } = string.Empty; //故障說明
    }

    [BindNever]
    public class PostAddMachineAlarm
    {
        public int MachineId { get; set; } //機台流水號
        public string MachineAlarmCode { get; set; } = string.Empty; //故障代碼
        public string MachineAlarmAbstract { get; set; } = string.Empty; //故障說明
    }

    [BindNever]
    public class PostEditMachineAlarm
    {
        public int MachineAlarmId { get; set; } //機台故障流水號
        public string MachineAlarmCode { get; set; } = string.Empty; //故障代碼
        public string MachineAlarmAbstract { get; set; } = string.Empty; //故障說明
    }
}
