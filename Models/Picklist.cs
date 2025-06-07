using System;

namespace WarehouseKDS.Models
{
    public class Picklist
    {
        public int ID { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime DeliveryDate { get; set; }
        public string RouteName { get; set; }
        public string ItemLocation { get; set; }
        public string SalesPerson { get; set; }
        public string? PickerName { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? ExpectedCompletionTime { get; set; }
        public DateTime? CompletionTime { get; set; }
        public string Status { get; set; }
        public string BarcodeID { get; set; }
        public DateTime? LastUpdated { get; set; }
        public int ExpectedTimeInMinutes { get; set; }

        // Computed properties for UI
        public TimeSpan? ElapsedTime => StartTime.HasValue 
            ? (CompletionTime ?? DateTime.Now) - StartTime.Value 
            : null;

        public bool IsOverdue => StartTime.HasValue && 
            ElapsedTime.HasValue && 
            ElapsedTime.Value.TotalMinutes > ExpectedTimeInMinutes;

        public bool IsWarning => StartTime.HasValue && 
            ElapsedTime.HasValue && 
            ElapsedTime.Value.TotalMinutes > ExpectedTimeInMinutes * 0.9 &&
            ElapsedTime.Value.TotalMinutes <= ExpectedTimeInMinutes;
    }
} 