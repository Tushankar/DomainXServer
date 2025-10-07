# 🧪 Quick Email Test Guide

## Test Your Email Configuration in 30 Seconds!

### Step 1: Open Terminal in Server Directory
```bash
cd "c:\Users\SUBARNA MONDAL\Desktop\New folder (10)\new\server"
```

### Step 2: Run the Test Script
```bash
node test-email.js
```

### Step 3: Check the Output

#### ✅ If Successful:
You'll see:
```
✅ EMAIL SENT SUCCESSFULLY!
Message ID: <abc123@gmail.com>
📬 Check your inbox at: tirtho.kyptronix@gmail.com
```

#### ❌ If Failed:
You'll see detailed error information with solutions.

---

## Common Errors & Quick Fixes:

### Error: "Invalid login: 535-5.7.8"
**Problem:** Wrong Gmail App Password

**Fix:**
1. Remove spaces from the password in `.env`
2. Current: `EMAIL_PASSWORD=kozi ozmn wtzn cuyg`
3. Change to: `EMAIL_PASSWORD=koziozmnwtzncy`
   (remove ALL spaces)

### Error: "EMAIL_USER: ❌ NOT SET"
**Problem:** Environment variables not loaded

**Fix:**
1. Make sure `.env` file exists in server directory
2. Restart the terminal/server

### Error: "Connection timeout"
**Problem:** Network/firewall blocking

**Fix:**
1. Disable firewall temporarily
2. Try using a different network
3. Check if port 587 is open

---

## 🎯 After Testing:

1. If test email succeeds → Your password reset will work!
2. If test email fails → Fix the issue shown in error message
3. Restart your server after any changes to `.env`

---

## 🔄 Quick Commands:

```bash
# Test email
node test-email.js

# Check environment variables
node -e "require('dotenv').config(); console.log(process.env.EMAIL_USER, process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET')"

# Start server with logs
npm start
```
