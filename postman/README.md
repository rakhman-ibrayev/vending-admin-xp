# PharmExpress Admin API - Postman Collection

This directory contains Postman collections and environments for testing the PharmExpress Vending Machine Administration API.

## 📋 What's Included

- **Collection**: `Vending_Admin_API.postman_collection.json` - Complete API endpoints
- **Environments**:
  - `Local_Development.postman_environment.json` - For local testing
  - `Development.postman_environment.json` - For dev environment
  - `Production.postman_environment.json` - For production

## 🚀 Quick Start

### 1. Import Collection & Environment

1. Open Postman
2. Click **Import** button
3. Import `Vending_Admin_API.postman_collection.json`
4. Import `Local_Development.postman_environment.json`
5. Select "Local Development" environment

### 2. Start Your Local Server

```bash
pnpm dev
```

### 3. Test Authentication

1. Run the **"Login"** request in the Authentication folder
2. The access token will be automatically saved to the environment
3. All subsequent requests will use this token

## 📚 API Endpoints

### Authentication
- **POST** `/api/auth/login` - Sign in with email/password
- **POST** `/api/auth/logout` - Sign out
- **POST** `/api/auth/confirm` - Confirm email with OTP

### Core API
- **GET** `/api/health` - Health check
- **POST** `/api/products` - Update product stock (1C sync)
- **GET** `/api/orders` - Get sales data with date filters

### Machines
- **GET** `/api/machines/{serial_number}` - Machine info
- **GET** `/api/machines/{serial_number}/products` - Machine products
- **GET** `/api/machines/{serial_number}/orders` - Machine orders

### Kaspi Integration
- **GET** `/api/kaspi?command=check` - Check payment status
- **GET** `/api/kaspi?command=pay` - Process payment

## 🔐 Authentication

The collection uses **Bearer Token** authentication:

1. Login request automatically saves `access_token` to environment
2. All protected endpoints use `{{access_token}}` variable
3. Token expires - just run Login again

## 🌍 Environments

### Local Development
- **URL**: `http://localhost:3000`
- **Usage**: Local testing during development

### Development
- **URL**: `https://admin-dev.expresspharm.kz`
- **Usage**: Testing against dev deployment

### Production
- **URL**: `https://admin.expresspharm.kz`
- **Usage**: Testing against production (be careful!)

## 📝 Test Credentials

For local testing with seeded data:

```json
{
  "email": "user@mail.com",
  "password": "Qwerty123"
}
```

## 🔄 Keeping Updated

When you add new API endpoints:

1. Update the collection JSON file
2. Commit changes to version control
3. Team members can pull latest collection

## 🐛 Troubleshooting

### Token Expired
- Run the Login request again
- Token will be refreshed automatically

### Environment Variables
- Check that `{{base_url}}` and `{{access_token}}` are set
- Switch environments if testing different deployments

### 401 Unauthorized
- Make sure you've run Login first
- Check that RLS policies are enabled on your tables

## 📞 Support

For API questions, check the route handler comments in the codebase.