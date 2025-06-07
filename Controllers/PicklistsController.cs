using Microsoft.AspNetCore.Mvc;
using WarehouseKDS.Models;
using WarehouseKDS.Services;

namespace WarehouseKDS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PicklistsController : ControllerBase
    {
        private readonly DatabaseService _databaseService;

        public PicklistsController(DatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<Picklist>>> GetActivePicklists()
        {
            var picklists = await _databaseService.GetActivePicklistsAsync();
            return Ok(picklists);
        }

        [HttpGet("employees")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
        {
            var employees = await _databaseService.GetEmployeesAsync();
            return Ok(employees);
        }

        [HttpPost("scan")]
        public async Task<ActionResult> ScanPicklist([FromBody] ScanRequest request)
        {
            if (string.IsNullOrEmpty(request.BarcodeID))
                return BadRequest("BarcodeID is required");

            var success = await _databaseService.UpdatePicklistStatusAsync(
                request.BarcodeID, 
                request.PickerName);

            if (!success)
                return NotFound("Picklist not found");

            return Ok();
        }
    }

    public class ScanRequest
    {
        public string BarcodeID { get; set; }
        public string PickerName { get; set; }
    }
} 