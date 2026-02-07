using System;
using System.Collections.Generic;

namespace DigiCams.Api.Models;

public partial class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public string? Brand { get; set; }

    public string? ImageUrl { get; set; }

    public bool? IsForSale { get; set; }

    public decimal? PriceSale { get; set; }

    public int? StockQuantity { get; set; }

    public bool? IsForRent { get; set; }

    public decimal? PriceRentPerDay { get; set; }

    public string? Resolution { get; set; }

    public string? SensorType { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
