using Microsoft.AspNetCore.Mvc;

namespace ARManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PingController : ControllerBase
    {
        // GET: api/ping
        [HttpGet]
        public IActionResult Ping()
        {
            return Ok("pong");  // 返回响应 "pong" 来确认服务器正常运行
        }
    }
}
