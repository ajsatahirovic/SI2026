using System;
using System.Collections.Generic;

namespace DigiCams.Api.Models;

public partial class Reservation
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    public int? ProductId { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public decimal TotalPrice { get; set; }

    public string? Status { get; set; }

    public virtual Product? Product { get; set; }

    public virtual User? User { get; set; }
}
