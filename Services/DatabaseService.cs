using System.Data;
using System.Data.SqlClient;
using WarehouseKDS.Models;
using Microsoft.Extensions.Configuration;

namespace WarehouseKDS.Services
{
    public class DatabaseService
    {
        private readonly string _picklistConnectionString;
        private readonly string _employeeConnectionString;

        public DatabaseService(IConfiguration configuration)
        {
            _picklistConnectionString = "Server=10.10.21.132;Database=DBOTHER;User Id=sa;Password=0l!fantje;";
            _employeeConnectionString = "Server=10.10.21.132;Database=SBO_SPX_SR;User Id=sa;Password=0l!fantje;";
        }

        public async Task<List<Picklist>> GetActivePicklistsAsync()
        {
            var picklists = new List<Picklist>();
            
            using (var connection = new SqlConnection(_picklistConnectionString))
            {
                await connection.OpenAsync();
                using var command = new SqlCommand(
                    @"SELECT 
                        ID,
                        CreateDate,
                        DeliveryDate,
                        RouteName,
                        ItemLocation,
                        SalesPerson,
                        PickerName,
                        StartTime,
                        ExpectedCompletionTime,
                        CompletionTime,
                        Status,
                        BarcodeID,
                        LastUpdated,
                        ExpectedTimeInMinutes
                    FROM WarehousePicklistTracking 
                    WHERE Status IN ('Created', 'Active')
                    ORDER BY DeliveryDate, StartTime", connection);

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    try
                    {
                        picklists.Add(new Picklist
                        {
                            ID = reader.IsDBNull(reader.GetOrdinal("ID")) ? 0 : reader.GetInt32(reader.GetOrdinal("ID")),
                            CreateDate = reader.IsDBNull(reader.GetOrdinal("CreateDate")) ? DateTime.MinValue : reader.GetDateTime(reader.GetOrdinal("CreateDate")),
                            DeliveryDate = reader.IsDBNull(reader.GetOrdinal("DeliveryDate")) ? DateTime.MinValue : reader.GetDateTime(reader.GetOrdinal("DeliveryDate")),
                            RouteName = reader.IsDBNull(reader.GetOrdinal("RouteName")) ? null : reader.GetString(reader.GetOrdinal("RouteName")),
                            ItemLocation = reader.IsDBNull(reader.GetOrdinal("ItemLocation")) ? null : reader.GetString(reader.GetOrdinal("ItemLocation")),
                            SalesPerson = reader.IsDBNull(reader.GetOrdinal("SalesPerson")) ? null : reader.GetString(reader.GetOrdinal("SalesPerson")),
                            PickerName = reader.IsDBNull(reader.GetOrdinal("PickerName")) ? null : reader.GetString(reader.GetOrdinal("PickerName")),
                            StartTime = reader.IsDBNull(reader.GetOrdinal("StartTime")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("StartTime")),
                            ExpectedCompletionTime = reader.IsDBNull(reader.GetOrdinal("ExpectedCompletionTime")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("ExpectedCompletionTime")),
                            CompletionTime = reader.IsDBNull(reader.GetOrdinal("CompletionTime")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("CompletionTime")),
                            Status = reader.IsDBNull(reader.GetOrdinal("Status")) ? null : reader.GetString(reader.GetOrdinal("Status")),
                            BarcodeID = reader.IsDBNull(reader.GetOrdinal("BarcodeID")) ? null : reader.GetString(reader.GetOrdinal("BarcodeID")),
                            LastUpdated = reader.IsDBNull(reader.GetOrdinal("LastUpdated")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("LastUpdated")),
                            ExpectedTimeInMinutes = reader.IsDBNull(reader.GetOrdinal("ExpectedTimeInMinutes")) ? 0 : reader.GetInt32(reader.GetOrdinal("ExpectedTimeInMinutes"))
                        });
                    }
                    catch (Exception ex)
                    {
                        // Log the error and continue with the next record
                        Console.WriteLine($"Error reading record: {ex.Message}");
                        continue;
                    }
                }
            }
            
            return picklists;
        }

        public async Task<List<Employee>> GetEmployeesAsync()
        {
            var employees = new List<Employee>();
            
            using (var connection = new SqlConnection(_employeeConnectionString))
            {
                await connection.OpenAsync();
                using var command = new SqlCommand(
                    "SELECT FirstName, LastName FROM OHEM", connection);

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    employees.Add(new Employee
                    {
                        FirstName = reader.GetString(reader.GetOrdinal("FirstName")),
                        LastName = reader.GetString(reader.GetOrdinal("LastName"))
                    });
                }
            }
            
            return employees;
        }

        public async Task<bool> UpdatePicklistStatusAsync(string barcodeId, string pickerName = null)
        {
            using var connection = new SqlConnection(_picklistConnectionString);
            await connection.OpenAsync();

            // First, get the current status
            using (var command = new SqlCommand(
                "SELECT Status, StartTime FROM WarehousePicklistTracking WHERE BarcodeID = @BarcodeID", connection))
            {
                command.Parameters.AddWithValue("@BarcodeID", barcodeId);
                using var reader = await command.ExecuteReaderAsync();
                
                if (!await reader.ReadAsync())
                    return false;

                var status = reader.GetString(reader.GetOrdinal("Status"));
                var hasStartTime = !reader.IsDBNull(reader.GetOrdinal("StartTime"));
                reader.Close();

                // If not started, start it
                if (!hasStartTime)
                {
                    using var updateCommand = new SqlCommand(
                        @"UPDATE WarehousePicklistTracking 
                        SET Status = 'Active', 
                            StartTime = GETDATE(), 
                            PickerName = @PickerName,
                            LastUpdated = GETDATE()
                        WHERE BarcodeID = @BarcodeID", connection);
                    
                    updateCommand.Parameters.AddWithValue("@BarcodeID", barcodeId);
                    updateCommand.Parameters.AddWithValue("@PickerName", pickerName);
                    await updateCommand.ExecuteNonQueryAsync();
                }
                // If already started, complete it
                else if (status == "Active")
                {
                    using var updateCommand = new SqlCommand(
                        @"UPDATE WarehousePicklistTracking 
                        SET Status = 'Completed', 
                            CompletionTime = GETDATE(),
                            LastUpdated = GETDATE()
                        WHERE BarcodeID = @BarcodeID", connection);
                    
                    updateCommand.Parameters.AddWithValue("@BarcodeID", barcodeId);
                    await updateCommand.ExecuteNonQueryAsync();
                }
            }

            return true;
        }
    }
} 