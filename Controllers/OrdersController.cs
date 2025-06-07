using Microsoft.AspNetCore.Mvc;
using WarehouseKDS.Models;
using System.Collections.Generic;
using System;

namespace WarehouseKDS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private static List<Order> _orders = new List<Order>();
        private static int _nextOrderId = 1;

        [HttpGet]
        public ActionResult<IEnumerable<Order>> GetOrders()
        {
            return Ok(_orders);
        }

        [HttpGet("{id}")]
        public ActionResult<Order> GetOrder(int id)
        {
            var order = _orders.Find(o => o.Id == id);
            if (order == null)
            {
                return NotFound();
            }
            return Ok(order);
        }

        [HttpPost]
        public ActionResult<Order> CreateOrder(Order order)
        {
            order.Id = _nextOrderId++;
            order.CreatedAt = DateTime.UtcNow;
            order.Status = OrderStatus.Pending;
            _orders.Add(order);
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }

        [HttpPut("{id}/status")]
        public ActionResult UpdateOrderStatus(int id, [FromBody] OrderStatus newStatus)
        {
            var order = _orders.Find(o => o.Id == id);
            if (order == null)
            {
                return NotFound();
            }

            order.Status = newStatus;
            if (newStatus == OrderStatus.Completed)
            {
                order.CompletedAt = DateTime.UtcNow;
            }

            return NoContent();
        }

        [HttpPut("{orderId}/items/{itemId}/status")]
        public ActionResult UpdateItemStatus(int orderId, int itemId, [FromBody] ItemStatus newStatus)
        {
            var order = _orders.Find(o => o.Id == orderId);
            if (order == null)
            {
                return NotFound();
            }

            var item = order.Items.Find(i => i.Id == itemId);
            if (item == null)
            {
                return NotFound();
            }

            item.Status = newStatus;
            if (newStatus == ItemStatus.InProgress)
            {
                item.StartedAt = DateTime.UtcNow;
            }
            else if (newStatus == ItemStatus.Completed)
            {
                item.CompletedAt = DateTime.UtcNow;
            }

            return NoContent();
        }
    }
} 