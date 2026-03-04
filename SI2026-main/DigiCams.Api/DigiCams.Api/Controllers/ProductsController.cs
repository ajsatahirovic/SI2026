using Microsoft.AspNetCore.Authorization;
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

        // GET: api/products
        // PRISTUP: Guest, Registrovani, Prodavac, Admin — svi mogu pregledati
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }

        // GET: api/products/5
        // PRISTUP: Guest, Registrovani, Prodavac, Admin — svi mogu pregledati detalje
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            return product;
        }

        // GET: api/products/sale
        // PRISTUP: Guest, Registrovani, Prodavac, Admin
        [AllowAnonymous]
        [HttpGet("sale")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsForSale()
        {
            return await _context.Products
                .Where(p => p.IsForSale == true)
                .ToListAsync();
        }

        // GET: api/products/rent
        // PRISTUP: Guest, Registrovani, Prodavac, Admin
        [AllowAnonymous]
        [HttpGet("rent")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsForRent()
        {
            return await _context.Products
                .Where(p => p.IsForRent == true)
                .ToListAsync();
        }

        // POST: api/products
        // PRISTUP: Prodavac, Admin — samo oni mogu dodavati proizvode
        [Authorize(Roles = "Seller,Admin")]
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // PUT: api/products/5
        // PRISTUP: Prodavac, Admin — samo oni mogu uredjivati proizvode
        [Authorize(Roles = "Seller,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, Product product)
        {
            if (id != product.Id) return BadRequest();

            _context.Entry(product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/products/5
        // PRISTUP: Prodavac, Admin — samo oni mogu brisati proizvode
        [Authorize(Roles = "Seller,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }
    }
}