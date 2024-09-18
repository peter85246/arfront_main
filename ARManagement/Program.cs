using ARManagement.BaseRepository.Implement;
using ARManagement.BaseRepository.Interface;
using ARManagement.Data;
using ARManagement.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

#region DBHelper
builder.Services.Configure<PostgreSqlDBConfig>(builder.Configuration.GetSection("DBConfig"));
builder.Services.AddTransient<IDatabaseHelper, DatabaseHelper>();

//builder.Services.AddDbContext<ARManagementContext>(options =>
//        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
//builder.Services.AddDbContext<ARManagementContext>(options =>
//    options.UseNpgsql(builder.Configuration["DBConfig:ConnectionString"]));

// 下面這個是最後一個使用的版本，還原以此優先
//builder.Services.AddDbContext<ARManagementContext>(options =>
//    options.UseNpgsql(builder.Configuration["DBConfig:ConnectionString"]), ServiceLifetime.Scoped);
builder.Services.AddDbContext<ARManagementContext>((serviceProvider, options) =>
{
    var httpContextAccessor = serviceProvider.GetRequiredService<IHttpContextAccessor>();
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
    var schema = httpContextAccessor.HttpContext?.Items["SchemaName"] as string ?? "public";
    var connectionString = configuration["DBConfig:ConnectionString"] + $"SearchPath={schema};";
    options.UseNpgsql(connectionString);
}, ServiceLifetime.Scoped);


#endregion DBHelperss

#region Repository 注入
builder.Services.AddTransient<IBaseRepository, BaseRepository>();
#endregion

#region Localizer�h��y��
builder.Services.AddSingleton<ResponseCodeHelper>();
#endregion

#region CORS
// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("corsapp",
        builder =>
        {
            builder.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
            //  builder.WithOrigins("http://localhost", "http://localhost:3000", "http://140.112.43.30:10001")  // 添加多個允許的來源
        });
});
#endregion

#region JWT
builder.Services.AddSingleton<JwtHelper>();
#endregion

#region SMTP Settings
// Add SMTP settings to the service container
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SMTP"));
#endregion

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IBaseRepository, BaseRepository>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();
//app cors
app.UseCors("corsapp");

// Register Schema Middleware
app.UseMiddleware<SchemaMiddleware>();

app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*"); // 允許所有來源跨域
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type, Authorization");
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    }
});

app.UseAuthorization();

app.MapControllers();

app.Run();
