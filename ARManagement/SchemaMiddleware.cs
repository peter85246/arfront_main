using Microsoft.AspNetCore.Http;
using System.Linq;
using System.Threading.Tasks;

public class SchemaMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public SchemaMiddleware(RequestDelegate next, IHttpContextAccessor httpContextAccessor)
    {
        _next = next;
        _httpContextAccessor = httpContextAccessor;
    }

    //public async Task InvokeAsync(HttpContext context)
    //{
    //    //var schemaName = context.Request.Headers["X-Schema-Name"].ToString();
    //    var schemaName = context.Request.Headers["X-Schema-Name"].FirstOrDefault();
    //    Console.WriteLine($"Received schema header: {schemaName}");  // 确认是否接收到 Header

    //    if (!string.IsNullOrEmpty(schemaName))
    //    {
    //        context.Items["SchemaName"] = schemaName;
    //        Console.WriteLine($"Schema set to: {schemaName}"); // 确认 schema 设置正确
    //    }
    //    else
    //    {
    //        Console.WriteLine("No schema found in header, using default schema 'public'.");
    //        context.Items["SchemaName"] = "public";  // 默认使用 public schema
    //    }

    //    await _next(context);
    //}
    public async Task InvokeAsync(HttpContext context)
    {
        var schemaName = context.Request.Headers["X-Schema-Name"].FirstOrDefault();
       Console.WriteLine($"Received schema header: {schemaName}");

        if (string.IsNullOrEmpty(schemaName))
        {
            schemaName = "public";
            Console.WriteLine("No schema found in header, using default schema 'public'.");
        }

        context.Items["SchemaName"] = schemaName;
        _httpContextAccessor.HttpContext.Items["SchemaName"] = schemaName;
        Console.WriteLine($"Schema set to: {schemaName}");

        await _next(context);
    }
}
