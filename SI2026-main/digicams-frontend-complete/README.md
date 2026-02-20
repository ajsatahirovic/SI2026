# DigiCams - Platforma za Iznajmljivanje i Prodaju Fotoaparata

Kompletan full-stack projekat za iznajmljivanje i prodaju foto opreme.

## 🚀 Tehnologije

### Frontend
- **React 18** + Vite
- **React Router** - Rutiranje
- **Axios** - HTTP klijent
- **Tailwind CSS** - Styling
- **Lucide React** - Ikone
- **date-fns** - Rad sa datumima

### Backend
- **.NET 8** Web API
- **Entity Framework Core**
- **SQL Server**
- **JWT Authentication**
- **BCrypt** - Heširanje lozinki

## 📁 Struktura Projekta

```
DigiCams/
├── digicams-frontend-complete/    # React frontend
│   ├── src/
│   │   ├── components/           # Komponente (Navbar, Footer)
│   │   ├── context/              # Context API (Auth, Cart)
│   │   ├── pages/                # Stranice
│   │   ├── services/             # API servisi
│   │   ├── App.jsx              # Glavna aplikacija
│   │   └── main.jsx             # Entry point
│   └── package.json
│
├── DigiCams.Api/                 # .NET Backend
│   ├── Controllers/              # API kontroleri
│   ├── Models/                   # Database modeli
│   └── Program.cs
│
└── BACKEND_CONTROLLERS/          # Dodatni kontroleri za dodavanje
    ├── AuthController.cs
    ├── OrdersController.cs
    ├── ReservationsController.cs
    └── UsersController.cs
```

## 🎯 Funkcionalnosti

### Za Goste
- ✅ Pregled proizvoda (prodaja i iznajmljivanje)
- ✅ Detaljan prikaz proizvoda sa specifikacijama
- ✅ Registracija novog naloga

### Za Registrovane Korisnike
- ✅ Sve funkcionalnosti gosta +
- ✅ Kupovina proizvoda (dodavanje u korpu, checkout)
- ✅ Rezervacija opreme za iznajmljivanje
- ✅ Kalendar dostupnosti
- ✅ Pregled svojih porudžbina
- ✅ Pregled i otkazivanje rezervacija
- ✅ Uređivanje profila

### Za Prodavce
- ✅ Sve funkcionalnosti korisnika +
- ✅ Dodavanje novih proizvoda
- ✅ Uređivanje postojećih proizvoda
- ✅ Brisanje proizvoda
- ✅ Pregled svih porudžbina
- ✅ Pregled svih rezervacija

### Za Administratore
- ✅ Sve funkcionalnosti prodavca +
- ✅ Upravljanje korisničkim nalozima
- ✅ Brisanje korisnika
- ✅ Pregled svih aktivnosti

## 🛠️ Instalacija i Pokretanje

### 1. Backend Setup

#### A. Dodaj nove kontrolere

Kopiraj sve fajlove iz `BACKEND_CONTROLLERS/` foldera u `DigiCams.Api/Controllers/`:

```bash
cp BACKEND_CONTROLLERS/*.cs DigiCams.Api/DigiCams.Api/Controllers/
```

#### B. Instaliraj dodatne pakete

```bash
cd DigiCams.Api/DigiCams.Api
dotnet add package BCrypt.Net-Next
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package System.IdentityModel.Tokens.Jwt
```

#### C. Ažuriraj Program.cs

Dodaj JWT autentifikaciju u `Program.cs`:

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// Posle builder.Services.AddDbContext...

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"] ?? "your-secret-key-min-32-characters-long")),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// Posle app.UseCors...
app.UseAuthentication();
app.UseAuthorization();
```

#### D. Ažuriraj appsettings.json

Dodaj JWT konfiguraciju:

```json
{
  "Jwt": {
    "Key": "your-super-secret-jwt-key-that-is-at-least-32-characters-long"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DigiCamsDb;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

#### E. Pokreni Backend

```bash
cd DigiCams.Api/DigiCams.Api
dotnet run
```

Backend će biti dostupan na: `https://localhost:7139`

### 2. Frontend Setup

#### A. Instaliraj dependencije

```bash
cd digicams-frontend-complete
npm install
```

#### B. Pokreni Development Server

```bash
npm run dev
```

Frontend će biti dostupan na: `http://localhost:3000`

## 🗄️ Database

Ako database nije kreirana, pokreni migracije:

```bash
cd DigiCams.Api/DigiCams.Api
dotnet ef database update
```

### Test Korisnici

Možeš kreirati test korisnike kroz registraciju ili direktno u bazi:

**Admin:**
- Email: admin@digicams.rs
- Password: admin123
- Role: Admin

**Seller:**
- Email: seller@digicams.rs
- Password: seller123
- Role: Seller

**User:**
- Email: user@digicams.rs
- Password: user123
- Role: User

## 📱 Korišćenje Aplikacije

1. **Registruj se** kao novi korisnik
2. **Pregledaj proizvode** - filtriraj po brendu, ceni, tipu senzora
3. **Kupovina**:
   - Dodaj proizvode u korpu
   - Idi na checkout
   - Potvrdi porudžbinu
4. **Iznajmljivanje**:
   - Otvori detalje proizvoda za rent
   - Odaberi datum početka i kraja na kalendaru
   - Potvrdi rezervaciju
5. **Dashboard** (za Seller/Admin):
   - Dodaj nove proizvode
   - Uredi postojeće
   - Pregledaj sve porudžbine i rezervacije

## 🎨 Dizajn

- Moderan i čist UI dizajn
- Potpuno responsivan (mobile, tablet, desktop)
- Smooth animacije i transitions
- Intuitivna navigacija
- Brand color: Primary Blue (#0ea5e9)

## 🔒 Autentifikacija

- JWT token-based authentication
- Role-based access control (Guest, User, Seller, Admin)
- Zaštićene rute
- Token stored in localStorage

## 📊 Database Schema

```
Users
├── Id (PK)
├── FirstName
├── LastName
├── Email (unique)
├── PasswordHash
└── Role (User/Seller/Admin)

Products
├── Id (PK)
├── Name
├── Description
├── Brand
├── ImageUrl
├── IsForSale
├── PriceSale
├── StockQuantity
├── IsForRent
├── PriceRentPerDay
├── Resolution
└── SensorType

Orders
├── Id (PK)
├── UserId (FK)
├── OrderDate
└── TotalAmount

OrderItems
├── Id (PK)
├── OrderId (FK)
├── ProductId (FK)
├── Quantity
└── PriceAtTime

Reservations
├── Id (PK)
├── UserId (FK)
├── ProductId (FK)
├── StartDate
├── EndDate
├── TotalPrice
└── Status
```

## 🚨 Troubleshooting

### CORS Errors
Proveri da je CORS pravilno konfigurisan u `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

app.UseCors("AllowReact");
```

### Port Conflicts
Promeni portove u:
- Backend: `Properties/launchSettings.json`
- Frontend: `vite.config.js`

### Database Connection
Proveri connection string u `appsettings.json`

## 📝 Napomene

- Aplikacija je kreirana za univerzitetski projekat
- Svi API endpoints su funkcionalni
- Frontend je kompletno implementiran
- Dizajn je moderan i profesionalan
- Kod je dobro organizovan i komentarisan

## 🎓 Projekat

**Naziv:** DigiCams - Platforma za Iznajmljivanje i Prodaju Fotoaparata  
**Student:** [Tvoje Ime]  
**Univerzitet:** [Tvoj Univerzitet]  
**Godina:** 2026

## 📄 Licenca

Ovo je edukativni projekat namenjen za univerzitetsku upotrebu.
