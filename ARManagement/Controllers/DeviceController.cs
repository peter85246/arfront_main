using ARManagement.BaseRepository.Interface;
using ARManagement.Data;
using ARManagement.Helpers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;

using System.Diagnostics;

namespace ARManagement.Controllers
{
    public class DeviceController : MyBaseApiController
    {
        private readonly IBaseRepository _baseRepository;
        private readonly ResponseCodeHelper _responseCodeHelper;
        private readonly ARManagementContext _context;

        public DeviceController(ARManagementContext context, IBaseRepository baseRepository, ResponseCodeHelper responseCodeHelper)
        {
            _context = context;
            _baseRepository = baseRepository;
            _responseCodeHelper = responseCodeHelper;
        }

        //// GET: api/Devices
        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<Device>>> GetDevices()
        //{
        //    return await _context.Devices.ToListAsync();
        //}

        //// GET: api/Devices/5
        //[HttpGet("{id}")]
        //public async Task<ActionResult<Device>> GetDevice(int id)
        //{
        //    var device = await _context.Devices.FindAsync(id);

        //    if (device == null)
        //    {
        //        return NotFound();
        //    }

        //    return device;
        //}

        //// POST: api/Devices
        //[HttpPost]
        //public async Task<ActionResult<Device>> PostDevice(Device device)
        //{
        //    _context.Devices.Add(device);
        //    await _context.SaveChangesAsync();

        //    return CreatedAtAction(nameof(GetDevice), new { id = device.MachineDeviceId }, device);
        //}

        //// PUT: api/Devices/5
        //[HttpPut("{id}")]
        //public async Task<IActionResult> PutDevice(int id, Device device)
        //{
        //    if (id != device.MachineDeviceId)
        //    {
        //        return BadRequest();
        //    }

        //    _context.Entry(device).State = EntityState.Modified;

        //    try
        //    {
        //        await _context.SaveChangesAsync();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!DeviceExists(id))
        //        {
        //            return NotFound();
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return NoContent();
        //}

        //// DELETE: api/Device/5
        //[HttpDelete("{id}")]
        //public async Task<IActionResult> DeleteDevice(int id)
        //{
        //    var device = await _context.Devices.FindAsync(id);
        //    if (device == null)
        //    {
        //        return NotFound();
        //    }

        //    _context.Devices.Remove(device);
        //    await _context.SaveChangesAsync();

        //    return NoContent();
        //}

        //private bool DeviceExists(int id)
        //{
        //    return _context.Devices.Any(e => e.MachineDeviceId == id);
        //}

        /// <summary>
        /// 18. 取得單一一筆機台設備
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<ApiResult<Device>>> GetOneMachineDevice(DevicePrimary post)
        {
            ApiResult<Device> apiResult = new ApiResult<Device>();

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

                #region 設備是否存在
                var where = $@"""MachineDeviceId"" = @MachineDeviceId";
                var machineDevice = await _baseRepository.GetOneAsync<Device>("MachineDevice", where, new { MachineDeviceId = post.MachineDeviceId });

                if (machineDevice == null)
                {
                    apiResult.Code = "4001"; //資料庫或是實體檔案不存在
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }

                if (machineDevice.Deleted == (byte)DeletedDataEnum.True)
                {
                    apiResult.Code = "4002"; //此資料已被刪除
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }
                #endregion

                #region 機台是否存在
                where = $@"""MachineId"" = @MachineId";
                Machine machineinfo = await _baseRepository.GetOneAsync<Machine>("Machine", where, new { MachineId = machineDevice.MachineId });

                if (machineinfo == null)
                {
                    apiResult.Code = "4004"; //該機台不存在資料庫或是資料已被刪除
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }

                if (machineinfo.Deleted == (byte)DeletedDataEnum.True)
                {
                    apiResult.Code = "4004"; //該機台不存在資料庫或是資料已被刪除
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }
                #endregion

                machineDevice.MachineCode = machineinfo.MachineCode;

                apiResult.Code = "0000";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                apiResult.Result = machineDevice;
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
        /// 19. 修改機台設備
        /// </summary>
        /// <param name="post"></param>
        /// <returns></returns>
        [HttpPut]
        public async Task<ActionResult<ApiResult<string>>> EditMachineDevice(Device post)
        {
            ApiResult<string> apiResult = new ApiResult<string>();
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

                #region 欄位驗證
                if (post.MachineDeviceId <= 0)
                {
                    apiResult.Code = "2004"; //不合法的欄位
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }

                if (string.IsNullOrEmpty(post.MachineDeviceControlerModel) ||
                    string.IsNullOrEmpty(post.MachineDeviceServerIP) ||
                    string.IsNullOrEmpty(post.MachineDeviceMachineIP))
                {
                    apiResult.Code = "2003"; //有必填欄位尚未填寫
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }

                if(post.MachineDeviceControlerModel.Length > 100 ||
                    post.MachineDeviceServerIP.Length > 20 ||
                    post.MachineDeviceMachineIP.Length > 20)
                {
                    apiResult.Code = "2005"; //輸入文字字數不符合長度規範
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }

                #endregion

                #region 設備是否存在
                var where = $@"""MachineDeviceId"" = @MachineDeviceId";
                var machineDevice = await _baseRepository.GetOneAsync<Device>("MachineDevice", where, new { MachineDeviceId = post.MachineDeviceId });

                if (machineDevice == null)
                {
                    apiResult.Code = "4001"; //資料庫或是實體檔案不存在
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }

                if (machineDevice.Deleted == (byte)DeletedDataEnum.True)
                {
                    apiResult.Code = "4002"; //此資料已被刪除
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }
                #endregion

                #region 機台是否存在
                where = $@"""MachineId"" = @MachineId";
                Machine machineinfo = await _baseRepository.GetOneAsync<Machine>("Machine", where, new { MachineId = machineDevice.MachineId });

                if (machineinfo == null)
                {
                    apiResult.Code = "4004"; //該機台不存在資料庫或是資料已被刪除
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }

                if (machineinfo.Deleted == (byte)DeletedDataEnum.True)
                {
                    apiResult.Code = "4004"; //該機台不存在資料庫或是資料已被刪除
                    apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
                    return Ok(apiResult);
                }
                #endregion

                Dictionary<string, object> updateManchineDevice_Dict = new Dictionary<string, object>()
                {
                    { "MachineDeviceId", post.MachineDeviceId},
                    { "@MachineDeviceControlerModel", post.MachineDeviceControlerModel},
                    { "@MachineDeviceServerIP", post.MachineDeviceServerIP},
                    { "@MachineDeviceServerPort", post.MachineDeviceServerPort},
                    { "@MachineDeviceMachineIP", post.MachineDeviceMachineIP},
                    { "@Updater", myUser.UserId},
                    { "@UpdateTime", DateTime.Now}
                };

                await _baseRepository.UpdateOneByCustomTable(updateManchineDevice_Dict, "MachineDevice", "\"MachineDeviceId\" = @MachineDeviceId");

                apiResult.Code = "0000";
                apiResult.Message = _responseCodeHelper.GetResponseCodeString(apiResult.Code);
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
    }
}
