# Backend Integration Guide - DigiCams

Ovaj dokument sadrži detaljne instrukcije za integraciju frontenda sa backendom.

## 📋 Pregled Backend Kontrolera

### 1. AuthController.cs
**Lokacija:** `Controllers/AuthController.cs`

**Endpoints:**
- `POST /api/auth/register` - Registracija novog korisnika
- `POST /api/auth/login` - Prijava korisnika

**Potrebni Paketi:**
```bash
dotnet add package BCrypt.Net-Next
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package System.IdentityModel.Tokens.Jwt
```

### 2. ProductsController.cs (Enhanced)
**Lokacija:** `Controllers/ProductsController.cs`

**Endpoints:**
- `GET /api/products` - Svi proizvodi
- `GET /api/products/{id}` - Detalji proizvoda
- `GET /api/products/sale` - Proizvodi za prodaju
- `GET /api/products/rent` - Proizvodi za iznajmljivanje
- `POST /api/products` - Kreiranje proizvoda
- `PUT /api/products/{id}` - Ažuriranje proizvoda
- `DELETE /api/products/{id}` - Brisanje proizvoda

### 3. OrdersController.cs
**Lokacija:** `Controllers/OrdersController.cs`

**Endpoints:**
- `GET /api/orders` - Sve porudžbine (Admin/Seller)
- `GET /api/orders/my` - Moje porudžbine
- `GET /api/orders/{id}` - Detalji porudžbine
- `POST /api/orders` - Kreiranje porudžbine

### 4. ReservationsController.cs
**Lokacija:** `Controllers/ReservationsController.cs`

**Endpoints:**
- `GET /api/reservations` - Sve rezervacije (Admin/Seller)
- `GET /api/reservations/my` - Moje rezervacije
- `GET /api/reservations/availability/{productId}` - Provera dostupnosti
- `POST /api/reservations` - Kreiranje rezervacije
- `PUT /api/reservations/{id}/cancel` - Otkazivanje rezervacije

### 5. UsersController.cs
**Lokacija:** `Controllers/UsersController.cs`

**Endpoints:**
- `GET /api/users` - Svi korisnici (Admin)
- `GET /api/users/{id}` - Detalji korisnika
- `PUT /api/users/profile` - Ažuriranje profila
- `PUT /api/users/{id}` - Ažuriranje korisnika (Admin)
- `DELETE /api/users/{id}` - Brisanje korisnika (Admin)

## 🔧 Koraci za Integraciju

### Korak 1: Kopiraj Kontrolere

```bash
# Kopiraj sve kontrolere iz BACKEND_CONTROLLERS/ u tvoj Controllers folder
cp BACKEND_CONTROLLERS/AuthController.cs DigiCams.Api/DigiCams.Api/Controllers/
cp BACKEND_CONTROLLERS/OrdersController.cs DigiCams.Api/DigiCams.Api/Controllers/
cp BACKEND_CONTROLLERS/ReservationsController.cs DigiCams.Api/DigiCams.Api/Controllers/
cp BACKEND_CONTROLLERS/UsersController.cs DigiCams.Api/DigiCams.Api/Controllers/

# Zameni postojeći ProductsController sa enhanced verzijom
cp BACKEND_CONTROLLERS/ProductsController_Enhanced.cs DigiCams.Api/DigiCams.Api/Controllers/ProductsController.cs
```

### Korak 2: Instaliraj NuGet Pakete

```bash
cd DigiCams.Api/DigiCams.Api
dotnet add package BCrypt.Net-Next
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package System.IdentityModel.Tokens.Jwt
```

### Korak 3: Ažuriraj Program.cs

Zameni postojeći `Program.cs` sa sledećim kodom:

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DigiCams.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<DigiCamsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "your-super-secret-jwt-key-that-is-at-least-32-characters-long";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReact");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

### Korak 4: Ažuriraj appsettings.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DigiCamsDb;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "your-super-secret-jwt-key-that-is-at-least-32-characters-long"
  }
}
```

### Korak 5: Migracije (ako je potrebno)

```bash
# Ako imaš promene u modelima
dotnet ef migrations add AddAuthAndEnhancements
dotnet ef database update
```

## 🧪 Testiranje API-ja

### Test Registracije
```bash
curl -X POST https://localhost:7139/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@test.com",
    "password": "test123",
    "role": "User"
  }'
```

### Test Prijave
```bash
curl -X POST https://localhost:7139/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123"
  }'
```

### Test Kreiranja Proizvoda (sa JWT tokenom)
```bash
curl -X POST https://localhost:7139/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Canon EOS R5",
    "brand": "Canon",
    "description": "Professional mirrorless camera",
    "isForSale": true,
    "priceSale": 150000,
    "stockQuantity": 5,
    "isForRent": true,
    "priceRentPerDay": 5000,
    "resolution": "45 MP",
    "sensorType": "Full Frame"
  }'
```

## 🔒 Authorization

Kontroleri koriste JWT authentication. Frontend automatski dodaje token u sve zahteve kroz axios interceptor.

**Token se dobija pri login-u i čuva u localStorage.**

### Zaštita Ruta

Backend automatski proverava token za zaštićene endpoint-e. Korisnik mora biti prijavljen (imati validan token) za:

- Kreiranje/ažuriranje/brisanje proizvoda
- Kreiranje porudžbina
- Kreiranje rezervacija
- Pristup ličnim podacima

## 🐛 Debugging

### Provera JWT Tokena
1. Prijavi se na frontend
2. Otvori Browser DevTools → Application → Local Storage
3. Proveri da postoji `token` key

### CORS Problemi
Ako vidiš CORS greške:
1. Proveri da je `app.UseCors("AllowReact")` pozvan PRE `app.UseAuthorization()`
2. Proveri da backend radi na `https://localhost:7139`
3. Proveri proxy konfiguraciju u `vite.config.js`

### 401 Unauthorized
- Proveri da je token validan
- Proveri da nije expired (default: 7 dana)
- Proveri Jwt:Key u appsettings.json

## 📊 Database Seed Data (Optional)

Možeš kreirati seed data za testiranje:

```csharp
// U Program.cs posle app.Build()
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<DigiCamsDbContext>();
    
    // Seed Admin User
    if (!context.Users.Any())
    {
        context.Users.Add(new User
        {
            FirstName = "Admin",
            LastName = "User",
            Email = "admin@digicams.rs",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = "Admin"
        });
        
        context.SaveChanges();
    }
}
```

## ✅ Checklist Pre Pokretanja

- [ ] Svi kontroleri kopirani
- [ ] NuGet paketi instalirani
- [ ] Program.cs ažuriran
- [ ] appsettings.json ažuriran
- [ ] Database kreirana/updatovana
- [ ] Backend radi na https://localhost:7139
- [ ] Frontend radi na http://localhost:3000
- [ ] CORS pravilno konfigurisan
- [ ] JWT authentication radi
- [ ] Test korisnik kreiran

## 🎉 Gotovo!

Sada bi trebalo da imaš potpuno funkcionalan full-stack projekat!

Za dodatnu pomoć, pogledaj README.md u glavnom folderu.
