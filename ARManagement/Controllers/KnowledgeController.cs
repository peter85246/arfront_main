using ARManagement.BaseRepository.Interface;
using ARManagement.Data;
using ARManagement.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Models;
using System.Diagnostics;
using Newtonsoft.Json;
using Dapper;
using static Microsoft.Extensions.Logging.EventSource.LoggingEventSource;

namespace ARManagement.Controllers
{
    public class KnowledgeController : MyBaseApiController
    {
        private readonly IBaseRepository _baseRepository;
        private readonly ResponseCodeHelper _responseCodeHelper;
        private string _savePath = string.Empty;
        private readonly ARManagementContext _context;
        private readonly ARManagementContext _dbContext;

        public KnowledgeController(ARManagementContext context,
            IBaseRepository baseRepository,
            ResponseCodeHelper responseCodeHelper,
			ARManagementContext dbContext)
        {
            _context = context;
            _baseRepository = baseRepository;
            _responseCodeHelper = responseCodeHelper;
            _savePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "upload");

            // 確保目錄存在
            if (!Directory.Exists(_savePath))
            {
                Directory.CreateDirectory(_savePath);
            }

            // 打印路徑，確認是否正確
            Console.WriteLine($"Save path: {_savePath}");
            _dbContext = dbContext;
        }

        // GET: api/Products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<KnowledgeBase>>> GetKnowledgeBases()
        {
            _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");
            return await _context.KnowledgeBase.ToListAsync();
        }

        // GET: api/KnowledgeBase/5
        [HttpGet("{id}")]
        public async Task<ActionResult<KnowledgeBase>> GetKnowledgeBase(int id)
        {
            _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");

            var knowledgeBase = await _context.KnowledgeBase.FindAsync(id);

            if (knowledgeBase == null)
            {
                return NotFound();
            }

            return knowledgeBase;
        }

