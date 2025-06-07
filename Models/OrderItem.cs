using System;

namespace WarehouseKDS.Models
{
    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string Name { get; set; }
        public int Quantity { get; set; }
        public string SpecialInstructions { get; set; }
        public ItemStatus Status { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public enum ItemStatus
    {
        Pending,
        InProgress,
        Ready,
        Completed
    }
} 