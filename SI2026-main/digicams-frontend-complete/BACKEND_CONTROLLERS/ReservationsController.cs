using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DigiCams.Api.Models;

namespace DigiCams.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        private readonly DigiCamsDbContext _context;

        public ReservationsController(DigiCamsDbContext context)
        {
            _context = context;
        }

        // GET: api/reservations (Admin/Seller only)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Reservation>>> GetAllReservations()
        {
            return await _context.Reservations
                .Include(r => r.User)
                .Include(r => r.Product)
                .OrderByDescending(r => r.StartDate)
                .ToListAsync();
        }

        // GET: api/reservations/my
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<Reservation>>> GetMyReservations()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim.Value);

            return await _context.Reservations
                .Where(r => r.UserId == userId)
                .Include(r => r.Product)
                .OrderByDescending(r => r.StartDate)
                .ToListAsync();
        }

        // GET: api/reservations/availability/5
        [HttpGet("availability/{productId}")]
        public async Task<ActionResult<object>> CheckAvailability(int productId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var reservations = await _context.Reservations
                .Where(r => r.ProductId == productId &&
                           r.Status != "Cancelled" &&
                           ((r.StartDate <= endDate && r.EndDate >= startDate)))
                .ToListAsync();

            return Ok(new
            {
                isAvailable = !reservations.Any(),
                conflictingReservations = reservations
            });
        }

        // POST: api/reservations
        [HttpPost]
        public async Task<ActionResult<Reservation>> CreateReservation(CreateReservationDto reservationDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim.Value);

            // Check if product is available
            var hasConflict = await _context.Reservations
                .AnyAsync(r => r.ProductId == reservationDto.ProductId &&
                              r.Status != "Cancelled" &&
                              ((r.StartDate <= reservationDto.EndDate && r.EndDate >= reservationDto.StartDate)));

            if (hasConflict)
            {
                return BadRequest(new { message = "Proizvod nije dostupan u odabranom periodu" });
            }

            var reservation = new Reservation
            {
                UserId = userId,
                ProductId = reservationDto.ProductId,
                StartDate = reservationDto.StartDate,
                EndDate = reservationDto.EndDate,
                TotalPrice = reservationDto.TotalPrice,
                Status = "Active"
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMyReservations), new { id = reservation.Id }, reservation);
        }

        // PUT: api/reservations/5/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelReservation(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim.Value);
            var reservation = await _context.Reservations.FindAsync(id);

            if (reservation == null)
            {
                return NotFound();
            }

            // Check if user owns this reservation
            if (reservation.UserId != userId)
            {
                return Forbid();
            }

            reservation.Status = "Cancelled";
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class CreateReservationDto
    {
        public int ProductId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
