# DomainX CMS Backend Server

A robust backend server with MVC architecture for managing DomainX CMS content using MongoDB.

## 🏗️ Architecture

This backend follows the **Model-View-Controller (MVC)** pattern:

- **Models** (`/models`): MongoDB schema definitions
- **Controllers** (`/controllers`): Business logic for handling requests
- **Routes** (`/routes`): API endpoint definitions
- **Config** (`/config`): Database and configuration files
- **Middleware** (`/middleware`): Error handling and other middleware

## 📁 Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   └── contentController.js # Content CRUD operations
├── middleware/
│   └── errorHandler.js      # Error handling middleware
├── models/
│   └── Content.js           # Content schema definition
├── routes/
│   └── contentRoutes.js     # API route definitions
├── .env                     # Environment variables (not in git)
├── .gitignore              # Git ignore file
├── package.json            # Dependencies and scripts
├── server.js               # Main application file
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

   - The `.env` file is already configured with your MongoDB connection
   - You can modify the PORT if needed (default: 5000)

4. Start the server:

**Development mode** (with auto-restart):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

## 📡 API Endpoints

### Content Endpoints

#### Get All Content

```http
GET /api/content
```

Returns all CMS content from the database.

#### Update All Content

```http
PUT /api/content
Content-Type: application/json

{
  "landing": { ... },
  "about": { ... },
  ...
}
```

#### Get Specific Section

```http
GET /api/content/:section
```

Example: `GET /api/content/landing`

#### Update Specific Section

```http
PUT /api/content/:section
Content-Type: application/json

{
  "title": "New Title",
  "subtitle": "New Subtitle"
}
```

#### Reset Content to Defaults

```http
POST /api/content/reset
```

### Health Check

```http
GET /api/health
```

Returns server status and timestamp.

## 🗄️ Database

- **Database Name**: `domainx_cms`
- **Collection**: `contents`
- **Connection**: MongoDB Atlas

The database automatically creates default content if none exists.

## 📊 Content Sections

The CMS manages the following sections:

1. **landing** - Landing page hero content
2. **about** - About us section
3. **selling** - Domain selling page
4. **registration** - Domain registration page
5. **pricing** - Domain pricing cards
6. **news** - News and events
7. **footer** - Footer links
8. **promo** - Promotional banner
9. **partners** - Trusted partners/brands
10. **faq** - Frequently asked questions

## 🔒 Security Notes

- Add authentication middleware for PUT/POST/DELETE routes in production
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints
- Add input validation and sanitization

## 🛠️ Development

### Adding New Sections

1. Update the Content model in `models/Content.js`
2. The controller automatically handles new sections
3. No route changes needed

### Testing the API

You can test the API using:

- **Postman** or **Insomnia**
- **curl** commands
- **Thunder Client** VS Code extension

Example curl command:

```bash
curl https://domainxserver.onrender.com/api/content
```

## 📝 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb+srv://mondalsubarna29:Su12345@cluster0.1kmazke.mongodb.net/domainx_cms?retryWrites=true&w=majority
NODE_ENV=development
```

## 🤝 Integration with Frontend

Update your React frontend to fetch from this backend instead of localStorage.

See the integration guide in the client folder for implementation details.

## 📄 License

ISC
