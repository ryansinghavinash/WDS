using System;
using System.Collections.Generic;

namespace WarehouseKDS.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public OrderStatus Status { get; set; }
        public List<OrderItem> Items { get; set; }
        public string Notes { get; set; }
        public int TableNumber { get; set; }
    }

    public enum OrderStatus
    {
        Pending,
        InProgress,
        Ready,
        Completed,
        Cancelled
    }
} 