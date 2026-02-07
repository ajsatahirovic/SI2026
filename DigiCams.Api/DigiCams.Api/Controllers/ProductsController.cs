using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DigiCams.Api.Models;

namespace DigiCams.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly DigiCamsDbContext _context;

        public ProductsController(DigiCamsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }
    }
}