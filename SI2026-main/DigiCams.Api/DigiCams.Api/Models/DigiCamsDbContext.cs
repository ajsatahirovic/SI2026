using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace DigiCams.Api.Models;

public partial class DigiCamsDbContext : DbContext
{
    public DigiCamsDbContext()
    {
    }

    public DigiCamsDbContext(DbContextOptions<DigiCamsDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<Reservation> Reservations { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Connection string se čita iz appsettings.json - ne hardkodovati ovdje
        // Program.cs već konfigurira DbContext sa ispravnim connection stringom
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Orders__3214EC076927A3B3");

            entity.Property(e => e.OrderDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Orders__UserId__403A8C7D");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__OrderIte__3214EC07FDA813DD");

            entity.Property(e => e.PriceAtTime).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__OrderItem__Order__440B1D61");

            entity.HasOne(d => d.Product).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__OrderItem__Produ__44FF419A");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Products__3214EC075CD4A033");

            entity.Property(e => e.Brand).HasMaxLength(50);
            entity.Property(e => e.IsForRent).HasDefaultValue(false);
            entity.Property(e => e.IsForSale).HasDefaultValue(false);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.PriceRentPerDay).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.PriceSale).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Resolution).HasMaxLength(50);
            entity.Property(e => e.SensorType).HasMaxLength(50);
            entity.Property(e => e.StockQuantity).HasDefaultValue(0);
        });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Reservat__3214EC07871BD7D2");

            entity.Property(e => e.EndDate).HasColumnType("datetime");
            entity.Property(e => e.StartDate).HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Pending");
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Product).WithMany(p => p.Reservations)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__Reservati__Produ__48CFD27E");

            entity.HasOne(d => d.User).WithMany(p => p.Reservations)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Reservati__UserI__47DBAE45");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3214EC07E2671596");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534F32A7C51").IsUnique();

            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.LastName).HasMaxLength(50);
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .HasDefaultValue("User");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
