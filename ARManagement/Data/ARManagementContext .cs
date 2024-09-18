using Microsoft.EntityFrameworkCore;
using Models;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace ARManagement.Data
{    public class ARManagementContext : DbContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration; // 加入 IConfiguration 依賴
        private string _currentSchema;

        public ARManagementContext(DbContextOptions<ARManagementContext> options, IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
            : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration; // 初始化配置
        }

        public DbSet<KnowledgeBase> KnowledgeBase { get; set; }
        public DbSet<Machine> Machine { get; set; }
        public DbSet<MachineAdd> MachineAdd { get; set; }
        public DbSet<SOP2Model> SOP2Model { get; set; }
        //public DbSet<Device> Devices { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                var schema = GetSchemaFromContext();
                var connectionString = _configuration["DBConfig:ConnectionString"] + $"SearchPath={schema};";
                optionsBuilder.UseNpgsql(connectionString);
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            var schema = GetSchemaFromContext();
            modelBuilder.HasDefaultSchema(schema);

            modelBuilder.Entity<SOP2Model>().ToTable("SOPModel");
            modelBuilder.Entity<SOP2Model>().HasKey(s => s.SOPModelId);

            Console.WriteLine($"Using schema: {schema}");  // Optionally log the schema being used
        }

        public string GetSchemaFromContext()
        {
            var schema = _httpContextAccessor.HttpContext?.Items["SchemaName"] as string;
            return string.IsNullOrEmpty(schema) ? "public" : schema;
        }

        // You might want to add a method to set the schema for each database operation
        public void SetSchema()
        {
            var schema = GetSchemaFromContext();
            Database.ExecuteSqlRaw($"SET search_path TO {schema}");
            Console.WriteLine($"Schema set to: {schema} for this context.");
        }
    }
}