        // POST: api/KnowledgeBase
        [HttpPost]
        public async Task<ActionResult<KnowledgeBase>> PostKnowledgeBase(KnowledgeBase knowledgeBase)
        {
            _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");

            _context.KnowledgeBase.Add(knowledgeBase);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetKnowledgeBase), new { id = knowledgeBase.KnowledgeBaseId }, knowledgeBase);
        }

        // PUT: api/KnowledgeBase/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutKnowledgeBase(int id, KnowledgeBase knowledgeBase)
        {
            _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");

            if (id != knowledgeBase.KnowledgeBaseId)
            {
                return BadRequest();
            }

            _context.Entry(knowledgeBase).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!KnowledgeBaseExists(id))
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

        // DELETE: api/KnowledgeBase/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteKnowledgeBase(int id)
        {
            _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");

            var knowledgeBase = await _context.KnowledgeBase.FindAsync(id);
            if (knowledgeBase == null)
            {
                return NotFound();
            }

            _context.KnowledgeBase.Remove(knowledgeBase);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool KnowledgeBaseExists(int id)
        {
            _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");
            return _context.KnowledgeBase.Any(e => e.KnowledgeBaseId == id);
        }

		private async Task<string> GetSOPModelList(string knowledgeBase3DModelList)
		{
			var sopModelIds = JsonConvert.DeserializeObject<List<int>>(knowledgeBase3DModelList);
			var sopModels = await _context.SOP2Model
				.Where(s => sopModelIds.Contains(s.SOPModelId))
				.ToListAsync();
			return JsonConvert.SerializeObject(sopModels);
		}

		/// <summary>
		/// 3. 依據條件取得所有用戶列表
		/// </summary>
		/// <param name="post"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<ActionResult<ApiResult<List<KnowledgeBase>>>> GetAllKnowledgeBaseByFilter(PostKnowledgeinfoFilter post)
		{
			ApiResultKnowledgeBase<List<KnowledgeBase>> apiResult = new ApiResultKnowledgeBase<List<KnowledgeBase>>(jwtToken.Token);

            // 添加代碼來獲取未被刪除的 MachineAddId 列表
            var machineAddIds = _context.MachineAdd.Where(m => m.Deleted == 0).Select(m => m.MachineAddId).ToList();
            Console.WriteLine($"Active MachineAdd IDs: {string.Join(", ", machineAddIds)}");
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

                _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");

                //var where = $@"""Deleted"" = 0";
                // 現有的過濾條件
                // 确保当 machineAddIds 为空时不会导致 SQL 错误
                var idList = string.Join(", ", machineAddIds);
                var where = machineAddIds.Any() ? $@" ""Deleted"" = 0 AND ""MachineAddId"" IN ({idList})" : "1=0";

                if (!string.IsNullOrEmpty(post.Keyword))
                {
                    where += @" AND (""KnowledgeBaseDeviceType"" LIKE CONCAT('%', @Keyword ,'%') OR ""KnowledgeBaseDeviceParts"" LIKE CONCAT('%', @Keyword ,'%') OR ""KnowledgeBaseRepairItems"" LIKE CONCAT('%', @Keyword ,'%') OR ""KnowledgeBaseRepairType"" LIKE CONCAT('%', @Keyword ,'%')OR ""KnowledgeBaseSpec"" LIKE CONCAT('%', @Keyword ,'%') OR ""KnowledgeBaseProductName"" LIKE CONCAT('%', @Keyword ,'%') OR ""KnowledgeBaseSystem"" LIKE CONCAT('%', @Keyword ,'%') OR ""KnowledgeBaseFileNo"" LIKE CONCAT('%', @Keyword ,'%') )";
                }

                if (!string.IsNullOrEmpty(post.DeviceType))
				{
					where += $@" AND ( ""KnowledgeBaseDeviceType"" = @DeviceType )";
				}

				if (!string.IsNullOrEmpty(post.DeviceParts))
				{
					where += $@" AND ( ""KnowledgeBaseDeviceParts"" = @DeviceParts )";
				}

				if (!string.IsNullOrEmpty(post.RepairItems))
				{
					where += $@" AND ( ""KnowledgeBaseRepairItems"" = @RepairItems )";
				}

				if (!string.IsNullOrEmpty(post.RepairType))
				{
					where += $@" AND ( ""KnowledgeBaseRepairType"" = @RepairType )";
				}

                // 添加對 MachineAdd 中 Deleted 欄位的檢查
                //where += @" AND ""MachineAddId"" IN (SELECT ""MachineAddId"" FROM ""MachineAdd"" WHERE ""Deleted"" = 0)";

                var knowledgeBase = await _baseRepository.GetAllAsync<KnowledgeBase>("KnowledgeBase", where, new
				{
					Keyword = post.Keyword,
					DeviceType = post.DeviceType,
					DeviceParts = post.DeviceParts,
					RepairItems = post.RepairItems,
					RepairType = post.RepairType,
				}, "\"KnowledgeBaseId\" ASC");

				//var baseURL = "http://yourdomain.com/";

				foreach (var kb in knowledgeBase)
				{
					kb.KnowledgeBaseModelImage = JsonConvert.SerializeObject(
						ConvertImagePaths(baseURL, kb.MachineAddId.ToString(), kb.KnowledgeBaseId.ToString(), kb.KnowledgeBaseModelImage)
					);
					kb.KnowledgeBaseToolsImage = JsonConvert.SerializeObject(
						ConvertImagePaths(baseURL, kb.MachineAddId.ToString(), kb.KnowledgeBaseId.ToString(), kb.KnowledgeBaseToolsImage)
					);
					kb.KnowledgeBasePositionImage = JsonConvert.SerializeObject(
						ConvertImagePaths(baseURL, kb.MachineAddId.ToString(), kb.KnowledgeBaseId.ToString(), kb.KnowledgeBasePositionImage)
					);
					
					kb.KnowledgeBase3DModelList = await GetSOPModelList(kb.KnowledgeBase3DModelList);

					kb.KnowledgeBase3DModelImage = JsonConvert.SerializeObject(
						ConvertImagePaths(baseURL, kb.MachineAddId.ToString(), kb.KnowledgeBaseId.ToString(), kb.KnowledgeBase3DModelImage)
					);
					kb.KnowledgeBase3DModelFile = JsonConvert.SerializeObject(
						ConvertImagePaths(baseURL, kb.MachineAddId.ToString(), kb.KnowledgeBaseId.ToString(), kb.KnowledgeBase3DModelFile)
					);
				}

				List<string> knowledgeBaseAddOverview_DeviceType = knowledgeBase.Select(p => p.KnowledgeBaseDeviceType).Distinct().ToList();
				List<string> knowledgeBaseAddOverview_DeviceParts = knowledgeBase.Select(p => p.KnowledgeBaseDeviceParts).Distinct().ToList();
				List<string> knowledgeBaseAddOverview_RepairItems = knowledgeBase.Select(p => p.KnowledgeBaseRepairItems).Distinct().ToList();
				List<string> knowledgeBaseAddOverview_RepairType = knowledgeBase.Select(p => p.KnowledgeBaseRepairType).Distinct().ToList();

				apiResult.Code = "0000";
				apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
				apiResult.Result = knowledgeBase;

				apiResult.DeviceType = knowledgeBaseAddOverview_DeviceType;
				apiResult.DeviceParts = knowledgeBaseAddOverview_DeviceParts;
				apiResult.RepairItems = knowledgeBaseAddOverview_RepairItems;
				apiResult.RepairType = knowledgeBaseAddOverview_RepairType;
			}
			catch (Exception ex)
			{
				apiResult.Code = "9999";
				apiResult.Message = $"錯誤 - {ex.Message} | 堆栈跟踪: {ex.StackTrace}";
				exceptionMsg = ex.ToString();
				stackTrace = new StackTrace(ex);
			}

			return Ok(apiResult);
		}

		/// <summary>
		/// 取得最新建立的MachineAddId資訊綁定用以故障說明資訊
		/// </summary>
		/// <returns></returns>
		[HttpGet]
		public async Task<ActionResult<ApiResult<int>>> GetLatestMachineAddId()
		{
		    ApiResult<int> apiResult = new ApiResult<int>();

		    try
		    {
		        string tableName = "MachineAdd";
		        string sWhere = "\"Deleted\" = 0";
		        string selCol = "\"MachineAddId\"";
		        string sOrderBy = "\"MachineAddId\" DESC";
		        var latestMachineAddId = await _baseRepository.GetOneAsync<int>(
		            tableName,
		            sWhere,
		            selCol,
		            param: null,
		            sOrderBy: sOrderBy
		        );

		        if (latestMachineAddId != 0)
		        {
		            apiResult.Code = "0000";
		            apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
		            return Ok(latestMachineAddId);
		        }
		        else
		        {
		            apiResult.Code = "4004";
		            apiResult.Message = "沒有找到有效的機台ID";
		        }
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
		/// 依據MachineAddId取得所有故障說明(包含眼鏡使用)
		/// </summary>
		/// <param name="post"></param>
		/// <returns></returns>
		[HttpPost]
        public async Task<ActionResult<ApiResult<List<KnowledgeBase>>>> GetAllKnowledgeBaseByMachineAddId(PostAllKnowledgeBase post)
        {
            ApiResult<List<KnowledgeBase>> apiResult = new ApiResult<List<KnowledgeBase>>(); /*jwtToken.Token*/

            try
            {
                var machineAddWhere = $@"""MachineAddId"" = @MachineAddId";
                var machineAdd = await _baseRepository.GetOneAsync<MachineAdd>("MachineAdd", machineAddWhere, new { MachineAddId = post.Id });

                if (machineAdd == null)
                {
                    apiResult.Code = "4004"; // 該機台不存在資料庫或是資料已被刪除
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }

                if (machineAdd.Deleted == (byte)DeletedDataEnum.True)
                {
                    apiResult.Code = "4004"; // 該機台不存在資料庫或是資料已被刪除
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }

                var knowledgeBaseWhere = $@"""Deleted"" = 0 AND ""MachineAddId"" = @MachineAddId";
                var knowledgeBases = await _baseRepository.GetAllAsync<KnowledgeBase>("KnowledgeBase", knowledgeBaseWhere, new { MachineAddId = machineAdd.MachineAddId });

                //var baseURL = "http://yourdomain.com/";

                foreach (var knowledgeBase in knowledgeBases)
                {
                    knowledgeBase.KnowledgeBaseModelImage = JsonConvert.SerializeObject(
                        ConvertImagePaths(baseURL, knowledgeBase.MachineAddId.ToString(), knowledgeBase.KnowledgeBaseId.ToString(), knowledgeBase.KnowledgeBaseModelImage)
                    );
                    knowledgeBase.KnowledgeBaseToolsImage = JsonConvert.SerializeObject(
                        ConvertImagePaths(baseURL, knowledgeBase.MachineAddId.ToString(), knowledgeBase.KnowledgeBaseId.ToString(), knowledgeBase.KnowledgeBaseToolsImage)
                    );
                    knowledgeBase.KnowledgeBasePositionImage = JsonConvert.SerializeObject(
                        ConvertImagePaths(baseURL, knowledgeBase.MachineAddId.ToString(), knowledgeBase.KnowledgeBaseId.ToString(), knowledgeBase.KnowledgeBasePositionImage)
                    );
					knowledgeBase.KnowledgeBase3DModelList = await GetSOPModelList(knowledgeBase.KnowledgeBase3DModelList);
                    knowledgeBase.KnowledgeBase3DModelImage = JsonConvert.SerializeObject(
                        ConvertImagePaths(baseURL, knowledgeBase.MachineAddId.ToString(), knowledgeBase.KnowledgeBaseId.ToString(), knowledgeBase.KnowledgeBase3DModelImage)
                    );
                    knowledgeBase.KnowledgeBase3DModelFile = JsonConvert.SerializeObject(
                        ConvertImagePaths(baseURL, knowledgeBase.MachineAddId.ToString(), knowledgeBase.KnowledgeBaseId.ToString(), knowledgeBase.KnowledgeBase3DModelFile)
                    );
                }

                apiResult.Code = "0000";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                apiResult.Result = knowledgeBases;
            }
            catch (Exception ex)
            {
                apiResult.Code = "9999";
                apiResult.Message = $"錯誤 - {ex.Message} | 堆栈跟踪: {ex.StackTrace}";
            }

            return Ok(apiResult);
        }

        [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
		[DisableRequestSizeLimit]
		[Consumes("multipart/form-data")]
		[HttpPut]
		public async Task<ActionResult<ApiResult<int>>> SaveKnowledgeBase([FromForm] PostSaveKnowledgeBase post)
		{
			ApiResult<int> apiResult = new ApiResult<int>();
			string step = "Initial step";
			try
			{
				step = "Check KnowledgeBases null or empty";
				if (post.KnowledgeBases == null)
				{
					apiResult.Code = "錯誤代碼"; 
					apiResult.Message = "KnowledgeBases 為空";
					return Ok(apiResult);
				}

				step = "Validate MachineAddId";
				if (post.MachineAddId <= 0)
				{
					apiResult.Code = "错误代码";
					apiResult.Message = "MachineAddId must be greater than 0.";
					return BadRequest(apiResult);
				}


				#region Validate Fields Length
				step = "Validate KnowledgeBase fields length";
				foreach (var knowledgeBase in post.KnowledgeBases)
				{
					if ((knowledgeBase.KnowledgeBaseDeviceType != null && knowledgeBase.KnowledgeBaseDeviceType.Length > 100) ||
						(knowledgeBase.KnowledgeBaseDeviceParts != null && knowledgeBase.KnowledgeBaseDeviceParts.Length > 100) ||
						(knowledgeBase.KnowledgeBaseRepairItems != null && knowledgeBase.KnowledgeBaseRepairItems.Length > 100) ||
						(knowledgeBase.KnowledgeBaseRepairType != null && knowledgeBase.KnowledgeBaseRepairType.Length > 100) ||
						(knowledgeBase.KnowledgeBaseFileNo != null && knowledgeBase.KnowledgeBaseFileNo.Length > 50) ||
						(knowledgeBase.KnowledgeBaseSOPName != null && knowledgeBase.KnowledgeBaseSOPName.Length > 100) ||
						(knowledgeBase.KnowledgeBaseAlarmCode != null && knowledgeBase.KnowledgeBaseAlarmCode.Length > 50) ||
						(knowledgeBase.KnowledgeBaseSpec != null && knowledgeBase.KnowledgeBaseSpec.Length > 100) ||
						(knowledgeBase.KnowledgeBaseSystem != null && knowledgeBase.KnowledgeBaseSystem.Length > 100) ||
						(knowledgeBase.KnowledgeBaseProductName != null && knowledgeBase.KnowledgeBaseProductName.Length > 100) ||
						(knowledgeBase.KnowledgeBaseAlarmCause != null && knowledgeBase.KnowledgeBaseAlarmCause.Length > 1000) ||
						(knowledgeBase.KnowledgeBaseAlarmDesc != null && knowledgeBase.KnowledgeBaseAlarmDesc.Length > 1000) ||
						(knowledgeBase.KnowledgeBaseAlarmOccasion != null && knowledgeBase.KnowledgeBaseAlarmOccasion.Length > 1000))
					{
						apiResult.Code = "2005";
						apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
						return Ok(apiResult);
					}
				}
				#endregion

				#region Validate Image Extensions
				step = "Validate image extensions";
				var validImageEx = new List<string>() { "png", "jpg", "jpeg" };
				foreach (var knowledgeBase in post.KnowledgeBases)
				{
					ValidateImageExtensions(apiResult, knowledgeBase.KnowledgeBaseModelImageObj, validImageEx, "KnowledgeBaseModelImageObj");
					ValidateImageExtensions(apiResult, knowledgeBase.KnowledgeBaseToolsImageObj, validImageEx, "KnowledgeBaseToolsImageObj");
					ValidateImageExtensions(apiResult, knowledgeBase.KnowledgeBasePositionImageObj, validImageEx, "KnowledgeBasePositionImageObj");
					ValidateImageExtensions(apiResult, knowledgeBase.KnowledgeBase3DModelImageObj, validImageEx, "KnowledgeBase3DModelImageObj");
				}
				#endregion

				#region Check MachineAdd Existence and Status
				step = "Check MachineAdd existence and status";
				var machineAddWhere = $@"""MachineAddId"" = @MachineAddId";
				var machineAdd = await _baseRepository.GetOneAsync<MachineAdd>("MachineAdd", machineAddWhere, new { MachineAddId = post.MachineAddId });

				if (machineAdd == null || machineAdd.Deleted == (byte)DeletedDataEnum.True)
				{
					apiResult.Code = "4004";
					apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
					return Ok(apiResult);
				}
				#endregion

				FolderFunction folderFunction = new FolderFunction();
				var knowledgeBaseRootPath = Path.Combine(_savePath, "machineAdd", machineAdd.MachineAddId.ToString(), "knowledgeBase");

				#region Process KnowledgeBase Add
				step = "Process KnowledgeBase add";
				var addKnowledgeBases = post.KnowledgeBases.Where(x => x.KnowledgeBaseId == 0).ToList();
				foreach (var addKnowledgeBase in addKnowledgeBases)
				{
					var knowledgeBaseModelImagePaths = SaveImages(addKnowledgeBase.KnowledgeBaseModelImageObj, addKnowledgeBase.KnowledgeBaseModelImageNames, folderFunction, knowledgeBaseRootPath, apiResult, "KnowledgeBaseModelImageObj");
					var knowledgeBaseToolsImagePaths = SaveImages(addKnowledgeBase.KnowledgeBaseToolsImageObj, addKnowledgeBase.KnowledgeBaseToolsImageNames, folderFunction, knowledgeBaseRootPath, apiResult, "KnowledgeBaseToolsImageObj");
					var knowledgeBasePositionImagePaths = SaveImages(addKnowledgeBase.KnowledgeBasePositionImageObj, addKnowledgeBase.KnowledgeBasePositionImageNames, folderFunction, knowledgeBaseRootPath, apiResult, "KnowledgeBasePositionImageObj");
					
					var sopModelList = new List<int>();
                    Console.WriteLine($"KnowledgeBase3DModelImageObj count: {addKnowledgeBase.KnowledgeBase3DModelImageObj?.Count ?? 0}");
                    Console.WriteLine($"KnowledgeBase3DModelFileObj count: {addKnowledgeBase.KnowledgeBase3DModelFileObj?.Count ?? 0}");

                    if (addKnowledgeBase.KnowledgeBase3DModelImageObj != null && addKnowledgeBase.KnowledgeBase3DModelFileObj != null)
                    {
                        for (int i = 0; i < addKnowledgeBase.KnowledgeBase3DModelImageObj.Count; i++)
						{
                            var sopModel = new SOP2Model
							{
                                //SOPId = addKnowledgeBase.KnowledgeBaseId,
                                //SOPModelImage = JsonConvert.SerializeObject(SaveSOPFiles(new List<IFormFile> { addKnowledgeBase.KnowledgeBase3DModelImageObj[i] }, folderFunction, knowledgeBaseRootPath)),
                                //SOPModelFile = JsonConvert.SerializeObject(SaveSOPFiles(new List<IFormFile> { addKnowledgeBase.KnowledgeBase3DModelFileObj[i] }, folderFunction, knowledgeBaseRootPath)),
                                SOPModelImage = JsonConvert.SerializeObject(SaveSOPFiles(new List<IFormFile> { addKnowledgeBase.KnowledgeBase3DModelImageObj[i] }, folderFunction, knowledgeBaseRootPath)),
                                SOPModelFile = JsonConvert.SerializeObject(SaveSOPFiles(new List<IFormFile> { addKnowledgeBase.KnowledgeBase3DModelFileObj[i] }, folderFunction, knowledgeBaseRootPath)),
                                SOPModelPX = 0.0,
								SOPModelPY = 0.0,
								SOPModelPZ = 0.0,
								SOPModelRX = 0.0,
								SOPModelRY = 0.0,
								SOPModelRZ = 0.0,
								SOPModelSX = 0.0,
								SOPModelSY = 0.0,
								SOPModelSZ = 0.0,
								IsCommon = 0,
								Creator = myUser.UserId,
								CreatedTime = DateTime.UtcNow,  // 確保有設置時間
							};
                            //_context.SOP2Model.Add(sopModel);
                            //await _context.SaveChangesAsync();
                            //sopModelList.Add(sopModel.SOPModelId);

                            try
                            {
                                Console.WriteLine("Attempting to save SOP2Model");
                                var savedModel = await SaveSOP2ModelAsync(sopModel);
                                sopModelList.Add(savedModel.SOPModelId);
                                Console.WriteLine($"SOP2Model saved successfully, ID: {savedModel.SOPModelId}");
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Error saving SOP2Model: {ex.Message}");
                                // 考慮是否要中斷整個流程，或者繼續處理其他數據
                            }
                        }

					}

					Dictionary<string, object> addKnowledgeBase_Dict = new Dictionary<string, object>()
					{
						{ "@MachineAddId", post.MachineAddId},
						{ "@MachineName", post.MachineName},
						{ "@KnowledgeBaseDeviceType", addKnowledgeBase.KnowledgeBaseDeviceType },
						{ "@KnowledgeBaseDeviceParts", addKnowledgeBase.KnowledgeBaseDeviceParts },
						{ "@KnowledgeBaseRepairItems", addKnowledgeBase.KnowledgeBaseRepairItems },
						{ "@KnowledgeBaseRepairType", addKnowledgeBase.KnowledgeBaseRepairType },
						{ "@KnowledgeBaseFileNo", addKnowledgeBase.KnowledgeBaseFileNo },
						{ "@KnowledgeBaseSOPName", addKnowledgeBase.KnowledgeBaseSOPName },
						{ "@KnowledgeBaseAlarmCode", addKnowledgeBase.KnowledgeBaseAlarmCode },
						{ "@KnowledgeBaseSpec", addKnowledgeBase.KnowledgeBaseSpec },
						{ "@KnowledgeBaseSystem", addKnowledgeBase.KnowledgeBaseSystem },
						{ "@KnowledgeBaseProductName", addKnowledgeBase.KnowledgeBaseProductName },
						{ "@KnowledgeBaseAlarmCause", addKnowledgeBase.KnowledgeBaseAlarmCause },
						{ "@KnowledgeBaseAlarmDesc", addKnowledgeBase.KnowledgeBaseAlarmDesc },
						{ "@KnowledgeBaseAlarmOccasion", addKnowledgeBase.KnowledgeBaseAlarmOccasion },
						{ "@KnowledgeBaseModelImage", knowledgeBaseModelImagePaths.Count > 0 ? JsonConvert.SerializeObject(knowledgeBaseModelImagePaths.Select(p => p.Path)) : null },
						{ "@KnowledgeBaseModelImageNames", knowledgeBaseModelImagePaths.Count > 0 ? JsonConvert.SerializeObject(knowledgeBaseModelImagePaths.Select(p => p.Name)) : null },
						{ "@KnowledgeBaseToolsImage", knowledgeBaseToolsImagePaths.Count > 0 ? JsonConvert.SerializeObject(knowledgeBaseToolsImagePaths.Select(p => p.Path)) : null },
						{ "@KnowledgeBaseToolsImageNames", knowledgeBaseToolsImagePaths.Count > 0 ? JsonConvert.SerializeObject(knowledgeBaseToolsImagePaths.Select(p => p.Name)) : null },
						{ "@KnowledgeBasePositionImage", knowledgeBasePositionImagePaths.Count > 0 ? JsonConvert.SerializeObject(knowledgeBasePositionImagePaths.Select(p => p.Path)) : null },
						{ "@KnowledgeBasePositionImageNames", knowledgeBasePositionImagePaths.Count > 0 ? JsonConvert.SerializeObject(knowledgeBasePositionImagePaths.Select(p => p.Name)) : null },
						{ "@KnowledgeBase3DModelList", sopModelList.Count > 0 ? JsonConvert.SerializeObject(sopModelList):"[]" },
						{ "@Creator", myUser.UserId },
					};

					var knowledgeBaseId = await _baseRepository.AddOneByCustomTable(addKnowledgeBase_Dict, "KnowledgeBase", "KnowledgeBaseId");
					apiResult.Result = knowledgeBaseId;
					var knowledgeBasePath = Path.Combine(knowledgeBaseRootPath, knowledgeBaseId.ToString());
					folderFunction.CreateFolder(knowledgeBasePath, 0);

					SaveFiles(addKnowledgeBase.KnowledgeBaseModelImageObj, folderFunction, knowledgeBasePath, knowledgeBaseModelImagePaths);
					SaveFiles(addKnowledgeBase.KnowledgeBaseToolsImageObj, folderFunction, knowledgeBasePath, knowledgeBaseToolsImagePaths);
					SaveFiles(addKnowledgeBase.KnowledgeBasePositionImageObj, folderFunction, knowledgeBasePath, knowledgeBasePositionImagePaths);
				}
				#endregion

				#region Process KnowledgeBase Delete
				step = "Process KnowledgeBase delete";
				var deleteKnowledgeBases = post.KnowledgeBases.Where(x => x.Deleted == 1).ToList();
				List<Dictionary<string, object>> deleteKnowledgeBase_Dicts = new List<Dictionary<string, object>>();
				foreach (var deleteKnowledgeBase in deleteKnowledgeBases)
				{
					Dictionary<string, object> deleteKnowledgeBase_Dict = new Dictionary<string, object>()
					{
						{ "KnowledgeBaseId", deleteKnowledgeBase.KnowledgeBaseId},
						{ "@Deleted", DeletedDataEnum.True},
						{ "@Updater", 1},
						{ "@UpdateTime", DateTime.Now}
					};

					deleteKnowledgeBase_Dicts.Add(deleteKnowledgeBase_Dict);
				}
				if (deleteKnowledgeBase_Dicts.Count > 0)
				{
					await _baseRepository.UpdateMutiByCustomTable(deleteKnowledgeBase_Dicts, "KnowledgeBase", "\"KnowledgeBaseId\" = @KnowledgeBaseId");
				}

				foreach (var deleteKnowledgeBase in deleteKnowledgeBases)
				{
					var tempKnowledgeBasePath = Path.Combine(knowledgeBaseRootPath, deleteKnowledgeBase.KnowledgeBaseId.ToString());
					DirectoryInfo directoryInfo = new DirectoryInfo(tempKnowledgeBasePath);
					if (directoryInfo.Exists)
					{
						directoryInfo.Delete(true);
					}
				}
				#endregion

				#region Process KnowledgeBase Update
				step = "Process KnowledgeBase update";
				var updateKnowledgeBases = post.KnowledgeBases.Where(x => x.KnowledgeBaseId != 0 && x.Deleted == 0).ToList();

				var knowledgeBaseWhere = $@"""Deleted"" = 0 AND ""KnowledgeBaseId"" = ANY (@KnowledgeBaseIds)";
				var tempKnowledgeBases = await _baseRepository.GetAllAsync<KnowledgeBase>("KnowledgeBase", knowledgeBaseWhere, new { KnowledgeBaseIds = updateKnowledgeBases.Select(x => x.KnowledgeBaseId).ToList() });
				foreach (var updateKnowledgeBase in updateKnowledgeBases)
				{
					var knowledgeBaseModelImagePaths = SaveImages(updateKnowledgeBase.KnowledgeBaseModelImageObj, updateKnowledgeBase.KnowledgeBaseModelImageNames, folderFunction, knowledgeBaseRootPath, apiResult, "KnowledgeBaseModelImageObj");
					var knowledgeBaseToolsImagePaths = SaveImages(updateKnowledgeBase.KnowledgeBaseToolsImageObj, updateKnowledgeBase.KnowledgeBaseToolsImageNames, folderFunction, knowledgeBaseRootPath, apiResult, "KnowledgeBaseToolsImageObj");
					var knowledgeBasePositionImagePaths = SaveImages(updateKnowledgeBase.KnowledgeBasePositionImageObj, updateKnowledgeBase.KnowledgeBasePositionImageNames, folderFunction, knowledgeBaseRootPath, apiResult, "KnowledgeBasePositionImageObj");
					

					Dictionary<string, object> updateKnowledgeBase_Dict = new Dictionary<string, object>()
					{
						{ "@KnowledgeBaseId", updateKnowledgeBase.KnowledgeBaseId},
						{ "@KnowledgeBaseDeviceType", updateKnowledgeBase.KnowledgeBaseDeviceType },
						{ "@KnowledgeBaseDeviceParts", updateKnowledgeBase.KnowledgeBaseDeviceParts },
						{ "@KnowledgeBaseRepairItems", updateKnowledgeBase.KnowledgeBaseRepairItems },
						{ "@KnowledgeBaseRepairType", updateKnowledgeBase.KnowledgeBaseRepairType },
						{ "@KnowledgeBaseFileNo", updateKnowledgeBase.KnowledgeBaseFileNo },
						{ "@KnowledgeBaseSOPName", updateKnowledgeBase.KnowledgeBaseSOPName },
						{ "@KnowledgeBaseAlarmCode", updateKnowledgeBase.KnowledgeBaseAlarmCode },
						{ "@KnowledgeBaseSpec", updateKnowledgeBase.KnowledgeBaseSpec },
						{ "@KnowledgeBaseSystem", updateKnowledgeBase.KnowledgeBaseSystem },
						{ "@KnowledgeBaseProductName", updateKnowledgeBase.KnowledgeBaseProductName },
						{ "@KnowledgeBaseAlarmCause", updateKnowledgeBase.KnowledgeBaseAlarmCause },
						{ "@KnowledgeBaseAlarmDesc", updateKnowledgeBase.KnowledgeBaseAlarmDesc },
						{ "@KnowledgeBaseAlarmOccasion", updateKnowledgeBase.KnowledgeBaseAlarmOccasion },
						{ "@Updater", 1},
						{ "@UpdateTime", DateTime.Now}
					};

					if (knowledgeBaseModelImagePaths.Any())
					{
						updateKnowledgeBase_Dict["@KnowledgeBaseModelImage"] = JsonConvert.SerializeObject(knowledgeBaseModelImagePaths.Select(p => p.Path));
						updateKnowledgeBase_Dict["@KnowledgeBaseModelImageNames"] = JsonConvert.SerializeObject(knowledgeBaseModelImagePaths.Select(p => p.Name));
					}
					else if (updateKnowledgeBase.IsDeletedKnowledgeBaseModelImage)
					{
						updateKnowledgeBase_Dict["@KnowledgeBaseModelImage"] = null;
						updateKnowledgeBase_Dict["@KnowledgeBaseModelImageNames"] = null;
					}

					if (knowledgeBaseToolsImagePaths.Any())
					{
						updateKnowledgeBase_Dict["@KnowledgeBaseToolsImage"] = JsonConvert.SerializeObject(knowledgeBaseToolsImagePaths.Select(p => p.Path));
						updateKnowledgeBase_Dict["@KnowledgeBaseToolsImageNames"] = JsonConvert.SerializeObject(knowledgeBaseToolsImagePaths.Select(p => p.Name));
					}
					else if (updateKnowledgeBase.IsDeletedKnowledgeBaseToolsImage)
					{
						updateKnowledgeBase_Dict["@KnowledgeBaseToolsImage"] = null;
						updateKnowledgeBase_Dict["@KnowledgeBaseToolsImageNames"] = null;
					}

					if (knowledgeBasePositionImagePaths.Any())
					{
						updateKnowledgeBase_Dict["@KnowledgeBasePositionImage"] = JsonConvert.SerializeObject(knowledgeBasePositionImagePaths.Select(p => p.Path));
						updateKnowledgeBase_Dict["@KnowledgeBasePositionImageNames"] = JsonConvert.SerializeObject(knowledgeBasePositionImagePaths.Select(p => p.Name));
					}
					else if (updateKnowledgeBase.IsDeletedKnowledgeBasePositionImage)
					{
						updateKnowledgeBase_Dict["@KnowledgeBasePositionImage"] = null;
						updateKnowledgeBase_Dict["@KnowledgeBasePositionImageNames"] = null;
					}

					await _baseRepository.UpdateOneByCustomTable(updateKnowledgeBase_Dict, "KnowledgeBase", "\"KnowledgeBaseId\" = @KnowledgeBaseId");

					var tempSelectKnowledgeBase = tempKnowledgeBases.FirstOrDefault(x => x.KnowledgeBaseId == updateKnowledgeBase.KnowledgeBaseId);

					if (updateKnowledgeBase.IsDeletedKnowledgeBaseModelImage && tempSelectKnowledgeBase != null && tempSelectKnowledgeBase.KnowledgeBaseModelImage != null)
					{
						var modelImages = ParseJsonList(tempSelectKnowledgeBase.KnowledgeBaseModelImage);
						foreach (var modelImage in modelImages)
						{
							folderFunction.DeleteFile(Path.Combine(knowledgeBaseRootPath, tempSelectKnowledgeBase.KnowledgeBaseId.ToString(), modelImage));
						}
					}

					if (updateKnowledgeBase.IsDeletedKnowledgeBaseToolsImage && tempSelectKnowledgeBase != null && tempSelectKnowledgeBase.KnowledgeBaseToolsImage != null)
					{
						var toolsImages = ParseJsonList(tempSelectKnowledgeBase.KnowledgeBaseToolsImage);
						foreach (var toolsImage in toolsImages)
						{
							folderFunction.DeleteFile(Path.Combine(knowledgeBaseRootPath, tempSelectKnowledgeBase.KnowledgeBaseId.ToString(), toolsImage));
						}
					}

					if (updateKnowledgeBase.IsDeletedKnowledgeBasePositionImage && tempSelectKnowledgeBase != null && tempSelectKnowledgeBase.KnowledgeBasePositionImage != null)
					{
						var positionImages = ParseJsonList(tempSelectKnowledgeBase.KnowledgeBasePositionImage);
						foreach (var positionImage in positionImages)
						{
							folderFunction.DeleteFile(Path.Combine(knowledgeBaseRootPath, tempSelectKnowledgeBase.KnowledgeBaseId.ToString(), positionImage));
						}
					}

					
					SaveFiles(updateKnowledgeBase.KnowledgeBaseModelImageObj, folderFunction, Path.Combine(knowledgeBaseRootPath, updateKnowledgeBase.KnowledgeBaseId.ToString()), knowledgeBaseModelImagePaths);
					SaveFiles(updateKnowledgeBase.KnowledgeBaseToolsImageObj, folderFunction, Path.Combine(knowledgeBaseRootPath, updateKnowledgeBase.KnowledgeBaseId.ToString()), knowledgeBaseToolsImagePaths);
					SaveFiles(updateKnowledgeBase.KnowledgeBasePositionImageObj, folderFunction, Path.Combine(knowledgeBaseRootPath, updateKnowledgeBase.KnowledgeBaseId.ToString()), knowledgeBasePositionImagePaths);
				}
				#endregion

				apiResult.Code = "0000";
				apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
			}
			catch (Exception ex)
			{
				apiResult.Code = "9999";
				apiResult.Message = $"錯誤 - {ex.Message} | 堆栈跟踪: {ex.StackTrace}";
			}

			return Ok(apiResult);
		}


        // 修改 SaveSOP2ModelAsync 方法以添加更多日誌
        private async Task<SOP2Model> SaveSOP2ModelAsync(SOP2Model model)
        {
            try
            {
                Console.WriteLine($"Setting schema to: {_context.GetSchemaFromContext()}");
                _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");
                _context.SOP2Model.Add(model);
                Console.WriteLine("Attempting to save changes to database");
                await _context.SaveChangesAsync();
                Console.WriteLine("Changes saved successfully");
                return model;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SaveSOP2ModelAsync: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                throw;
            }
        }

        [HttpPut]
		public async Task<ActionResult<ApiResult<int>>> AddModelToKnowledgeBase3DModelList(int knowledgeBaseId, [FromBody] AddModelRequest request)
		{
			ApiResult<int> apiResult = new ApiResult<int>();
			try
			{
				var knowledgeBase = await _context.KnowledgeBase.FindAsync(knowledgeBaseId);
				if (knowledgeBase == null)
				{
					apiResult.Code = "404";
					apiResult.Message = "KnowledgeBase not found.";
					return NotFound(apiResult);
				}

				var machineAddWhere = $@"""MachineAddId"" = @MachineAddId";
				var machineAdd = await _baseRepository.GetOneAsync<MachineAdd>("MachineAdd", machineAddWhere, new { MachineAddId = request.MachineAddId });

				if (machineAdd == null || machineAdd.Deleted == (byte)DeletedDataEnum.True)
				{
					apiResult.Code = "4004";
					apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
					return Ok(apiResult);
				}

				FolderFunction folderFunction = new FolderFunction();
				var knowledgeBaseRootPath = Path.Combine(_savePath, "machineAdd", machineAdd.MachineAddId.ToString(), "knowledgeBase");

				var modelList = JsonConvert.DeserializeObject<List<int>>(knowledgeBase.KnowledgeBase3DModelList) ?? new List<int>();

                _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");
                var sopModel = new SOP2Model
				{
					SOPId = knowledgeBaseId,
					SOPModelImage = JsonConvert.SerializeObject(SaveSOPFiles(new List<IFormFile> { request.KnowledgeBase3DModelImageObj }, folderFunction, knowledgeBaseRootPath)),
					SOPModelFile = JsonConvert.SerializeObject(SaveSOPFiles(new List<IFormFile> { request.KnowledgeBase3DModelFileObj }, folderFunction, knowledgeBaseRootPath)),
					SOPModelPX = request.SOPModelPX,
					SOPModelPY = request.SOPModelPY,
					SOPModelPZ = request.SOPModelPZ,
					SOPModelRX = request.SOPModelRX,
					SOPModelRY = request.SOPModelRY,
					SOPModelRZ = request.SOPModelRZ,
					SOPModelSX = request.SOPModelSX,
					SOPModelSY = request.SOPModelSY,
					SOPModelSZ = request.SOPModelSZ,
					IsCommon = 0,
					Creator = request.Creator,
					CreatedTime = DateTime.UtcNow,
					Updater = request.Creator,
					UpdateTime = DateTime.UtcNow
				};

				_context.SOP2Model.Add(sopModel);
				await _context.SaveChangesAsync();

				modelList.Add(sopModel.SOPModelId);
				knowledgeBase.KnowledgeBase3DModelList = JsonConvert.SerializeObject(modelList);

				_context.Entry(knowledgeBase).State = EntityState.Modified;
				await _context.SaveChangesAsync();

				apiResult.Code = "0000";
				apiResult.Message = "Success";
				apiResult.Result = knowledgeBaseId;
			}
			catch (Exception ex)
			{
				apiResult.Code = "9999";
				apiResult.Message = $"錯誤 - {ex.Message} | 堆栈跟踪: {ex.StackTrace}";
			}

			return Ok(apiResult);
		}

		[HttpPut]
		public async Task<ActionResult<ApiResult<int>>> RemoveModelFromKnowledgeBase3DModelList(int knowledgeBaseId, [FromBody] RemoveModelRequest request)
		{
			ApiResult<int> apiResult = new ApiResult<int>();
			try
			{
				var knowledgeBase = await _context.KnowledgeBase.FindAsync(knowledgeBaseId);
				if (knowledgeBase == null)
				{
					apiResult.Code = "404";
					apiResult.Message = "KnowledgeBase not found.";
					return NotFound(apiResult);
				}

				var modelList = JsonConvert.DeserializeObject<List<int>>(knowledgeBase.KnowledgeBase3DModelList) ?? new List<int>();

                _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");
                var sopModel = await _context.SOP2Model.FindAsync(request.SOPModelId);
				if (sopModel == null)
				{
					apiResult.Code = "404";
					apiResult.Message = "SOPModel not found.";
					return NotFound(apiResult);
				}

				modelList.Remove(sopModel.SOPModelId);
				knowledgeBase.KnowledgeBase3DModelList = JsonConvert.SerializeObject(modelList);

				_context.Entry(knowledgeBase).State = EntityState.Modified;
				_context.SOP2Model.Remove(sopModel);
				await _context.SaveChangesAsync();

				apiResult.Code = "0000";
				apiResult.Message = "Success";
				apiResult.Result = knowledgeBaseId;
			}
			catch (Exception ex)
			{
				apiResult.Code = "9999";
				apiResult.Message = $"錯誤 - {ex.Message} | 堆栈跟踪: {ex.StackTrace}";
			}

			return Ok(apiResult);
		}

		[HttpPut]
		public async Task<ActionResult<ApiResult<int>>> UpdateKnowledgeBase3DModelList(int knowledgeBaseId, [FromBody] UpdateModelListRequest request)
		{
			ApiResult<int> apiResult = new ApiResult<int>();
			try
			{
				var knowledgeBase = await _context.KnowledgeBase.FindAsync(knowledgeBaseId);
				if (knowledgeBase == null)
				{
					apiResult.Code = "404";
					apiResult.Message = "KnowledgeBase not found.";
					return NotFound(apiResult);
				}

				var modelList = JsonConvert.DeserializeObject<List<int>>(knowledgeBase.KnowledgeBase3DModelList);
				if (modelList == null)
				{
					modelList = new List<int>();
				}

                _context.Database.ExecuteSqlRaw($"SET search_path TO '{_context.GetSchemaFromContext()}'");
                var sopModel = await _context.SOP2Model.FindAsync(request.SOPModelId);
				if (sopModel == null)
				{
					apiResult.Code = "404";
					apiResult.Message = "SOPModel not found.";
					return NotFound(apiResult);
				}

				sopModel.SOPModelPZ = request.SOPModelPZ;
				sopModel.Updater = request.Updater;
				sopModel.UpdateTime = DateTime.UtcNow;

				_context.Entry(sopModel).State = EntityState.Modified;
				await _context.SaveChangesAsync();

				apiResult.Code = "0000";
				apiResult.Message = "Success";
				apiResult.Result = knowledgeBaseId;
			}
			catch (Exception ex)
			{
				apiResult.Code = "9999";
				apiResult.Message = $"錯誤 - {ex.Message} | 堆栈跟踪: {ex.StackTrace}";
			}

			return Ok(apiResult);
		}
		
		private List<(string Path, string Name)> SaveImages(List<IFormFile>? imageFiles, List<string>? imageNames, FolderFunction folderFunction, string rootPath, ApiResult<int> apiResult, string imageType)
		{
			var imagePaths = new List<(string Path, string Name)>();
			if (imageFiles != null && imageNames != null && imageFiles.Count == imageNames.Count)
			{
				for (int i = 0; i < imageFiles.Count; i++)
				{
					var imageFile = imageFiles[i];
					var imageName = imageNames[i];
					var imagePath = folderFunction.FileProduceName(imageFile);
					imagePaths.Add((imagePath, imageName));
					AddLog(apiResult, $"{imageType}: {imageFile.FileName} 保存到 {rootPath}/{imagePath}，名稱為 {imageName}");
				}
			}
			else if (imageFiles != null && imageNames == null) {
				for (int i = 0; i < imageFiles.Count; i++)
				{
					var imageFile = imageFiles[i];
					var imagePath = folderFunction.FileProduceName(imageFile);
					imagePaths.Add((imagePath, ""));
					AddLog(apiResult, $"{imageType}: {imageFile.FileName} 保存到 {rootPath}/{imagePath}");
				}
			}
			return imagePaths;
		}

		private void SaveFiles(List<IFormFile>? imageFiles, FolderFunction folderFunction, string savePath, List<(string Path, string Name)> imagePaths)
		{
			if (imageFiles != null)
			{
				for (int i = 0; i < imageFiles.Count && i < imagePaths.Count; i++)
				{
					folderFunction.SavePathFile(imageFiles[i], savePath, imagePaths[i].Path);
				}
			}
		}

		private List<string> SaveSOPFiles(List<IFormFile>? files, FolderFunction folderFunction, string rootPath)
		{
			var filePaths = new List<string>();

			if (files != null)
			{
				foreach (var file in files)
				{
					var filePath = folderFunction.FileProduceName(file);
					var fullPath = Path.Combine(rootPath, filePath);
					using (var stream = new FileStream(fullPath, FileMode.Create))
					{
						file.CopyTo(stream);
					}
					filePaths.Add(filePath); // 添加文件路徑到列表
				}
			}

			return filePaths;
		}

		private void ValidateImageExtensions(ApiResult<int> apiResult, List<IFormFile>? imageFiles, List<string> validImageEx, string imageType)
		{
			if (imageFiles != null)
			{
				foreach (var imageFile in imageFiles)
				{
					var validImageSplit = imageFile.FileName.Split(".");
					var tempImageNameEx = validImageSplit.Last().ToLower();

					if (!validImageEx.Contains(tempImageNameEx))
					{
						apiResult.Code = "2004";
						apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
						AddLog(apiResult, $"{imageType}: {imageFile.FileName} 不合法的副檔名");
						throw new Exception(apiResult.Message);
					}
				}
			}
		}

		private void AddLog(ApiResult<int> apiResult, string message)
		{
			if (apiResult.Results == null)
			{
				apiResult.Results = new List<string>();
			}
			apiResult.Results.Add(message);
		}


		[HttpGet]
		public async Task<ActionResult<ApiResult<MindMapResponse>>> GetMachineAddMindMap(int machineAddId)
		{
		    ApiResult<MindMapResponse> apiResult = new ApiResult<MindMapResponse>();

		    try
		    {
		        var knowledgeBases = await _baseRepository.GetAllAsync<KnowledgeBase>(
		            "KnowledgeBase",
		            $@"""MachineAddId"" = @MachineAddId AND ""Deleted"" = 0",
		            new { MachineAddId = machineAddId });

		        if (knowledgeBases == null || !knowledgeBases.Any())
		        {
		            apiResult.Code = "404";
		            apiResult.Message = "No KnowledgeBase data found for the given MachineAddId.";
		            return NotFound(apiResult);
		        }

		        var knowledgeBaseIds = knowledgeBases.Select(kb => kb.KnowledgeBaseId).ToList();
		        var sop2List = await _baseRepository.GetAllAsync<SOP2>(
		            "SOP2",
		            $@"""KnowledgeBaseId"" = ANY(@KnowledgeBaseIds) AND ""Deleted"" = 0",
		            new { KnowledgeBaseIds = knowledgeBaseIds });

		        var mindMapData = new MindMapResponse
		        {
		            MachineAddId = machineAddId,
		            KnowledgeBases = knowledgeBases
		                .GroupBy(kb => kb.KnowledgeBaseDeviceParts)
		                .Select(g => new KnowledgeBaseDevicePartsGroup
		                {
		                    DeviceParts = g.Key,
		                    RepairTypes = g.GroupBy(kb => kb.KnowledgeBaseRepairType)
		                                .Select(rt => new RepairTypeGroup
		                                {
		                                    RepairType = rt.Key,
		                                    KnowledgeBases = rt.Select(kb => new KnowledgeBaseDto
		                                    {
		                                        KnowledgeBaseId = kb.KnowledgeBaseId,
                                                RepairItems = kb.KnowledgeBaseRepairItems,
                                                AlarmCode = kb.KnowledgeBaseAlarmCode,
                                                DeviceType = kb.KnowledgeBaseDeviceType,
		                                        FileNo = kb.KnowledgeBaseFileNo,
												MachineName = kb.MachineName,
												SOPName = kb.KnowledgeBaseSOPName,
		                                        Spec = kb.KnowledgeBaseSpec,
		                                        System = kb.KnowledgeBaseSystem,
		                                        ProductName = kb.KnowledgeBaseProductName,
		                                        AlarmCause = kb.KnowledgeBaseAlarmCause,
		                                        AlarmDesc = kb.KnowledgeBaseAlarmDesc,
		                                        AlarmOccasion = kb.KnowledgeBaseAlarmOccasion,
		                                        ModelImage = ParseJsonList(kb.KnowledgeBaseModelImage),
		                                        ToolsImage = ParseJsonList(kb.KnowledgeBaseToolsImage),
		                                        PositionImage = ParseJsonList(kb.KnowledgeBasePositionImage),
												T3DModelImage = ParseJsonList(kb.KnowledgeBase3DModelImage),
												T3DModelFile = ParseJsonList(kb.KnowledgeBase3DModelFile),
		                                        SOP2s = sop2List.Where(sop => sop.KnowledgeBaseId == kb.KnowledgeBaseId)
		                                                        .Select(sop => new SOP2Dto
		                                                        {
		                                                            SOP2Id = sop.SOP2Id,
		                                                            Step = sop.SOP2Step,
		                                                            Message = sop.SOP2Message,
		                                                            Image = sop.SOP2Image,
		                                                            Remark = sop.SOP2Remark,
		                                                            RemarkImage = sop.SOP2RemarkImage,
		                                                            Name = sop.SOP2Name,
		                                                            Video = sop.SOPVideo
		                                                        }).ToList()
		                                    }).ToList()
		                                }).ToList()
		                }).ToList()
		        };

		        apiResult.Code = "0000";
		        apiResult.Message = "Success";
		        apiResult.Result = mindMapData;
		    }
		    catch (Exception ex)
		    {
		        apiResult.Code = "9999";
		        apiResult.Message = $"錯誤 - {ex.Message} | 堆栈跟踪: {ex.StackTrace}";
		    }

		    return Ok(apiResult);
		}

		private List<string> ParseJsonList(string jsonString)
		{
			if (string.IsNullOrEmpty(jsonString))
			{
				return new List<string>();
			}

			try
			{
				return JsonConvert.DeserializeObject<List<string>>(jsonString) ?? new List<string>();
			}
			catch
			{
				return new List<string>();
			}
		}

		private string ConvertImagePath(string baseURL, string machineAddId, string knowledgeBaseId, string image)
		{
			return $"{baseURL}upload/machineAdd/{machineAddId}/knowledgeBase/{knowledgeBaseId}/{image}";
		}

		private List<string> ConvertImagePaths(string baseURL, string machineAddId, string knowledgeBaseId, string imagesJson)
		{
			if (string.IsNullOrEmpty(imagesJson)) return new List<string>();
			var images = JsonConvert.DeserializeObject<List<string>>(imagesJson) ?? new List<string>();
			return images.Select(image => ConvertImagePath(baseURL, machineAddId, knowledgeBaseId, image)).ToList();
		}
     }
}
