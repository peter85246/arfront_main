using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using ARManagement.BaseRepository.Interface;
using System.Data;
using System.Text;
using System.Data.SqlClient;
using Models;
using ARManagement.Helpers;
using Npgsql;
using Newtonsoft.Json;

namespace ARManagement.BaseRepository.Implement
{
    public class BaseRepository : IBaseRepository
    {
        protected readonly IDatabaseHelper _databaseHelper;
        //private string _currentSchema = "public";  // 預設 schema
        private readonly IHttpContextAccessor _httpContextAccessor;
        private string _currentSchema;
        protected string UseDB;
        protected IDbConnection con;
        public BaseRepository(IDatabaseHelper databaseHelper, IHttpContextAccessor httpContextAccessor)
        {
            _databaseHelper = databaseHelper;
            _httpContextAccessor = httpContextAccessor;
        }

        public void SetSchemaFromContext()
        {
            var schemaName = _httpContextAccessor.HttpContext?.Items["SchemaName"] as string;
            _currentSchema = string.IsNullOrEmpty(schemaName) ? "public" : schemaName;
            Console.WriteLine($"Current schema set to: {_currentSchema}");  // 日誌輸出當前 schema
            //if (!string.IsNullOrEmpty(schemaName))
            //{
            //    _currentSchema = schemaName;
            //    Console.WriteLine($"Schema set to: {_currentSchema}");
            //}
            //else
            //{
            //    _currentSchema = "public";
            //    Console.WriteLine("No schema name provided, using default schema.");
            //}
        }

        private string GetCurrentSchema()
        {
            var schema = _httpContextAccessor.HttpContext?.Items["SchemaName"] as string;
            return string.IsNullOrEmpty(schema) ? "public" : schema;
        }

        private void EnsureCorrectSchema()
        {
            var schema = GetCurrentSchema();
            using (var connection = GetDbConnection() as NpgsqlConnection)
            {
                connection.Open();
                using (var cmd = new NpgsqlCommand($"SET search_path TO {schema}", connection))
                {
                    cmd.ExecuteNonQuery();
                }
            }
            Console.WriteLine($"Schema set to: {schema} in EnsureCorrectSchema");
        }

        public IDbConnection GetDbConnection()
        {
            var schema = GetCurrentSchema();
            var connectionString = _databaseHelper.GetPostgreSqlConnectionString().Replace("{schema}", schema);
            Console.WriteLine($"Connection string with schema {schema}: {connectionString}");
            return new NpgsqlConnection(connectionString);
        }

        //public IDbConnection GetDbConnection()
        //{
        //    //IDbConnection conn;
        //    //conn = new NpgsqlConnection(this._databaseHelper.GetPostgreSqlConnectionString());
        //    //return conn;
        //    // 這裡假設連接字串包含一個可以動態替換的 schema 名稱
        //    SetSchemaFromContext();
        //    var connectionString = _databaseHelper.GetPostgreSqlConnectionString().Replace("{schema}", _currentSchema);
        //    Console.WriteLine($"Connection string with schema {_currentSchema}: {connectionString}");
        //    return new NpgsqlConnection(connectionString);
        //}

        public void SetSchema(string schemaName)
        {
            if (!string.IsNullOrEmpty(schemaName))
            {
                _currentSchema = schemaName;
                Console.WriteLine($"Successfully switched to schema: {_currentSchema}");
            }
            else
            {
                // 如果 schema 名稱是空的，保持當前 schema 不變
                Console.WriteLine("Failed to switch schema: Schema name is null or empty.");
            }
        }


