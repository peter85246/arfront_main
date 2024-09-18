using ARManagement.BaseRepository.Interface;
using ARManagement.Data;
using ARManagement.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;
using Newtonsoft.Json;
using System.Diagnostics;

namespace ARManagement.Controllers
{
    public class SOP2Controller : MyBaseApiController
    {
        private readonly IBaseRepository _baseRepository;
        private readonly ResponseCodeHelper _responseCodeHelper;
        private string _savePath = string.Empty;
        private readonly ARManagementContext _context;

        public SOP2Controller(
            IBaseRepository baseRepository,
            ResponseCodeHelper responseCodeHelper,
            ARManagementContext context)
        {
            _baseRepository = baseRepository;
            _responseCodeHelper = responseCodeHelper;
            _savePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "upload");
            _context = context;
        }

        /// <summary>
        /// 依據MachineAddId取得所有SOP(包含眼鏡使用)
        /// </summary>
        /// <param name="post"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<ApiResult<List<SOP2>>>> GetAllSOPByMachineAddId(PostAllSOP2 post)
        {
            ApiResult<List<SOP2>> apiResult = new ApiResult<List<SOP2>>(); /*jwtToken.Token*/

            try
            {
                // 設置動態 Schema
                _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");

                var machineAddWhere = $@"""MachineAddId"" = @MachineAddId";
                var machineAdd = await _baseRepository.GetOneAsync<MachineAdd>("MachineAdd", machineAddWhere, new { MachineAddId = post.Id });

                if (machineAdd == null || machineAdd.Deleted == (byte)DeletedDataEnum.True)
                {
                    apiResult.Code = "4004";
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }

                var sopWhere = $@"""Deleted"" = 0 AND ""MachineAddId"" = @MachineAddId";
                var sop2s = await _baseRepository.GetAllAsync<SOP2>("SOP2", sopWhere, new { MachineAddId = machineAdd.MachineAddId }, "\"SOP2Step\" ASC");

                foreach (var sop2 in sop2s)
                {
                    if (!string.IsNullOrEmpty(sop2.SOP2Image))
                    {
                        sop2.SOP2Image = $"{baseURL}upload/machineAdd/{machineAdd.MachineAddId}/sop2/{sop2.SOP2Id}/{sop2.SOP2Image}";
                    }

                    if (!string.IsNullOrEmpty(sop2.SOP2RemarkImage))
                    {
                        sop2.SOP2RemarkImage = $"{baseURL}upload/machineAdd/{machineAdd.MachineAddId}/sop2/{sop2.SOP2Id}/{sop2.SOP2RemarkImage}";
                    }

                    if (!string.IsNullOrEmpty(sop2.SOPVideo))
                    {
                        sop2.SOPVideo = $"{baseURL}upload/machineAdd/{machineAdd.MachineAddId}/sop2/{sop2.SOP2Id}/{sop2.SOPVideo}";
                    }

                    if (!string.IsNullOrEmpty(sop2.T3DModels))
                    {
                        sop2.T3DModels = JsonConvert.SerializeObject(JsonConvert.DeserializeObject<List<int>>(sop2.T3DModels));
                    }
                }

                apiResult.Code = "0000";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                apiResult.Result = sop2s;
            }
            catch (Exception ex)
            {
                apiResult.Code = "9999";
                apiResult.Message = $"未知的錯誤: {ex.Message}";
                exceptionMsg = ex.ToString();
                stackTrace = new StackTrace(ex);
            }

            return Ok(apiResult);
        }

