using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class MachineAddPrimary
    {
        public int MachineAddId { get; set; } //機台流水號
    }

    public class PostMachineAddCode
    {
        public string MachineAddCode { get; set; } = string.Empty; //機台ID
    }

    /// <summary>
    /// 機台搜尋條件
    /// </summary>
    public class PostMachineAddFilter
    {
        public string Keyword { get; set; } = string.Empty; //關鍵字
        public string MachineType { get; set; } = string.Empty; //關鍵字
        public string MachineName { get; set; } = string.Empty; //關鍵字
        public string ModelSeries { get; set; } = string.Empty; //關鍵字

    }

    /// <summary>
    /// 機台列表
    /// </summary>
    public class MachineAddOverview
    {
        public int MachineAddId { get; set; } //機台流水號
        public string MachineAddCode { get; set; } = string.Empty; //機台ID
        public string? MachineType { get; set; } = string.Empty; // 機台種類
        public string ModelSeries { get; set; } = string.Empty; // 型號系列
        public string MachineName { get; set; } = string.Empty; // 機台名稱

        public string MachineImage { get; set; } = string.Empty; //機台圖片路徑
        public int MachineDeviceId { get; set; } //機台設備流水號
    }

    public class MachineAddOverview_Category
    {
        public string MachineAddCategory { get; set; }
    }

    /// <summary>
    /// 新增知識 - 新增機台
    /// </summary>
    public class MachineAdd
    {
        public int MachineAddId { get; set; } // 新增機台ID
        public int CompanyId { get; set; } //公司流水號
        public short Deleted { get; set; } // 是否被刪除
        public string MachineType { get; set; } = string.Empty; // 機台種類
        public string ModelSeries { get; set; } = string.Empty; // 型號系列
        public string MachineName { get; set; } = string.Empty; // 機台名稱
        public string? MachineImage { get; set; } = string.Empty; //機台圖片路徑
        //public bool IsDeletedMachineImage { get; set; } = false; //是否被刪除機台圖片
    }

    /// <summary>
    /// 新增以及修改資料
    /// </summary>
    public class MachineAddInfo
    {
        public int MachineAddId { get; set; } //機台流水號
        public short? Deleted { get; set; } //刪除
        public string MachineType { get; set; } = string.Empty; // 機台種類
        public string ModelSeries { get; set; } = string.Empty; // 型號系列
        public string MachineName { get; set; } = string.Empty; // 機台名稱
        public string? MachineImage { get; set; } = string.Empty; //機台圖片路徑
        public IFormFile? MachineImageObj { get; set; } //機台圖片
        public bool IsDeletedMachineImage { get; set; } = false; //是否被刪除機台圖片
    }

}
