# QuickDine – Multi-Restaurant Booking Platform

QuickDine is a full-stack restaurant discovery and table reservation platform built to simplify the dining experience. Users can explore restaurants, check seat availability, and manage reservations, while restaurant owners can manage their venues and bookings.

## Features

### For Diners
- Browse and discover restaurants.
- Search and filter restaurants by location, cuisine, price range, and rating.
- Check seat availability for selected dates and time slots.
- Make table reservations with occasion and special requests.
- View and manage bookings.

### For Restaurant Owners
- Register and manage restaurant profiles.
- Submit restaurants for admin approval.
- Manage restaurant information and available time slots.
- View and manage incoming reservations.

### For Administrators
- Review restaurant registration requests.
- Approve or reject restaurant listings.
- Access administrative management features.

## Tech Stack

**Frontend**
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Lucide React
- React Hot Toast

**Backend**
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt

## Project Structure

```text
quick_dine/
├── Client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── config/
│   ├── server.ts
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js
- npm
- MongoDB database

### 1. Clone the Repository

```bash
git clone https://github.com/rashika-mitt/quick_dine.git
cd quick_dine
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend:

```bash
npm run server
```

The backend runs at:

`http://localhost:5000`

### 3. Setup Frontend

Open a new terminal:

```bash
cd Client
npm install
```

Create a `.env` file inside the `Client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Production Build

Inside the Client directory, run:

```bash
npm run build
```

## Future Improvements
- Online payment integration.
- Email and booking notifications.
- Enhanced reservation management.

## Author

**Rashika Mittal**

- GitHub: https://github.com/rashika-mitt
- LinkedIn: https://www.linkedin.com/in/rashika-mittal-3a8058451/
