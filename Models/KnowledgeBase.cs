using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models
{
    [BindNever]
    public class PostAllKnowledgeBase : PostId
    {
        public short IsCommon { get; set; }
    }

    
    public class KnowledgeBase
    {
        public int KnowledgeBaseId { get; set; } // 流程流水號
        public short Deleted { get; set; } // 是否刪除
        public string MachineName { get; set; } = string.Empty; // Machine Name
        public string KnowledgeBaseDeviceType { get; set; } = string.Empty; // 設備種類
        public string KnowledgeBaseDeviceParts { get; set; } = string.Empty; // 設備部件
        public string KnowledgeBaseRepairItems { get; set; } = string.Empty; // 維修項目
        public string KnowledgeBaseRepairType { get; set; } = string.Empty; // 維修類型
        public string KnowledgeBaseFileNo { get; set; } = string.Empty; // 檔案編號
        public string KnowledgeBaseSOPName { get; set; } = string.Empty; // SOP Name
        public string? KnowledgeBaseAlarmCode { get; set; } = string.Empty; // 故障代碼
        public string? KnowledgeBaseSpec { get; set; } = string.Empty; // 規格
        public string? KnowledgeBaseSystem { get; set; } = string.Empty; // 系統
        public string? KnowledgeBaseProductName { get; set; } = string.Empty; // 產品名稱
        public string? KnowledgeBaseAlarmCause { get; set; } = string.Empty; // 故障發生原因
        public string? KnowledgeBaseAlarmDesc { get; set; } = string.Empty; // 故障描述
        public string? KnowledgeBaseAlarmOccasion { get; set; } = string.Empty; // 故障發生時機
        public string KnowledgeBaseModelImage { get; set; } = string.Empty; // Model機型圖片
        [NotMapped]
        public List<IFormFile>? KnowledgeBaseModelImageObj { get; set; } // Model機型圖片檔案
        public string KnowledgeBaseToolsImage { get; set; } = string.Empty; // 所有使用工具圖片
        [NotMapped]
        public List<IFormFile>? KnowledgeBaseToolsImageObj { get; set; } // 所有使用工具圖片檔案
        public string KnowledgeBasePositionImage { get; set; } = string.Empty; // 部位位置圖片
        [NotMapped]
        public List<IFormFile>? KnowledgeBasePositionImageObj { get; set; } // 部位位置圖片檔案

        public string KnowledgeBase3DModelImage { get; set; } = string.Empty; // 3DModel圖片
        [NotMapped]
        public List<IFormFile>? KnowledgeBase3DModelImageObj { get; set; } // 3DModel圖片檔案

        public string KnowledgeBase3DModelFile { get; set; } = string.Empty; // 3DModel檔案
        [NotMapped]
        public List<IFormFile>? KnowledgeBase3DModelFileObj { get; set; } // 3DModel檔案檔案

        public string KnowledgeBaseModelImageNames { get; set; } = string.Empty; // Model機型圖片名稱
        public string KnowledgeBaseToolsImageNames { get; set; } = string.Empty; // 所有使用工具圖片名稱
        public string KnowledgeBasePositionImageNames { get; set; } = string.Empty; // 部位位置圖片名稱

        public string KnowledgeBase3DModelList { get; set; }

        public int MachineAddId { get; set; } //機台故障流水號
    }


    [BindNever]
    public class PostKnowledgeinfoFilter
    {
        public string Keyword { get; set; } = string.Empty; //關鍵字
        public string DeviceType { get; set; } = string.Empty; //關鍵字
        public string DeviceParts { get; set; } = string.Empty; //關鍵字
        public string RepairItems { get; set; } = string.Empty; //關鍵字
        public string RepairType { get; set; } = string.Empty; //關鍵字
    }

    /// <summary>
    /// 儲存故障流程
    /// </summary>
    public class PostSaveKnowledgeBase
    {
        public int MachineAddId { get; set; }
        public int MachineName { get; set; }
        public int KnowledgeBaseId { get; set; } // 流程流水號
        public List<PostKnowledgeBase>? KnowledgeBases { get; set; }
    }

    /// <summary>
    /// 儲存單一故障流程
    /// </summary>
    public class PostKnowledgeBase
    {
        public int KnowledgeBaseId { get; set; } // 故障說明流水號
        public int MachineAddId { get; set; }
        public string? MachineName { get; set; }
        public short? Deleted { get; set; } // 是否刪除
        public string? KnowledgeBaseDeviceType { get; set; } = string.Empty; // 設備種類
        public string? KnowledgeBaseDeviceParts { get; set; } = string.Empty; // 設備部件
        public string? KnowledgeBaseRepairItems { get; set; } = string.Empty; // 維修項目
        public string? KnowledgeBaseRepairType { get; set; } = string.Empty; // 維修類型
        public string? KnowledgeBaseFileNo { get; set; } = string.Empty; // 檔案編號
        public string? KnowledgeBaseSOPName { get; set; } = string.Empty; // SOP Name
        public string? KnowledgeBaseAlarmCode { get; set; } = string.Empty; // 故障代碼
        public string? KnowledgeBaseSpec { get; set; } = string.Empty; // 規格
        public string? KnowledgeBaseSystem { get; set; } = string.Empty; // 系統
        public string? KnowledgeBaseProductName { get; set; } = string.Empty; // 產品名稱
        public string? KnowledgeBaseAlarmCause { get; set; } = string.Empty; // 故障發生原因
        public string? KnowledgeBaseAlarmDesc { get; set; } = string.Empty; // 故障描述
        public string? KnowledgeBaseAlarmOccasion { get; set; } = string.Empty; // 故障發生時機

        public string? KnowledgeBaseModelImage { get; set; } = string.Empty; // Model機型圖片
        public List<string>? KnowledgeBaseModelImageNames { get; set; } = new List<string>(); // Model機型圖片名稱
        public List<IFormFile>? KnowledgeBaseModelImageObj { get; set; } // Model機型圖片檔案
        public bool IsDeletedKnowledgeBaseModelImage { get; set; } = false; //是否刪除Model機型圖片

        public string? KnowledgeBaseToolsImage { get; set; } = string.Empty; //所有使用工具圖片
        public List<string>? KnowledgeBaseToolsImageNames { get; set; } = new List<string>(); // 工具圖片名稱
        public List<IFormFile>? KnowledgeBaseToolsImageObj { get; set; } // 所有使用工具圖片檔案
        public bool IsDeletedKnowledgeBaseToolsImage { get; set; } = false; //是否刪除所有使用工具圖片

        public string? KnowledgeBasePositionImage { get; set; } = string.Empty; //部位位置圖片
        public List<string>? KnowledgeBasePositionImageNames { get; set; } = new List<string>(); // 位置圖片名稱
        public List<IFormFile>? KnowledgeBasePositionImageObj { get; set; } // 部位位置圖片檔案
        public bool IsDeletedKnowledgeBasePositionImage { get; set; } = false; //是否刪除部位位置圖片

        public string? KnowledgeBase3DModelImage { get; set; } = string.Empty; // 3D Model圖片
        public List<IFormFile>? KnowledgeBase3DModelImageObj { get; set; } // 3D Model圖片檔案
        public bool IsDeletedKnowledgeBase3DModelImage { get; set; } = false; //是否刪除3D Model圖片

        public string? KnowledgeBase3DModelFile { get; set; } = string.Empty; // 3D Model圖片
        public List<IFormFile>? KnowledgeBase3DModelFileObj { get; set; } // 3D Model圖片檔案
        public bool IsDeletedKnowledgeBase3DModelFile { get; set; } = false; //是否刪除3D Model圖片

        public string? KnowledgeBase3DModelList { get; set; }

        //public int? Creator { get; set; } // 創建者
        //public DateTime? CreatedTime { get; set; } // 創建時間
        //public int? Updater { get; set; } // 更新者
        //public DateTime? UpdateTime { get; set; } // 更新時間
    }

    public class MindMapResponse
    {
        public int MachineAddId { get; set; }
        public List<KnowledgeBaseDevicePartsGroup> KnowledgeBases { get; set; }
    }

    public class KnowledgeBaseDevicePartsGroup
    {
        public string DeviceParts { get; set; }
        public List<RepairTypeGroup> RepairTypes { get; set; }
    }

    public class RepairTypeGroup
    {
        public string RepairType { get; set; }
        public List<KnowledgeBaseDto> KnowledgeBases { get; set; }
    }

    public class KnowledgeBaseDto
    {
        public int KnowledgeBaseId { get; set; }
        public string MachineName { get; set; }
        public string DeviceType { get; set; }
        public string RepairItems { get; set; }
        public string FileNo { get; set; }
        public string SOPName { get; set; }
        public string AlarmCode { get; set; }
        public string Spec { get; set; }
        public string System { get; set; }
        public string ProductName { get; set; }
        public string AlarmCause { get; set; }
        public string AlarmDesc { get; set; }
        public string AlarmOccasion { get; set; }
        public List<string> ModelImage { get; set; } = new List<string>();
        public List<string> ToolsImage { get; set; } = new List<string>();
        public List<string> PositionImage { get; set; } = new List<string>();

        public List<string> T3DModelImage { get; set; } = new List<string>();
        public List<string> T3DModelFile { get; set; } = new List<string>();

        public List<int> KnowledgeBase3DModelList { get; set; } = new List<int>();

        public List<SOP2Dto> SOP2s { get; set; }
    }

    public class SOP2Dto
    {
        public int SOP2Id { get; set; }
        public int Step { get; set; }
        public string Message { get; set; }
        public string Image { get; set; }
        public string Remark { get; set; }
        public string RemarkImage { get; set; }
        public string Name { get; set; }
        public string Video { get; set; }
    }

    public class KnowledgeBaseSearchRequest
    {
        public string Keyword { get; set; }
    }

    public class SOP2Model
    {
        public int SOPModelId { get; set; }
        public short Deleted { get; set; }
        public int SOPId { get; set; }
        public string SOPModelImage { get; set; }
        public string SOPModelFile { get; set; }
        public double SOPModelPX { get; set; }
        public double SOPModelPY { get; set; }
        public double SOPModelPZ { get; set; }
        public double SOPModelRX { get; set; }
        public double SOPModelRY { get; set; }
        public double SOPModelRZ { get; set; }
        public double SOPModelSX { get; set; }
        public double SOPModelSY { get; set; }
        public double SOPModelSZ { get; set; }
        public short IsCommon { get; set; }
        public int Creator { get; set; }
        public DateTime CreatedTime { get; set; }
        public int? Updater { get; set; }
        public DateTime? UpdateTime { get; set; }
    }

    public class AddModelRequest
    {
        public int MachineAddId { get; set; }
        public IFormFile KnowledgeBase3DModelImageObj { get; set; }
        public IFormFile KnowledgeBase3DModelFileObj { get; set; }
        public double SOPModelPX { get; set; }
        public double SOPModelPY { get; set; }
        public double SOPModelPZ { get; set; }
        public double SOPModelRX { get; set; }
        public double SOPModelRY { get; set; }
        public double SOPModelRZ { get; set; }
        public double SOPModelSX { get; set; }
        public double SOPModelSY { get; set; }
        public double SOPModelSZ { get; set; }
        public int Creator { get; set; }
    }

    public class RemoveModelRequest
    {
        public int SOPModelId { get; set; }
    }

    public class UpdateModelListRequest
    {
        public int SOPModelId { get; set; }
        public double SOPModelPX { get; set; }
        public double SOPModelPY { get; set; }
        public double SOPModelPZ { get; set; }
        public double SOPModelRX { get; set; }
        public double SOPModelRY { get; set; }
        public double SOPModelRZ { get; set; }
        public double SOPModelSX { get; set; }
        public double SOPModelSY { get; set; }
        public double SOPModelSZ { get; set; }
        public int Updater { get; set; }
    }

}
