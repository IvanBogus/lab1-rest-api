# Lab 3 Auth API Testing

## 1. Start the Backend

Install dependencies:

```bash
npm install
```

Start MySQL, create the StudentLab database, then run the existing schema if needed:

```bash
mysql -u root -p < sql/schema.sql
```

Start the API:

```bash
npm start
```

Base URL:

```text
http://localhost:3000
```

## 2. Required Environment Variables

Create `.env` from `.env.example`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=studentlab_db
PORT=3000
JWT_ACCESS_SECRET=change_this_access_secret
JWT_REFRESH_SECRET=change_this_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCK_MINUTES=15
```

The `users` table is created automatically through Sequelize when the server starts.

## 3. Testing Order

### Register User

`POST /api/auth/register`

```json
{
  "name": "Ivan Student",
  "email": "ivan.student@studentlab.ua",
  "password": "password123",
  "passwordConfirmation": "password123",
  "role": "user"
}
```

Expected success: `201 Created`, user data, `accessToken`, `refreshToken`, and `emailConfirmationToken`.

Expected validation error:

```json
{
  "message": "Validation error",
  "errors": ["password confirmation does not match"]
}
```

### Register Admin

`POST /api/auth/register`

```json
{
  "name": "StudentLab Admin",
  "email": "admin@studentlab.ua",
  "password": "password123",
  "passwordConfirmation": "password123",
  "role": "admin"
}
```

Use the admin `accessToken` for admin-only user deletion tests.

### Confirm Email

`POST /api/auth/confirm-email`

```json
{
  "token": "PASTE_EMAIL_CONFIRMATION_TOKEN_HERE"
}
```

Expected success: `200 OK`, message `Email confirmed successfully`.

### Login User

`POST /api/auth/login`

```json
{
  "email": "ivan.student@studentlab.ua",
  "password": "password123"
}
```

Expected success: `200 OK`, user data, `accessToken`, and `refreshToken`.

Wrong password response: `401 Unauthorized`.

After too many wrong passwords, expected response: `429 Too Many Requests`.

### Access Protected Profile Route

`GET /api/auth/profile`

Header:

```text
Authorization: Bearer PASTE_ACCESS_TOKEN_HERE
```

Expected success: `200 OK` with current user data.

Wrong or missing token response: `401 Unauthorized`.

### Refresh Token

`POST /api/auth/refresh`

```json
{
  "refreshToken": "PASTE_REFRESH_TOKEN_HERE"
}
```

Expected success: new `accessToken` and new `refreshToken`.

Old refresh tokens become invalid after refresh.

### Update Profile

`PUT /api/auth/profile`

Header:

```text
Authorization: Bearer PASTE_ACCESS_TOKEN_HERE
```

Body:

```json
{
  "name": "Ivan Updated",
  "email": "ivan.updated@studentlab.ua"
}
```

Expected success: updated user data. Email changes set `email_confirmed` back to `false`.

### Change Password

`PUT /api/auth/change-password`

Header:

```text
Authorization: Bearer PASTE_ACCESS_TOKEN_HERE
```

Body:

```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123",
  "newPasswordConfirmation": "newpassword123"
}
```

Expected success: `Password changed successfully. Please login again.`

Then login again with the new password.

### Logout

`POST /api/auth/logout`

Header:

```text
Authorization: Bearer PASTE_ACCESS_TOKEN_HERE
```

Expected success: `Logout successful`.

Try `/api/auth/refresh` with the old refresh token after logout. Expected response: `401 Unauthorized`.

### Admin/User Role Check

`DELETE /api/auth/users/USER_ID`

Header:

```text
Authorization: Bearer ADMIN_ACCESS_TOKEN_HERE
```

Expected success for admin: `User deleted successfully`.

Expected response for regular user: `403 Forbidden`.

### Password Recovery

`POST /api/auth/forgot-password`

```json
{
  "email": "ivan.updated@studentlab.ua"
}
```

Expected success: recovery message and `resetPasswordToken` for lab testing.

### Google Login Demo

This is a simplified lab endpoint, not a production Google OAuth exchange.

`POST /api/auth/google`

```json
{
  "email": "google.user@studentlab.ua",
  "name": "Google User",
  "googleId": "google-demo-id-123"
}
```

Expected success: user data, `accessToken`, and `refreshToken`.

## 4. Existing StudentLab Routes

These routes should still work:

```text
GET /api/sequelize/groups
GET /api/sequelize/students
POST /api/sequelize/students
PUT /api/sequelize/students/:id
DELETE /api/sequelize/students/:id
```

They remain separate from auth so previous lab functionality is not broken.
