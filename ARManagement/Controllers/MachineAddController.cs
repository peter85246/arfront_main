using ARManagement.BaseRepository.Interface;
using ARManagement.Data;
using ARManagement.Helpers;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Diagnostics;

namespace ARManagement.Controllers
{
    public class MachineAddController : MyBaseApiController
    {
        private readonly IBaseRepository _baseRepository;
        private readonly ResponseCodeHelper _responseCodeHelper;
        private string _savePath = string.Empty;
        private readonly ARManagementContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public MachineAddController(ARManagementContext context,
           IBaseRepository baseRepository,
           ResponseCodeHelper responseCodeHelper, 
           IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _baseRepository = baseRepository;
            _responseCodeHelper = responseCodeHelper;
            _httpContextAccessor = httpContextAccessor;

            _savePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "upload");
        }

        // GET: api/MachineAdds
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MachineAdd>>> GetMachineAdds()
        {
            //_context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");
            return await _context.MachineAdd.ToListAsync();
        }

        // GET: api/MachineAdds/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MachineAdd>> GetMachineAdd(int id)
        {
            //_context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");
            var machineAdd = await _context.MachineAdd.FindAsync(id);

            if (machineAdd == null)
            {
                return NotFound();
            }

            return machineAdd;
        }

        // POST: api/MachineAdds
        [HttpPost]
        public async Task<ActionResult<MachineAdd>> PostMachine(MachineAdd machineAdd)
        {
            //_context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");
            _context.MachineAdd.Add(machineAdd);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMachineAdd), new { id = machineAdd.MachineAddId }, machineAdd);
        }

        // PUT: api/MachineAdds/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMachineAdd(int id, MachineAdd machineAdd)
        {
            //_context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");

            if (id != machineAdd.MachineAddId)
            {
                return BadRequest();
            }

            _context.Entry(machineAdd).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MachineAddExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/MachineAdd/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMachineAdd(int id)
        {
            //_context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");

            var machineAdd = await _context.MachineAdd.FindAsync(id);
            if (machineAdd == null)
            {
                return NotFound();
            }

            _context.MachineAdd.Remove(machineAdd);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MachineAddExists(int id)
        {
            //_context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");
            return _context.MachineAdd.Any(e => e.MachineAddId == id);
        }


        /// <summary>
        /// 10. 機台列表
        /// </summary>
        /// <param name="post"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<ApiResult<List<MachineAddOverview>>>> MachineAddOverview(PostMachineAddFilter post)
        {
            ApiResult<List<MachineAddOverview>> apiResult = new ApiResult<List<MachineAddOverview>>(); /*jwtToken.Token*/

            try
            {
                #region 判斷Token是否過期或無效
                //if (tokenExpired)
                //{
                //    apiResult.Code = "1001"; //Token過期或無效
                //    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                //    return Ok(apiResult);
                //}
                #endregion

                #region 判斷帳號是否為系統管理員
                //if ((myUser.UserLevel & (byte)UserLevelEnum.Admin) == 0)
                //{
                //    apiResult.Code = "3001"; //您不具有瀏覽的權限
                //    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                //    return Ok(apiResult);
                //}
                #endregion

                //var sql = $@"
                //            SELECT 
                //                m.*,
                //                md.""MachineDeviceId""
                //            FROM public.""MachineAdd"" m
                //            JOIN public.""MachineDevice"" md ON m.""MachineAddId"" = md.""MachineAddId"" AND md.""Deleted"" = 0
                //            WHERE m.""CompanyId"" = @CompanyId AND m.""Deleted"" = 0
                //        ";

                var sql = $@"
                            SELECT 
                                m.""MachineAddId"", m.""MachineType"", m.""ModelSeries"", m.""MachineName"", m.""MachineImage""
                            FROM ""{_context.GetSchemaFromContext()}"".""MachineAdd"" m
                            WHERE m.""CompanyId"" = @CompanyId AND m.""Deleted"" = 0";



                if (!string.IsNullOrEmpty(post.Keyword))
                {
                    sql += $@" AND (""MachineType"" LIKE CONCAT('%', @Keyword, '%') OR ""ModelSeries"" LIKE CONCAT('%', @Keyword, '%') OR ""MachineName"" LIKE CONCAT('%', @Keyword, '%'))";
                }

                if (!string.IsNullOrEmpty(post.MachineType))
                {
                    sql += $@" AND ( ""MachineType"" = @MachineType )";
                }

                if (!string.IsNullOrEmpty(post.MachineName))
                {
                    sql += $@" AND ( ""MachineName"" LIKE CONCAT('%', @MachineName, '%') )";
                }

                if (!string.IsNullOrEmpty(post.ModelSeries))
                {
                    sql += $@" AND ( ""ModelSeries"" = @ModelSeries )";
                }

                sql += $@" ORDER BY m.""MachineAddId"" ASC";

                List<MachineAddOverview> machineAddOverview = await _baseRepository.GetAllAsync<MachineAddOverview>(sql, new { Keyword = post.Keyword, CompanyId = CompanyId, MachineType = post.MachineType, MachineName = post.MachineName, ModelSeries  = post.ModelSeries});

                foreach (var item in machineAddOverview)
                {
                    if (!string.IsNullOrEmpty(item.MachineImage))
                    {
                        item.MachineImage = $"{baseURL}upload/machineAdd/{item.MachineAddId}/{item.MachineImage}";
                    }
                }

                sql = $@"
                            SELECT 
                                m.""MachineAddId"", m.""MachineType"", m.""ModelSeries"", m.""MachineName"", m.""MachineImage""
                            FROM ""{_context.GetSchemaFromContext()}"".""MachineAdd"" m
                            WHERE m.""CompanyId"" = @CompanyId AND m.""Deleted"" = 0";

                sql += $@" ORDER BY m.""MachineAddId"" ASC";

                //List<MachineAddOverview> machineAddOverviewALL = await _baseRepository.GetAllAsync<MachineAddOverview>(sql, new { Keyword = post.Keyword, CompanyId = CompanyId, MachineType = post.MachineType });

                List<string> machineAddOverview_MachineType = machineAddOverview.Select(p => p.MachineType).Distinct().ToList();
                List<string> machineAddOverview_MachineName = machineAddOverview.Select(p => p.MachineName).Distinct().ToList();
                List<string> machineAddOverview_ModelSeries = machineAddOverview.Select(p => p.ModelSeries).Distinct().ToList();

                apiResult.Code = "0000";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                apiResult.Result = machineAddOverview;
                apiResult.MachineType = machineAddOverview_MachineType;
                apiResult.MachineName = machineAddOverview_MachineName;
                apiResult.ModelSeries = machineAddOverview_ModelSeries;
            }
            catch (Exception ex)
            {
                apiResult.Code = "9999";
                //apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                apiResult.Message = $"錯誤 - {ex.Message} | 堆栈跟踪: {ex.StackTrace}";
                exceptionMsg = ex.ToString();
                stackTrace = new StackTrace(ex);
            }

            return Ok(apiResult);
        }

        /// <summary>
        /// 11. 取得單一一筆機台
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<ApiResult<MachineAddInfo>>> GetOneMachineAdd(MachineAddPrimary post)
        {
            var schema = _httpContextAccessor.HttpContext?.Items["SchemaName"] as string ?? "public";
            Console.WriteLine($"Current schema in MachineAddInfo: {schema}");

            ApiResult<MachineAddInfo> apiResult = new ApiResult<MachineAddInfo>(); /*jwtToken.Token*/

            try
            {
                #region 判斷Token是否過期或無效
                //if (tokenExpired)
                //{
                //    apiResult.Code = "1001"; //Token過期或無效
                //    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                //    return Ok(apiResult);
                //}
                #endregion

                #region 機台是否存在
                string conditionSQL = $@"""MachineAddId"" = @MachineAddId";
                var machineInfo = await _baseRepository.GetOneAsync<MachineAddInfo>("MachineAdd", conditionSQL, new { MachineAddId = post.MachineAddId });

                if (machineInfo == null)
                {
                    apiResult.Code = "4001"; //資料庫或是實體檔案不存在
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }

                if (machineInfo.Deleted == (byte)DeletedDataEnum.True)
                {
                    apiResult.Code = "4002"; //此資料已被刪除
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }
                #endregion

                if (!string.IsNullOrEmpty(machineInfo.MachineImage))
                {
                    machineInfo.MachineImage = $"{baseURL}upload/machineAdd/{machineInfo.MachineAddId}/{machineInfo.MachineImage}";
                }

                apiResult.Code = "0000";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                apiResult.Result = machineInfo;
            }
            catch (Exception ex)
            {
                apiResult.Code = "9999";
                //apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                apiResult.Message = $"錯誤 - {ex.Message} | 堆栈跟踪: {ex.StackTrace}";
                exceptionMsg = ex.ToString();
                stackTrace = new StackTrace(ex);
            }

            return Ok(apiResult);
        }

        /// <summary>
        /// 28. 取得單一一筆機台(For 眼鏡，透過MachineCode)
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<ApiResult<MachineAddInfo>>> GetOneMachineByMachineAddCode(PostMachineAddCode post)
        {
            ApiResult<MachineAddInfo> apiResult = new ApiResult<MachineAddInfo>(); /*jwtToken.Token*/

            try
            {
                #region 判斷Token是否過期或無效
                //if (tokenExpired)
                //{
                //    apiResult.Code = "1001"; //Token過期或無效
                //    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                //    return Ok(apiResult);
                //}
                #endregion

                #region 機台是否存在
                var machineInfo = await _baseRepository.GetOneAsync<MachineAddInfo>("MachineAdd");

                if (machineInfo == null)
                {
                    apiResult.Code = "4001"; //資料庫或是實體檔案不存在
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }

                if (machineInfo.Deleted == (byte)DeletedDataEnum.True)
                {
                    apiResult.Code = "4002"; //此資料已被刪除
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }
                #endregion

                apiResult.Code = "0000";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                apiResult.Result = machineInfo;
            }
            catch (Exception ex)
            {
                apiResult.Code = "9999";
                //apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                apiResult.Message = $"錯誤 - {ex.Message} | 堆栈跟踪: {ex.StackTrace}";
                exceptionMsg = ex.ToString();
                stackTrace = new StackTrace(ex);
            }

            return Ok(apiResult);
        }


        /// <summary>
        /// 12. 新增/編輯機台
        /// </summary>
        /// <param name="post"></param>
        /// <returns></returns>
        [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
        [DisableRequestSizeLimit]
        [Consumes("multipart/form-data")]
        [HttpPut]
        public async Task<ActionResult<ApiResult<string>>> MachineAddInfo([FromForm] MachineAddInfo post)
        {
            ApiResult<string> apiResult = new ApiResult<string>(); /*jwtToken.Token*/

            try
            {
                // 获取并设置当前的 schema
                var schema = _httpContextAccessor.HttpContext?.Items["SchemaName"] as string ?? "public";
                _baseRepository.SetSchema(schema);
                Console.WriteLine($"Current schema in MachineAddInfo: {schema}");
                #region 判斷Token是否過期或無效
                //if (tokenExpired)
                //{
                //    apiResult.Code = "1001"; //Token過期或無效
                //    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                //    return Ok(apiResult);
                //}
                #endregion

                #region 欄位驗證
                //if (string.IsNullOrEmpty(post.MachineType) ||
                //    string.IsNullOrEmpty(post.ModelSeries) ||
                //    string.IsNullOrEmpty(post.MachineName))
                //{
                //    apiResult.Code = "2003"; //有必填欄位尚未填寫
                //    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                //    return Ok(apiResult);
                //}

                //if (post.MachineType.Length > 100 || 
                //    post.ModelSeries.Length > 100 ||
                //    post.MachineName.Length > 100)
                //{
                //    apiResult.Code = "2005"; //輸入文字字數不符合長度規範
                //    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                //    return Ok(apiResult);
                //}
                #endregion

                #region 機台是否存在
                MachineAdd machineinfo = new MachineAdd();
                if (post.MachineAddId != 0)
                {
                    var where = $@"""MachineAddId"" = @MachineAddId";

                    machineinfo = await _baseRepository.GetOneAsync<MachineAdd>("MachineAdd", where, new { MachineAddId = post.MachineAddId });

                    if (machineinfo == null)
                    {
                        apiResult.Code = "4001"; //資料庫或是實體檔案不存在
                        apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                        return Ok(apiResult);
                    }

                    if (machineinfo.Deleted == (byte)DeletedDataEnum.True)
                    {
                        apiResult.Code = "4002"; //此資料已被刪除
                        apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                        return Ok(apiResult);
                    }
                }
                #endregion

                //需檢查MachineAddCode有沒有重複
                MachineAdd machineinfoRepeat = new MachineAdd();
                var conditionSQL = $@"""Deleted"" = 0 AND ""CompanyId"" = @CompanyId";

                if (post.MachineAddId != 0)
                {
                    conditionSQL += " AND \"MachineAddId\" != @MachineAddId";
                }

                //machineinfoRepeat = await _baseRepository.GetOneAsync<MachineAdd>("MachineAdd", conditionSQL, new { CompanyId = CompanyId,  MachineAddId = post.MachineAddId });

                //if (machineinfoRepeat != null) //代表有重複
                //{

                //    apiResult.Code = "2013"; //機台ID已重複
                //    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                //    return Ok(apiResult);
                //}

                FolderFunction folderFunction = new FolderFunction();
                string ImageName = string.Empty; //圖片路徑
                if (post.MachineImageObj != null)
                {
                    var validFileNameEx = new List<string>() { "png", "jpg", "jpeg" }; //合法副檔名
                    string response = folderFunction.FileProduceName(post.MachineImageObj, validFileNameEx);

                    if (response == "Fail")
                    {
                        apiResult.Code = "2004"; //不合法的欄位
                        apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                        return Ok(apiResult);
                    }
                    ImageName = response;
                }

                //判斷machineAdd資料夾是否存在
                DirectoryInfo directoryInfo = new DirectoryInfo(Path.Combine(_savePath, "machineAdd"));
                if (!directoryInfo.Exists)
                {
                    directoryInfo.Create();
                }

                int MachineAddId = 0;

                if (post.MachineAddId == 0) //新增
                {
                    Dictionary<string, object> addMachine_Dict = new Dictionary<string, object>()
                    {
                        { "@CompanyId", CompanyId},
                        { "@MachineType", post.MachineType},
                        { "@ModelSeries", post.ModelSeries},
                        { "@MachineName", post.MachineName},
                        { "@MachineImage", ImageName},
                        { "@Creator", myUser.UserId},
                    };

                    MachineAddId = await _baseRepository.AddOneByCustomTable(addMachine_Dict, "MachineAdd", "MachineAddId");
                    apiResult.Result = MachineAddId.ToString(); // 确保返回 MachineAddId

                    //Dictionary<string, object> addMachineDevice_Dict = new Dictionary<string, object>()
                    //{
                    //    { "@MachineAddId", MachineAddId},
                    //    //{ "@Creator", myUser.UserId},
                    //    { "@Creator", 1},
                    //};

                    //await _baseRepository.AddOneByCustomTable(addMachineDevice_Dict, "MachineDevice", "MachineDeviceId");
                }
                else //編輯
                {
                    Dictionary<string, object> updateManchine_Dict = new Dictionary<string, object>()
                     {
                        { "MachineAddId", post.MachineAddId},
                        { "@CompanyId", CompanyId},
                        { "@MachineType", post.MachineType},
                        { "@ModelSeries", post.ModelSeries},
                        { "@MachineName", post.MachineName},
                        //{ "@Updater", myUser.UserId},
                        { "@Updater", 1},
                        { "@UpdateTime", DateTime.Now}
                    };

                    if (!string.IsNullOrEmpty(ImageName))
                    {
                        updateManchine_Dict.Add("@MachineImage", ImageName);
                    }
                    else
                    {
                        if ((bool)post.IsDeletedMachineImage)
                        {
                            updateManchine_Dict.Add("@MachineImage", "");
                        }
                    }

                    await _baseRepository.UpdateOneByCustomTable(updateManchine_Dict, "MachineAdd", "\"MachineAddId\" = @MachineAddId");

                    MachineAddId = post.MachineAddId;
                }

                var fullPath = Path.Combine(_savePath, "machineAdd", MachineAddId.ToString()); //根目錄
                if ((bool)post.IsDeletedMachineImage && !string.IsNullOrEmpty(machineinfo.MachineImage)) //刪除之前的圖片
                {
                    folderFunction.DeleteFile(Path.Combine(fullPath, machineinfo.MachineImage));
                }
                if (!string.IsNullOrEmpty(ImageName)) //新增圖片
                {
                    folderFunction.SavePathFile(post.MachineImageObj, fullPath, ImageName);
                 }

                apiResult.Code = "0000";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
            }
            catch (Exception ex)
            {
                apiResult.Code = "9999";
                //apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                apiResult.Message = $"錯誤 - {ex.Message} | 堆栈跟踪: {ex.StackTrace}";
                exceptionMsg = ex.ToString();
                stackTrace = new StackTrace(ex);
            }

            return Ok(apiResult);
        }

        /// <summary>
        /// 13. 刪除機台
        /// </summary>
        /// <param name="post"></param>
        /// <returns></returns>
        [HttpDelete]
        public async Task<ActionResult<ApiResult<int>>> DeleteMachineAdd(PostId post)
        {
            ApiResult<int> apiResult = new ApiResult<int>();

            try
            {
                #region 判斷Token是否過期或無效
                //if (tokenExpired)
                //{
                //    apiResult.Code = "1001"; //Token過期或無效
                //    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                //    return Ok(apiResult);
                //}
                #endregion

                #region 機台是否存在
                string conditionSQL = $@"""MachineAddId"" = @MachineAddId";
                var machineInfo = await _baseRepository.GetOneAsync<MachineAddInfo>("MachineAdd", conditionSQL, new { MachineAddId = post.Id });

                if (machineInfo == null)
                {
                    apiResult.Code = "4001"; //資料庫或是實體檔案不存在
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }

                if (machineInfo.Deleted == (byte)DeletedDataEnum.True)
                {
                    apiResult.Code = "4002"; //此資料已被刪除
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }
                #endregion

                #region 刪掉Machine表
                await _baseRepository.DeleteOne(machineInfo.MachineAddId, "MachineAdd", "\"MachineAddId\"", myUser.UserId);
                #endregion

                var machineWhere = $@"""MachineAddId"" = @MachineAddId";

                #region 刪掉Machine底下所有子資料夾、檔案
                var machinePath = Path.Combine(_savePath, "machineAdd", machineInfo.MachineAddId.ToString());

                DirectoryInfo directoryInfo = new DirectoryInfo(machinePath);
                if (directoryInfo.Exists)
                {
                    directoryInfo.Delete(true);
                }
                #endregion

                apiResult.Code = "0000";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
            }
            catch (Exception ex)
            {
                apiResult.Code = "9999";
                //apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                apiResult.Message = $"錯誤 - {ex.Message} | 堆栈跟踪: {ex.StackTrace}";
                exceptionMsg = ex.ToString();
                stackTrace = new StackTrace(ex);
            }

            return Ok(apiResult);
        }

    }
}
