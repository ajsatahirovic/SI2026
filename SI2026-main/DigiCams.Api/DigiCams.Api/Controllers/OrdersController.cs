using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DigiCams.Api.Models;

namespace DigiCams.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly DigiCamsDbContext _context;
        public OrdersController(DigiCamsDbContext context) { _context = context; }

        // GET: api/orders — PRISTUP: Prodavac, Admin
        [Authorize(Roles = "Seller,Admin")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetAllOrders()
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.OrderDate).ToListAsync();
        }

        // GET: api/orders/my — PRISTUP: Registrovani, Admin
        [Authorize]
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<Order>>> GetMyOrders()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.OrderDate).ToListAsync();
        }

        // GET: api/orders/5 — PRISTUP: vlasnik narudzbine, Prodavac, Admin
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();
            var userId = GetUserId();
            var isPrivileged = User.IsInRole("Seller") || User.IsInRole("Admin");
            if (!isPrivileged && order.UserId != userId) return Forbid();
            return order;
        }

        // POST: api/orders — PRISTUP: User, Admin — Guest NE MOZE kupovati
        [Authorize(Roles = "User,Admin")]
        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto orderDto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            var order = new Order { UserId = userId.Value, OrderDate = DateTime.UtcNow, TotalAmount = orderDto.TotalAmount };
            foreach (var item in orderDto.OrderItems)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null) return BadRequest(new { message = "Proizvod nije pronadjen" });
                if (product.IsForSale != true) return BadRequest(new { message = product.Name + " nije na prodaju" });
                if (product.StockQuantity < item.Quantity) return BadRequest(new { message = "Nedovoljno na stanju: " + product.Name });
                order.OrderItems.Add(new OrderItem { ProductId = item.ProductId, Quantity = item.Quantity, PriceAtTime = product.PriceSale ?? item.PriceAtTime });
                product.StockQuantity -= item.Quantity;
            }
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }

        private int? GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : null;
        }
    }

    public class CreateOrderDto { public decimal TotalAmount { get; set; } public List<OrderItemDto> OrderItems { get; set; } = new(); }
    public class OrderItemDto { public int ProductId { get; set; } public int Quantity { get; set; } public decimal PriceAtTime { get; set; } }
}