        /// <summary>
        /// 26. SOP頁面儲存設定
        /// </summary>
        /// <param name="post"></param>
        /// <returns></returns>
        [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
        [DisableRequestSizeLimit]
        [Consumes("multipart/form-data")]
        [HttpPut]
        public async Task<ActionResult<ApiResult<int>>> SaveSOP2([FromForm] PostSaveSOP2 post)
        {
            ApiResult<int> apiResult = new ApiResult<int>(); /*jwtToken.Token*/
            string step = "Initial step";
            try
            {
                // 設置動態 Schema
                _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");

                FolderFunction folderFunction = new FolderFunction();
                var sopRootPath = Path.Combine(_savePath, "machineAdd", post.MachineAddId.ToString(), "sop2");

                #region 找出要新增的SOP
                var addSOPs = post.SOP2s.Where(x => x.SOP2Id == 0 ).ToList();
                foreach (var addSOP in addSOPs)
                {
                    string? sopImageName = null;
                    string? videoName = null;
                    string? remarkImageName = null;

                    if (addSOP.SOP2ImageObj != null)
                    {
                        sopImageName = folderFunction.FileProduceName(addSOP.SOP2ImageObj);
                    }

                    if (addSOP.SOPVideoObj != null)
                    {
                        videoName = folderFunction.FileProduceName(addSOP.SOPVideoObj);
                    }

                    if (addSOP.SOP2RemarkImageObj != null)
                    {
                        remarkImageName = folderFunction.FileProduceName(addSOP.SOP2RemarkImageObj);
                    }

                    var addSOP_Dict = new Dictionary<string, object>()
                    {
                        { "@MachineAddId", post.MachineAddId},
                        { "@KnowledgeBaseId", post.KnowledgeBaseId},
                        { "@SOP2Name", addSOP.SOP2Name },
                        { "@SOP2Step", addSOP.SOP2Step },
                        { "@SOP2Message", addSOP.SOP2Message },
                        { "@SOP2Image", sopImageName },
                        { "@SOPVideo", videoName },
                        { "@SOP2Remark", addSOP.SOP2Remark },
                        { "@SOP2RemarkImage", remarkImageName },
                        { "@PLC1", addSOP.PLC1 },
                        { "@PLC2", addSOP.PLC2 },
                        { "@PLC3", addSOP.PLC3 },
                        { "@PLC4", addSOP.PLC4 },
                        { "@T3DModels", addSOP.T3DModels ?? "[]" }, // 確保 T3DModels 為有效 JSON 字串
                        { "@Creator", myUser.UserId },
                    };

                    var sopId = await _baseRepository.AddOneByCustomTable(addSOP_Dict, "SOP2", "SOP2Id");
                    var sopPath = Path.Combine(sopRootPath, sopId.ToString());
                    folderFunction.CreateFolder(sopPath, 0);

                    if (!string.IsNullOrEmpty(sopImageName))
                    {
                        folderFunction.SavePathFile(addSOP.SOP2ImageObj, sopPath, sopImageName);
                    }

                    if (!string.IsNullOrEmpty(remarkImageName))
                    {
                        folderFunction.SavePathFile(addSOP.SOP2RemarkImageObj, sopPath, remarkImageName);
                    }

                    if (!string.IsNullOrEmpty(videoName))
                    {
                        folderFunction.SavePathFile(addSOP.SOPVideoObj, sopPath, videoName);
                    }
                }
                #endregion

                #region 找出要刪除的SOP
                var deleteSOPs = post.SOP2s.Where(x => x.Deleted == 1).ToList();

                var deleteSOP_Dicts = new List<Dictionary<string, object>>();

                foreach (var deleteSOP in deleteSOPs)
                {
                    var deleteSOP_Dict = new Dictionary<string, object>()
                    {
                        { "SOP2Id", deleteSOP.SOP2Id},
                        { "@Deleted", DeletedDataEnum.True},
                        { "@Updater", myUser.UserId},
                        { "@UpdateTime", DateTime.Now}
                    };

                    deleteSOP_Dicts.Add(deleteSOP_Dict);
                }
                if (deleteSOP_Dicts.Count > 0)
                {
                    await _baseRepository.UpdateMutiByCustomTable(deleteSOP_Dicts, "SOP2", "\"SOP2Id\" = @SOP2Id");
                }

                foreach (var deleteSOP in deleteSOPs)
                {
                    var tempSOPPath = Path.Combine(sopRootPath, deleteSOP.SOP2Id.ToString());

                    DirectoryInfo directoryInfo = new DirectoryInfo(tempSOPPath);
                    if (directoryInfo.Exists)
                    {
                        directoryInfo.Delete(true);
                    }
                }
                #endregion

                #region 找出要修改的SOP
                var updateSOPs = post.SOP2s.Where(x => x.SOP2Id != 0 && x.Deleted == 0).ToList();

                var sopWhere = $@"""Deleted"" = 0 AND ""SOP2Id"" = ANY (@SOP2Ids)";
                var tempSops = await _baseRepository.GetAllAsync<SOP2>("SOP2", sopWhere, new { SOP2Ids = updateSOPs.Select(x => x.SOP2Id).ToList() });
                
                foreach (var updateSOP in updateSOPs)
                {
                    string? sopImageName = null;
                    string? remarkImageName = null;
                    string? videoName = updateSOP.SOPVideoObj != null ? folderFunction.FileProduceName(updateSOP.SOPVideoObj) : null;

                    // 處理圖片檔案
                    if (updateSOP.SOP2ImageObj != null)
                    {
                        sopImageName = folderFunction.FileProduceName(updateSOP.SOP2ImageObj);
                    }

                    // 處理備註圖片檔案
                    if (updateSOP.SOP2RemarkImageObj != null)
                    {
                        remarkImageName = folderFunction.FileProduceName(updateSOP.SOP2RemarkImageObj);
                    }

                    // 處理影片檔案
                    if (updateSOP.SOPVideoObj != null)
                    {
                        videoName = folderFunction.FileProduceName(updateSOP.SOPVideoObj);
                    }

                    var updateSOP_Dict = new Dictionary<string, object>()
                    {
                        { "SOP2Id", updateSOP.SOP2Id },
                        { "@SOP2Name", updateSOP.SOP2Name },
                        { "@SOP2Step", updateSOP.SOP2Step },
                        { "@SOP2Message", updateSOP.SOP2Message },
                        { "@SOP2Remark", updateSOP.SOP2Remark },
                        { "@T3DModels", updateSOP.T3DModels },
                        { "@Updater", myUser.UserId},
                        { "@UpdateTime", DateTime.Now}
                    };

                    // 處理圖片檔案
                    if (!string.IsNullOrEmpty(sopImageName))
                    {
                        updateSOP_Dict.Add("@SOP2Image", sopImageName);
                    }
                    else if (updateSOP.IsDeletedSOP2Image)
                    {
                        updateSOP_Dict.Add("@SOP2Image", null);
                    }

                    // 處理備註圖片檔案
                    if (!string.IsNullOrEmpty(remarkImageName))
                    {
                        updateSOP_Dict.Add("@SOP2RemarkImage", remarkImageName);
                    }
                    else if (updateSOP.IsDeletedSOP2RemarkImage)
                    {
                        updateSOP_Dict.Add("@SOP2RemarkImage", null);
                    }

                    // 處理影片檔案
                    if (!string.IsNullOrEmpty(videoName))
                    {
                        updateSOP_Dict.Add("@SOPVideo", videoName);
                    }
                    else if (updateSOP.IsDeletedSOPVideo)
                    {
                        if (updateSOP.IsDeletedSOPVideo)
                        {
                            updateSOP_Dict.Add("@SOPVideo", null);
                        }
                    }

                    // 更新語句中指定僅更新非ID欄位
                    await _baseRepository.UpdateOneByCustomTable(updateSOP_Dict, "SOP2", "\"SOP2Id\" = @SOP2Id");

                    var tempSelectSOP = tempSops.FirstOrDefault(x => x.SOP2Id == updateSOP.SOP2Id);

                    if (updateSOP.IsDeletedSOP2Image && !string.IsNullOrEmpty(tempSelectSOP.SOP2Image))
                    {
                        folderFunction.DeleteFile(Path.Combine(sopRootPath, tempSelectSOP.SOP2Id.ToString(), tempSelectSOP.SOP2Image));
                    }

                    if (updateSOP.IsDeletedSOP2RemarkImage && !string.IsNullOrEmpty(tempSelectSOP.SOP2RemarkImage))
                    {
                        folderFunction.DeleteFile(Path.Combine(sopRootPath, tempSelectSOP.SOP2Id.ToString(), tempSelectSOP.SOP2RemarkImage));
                    }

                    if (updateSOP.IsDeletedSOPVideo && !string.IsNullOrEmpty(tempSelectSOP.SOPVideo))
                    {
                        folderFunction.DeleteFile(Path.Combine(sopRootPath, tempSelectSOP.SOP2Id.ToString(), tempSelectSOP.SOPVideo));
                    }

                    if (!string.IsNullOrEmpty(sopImageName))
                    {
                        folderFunction.SavePathFile(updateSOP.SOP2ImageObj, Path.Combine(sopRootPath, tempSelectSOP.SOP2Id.ToString()), sopImageName);
                    }

                    if (!string.IsNullOrEmpty(remarkImageName))
                    {
                        folderFunction.SavePathFile(updateSOP.SOP2RemarkImageObj, Path.Combine(sopRootPath, tempSelectSOP.SOP2Id.ToString()), remarkImageName);
                    }

                    if (!string.IsNullOrEmpty(videoName))
                    {
                        folderFunction.SavePathFile(updateSOP.SOPVideoObj, Path.Combine(sopRootPath, tempSelectSOP.SOP2Id.ToString()), videoName);
                    }
                }
                #endregion

                apiResult.Code = "0000";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
            }
            catch (Exception ex)
            {
                apiResult.Code = "9999";
                apiResult.Message = $"錯誤更新 - {step}: {ex.Message}";
                exceptionMsg = ex.ToString();
                stackTrace = new StackTrace(ex);
            }

            return Ok(apiResult);
        }
    }
}
