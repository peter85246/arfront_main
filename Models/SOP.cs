using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    /// <summary>
    /// 查詢單一SOP過濾條件
    /// </summary>
    [BindNever]
    public class PostSOPFilter
    {
        public int MachineAlarmId { get; set; } //機台故障流水號
        public int SOPStep { get; set; } //流程步驟
    }

    /// <summary>
    /// 取得所有SOP資料
    /// </summary>
    [BindNever]
    public class PostAllSOP : PostId
    {
        public short IsCommon { get; set; } //0:取得網頁的；1:取得眼鏡的
    }

    /// <summary>
    /// 故障流程
    /// </summary>
    public class SOP
    {
        public int SOPId { get; set; } //流程流水號
        public short Deleted { get; set; } //是否刪除
        public int MachineAddId { get; set; } //機台故障流水號
        public int SOPStep { get; set; } //流程步驟
        public string SOPMessage { get; set; } = string.Empty; //步驟訊息
        public string SOPImage { get; set; } = string.Empty; //步驟圖片
        public IFormFile? SOPImageObj { get; set; } //步驟圖片檔案
        public bool IsDeletedSOPImage { get; set; } = false; //是否刪除步驟圖片
        public string SOPVideo { get; set; } = string.Empty; //步驟影片
        public IFormFile? SOPVideoObj { get; set; } //步驟影片檔案
        public bool IsDeletedSOPVideo { get; set; } = false; //是否刪除步驟影片
        public string SOPPLC1 { get; set; } = string.Empty; //PLC1
        public string SOPPLC2 { get; set; } = string.Empty; //PLC2
        public string SOPPLC3 { get; set; } = string.Empty; //PLC3
        public string SOPPLC4 { get; set; } = string.Empty; //PLC4
        public string SOPRemark { get; set; } = string.Empty; //SOPRemark
        public string SOPRemarkImage { get; set; } = string.Empty; //SOPRemarkImage
        public string SOPName { get; set; } = string.Empty; //SOPName

        public List<SOPModel> SOPModels { get; set; }
    }

    /// <summary>
    /// 故障流程3D模型
    /// </summary>
    public class SOPModel
    {
        public int SOPModelId { get; set; } //流程模型流水號
        public short Deleted { get; set; } //是否刪除
        public int SOPId { get; set; } //流程流水號
        public string SOPModelImage { get; set; } = string.Empty; //流程模型圖片
        public string SOPModelFile { get; set; } = string.Empty; //流程模型檔案
        public double SOPModelPX { get; set; } //PX
        public double SOPModelPY { get; set; } //PY
        public double SOPModelPZ { get; set; } //PZ
        public double SOPModelRX { get; set; } //RX
        public double SOPModelRY { get; set; } //RY
        public double SOPModelRZ { get; set; } //RZ
        public double SOPModelSX { get; set; } //SX
        public double SOPModelSY { get; set; } //SY
        public double SOPModelSZ { get; set; } //SZ
        public short IsCommon { get; set; }
    }

    /// <summary>
    /// 新增故障流程步驟
    /// </summary>
    public class PostAddSOPStep
    {
        public int MachineAlarmId { get; set; } //機台故障流水號
    }

    /// <summary>
    /// Post修改故障流程步驟
    /// </summary>
    public class PostEditSOPStepPriority
    {
        public int MachineAlarmId { get; set; } //機台故障流水號
        public List<int> SOPIds { get; set; } //流程流水號
    }

    /// <summary>
    /// 儲存故障流程
    /// </summary>
    public class PostSaveSOP
    {
        public int MachineAlarmId { get; set; }
        public List<PostSOP> SOPs { get; set; }
    }

    /// <summary>
    /// 儲存單一故障流程
    /// </summary>
    public class PostSOP
    {
        public int SOPId { get; set; } //流程流水號
        public short Deleted { get; set; } //是否刪除
        public int SOPStep { get; set; } //流程步驟
        public string? SOPMessage { get; set; } = string.Empty; //步驟訊息
        public string? SOPImage { get; set; } = string.Empty; //步驟圖片
        public IFormFile? SOPImageObj { get; set; } //步驟圖片檔案
        public bool IsDeletedSOPImage { get; set; } = false; //是否刪除步驟圖片
        public string? SOPVideo { get; set; } = string.Empty; //步驟影片
        public IFormFile? SOPVideoObj { get; set; } //步驟影片檔案
        public bool IsDeletedSOPVideo { get; set; } = false; //是否刪除步驟影片
        public string? SOPPLC1 { get; set; } = string.Empty; //PLC1
        public string? SOPPLC2 { get; set; } = string.Empty; //PLC2
        public string? SOPPLC3 { get; set; } = string.Empty; //PLC3
        public string? SOPPLC4 { get; set; } = string.Empty; //PLC4
        public List<PostSOPModel>? SOPModels { get; set; }
    }

    /// <summary>
    /// 儲存故障流程3D模型
    /// </summary>
    public class PostSOPModel
    {
        public int SOPModelId { get; set; } //流程模型流水號
        public short Deleted { get; set; } //是否刪除
        public int SOPId { get; set; } //流程流水號
        public string? SOPModelImage { get; set; } = string.Empty; //流程模型圖片
        public IFormFile? SOPModelImageObj { get; set; } //流程模型圖片檔案
        public string? SOPModelFile { get; set; } = string.Empty; //流程模型
        public IFormFile? SOPModelFileObj { get; set; } //流程模型檔案
    }

    /// <summary>
    /// 眼鏡儲存Model
    /// </summary>
    public class PostSaveSOPModelGlasses
    {
        public int MachineAlarmId { get; set; }
        public List<SOPModelGlasses> SOPModelGlasses { get; set; }
    }

    public class SOPModelGlasses: SOPModel
    {
        public int SourceSOPModelId { get; set; } //參照過來的SOP Model Id
    }
}