        public string InsertGenerateString(List<string> properties, string table_name)
        {
            //var insertQuery = new StringBuilder($"INSERT INTO public.\"{table_name}\" ");
            var insertQuery = new StringBuilder($"INSERT INTO \"{_currentSchema}\".\"{table_name}\" ");

            insertQuery.Append("(");

            properties.ForEach(prop => { insertQuery.Append($"\"{prop.Replace("@", "")}\","); });

            insertQuery
                .Remove(insertQuery.Length - 1, 1)
                .Append(") VALUES (");

            properties.ForEach(prop => { insertQuery.Append($"{prop},"); });

            insertQuery
                .Remove(insertQuery.Length - 1, 1)
                .Append(");");

            return insertQuery.ToString();
        }
        public string UpdateGenerateString(List<string> properties, string table_name, string sWhere)
        {
            //var updateQuery = new StringBuilder($"UPDATE public.\"{table_name}\" SET ");
            var updateQuery = new StringBuilder($"UPDATE \"{_currentSchema}\".\"{table_name}\" SET ");

            properties.ForEach(property =>
            {
                if (property.Contains("@"))
                {
                    updateQuery.Append($"\"{property.Replace("@", "")}\"={property},");
                }
            });

            updateQuery.Remove(updateQuery.Length - 1, 1); //remove last comma
            updateQuery.Append($" WHERE {sWhere}");

            return updateQuery.ToString();
        }

        #region GetAll

        /// <summary>
        /// 取得所有資料(根據條件以及排序)
        /// </summary>
        /// <typeparam name="A"></typeparam>
        /// <param name="tableName"></param>
        /// <param name="sWhere"></param>
        /// <param name="param">Ex: new { status = 1}</param>
        /// <returns></returns>
        public virtual async Task<List<A>> GetAllAsync<A>(string tableName, string sWhere, object param = null, string sOrderBy = "")
        {
            EnsureCorrectSchema();
            SetSchemaFromContext();  // 确保 schema 被设置
            List<A> result;
            using (IDbConnection conn = GetDbConnection())
            {
                try
                {
                    //var sql = $"SELECT * FROM public.\"{tableName}\"";
                    var sql = $"SELECT * FROM \"{_currentSchema}\".\"{tableName}\"";
                    if (!string.IsNullOrEmpty(sWhere))
                    {
                        sql += $" WHERE {sWhere}";
                    }

                    if (!string.IsNullOrEmpty(sOrderBy))
                    {
                        sql += $" ORDER BY {sOrderBy}";
                    }

                    result = (await conn.QueryAsync<A>(sql, param)).ToList();
                }
                catch (Exception exception)
                {
                    throw exception;
                }
                return result;
            }
        }

        /// <summary>
        /// 根據SQL語句抓取整包資料
        /// </summary>
        /// <typeparam name="A"></typeparam>
        /// <param name="sqlString"></param>
        /// <returns></returns>
        public virtual async Task<List<A>> GetAllAsync<A>(string sqlString, object param = null)
        {
            EnsureCorrectSchema();
            SetSchemaFromContext();
            List<A> result;
            using (IDbConnection conn = GetDbConnection())
            {
                try
                {
                    var sql = sqlString;

                    result = (await conn.QueryAsync<A>(sql, param)).ToList();
                }
                catch (Exception exception)
                {
                    throw exception;
                }
                return result;
            }
        }

        /// <summary>
        /// 取得多筆資料的某個欄位變成列表
        /// </summary>
        /// <param name="guid">流水號</param>
        /// <param name="table_name">資料表名稱</param>
        /// <param name="idName">指定欄位名稱的流水號</param>
        /// <param name="selCol">選擇陣列資料庫欄位名稱</param>
        /// <returns></returns>
        public virtual async Task<List<object>> GetAllWithCustomDBNameAndTableAsync(int id, string table_name, string idName, string selCol)
        {
            EnsureCorrectSchema();
            List<object> result;
            using (IDbConnection conn = GetDbConnection())
            {
                try
                {
                    // 修正为使用 _currentSchema 而不是硬编码的 public
                    var sql = $"SELECT {selCol} FROM \"{_currentSchema}\".\"{table_name}\" WHERE {idName} = @Id";
                    //var sql = $"SELECT {selCol} FROM public.\"{table_name}\" WHERE {idName} = @Id";

                    result = (await conn.QueryAsync<object>(sql, new { Id = id })).ToList();
                }
                catch (Exception exception)
                {
                    throw exception;
                }
                return result;
            }
        }

        #endregion GetAll

