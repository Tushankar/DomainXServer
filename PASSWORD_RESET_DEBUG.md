# Password Reset Debugging Guide

## 🔍 Full Debugging Implementation Complete!

### What Was Added:

#### 1. **Password Reset Controller** (`passwordResetController.js`)

- ✅ Request body logging
- ✅ Email search logging
- ✅ User found/not found status
- ✅ Token generation logging
- ✅ Database save confirmation
- ✅ Environment variables check
- ✅ Detailed email error logging with full stack trace

#### 2. **Email Service** (`emailService.js`)

- ✅ Transporter creation logging
- ✅ Email credentials validation
- ✅ Reset URL logging
- ✅ Email sending status
- ✅ SMTP response logging
- ✅ Complete error details (name, message, code, response)

#### 3. **Test Endpoint**

- ✅ Added `/api/auth/test-email-config` to verify environment variables

---

## 🚀 How to Debug:

### Step 1: Test Email Configuration

Open your browser or Postman and visit:

```
http://localgost:5000/api/auth/test-email-config
```

This will show you:

- Is EMAIL_USER set?
- Is EMAIL_PASSWORD set?
- What is FRONTEND_URL?

### Step 2: Check Server Console

When you submit the forgot password form, your server console will show:

```
=== FORGOT PASSWORD REQUEST ===
Request body: { email: 'sahatushankar234@gmail.com' }
Email received: sahatushankar234@gmail.com
🔍 Searching for user with email: sahatushankar234@gmail.com
User found: Yes (ID: 507f1f77bcf86cd799439011)
🔐 Generating reset token...
Reset token generated (first 10 chars): a3f5c8e2d1
Hashed token (first 10 chars): 9b2a7f4e3c
💾 Saving token to database...
✅ Token saved successfully
📧 Attempting to send reset email to: sahatushankar234@gmail.com
Environment check:
  - EMAIL_USER: tirth...
  - EMAIL_PASSWORD: SET (hidden)
  - FRONTEND_URL: http://localhost:5173

=== CREATING EMAIL TRANSPORTER ===
Service: Gmail
Email User: tirtho.kyptronix@gmail.com
Email Password: SET (length: 19)
✅ Transporter created

=== SENDING PASSWORD RESET EMAIL ===
To: sahatushankar234@gmail.com
Token (first 10 chars): a3f5c8e2d1
Reset URL: http://localhost:5173/reset-password?token=a3f5c8e2d1...
📤 Sending email...
✅ Password reset email sent successfully!
Message ID: <abc123@gmail.com>
Response: 250 2.0.0 OK
```

### Step 3: If Email Fails

The console will show detailed error information:

```
❌ EMAIL ERROR - Clearing token from database

=== EMAIL ERROR DETAILS ===
Error name: Error
Error message: Invalid login: 535-5.7.8 Username and Password not accepted
Error code: EAUTH
SMTP Response: 535-5.7.8 Username and Password not accepted
Response code: 535
Full error: { ... full error object ... }
========================
```

---

## 🔧 Common Issues & Solutions:

### Issue 1: "Invalid login" or "Username and Password not accepted"

**Cause:** Gmail App Password is incorrect or not set

**Solution:**

1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Go to App Passwords
4. Generate a new password for "Mail"
5. Update `.env` file:
   ```
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```
   (use the 16-character password WITHOUT spaces)

### Issue 2: "User not found"

**Cause:** The email address doesn't exist in the database

**Solution:**

1. Check your admin user in MongoDB
2. Make sure the email matches exactly
3. Try logging in first to verify the account exists

### Issue 3: "EMAIL_USER not set" or "EMAIL_PASSWORD not set"

**Cause:** Environment variables are not loaded

**Solution:**

1. Check your `.env` file in the server directory
2. Make sure it has:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   FRONTEND_URL=http://localhost:5173
   ```
3. Restart the server after updating `.env`

### Issue 4: "Connection timeout" or "ETIMEDOUT"

**Cause:** Firewall or network blocking Gmail SMTP

**Solution:**

1. Check if port 587 or 465 is blocked
2. Try using port 465 with secure: true:
   ```javascript
   port: 465,
   secure: true,
   ```
3. Check your antivirus/firewall settings

---

## 📧 Email Configuration Details:

Current settings in `.env`:

```env
EMAIL_USER=tirtho.kyptronix@gmail.com
EMAIL_PASSWORD=kozi ozmn wtzn cuyg
FRONTEND_URL=http://localhost:5173
```

**Note:** The EMAIL_PASSWORD appears to be a Gmail App Password (with spaces).
In the code, it should work with or without spaces, but Gmail expects it without spaces.

---

## 🧪 Testing Steps:

1. **Start the server:**

   ```bash
   cd server
   npm start
   ```

2. **Check the console** for startup messages

3. **Visit test endpoint:**

   ```
   http://localgost:5000/api/auth/test-email-config
   ```

4. **Try forgot password** with a valid admin email

5. **Watch the server console** for detailed logs

6. **Check your email** (including spam folder)

---

## 📝 Expected Console Output (Success):

```
=== FORGOT PASSWORD REQUEST ===
✅ All validations passed
✅ Token saved successfully
✅ Email sent successfully!
```

## 📝 Expected Console Output (Failure):

```
❌ EMAIL ERROR - Clearing token from database
=== EMAIL ERROR DETAILS ===
[Detailed error information will be shown here]
```

---

## 🎯 Next Steps:

1. **Restart your server** to load the debugging code
2. **Try the forgot password feature** again
3. **Copy the full console output** and share it to identify the exact issue
4. **Check the test endpoint** to verify environment variables

The detailed logs will tell us exactly where the email sending is failing!
