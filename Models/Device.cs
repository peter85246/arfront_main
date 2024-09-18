using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class DevicePrimary
    {
        public int MachineDeviceId { get; set; } //機台設備流水號
    }

    public class Device
    {
        public int? MachineId { get; set; } //機台流水號
        public string? MachineCode { get; set; } //機台ID
        public int MachineDeviceId { get; set; } //設備流水號
        public short? Deleted { get; set; } //刪除
        public string MachineDeviceControlerModel { get; set; } = string.Empty; //控制器型號
        public string MachineDeviceServerIP { get; set; } = string.Empty; //ServerIP
        public int MachineDeviceServerPort { get; set; } //ServerPort
        public string MachineDeviceMachineIP { get; set; } = string.Empty; //MachineIP
    }
}
