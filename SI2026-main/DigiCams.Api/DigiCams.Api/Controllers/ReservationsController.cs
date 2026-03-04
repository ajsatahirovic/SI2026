using Microsoft.AspNetCore.Authorization;
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

        // GET: api/reservations
        // PRISTUP: Prodavac, Admin
        [Authorize(Roles = "Seller,Admin")]
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
        // PRISTUP: Registrovani korisnik, Prodavac, Admin
        [Authorize]
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<Reservation>>> GetMyReservations()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            return await _context.Reservations
                .Where(r => r.UserId == userId)
                .Include(r => r.Product)
                .OrderByDescending(r => r.StartDate)
                .ToListAsync();
        }

        // GET: api/reservations/availability/5
        // PRISTUP: Svi — Guest moze vidjeti kalendar dostupnosti
        [AllowAnonymous]
        [HttpGet("availability/{productId}")]
        public async Task<ActionResult<object>> CheckAvailability(
            int productId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var reservations = await _context.Reservations
                .Where(r => r.ProductId == productId &&
                            r.Status != "Cancelled" &&
                            r.StartDate <= endDate && r.EndDate >= startDate)
                .ToListAsync();

            return Ok(new { isAvailable = !reservations.Any(), conflictingReservations = reservations });
        }

        // POST: api/reservations
        // PRISTUP: Registrovani korisnik (User), Admin — Guest NE MOZE
        [Authorize(Roles = "User,Admin")]
        [HttpPost]
        public async Task<ActionResult<Reservation>> CreateReservation(CreateReservationDto dto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var hasConflict = await _context.Reservations
                .AnyAsync(r => r.ProductId == dto.ProductId &&
                               r.Status != "Cancelled" &&
                               r.StartDate <= dto.EndDate && r.EndDate >= dto.StartDate);

            if (hasConflict)
                return BadRequest(new { message = "Proizvod nije dostupan u odabranom periodu" });

            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null) return NotFound(new { message = "Proizvod nije prona?en" });
            if (product.IsForRent != true || product.PriceRentPerDay == null)
                return BadRequest(new { message = "Ovaj proizvod nije dostupan za iznajmljivanje" });

            var nights = (int)(dto.EndDate - dto.StartDate).TotalDays;
            if (nights <= 0)
                return BadRequest(new { message = "EndDate mora biti posle StartDate" });

            // Cijena se racuna na serveru, ne prima od klijenta!
            var totalPrice = nights * product.PriceRentPerDay.Value;

            var reservation = new Reservation
            {
                UserId = userId.Value,
                ProductId = dto.ProductId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                TotalPrice = totalPrice,
                Status = "Pending"
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMyReservations), new { id = reservation.Id }, reservation);
        }

        // PUT: api/reservations/{id}/cancel
        // PRISTUP: Registrovani korisnik (samo svoju), Admin (bilo koju)
        [Authorize(Roles = "User,Admin")]
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelReservation(int id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null) return NotFound();

            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin && reservation.UserId != userId)
                return Forbid();

            // Pravilo platforme: ne moze se otkazati manje od 24h prije pocetka
            if (!isAdmin && reservation.StartDate <= DateTime.UtcNow.AddHours(24))
                return BadRequest(new { message = "Rezervacija se ne moze otkazati manje od 24h pre pocetka" });

            if (reservation.Status == "Cancelled")
                return BadRequest(new { message = "Rezervacija je vec otkazana" });

            reservation.Status = "Cancelled";
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/reservations/{id}/confirm
        // PRISTUP: Prodavac, Admin — potvrdjuju rezervacije korisnika
        [Authorize(Roles = "Seller,Admin")]
        [HttpPut("{id}/confirm")]
        public async Task<IActionResult> ConfirmReservation(int id)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null) return NotFound();

            if (reservation.Status != "Pending")
                return BadRequest(new { message = "Samo Pending rezervacije mogu biti potvrdene" });

            reservation.Status = "Confirmed";
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private int? GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : null;
        }
    }

    public class CreateReservationDto
    {
        public int ProductId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        // TotalPrice se NE prima od klijenta — racuna se na serveru
    }
}