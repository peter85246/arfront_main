using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class SchemaContextService : ISchemaContextService
    {
        public string CurrentSchema { get; set; }
    }
}