        #region GetOne
        /// <summary>
        /// 取得單一筆資料(排序)
        /// </summary>
        /// <typeparam name="A"></typeparam>
        /// <param name="tableName"></param>
        /// <param name="sWhere"></param>
        /// <param name="param">參數值</param>
        /// <param name="sOrderBy"></param>
        /// <returns></returns>
        public virtual async Task<A> GetOneAsync<A>(string tableName, string sWhere, object param = null, string sOrderBy = "")
        {
            EnsureCorrectSchema();
            SetSchemaFromContext();
            A result;
            using (IDbConnection conn = GetDbConnection())
            {
                try
                {
                    //var sql = $"SELECT * FROM public.\"{tableName}\"";
                    var sql = $"SELECT * FROM \"{_currentSchema}\".\"{tableName}\"";

                    if (!string.IsNullOrEmpty(sWhere))
                    {
                        sql += $" WHERE {sWhere}";
                    }

                    if (!string.IsNullOrEmpty(sOrderBy))
                    {
                        sql += $" ORDER BY {sOrderBy}";
                    }
                    Console.WriteLine($"Executing SQL on schema {_currentSchema}: {sql}");  // Log the final SQL
                    result = await conn.QueryFirstOrDefaultAsync<A>(sql, param);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
                return result;
            }
        }
        /// <summary>
        /// 取得單一筆資料某一欄位(排序)
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="sWhere"></param>
        /// <param name="selCol">填放欄位</param>
        /// <param name="param">參數值</param>
        /// <param name="sOrderBy"></param>
        /// <returns></returns>
        public virtual async Task<A> GetOneAsync<A>(string tableName, string sWhere, string selCol, object param = null, string sOrderBy = "")
        {
            EnsureCorrectSchema();
            A result;
            using (IDbConnection conn = GetDbConnection())
            {
                try
                {
                    //var sql = $"SELECT {selCol} FROM public.\"{tableName}\"";
                    var sql = $"SELECT * FROM \"{_currentSchema}\".\"{tableName}\"";
                    if (!string.IsNullOrEmpty(sWhere))
                    {
                        sql += $" WHERE {sWhere}";
                    }
                    if (!string.IsNullOrEmpty(sOrderBy))
                    {
                        sql += $" ORDER BY {sOrderBy}";
                    }

                    result = await conn.QueryFirstOrDefaultAsync<A>(sql, param);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
                return result;
            }
        }

        /// <summary>
        /// 取得單一筆資料(根據自訂SQL, 自訂參數)
        /// </summary>
        /// <param name="sqlString"></param>
        /// <param name="param"></param>
        /// <returns></returns>
        public virtual async Task<A> GetOneAsync<A>(string sqlString, object param = null)
        {
            EnsureCorrectSchema();
            A result;
            using (IDbConnection conn = GetDbConnection())
            {
                try
                {
                    var sql = sqlString;

                    result = await conn.QueryFirstOrDefaultAsync<A>(sql, param);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
                return result;
            }
        }
        #endregion GetOne

        #region DeleteOne (軟刪除)

        /// <summary>
        /// 透過guid，軟刪除單一筆資料
        /// UPDATE {tableName} SET deleted = 1 WHERE {idName} = @Guid
        /// </summary>
        /// <param name="guid"></param>
        /// <returns></returns>
        public virtual async Task DeleteOne(int id, string tableName, string idName)
        {
            EnsureCorrectSchema();
            SetSchemaFromContext();
            using (IDbConnection conn = GetDbConnection())
            {
                conn.Open();
                using (var trans = conn.BeginTransaction())
                {
                    try
                    {
                        //var sql = $"UPDATE public.\"{tableName}\" SET \"Deleted\" = 1 WHERE {idName} = @Id";
                        var sql = $"UPDATE \"{_currentSchema}\".\"{tableName}\" SET \"Deleted\" = 1 WHERE {idName} = @Id";

                        await conn.ExecuteAsync(sql, new { Id = id }, trans);

                        trans.Commit();
                    }
                    catch (Exception exception)
                    {
                        trans.Rollback();
                        throw exception;
                    }
                    finally
                    {
                        conn.Close();
                    }

                }
            }
        }

        /// <summary>
        /// 透過guid，軟刪除單一筆資料
        /// UPDATE {tableName} SET deleted = 1 WHERE {idName} = @Guid
        /// </summary>
        /// <param name="guid"></param>
        /// <returns></returns>
        public virtual async Task DeleteOne(int id, string tableName, string idName, int updater)
        {
            EnsureCorrectSchema();
            using (IDbConnection conn = GetDbConnection())
            {
                conn.Open();
                using (var trans = conn.BeginTransaction())
                {
                    try
                    {
                        // 修正为使用 _currentSchema
                        var sql = $"UPDATE \"{_currentSchema}\".\"{tableName}\" SET \"Deleted\" = 1, \"Updater\" = @Updater, \"UpdateTime\" = @UpdateTime WHERE {idName} = @Id";
                        //var sql = $"UPDATE public.\"{tableName}\" SET \"Deleted\" = 1, \"Updater\" = @Updater, \"UpdateTime\" = @UpdateTime WHERE {idName} = @Id";

                        await conn.ExecuteAsync(sql, new { Id = id, Updater = updater, UpdateTime = DateTime.Now }, trans);

                        trans.Commit();
                    }
                    catch (Exception exception)
                    {
                        trans.Rollback();
                        throw exception;
                    }
                    finally
                    {
                        conn.Close();
                    }

                }
            }
        }
        /// <summary>
        /// 透過guid、db_name、table_name，刪除指定的資料庫之資料表的一筆資料
        /// </summary>
        /// <param name="guid"></param>
        /// <param name="db_name"></param>
        /// <param name="table_name"></param>
        /// <returns></returns>
        public virtual async Task DeleteOneByGuidWithCustomDBNameAndTable(string guid, string db_name, string table_name, string idName)
        {
            EnsureCorrectSchema();
            using (IDbConnection conn = GetDbConnection())
            {
                conn.Open();
                using (var trans = conn.BeginTransaction())
                {
                    try
                    {
                        var sql = $"UPDATE {db_name}.{table_name} SET Deleted = 1 WHERE {idName} = @Guid";

                        await conn.ExecuteAsync(sql, new { Guid = guid }, trans);

                        trans.Commit();
                    }
                    catch (Exception exception)
                    {
                        trans.Rollback();
                        throw exception;
                    }
                    finally
                    {
                        conn.Close();
                    }
                }
            }
        }

        #endregion DeleteOne (軟刪除)

        #region PurgeOne (硬刪除)
        /// <summary>
        /// 根據Where條件進行刪除
        /// </summary>
        /// <param name="table_name"></param>
        /// <param name="sWhere"></param>
        /// <returns></returns>
        public virtual async Task PurgeOneByGuidWithCustomDBNameAndTable(string table_name, string sWhere, object param = null)
        {
            EnsureCorrectSchema();
            SetSchemaFromContext();
            using (IDbConnection conn = GetDbConnection())
            {
                conn.Open();
                using (var trans = conn.BeginTransaction())
                {
                    try
                    {
                        //var sql = $"DELETE FROM public.\"{table_name}\" WHERE {sWhere}";
                        // 这里应根据实际情况使用正确的 schema 和数据库
                        var sql = $"DELETE FROM \"{_currentSchema}\".\"{table_name}\" WHERE {sWhere}";

                        await conn.ExecuteAsync(sql, param, trans);

                        trans.Commit();
                    }
                    catch (Exception exception)
                    {
                        trans.Rollback();
                        throw exception;
                    }
                    finally
                    {
                        conn.Close();
                    }
                }
            }
        }
        /// <summary>
        /// 指定單一欄位，實際刪除單一筆資料
        /// </summary>
        /// <param name="guid"></param>
        /// <param name="table_name"></param>
        /// <param name="idName"></param>
        /// <returns></returns>
        public virtual async Task PurgeOneAsync(int guid, string table_name, string idName)
        {
            EnsureCorrectSchema();
            using (IDbConnection conn = GetDbConnection())
            {
                conn.Open();
                using (var trans = conn.BeginTransaction())
                {
                    try
                    {
                        var sql = $"DELETE FROM {table_name} WHERE {idName} = @Guid";

                        await conn.ExecuteAsync(sql, new { Guid = guid }, trans);

                        trans.Commit();
                    }
                    catch (Exception exception)
                    {
                        trans.Rollback();
                        throw exception;
                    }
                    finally
                    {
                        conn.Close();
                    }
                }
            }
        }
        #endregion PurgeOne (硬刪除)

        #region AddMuti
        /// <summary>
        /// 新增Table多筆資料
        /// </summary>
        /// <param name="dict"></param>
        /// <param name="Table_name"></param>
        /// <returns></returns>
        public async Task AddMutiByCustomTable(List<Dictionary<string, object>> dict, string Table_name)
        {
            EnsureCorrectSchema();
            SetSchemaFromContext();
            using (IDbConnection conn = GetDbConnection())
            {
                conn.Open();
                using (var trans = conn.BeginTransaction())
                {
                    try
                    {
                        List<string> properties = dict[0].Keys.ToList();
                        string sql = InsertGenerateString(properties, Table_name);

                        await conn.ExecuteAsync(sql, dict, trans);

                        trans.Commit();
                    }
                    catch (Exception exception)
                    {
                        trans.Rollback();
                        throw exception;
                    }
                    finally
                    {
                        conn.Close();
                    }
                }
            }
        }

        /// <summary>
        /// 新增Table多筆資料，由外部帶入資料庫連線、trans
        /// </summary>
        /// <param name="conn"></param>
        /// <param name="trans"></param>
        /// <param name="dict"></param>
        /// <param name="Table_name"></param>
        /// <returns></returns>
        public async Task AddMutiByCustomTable(IDbConnection conn, IDbTransaction trans, List<Dictionary<string, object>> dict, string Table_name)
        {
            EnsureCorrectSchema();
            try
            {
                List<string> properties = dict[0].Keys.ToList();
                string sql = InsertGenerateString(properties, Table_name);

                await conn.ExecuteAsync(sql, dict, trans);
            }
            catch (Exception exception)
            {
                trans.Rollback();
                throw exception;
            }
        }
        #endregion AddMuti

        #region AddOne
        /// <summary>
        /// 新增table一筆資料
        /// </summary>
        /// <param name="dict">新增資料庫名稱以及值</param>
        /// <param name="Table_name">資料表名稱</param>
        /// <returns></returns>
        public async Task<int> AddOneByCustomTable(Dictionary<string, object> dict, string Table_name, string idColumn = "")
        {
            EnsureCorrectSchema();
            SetSchemaFromContext();
            var id = 0;
            using (IDbConnection conn = GetDbConnection())
            {
                conn.Open();
                using (var trans = conn.BeginTransaction())
                {
                    try
                    {
                        List<string> properties = dict.Keys.ToList();
                        string sql = InsertGenerateString(properties, Table_name);
                        if (!string.IsNullOrEmpty(idColumn))
                        {
                            //sql += $" SELECT CURRVAL(pg_get_serial_sequence('public.\"{Table_name}\"', '{idColumn}'));";
                            sql += $" SELECT CURRVAL(pg_get_serial_sequence('\"{_currentSchema}\".\"{Table_name}\"', '{idColumn}'));";
                        }
                        id = await conn.QueryFirstOrDefaultAsync<int>(sql, dict, trans);
                        //await conn.ExecuteAsync(sql, dict, trans);
                        trans.Commit();
                    }
                    catch (Exception exception)
                    {
                        trans.Rollback();
                        throw exception;
                    }
                    finally
                    {
                        conn.Close();
                    }
                }
            }

            return id;
        }

        #endregion AddOne

        #region UpdateOne
        /// <summary>
        /// 更新Table一筆資料
        /// </summary>
        /// <param name="dict">更新資料庫名稱以及值</param>
        /// <param name="Table_name">資料表名稱</param>
        /// <param name="sWhere">Where條件</param>
        /// <returns></returns>
        public async Task UpdateOneByCustomTable(Dictionary<string, object> dict, string Table_name, string sWhere)
        {
            EnsureCorrectSchema();
            SetSchemaFromContext();
            using (IDbConnection conn = GetDbConnection())
            {
                conn.Open();
                using (var trans = conn.BeginTransaction())
                {
                    try
                    {
                        List<string> properties = dict.Keys.ToList();
                        string sql = UpdateGenerateString(properties, Table_name, sWhere);

                        await conn.ExecuteAsync(sql, dict, trans);

                        trans.Commit();
                    }
                    catch (Exception exception)
                    {
                        trans.Rollback();
                        throw exception;
                    }
                    finally
                    {
                        conn.Close();
                    }
                }
            }
        }
        #endregion UpdateOne

        #region UpdateMuti
        /// <summary>
        /// 更新Table多筆資料
        /// </summary>
        /// <param name="dicts">更新值</param>
        /// <param name="Table_name">資料表名稱</param>
        /// <param name="sWhere">Where條件</param>
        /// <returns></returns>
        public async Task UpdateMutiByCustomTable(List<Dictionary<string, object>> dicts, string Table_name, string sWhere)
        {
            EnsureCorrectSchema();
            SetSchemaFromContext();
            using (IDbConnection conn = GetDbConnection())
            {
                conn.Open();
                using (var trans = conn.BeginTransaction())
                {
                    try
                    {
                        List<string> properties = dicts.First().Keys.ToList();
                        string sql = UpdateGenerateString(properties, Table_name, sWhere);

                        await conn.ExecuteAsync(sql, dicts, trans);

                        trans.Commit();
                    }
                    catch (Exception exception)
                    {
                        trans.Rollback();
                        throw exception;
                    }
                    finally
                    {
                        conn.Close();
                    }
                }
            }
        }
        #endregion UpdateMuti

        /// <summary>
        /// 透過id來搜尋此筆資料是否存在
        /// </summary>
        /// <param name="id">id值</param>
        /// <param name="Table_name">table名稱</param>
        /// <param name="id_name">id名稱</param>
        /// <returns></returns>
        public async Task<Boolean> HasExistsWithGuid(int id, string Table_name, string id_name)
        {
            EnsureCorrectSchema();
            using (IDbConnection conn = GetDbConnection())
            {
                Boolean hasExists = false;
                conn.Open();
                try
                {
                    var sql = $"SELECT * FROM {Table_name} WHERE {id_name} = @id";

                    var result = await conn.QueryFirstOrDefaultAsync<string>(sql, new { id = id });

                    if (result != null)
                    {
                        hasExists = true;
                    }
                }
                catch (Exception exception)
                {
                    throw exception;
                }
                finally
                {
                    conn.Close();
                }

                return hasExists;
            }
        }

        /// <summary>
        /// 根據SQL條件搜尋此筆資料是否存在
        /// </summary>
        /// <param name="sql"></param>
        /// <returns></returns>
        public async Task<Boolean> HasExistsWithParam(string sql, object param = null)
        {
            EnsureCorrectSchema();
            using (IDbConnection conn = GetDbConnection())
            {
                Boolean hasExists = false;
                conn.Open();
                try
                {
                    var result = await conn.QueryFirstOrDefaultAsync<object>(sql, param);

                    if (result != null)
                    {
                        hasExists = true;
                    }
                }
                catch (Exception exception)
                {
                    throw exception;
                }
                finally
                {
                    conn.Close();
                }

                return hasExists;
            }
        }

        /// <summary>
        /// 直接執行SQL語句
        /// </summary>
        /// <param name="sql"></param>
        /// <param name="param"></param>
        /// <returns></returns>
        public async Task ExecuteSql(string sql, object param = null)
        {
            EnsureCorrectSchema();
            using (IDbConnection conn = GetDbConnection())
            {
                conn.Open();
                try
                {
                    var result = await conn.ExecuteAsync(sql, param);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
                finally
                {
                    conn.Close();
                }
            }
        }

        /// <summary>
        /// 判斷順序是否重複
        /// </summary>
        /// <param name="priorityVal">順序值</param>
        /// <param name="Table_name">table名稱</param>
        /// <param name="priority_name">順序名稱</param>
        /// <param name="sWhere">排除Where條件</param>
        /// <returns></returns>
        public async Task<Boolean> PriorityRepeat(int priorityVal, string Table_name, string priority_name,
            string sWhere)
        {
            EnsureCorrectSchema();
            using (IDbConnection conn = GetDbConnection())
            {
                Boolean hasExists = false;
                conn.Open();
                try
                {
                    var sql = $"SELECT * FROM {Table_name} WHERE {priority_name} = @priority_name AND {sWhere}";

                    var result = await conn.QueryFirstOrDefaultAsync<string>(sql, new { priority_name = priorityVal });

                    if (result != null)
                    {
                        hasExists = true;
                    }
                }
                catch (Exception exception)
                {
                    throw exception;
                }
                finally
                {
                    conn.Close();
                }

                return hasExists;
            }
        }
    }
}
