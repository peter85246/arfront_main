﻿using ARManagement.BaseRepository.Interface;
using ARManagement.Data;
using ARManagement.Helpers;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Diagnostics;

namespace ARManagement.Controllers
{
    public class MachineController : MyBaseApiController
    {
        private readonly IBaseRepository _baseRepository;
        private readonly ResponseCodeHelper _responseCodeHelper;
        private string _savePath = string.Empty;
        private readonly ARManagementContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public MachineController(ARManagementContext context,
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

        // GET: api/Machines
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Machine>>> GetMachines()
        {
            _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'"); // SchemaName訪問
            return await _context.Machine.ToListAsync();
        }

        // GET: api/Machine/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Machine>> GetMachine(int id)
        {
            _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'"); // SchemaName訪問
            var machine = await _context.Machine.FindAsync(id);

            if (machine == null)
            {
                return NotFound();
            }

            return machine;
        }

        //// POST: api/Machine
        //[HttpPost]PutMachine
        //public async Task<ActionResult<Machine>> PostMachine(Machine machine)
        //{
        //    _context.Machine.Add(machine);
        //    await _context.SaveChangesAsync();

        //    return CreatedAtAction(nameof(GetMachine), new { id = machine.MachineId }, machine);
        //}

        // PUT: api/Machine/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMachine(int id, Machine machine)
        {
            _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'"); // SchemaName訪問

            if (id != machine.MachineId)
            {
                return BadRequest();
            }

            _context.Entry(machine).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MachineExists(id))
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

        // DELETE: api/Machine/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMachine(int id)
        {
            _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'"); // SchemaName訪問

            var machine = await _context.Machine.FindAsync(id);
            if (machine == null)
            {
                return NotFound();
            }

            _context.Machine.Remove(machine);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MachineExists(int id)
        {
            _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'"); // SchemaName訪問
            return _context.Machine.Any(e => e.MachineId == id);
        }

        /// <summary>
        /// 10. 機台列表
        /// </summary>
        /// <param name="post"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<ApiResult<List<MachineOverview>>>> MachineOverview(PostMachineFilter post)
        {
            ApiResult<List<MachineOverview>> apiResult = new ApiResult<List<MachineOverview>>(jwtToken.Token);

            try
            {
                #region 判斷Token是否過期或無效
                if (tokenExpired)
                {
                    apiResult.Code = "1001"; //Token過期或無效
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }
                #endregion

                _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'"); // SchemaName訪問

                var sql = $@"
                            SELECT 
                                m.*,
                                md.""MachineDeviceId""
                            FROM ""{_context.GetSchemaFromContext()}"".""Machine"" m
                            JOIN ""{_context.GetSchemaFromContext()}"".""MachineDevice"" md ON m.""MachineId"" = md.""MachineId"" AND md.""Deleted"" = 0
                            WHERE m.""CompanyId"" = @CompanyId AND m.""Deleted"" = 0
                        ";

                if (!string.IsNullOrEmpty(post.Keyword))
                {
                    sql += $@" AND (""MachineCode"" LIKE CONCAT('%', @Keyword, '%') OR ""MachineName"" LIKE CONCAT('%', @Keyword, '%') OR ""MachineSpec"" LIKE CONCAT('%', @Keyword, '%'))";
                }

                sql += $@" ORDER BY m.""MachineId"" ASC";

                List<MachineOverview> machineOverview = await _baseRepository.GetAllAsync<MachineOverview>(sql, new { Keyword = post.Keyword, CompanyId = CompanyId });
                foreach (var item in machineOverview)
                {
                    if (!string.IsNullOrEmpty(item.MachineImage))
                    {
                        item.MachineImage = $"{baseURL}upload/machine/{item.MachineId}/{item.MachineImage}";
                    }
                }

                apiResult.Code = "0000";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                apiResult.Result = machineOverview;
            }
            catch (Exception ex)
            {
                apiResult.Code = "9999";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
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
        public async Task<ActionResult<ApiResult<MachineInfo>>> GetOneMachine(MachinePrimary post)
        {
            ApiResult<MachineInfo> apiResult = new ApiResult<MachineInfo>(jwtToken.Token);

            try
            {
                #region 判斷Token是否過期或無效
                if (tokenExpired)
                {
                    apiResult.Code = "1001"; //Token過期或無效
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }
                #endregion

                var schema = _context.GetSchemaFromContext();
                _context.Database.ExecuteSqlRaw($"SET search_path TO {schema}"); //Schema訪問

                #region 機台是否存在
                string conditionSQL = $@"""MachineId"" = @MachineId";
                var machineInfo = await _baseRepository.GetOneAsync<MachineInfo>("Machine", conditionSQL, new { MachineId = post.MachineId });

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
                    machineInfo.MachineImage = $"{baseURL}upload/machine/{machineInfo.MachineId}/{machineInfo.MachineImage}";
                }

                if (!string.IsNullOrEmpty(machineInfo.MachineFile))
                {
                    machineInfo.MachineFile = $"{baseURL}upload/machine/{machineInfo.MachineId}/{machineInfo.MachineFile}";
                }

                apiResult.Code = "0000";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                apiResult.Result = machineInfo;
            }
            catch (Exception ex)
            {
                apiResult.Code = "9999";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
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
        public async Task<ActionResult<ApiResult<MachineInfo>>> GetOneMachineByMachineCode(PostMachineCode post)
        {
            ApiResult<MachineInfo> apiResult = new ApiResult<MachineInfo>(jwtToken.Token);

            try
            {
                #region 判斷Token是否過期或無效
                if (tokenExpired)
                {
                    apiResult.Code = "1001"; //Token過期或無效
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }
                #endregion

                _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'"); // SchemaName訪問

                #region 機台是否存在
                string conditionSQL = $@"""MachineCode"" = @MachineCode";
                var machineInfo = await _baseRepository.GetOneAsync<MachineInfo>($"{_context.GetSchemaFromContext()}.\"Machine\"", conditionSQL, new { MachineCode = post.MachineCode });

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
                    machineInfo.MachineImage = $"{baseURL}upload/machine/{machineInfo.MachineId}/{machineInfo.MachineImage}";
                }

                if (!string.IsNullOrEmpty(machineInfo.MachineFile))
                {
                    machineInfo.MachineFile = $"{baseURL}upload/machine/{machineInfo.MachineId}/{machineInfo.MachineFile}";
                }

                apiResult.Code = "0000";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                apiResult.Result = machineInfo;
            }
            catch (Exception ex)
            {
                apiResult.Code = "9999";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
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
        public async Task<ActionResult<ApiResult<string>>> MachineInfo([FromForm] MachineInfo post)
        {
            ApiResult<string> apiResult = new ApiResult<string>(jwtToken.Token);

            try
            {
                var schema = _httpContextAccessor.HttpContext?.Items["SchemaName"] as string ?? "public";
                Console.WriteLine($"Current schema in MachineInfo: {schema}");

                // 设置 schema
                _context.Database.ExecuteSqlRaw($"SET search_path TO \"{schema}\"");

                // 打印接收到的所有字段，以便调试
                Console.WriteLine("Received fields:");
                foreach (var prop in typeof(MachineInfo).GetProperties())
                {
                    Console.WriteLine($"{prop.Name}: {prop.GetValue(post)}");
                }

                #region 判斷Token是否過期或無效
                if (tokenExpired)
                {
                    apiResult.Code = "1001"; //Token過期或無效
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }
                #endregion

                _context.Database.ExecuteSqlRaw($"SET search_path TO '{schema}'"); // SchemaName訪問

                #region 欄位驗證
                if (string.IsNullOrEmpty(post.MachineCode) ||
                    string.IsNullOrEmpty(post.MachineName) ||
                    string.IsNullOrEmpty(post.MachineSpec))
                {
                    apiResult.Code = "2003"; //有必填欄位尚未填寫
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    Console.WriteLine($"Validation failed. Code: {apiResult.Code}, Message: {apiResult.Message}");
                    return Ok(apiResult);
                }

                if (post.MachineCode.Length > 100 || 
                    post.MachineName.Length > 100 ||
                    post.MachineSpec.Length > 100)
                {
                    apiResult.Code = "2005"; //輸入文字字數不符合長度規範
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    Console.WriteLine($"Validation failed. Code: {apiResult.Code}, Message: {apiResult.Message}");
                    return Ok(apiResult);
                }
                #endregion

                #region 機台是否存在
                Machine machineinfo = new Machine();
                if (post.MachineId != 0)
                {
                    var where = $@"""MachineId"" = @MachineId";

                    //machineinfo = await _baseRepository.GetOneAsync<Machine>($"{_context.GetSchemaFromContext()}.\"Machine\"", where, new { MachineId = post.MachineId });
                    machineinfo = await _baseRepository.GetOneAsync<Machine>("Machine", where, new { MachineId = post.MachineId });

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

                //需檢查MachineCode有沒有重複
                Machine machineinfoRepeat = new Machine();
                var conditionSQL = $@"""Deleted"" = 0 AND ""CompanyId"" = @CompanyId AND ""MachineCode"" = @MachineCode";

                if (post.MachineId != 0)
                {
                    conditionSQL += " AND \"MachineId\" != @MachineId";
                }

                //machineinfoRepeat = await _baseRepository.GetOneAsync<Machine>($"{_context.GetSchemaFromContext()}.\"Machine\"", conditionSQL, new { CompanyId = CompanyId, MachineCode = post.MachineCode, MachineId = post.MachineId });
                machineinfoRepeat = await _baseRepository.GetOneAsync<Machine>("Machine", conditionSQL, new { CompanyId = CompanyId, MachineCode = post.MachineCode, MachineId = post.MachineId });

                if (machineinfoRepeat != null) //代表有重複
                {

                    apiResult.Code = "2013"; //機台ID已重複
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }

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

                string FileName = string.Empty; //檔案路徑
                if (post.MachineFileObj != null)
                {
                    var validFileNameEx = new List<string>() {"zip"}; //合法副檔名
                    string response = folderFunction.FileProduceName(post.MachineFileObj, validFileNameEx);

                    if (response == "Fail")
                    {
                        apiResult.Code = "2004"; //不合法的欄位
                        apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                        return Ok(apiResult);
                    }
                    FileName = response;
                }

                //判斷machine資料夾是否存在
                DirectoryInfo directoryInfo = new DirectoryInfo(Path.Combine(_savePath, "machine"));
                if (!directoryInfo.Exists)
                {
                    directoryInfo.Create();
                }

                int MachineId = 0;

                if (post.MachineId == 0) //新增
                {
                    Dictionary<string, object> addMachine_Dict = new Dictionary<string, object>()
                    {
                        { "@CompanyId", CompanyId},
                        { "@MachineCode", post.MachineCode},
                        { "@MachineName", post.MachineName},
                        { "@MachineSpec", post.MachineSpec},
                        { "@MachineImage", ImageName},
                        { "@MachineFile", FileName},
                        { "@Creator", myUser.UserId},
                    };

                    //MachineId = await _baseRepository.AddOneByCustomTable(addMachine_Dict, $"{_context.GetSchemaFromContext()}.\"Machine\"", "MachineId");
                    MachineId = await _baseRepository.AddOneByCustomTable(addMachine_Dict, "Machine", "MachineId");

                    Dictionary<string, object> addMachineDevice_Dict = new Dictionary<string, object>()
                    {
                        { "@MachineId", MachineId},
                        { "@Creator", myUser.UserId},
                    };

                    //await _baseRepository.AddOneByCustomTable(addMachineDevice_Dict, $"{_context.GetSchemaFromContext()}.\"MachineDevice\"", "MachineDeviceId");
                    await _baseRepository.AddOneByCustomTable(addMachineDevice_Dict, "MachineDevice", "MachineDeviceId");

                }
                else //編輯
                {
                    Dictionary<string, object> updateManchine_Dict = new Dictionary<string, object>()
                     {
                        { "MachineId", post.MachineId},
                        { "@CompanyId", CompanyId},
                        { "@MachineCode", post.MachineCode},
                        { "@MachineName", post.MachineName},
                        { "@MachineSpec", post.MachineSpec},
                        { "@Updater", myUser.UserId},
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

                    if (!string.IsNullOrEmpty(FileName))
                    {
                        updateManchine_Dict.Add("@MachineFile", FileName);
                    }
                    else
                    {
                        if ((bool)post.IsDeletedMachineFile)
                        {
                            updateManchine_Dict.Add("@MachineFile", "");
                        }
                    }

                    //await _baseRepository.UpdateOneByCustomTable(updateManchine_Dict, $"{_context.GetSchemaFromContext()}.\"Machine\"", "\"MachineId\" = @MachineId");
                    await _baseRepository.UpdateOneByCustomTable(updateManchine_Dict, "Machine", @"""MachineId"" = @MachineId");

                    MachineId = post.MachineId;
                }

                var fullPath = Path.Combine(_savePath, "machine", MachineId.ToString()); //根目錄
                if ((bool)post.IsDeletedMachineImage && !string.IsNullOrEmpty(machineinfo.MachineImage)) //刪除之前的圖片
                {
                    folderFunction.DeleteFile(Path.Combine(fullPath, machineinfo.MachineImage));
                }

                if ((bool)post.IsDeletedMachineFile && !string.IsNullOrEmpty(machineinfo.MachineFile)) //刪除之前的檔案
                {
                    folderFunction.DeleteFile(Path.Combine(fullPath, machineinfo.MachineFile));
                }

                if (!string.IsNullOrEmpty(ImageName)) //新增圖片
                {
                    folderFunction.SavePathFile(post.MachineImageObj, fullPath, ImageName);
                }

                if (!string.IsNullOrEmpty(FileName)) //新增檔案
                {
                    folderFunction.SavePathFile(post.MachineFileObj, fullPath, FileName);
                }

                apiResult.Code = "0000";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                apiResult.Result = MachineId.ToString();
                Console.WriteLine($"Operation successful. MachineId: {MachineId}");
            }
            catch (Exception ex)
            {
                apiResult.Code = "9999";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                exceptionMsg = ex.ToString();
                stackTrace = new StackTrace(ex);
                Console.WriteLine($"Error in MachineInfo: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                    Console.WriteLine($"Inner Exception Stack Trace: {ex.InnerException.StackTrace}");
                }
            }

            return Ok(apiResult);
        }

        /// <summary>
        /// 13. 刪除機台
        /// </summary>
        /// <param name="post"></param>
        /// <returns></returns>
        [HttpDelete]
        public async Task<ActionResult<ApiResult<int>>> DeleteMachine(PostId post)
        {
            ApiResult<int> apiResult = new ApiResult<int>();

            try
            {
                #region 判斷Token是否過期或無效
                if (tokenExpired)
                {
                    apiResult.Code = "1001"; //Token過期或無效
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }
                #endregion

                var schema = _context.GetSchemaFromContext();
                Console.WriteLine($"Current schema in DeleteMachine: {schema}");

                _context.Database.ExecuteSqlRaw($"SET search_path TO '{schema}'"); //SchemaName

                #region 機台是否存在
                string conditionSQL = $@"""MachineId"" = @MachineId";
                var machineInfo = await _baseRepository.GetOneAsync<MachineInfo>("Machine", conditionSQL, new { MachineId = post.Id });

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
                await _baseRepository.DeleteOne(machineInfo.MachineId, "Machine", "\"MachineId\"", myUser.UserId);
                #endregion

                var machineWhere = $@"""MachineId"" = @MachineId";

                #region 刪掉MachineAlarm表
                //找出所有MachineAlarm
                var machineAlarms = await _baseRepository.GetAllAsync<MachineAlarm>("MachineAlarm", machineWhere, new { MachineId = machineInfo.MachineId });

                //刪除MachineAlarm
                await _baseRepository.DeleteOne(machineInfo.MachineId, "MachineAlarm", "\"MachineId\"", myUser.UserId);
                #endregion

                #region 刪掉SOP表
                //找出所有SOP
                var machineAlarmIds = machineAlarms.Select(x => x.MachineAlarmId).ToList();
                var sopWhere = $@"""MachineAlarmId"" = ANY (@MachineAlarmId)";
                var sops = await _baseRepository.GetAllAsync<SOP>("SOP", sopWhere, new { MachineAlarmId = machineAlarmIds });

                //刪除SOP
                var deleteSOP = $@"UPDATE ""{_context.GetSchemaFromContext()}"".""SOP"" SET
                                                ""Deleted"" = 1,
                                                ""Updater"" = @Updater,
                                                ""UpdateTime"" = @UpdateTime WHERE ""MachineAlarmId"" = ANY (@Ids)";
                await _baseRepository.ExecuteSql(deleteSOP, new { Updater = myUser.UserId, UpdateTime = DateTime.Now, Ids = machineAlarmIds });
                #endregion

                #region 刪掉SOP Model表
                var sopIds = sops.Select(x => x.SOPId).ToList();
                var deleteSOPModel = $@"UPDATE ""{_context.GetSchemaFromContext()}"".""SOPModel"" SET
                                                ""Deleted"" = 1,
                                                ""Updater"" = @Updater,
                                                ""UpdateTime"" = @UpdateTime WHERE ""SOPId"" = ANY (@Ids)";
                await _baseRepository.ExecuteSql(deleteSOPModel, new { Updater = myUser.UserId, UpdateTime = DateTime.Now, Ids = sopIds });
                #endregion

                #region 刪掉MachineDevice表
                await _baseRepository.DeleteOne(machineInfo.MachineId, "MachineDevice", "\"MachineId\"", myUser.UserId);
                #endregion

                #region 刪掉MachineIOT表
                //找出所有MachineIOT
                var machineIOTs = await _baseRepository.GetAllAsync<IOT>("MachineIOT", machineWhere, new { MachineId = machineInfo.MachineId });

                //刪除MachineIOT
                await _baseRepository.DeleteOne(machineInfo.MachineId, "MachineIOT", "\"MachineId\"", myUser.UserId);
                #endregion

                #region 刪掉MachineIOTTopic
                var machineIOTIds = machineIOTs.Select(x => x.MachineIOTId).ToList();

                var deleteMachineIOTTopic = $@"UPDATE ""MachineIOTTopic"" SET
                                                ""Deleted"" = 1,
                                                ""Updater"" = @Updater,
                                                ""UpdateTime"" = @UpdateTime WHERE ""MachineIOTId"" = ANY (@Ids)";
                await _baseRepository.ExecuteSql(deleteMachineIOTTopic, new { Updater = myUser.UserId, UpdateTime = DateTime.Now, Ids = machineIOTIds });
                #endregion

                #region 刪掉Machine底下所有子資料夾、檔案
                var machinePath = Path.Combine(_savePath,"machine", machineInfo.MachineId.ToString());

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
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                exceptionMsg = ex.ToString();
                stackTrace = new StackTrace(ex);
                Console.WriteLine($"Error in DeleteMachine: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                    Console.WriteLine($"Inner Exception Stack Trace: {ex.InnerException.StackTrace}");
                }
            }

            return Ok(apiResult);
        }

    }
}
