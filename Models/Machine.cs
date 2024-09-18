using Microsoft.AspNetCore.Http;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class MachinePrimary
    {
        public int MachineId { get; set; } //機台流水號
    }

    public class PostMachineCode
    {
        public string MachineCode { get; set; } = string.Empty; //機台ID
    }

    /// <summary>
    /// 機台搜尋條件
    /// </summary>
    public class PostMachineFilter
    {
        public string Keyword { get; set; } = string.Empty; //關鍵字
    }

    /// <summary>
    /// 機台列表
    /// </summary>
    public class MachineOverview
    {
        public int MachineId { get; set; } //機台流水號
        public string MachineCode { get; set; } = string.Empty; //機台ID
        public string MachineName { get; set; } = string.Empty; //機台名稱
        public string MachineSpec { get; set; } = string.Empty; //機台規格
        public string MachineImage { get; set; } = string.Empty; //機台圖片路徑
        public int MachineDeviceId { get; set; } //機台設備流水號
    }

    public class Machine
    {
        public int MachineId { get; set; } //機台流水號
        public int CompanyId { get; set; } //公司流水號
        public short Deleted { get; set; } //刪除
        public string MachineCode { get; set; } = string.Empty; //機台ID
        public string MachineName { get; set; } = string.Empty; //機台名稱
        public string MachineSpec { get; set; } = string.Empty; //機台規格
        public string? MachineImage { get; set; } = string.Empty; //機台圖片路徑
        public bool IsDeletedMachineImage { get; set; } = false; //是否被刪除機台圖片
        public string? MachineFile { get; set; } = string.Empty; //AR檔案路徑
        public bool IsDeletedMachineFile { get; set; } = false; //是否被刪除AR檔案
    }

    /// <summary>
    /// 新增以及修改資料
    /// </summary>
    public class MachineInfo
    {
        public int MachineId { get; set; } //機台流水號
        public short? Deleted { get; set; } //刪除
        public string MachineCode { get; set; } = string.Empty; //機台ID
        public string MachineName { get; set; } = string.Empty; //機台名稱
        public string MachineSpec { get; set; } = string.Empty; //機台規格
        public string? MachineImage { get; set; } = string.Empty; //機台圖片路徑
        public IFormFile? MachineImageObj { get; set; } //機台圖片
        public bool IsDeletedMachineImage { get; set; } = false; //是否被刪除機台圖片
        public string? MachineFile { get; set; } = string.Empty; //AR檔案路徑
        public IFormFile? MachineFileObj { get; set; } //AR檔案
        public bool IsDeletedMachineFile { get; set; } = false; //是否被刪除AR檔案
    }
}
