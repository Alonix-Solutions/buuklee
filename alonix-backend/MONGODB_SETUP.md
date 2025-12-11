# MongoDB Connection Setup

## Connection String
The MongoDB connection string has been configured:

```
mongodb+srv://pascalgihozo:Ailey@123@alonix-cluster.nc856v9.mongodb.net/alonix?retryWrites=true&w=majority
```

## Fixed Issues

### 1. Duplicate Index Warnings ✅
- **User.js**: Removed duplicate `email` index (already has `unique: true`)
- **Booking.js**: Removed duplicate `bookingReference` index (already has `unique: true`)

### 2. Deprecated Options ✅
- Removed `useNewUrlParser: true` (deprecated in Mongoose 6+)
- Removed `useUnifiedTopology: true` (deprecated in Mongoose 6+)

### 3. Connection String ✅
- Added default connection string in `server.js`
- Created `.env` file with connection string

## Environment Variables

The `.env` file should contain:

```env
MONGODB_URI=mongodb+srv://pascalgihozo:Ailey@123@alonix-cluster.nc856v9.mongodb.net/alonix?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
FRONTEND_URL=*
```

## Important Notes

1. **IP Whitelisting**: Make sure your current IP address is whitelisted in MongoDB Atlas
   - Go to: https://www.mongodb.com/docs/atlas/security-whitelist/
   - Add your current IP or use `0.0.0.0/0` for development (not recommended for production)

2. **Database Name**: The connection string uses database name `alonix`

3. **Connection Options**:
   - `retryWrites=true`: Enables retryable writes
   - `w=majority`: Write concern for data durability

## Testing Connection

Start the server:
```bash
cd alonix-backend
npm start
```

You should see:
```
✅ MongoDB connected successfully
🚀 Alonix Backend Server running on port 3000
```

If you see connection errors, check:
1. IP whitelist in MongoDB Atlas
2. Username/password are correct
3. Network connectivity

