# StoreHub

StoreHub is a multi-tenant SaaS dashboard for managing products, orders, users, and payments. It is designed for organisations to efficiently handle their e-commerce operations with role-based access and secure, tenant-aware data management.

---

## Features

- **Multi-Tenant Support:** Each organisation (tenant) has isolated data and user management.
- **Role-Based Access:** Manager, Admin, and User roles with different permissions.
- **Product Management:** Add, update, delete, and search products within your organisation.
- **Cart & Orders:** Full shopping cart and order lifecycle, including payment integration.
- **Payment Integration:** Secure payments via Razorpay.
- **Google Authentication:** Easy sign-in for users via Google.
- **Invitations:** Invite admins/managers to your organisation.
- **Organisation Management:** Create and manage your own organisation.

---

## Folder Structure

```
storehub
├── client                  # React frontend
│   ├── public              # Public files
│   └── src                 # Source files
│       ├── components      # React components
│       ├── pages           # Page components
│       ├── App.js          # Main app component
│       └── index.js        # Entry point
└── server                  # Node.js backend
    ├── config              # Configuration files
    ├── controllers         # Request handlers
    ├── middleware          # Custom middleware
    ├── models              # Database models
    ├── routes              # API routes
    ├── utils               # Utility functions
    ├── .env                 # Environment variables
    ├── server.js           # Entry point
    └── readMe.md          # API documentation
```

---

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT, Google OAuth
- **Payments:** Razorpay

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB (local or Atlas)
- Yarn or npm

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/storehub.git
   cd storehub
   ```

2. **Install dependencies:**

   ```bash
   cd server
   npm install
   cd ../client
   npm install
   ```

3. **Set up environment variables:**

   - In `/client/.env`:

     ```
     REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key
     REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
     REACT_APP_API_URL=http://localhost:5000
     ```

   - In `/server/.env` (create if not present):
     ```
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     RAZORPAY_KEY_ID=your_razorpay_key
     RAZORPAY_KEY_SECRET=your_razorpay_secret
     ```

4. **Run the backend:**

   ```bash
   cd server
   npm start
   ```

5. **Run the frontend:**
   ```bash
   cd client
   npm start
   ```

---

## API Documentation

See [`server/readMe.md`](server/readMe.md) for a full list of backend API endpoints, request/response formats, and usage examples.

---

## Example Environment Variables

```env
# client/.env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xgNLv2zezQcyOj
REACT_APP_GOOGLE_CLIENT_ID=902082469942-icf65i6oiieebmuptvcmvdktm7lfr1a0.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:5000

# server/.env
MONGO_URI=mongodb://localhost:27017/storehub
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

---

## License

This project is licensed under the MIT License.

---

## Contact

For questions or support, please contact
