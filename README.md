# MaxERP - Leave Management System

A SaaS HR platform for managing employee leave requests with role-based access control.

## 🚀 Quick Start

### Backend Setup

```bash
cd Server
npm i
docker run -d -p 6379:6379 redis:alpine
bash setup.sh
npm run start:dev
```

### Frontend Setup

```bash
cd Client
npm i
npm run dev
```

## 📋 Features

- **Employee Dashboard**: Apply for leave, view history, check balance
- **Manager Dashboard**: Approve/reject requests, view statistics
- **Real-time Balance**: Dynamic leave balance calculation
- **Role-based Access**: Separate interfaces for employees and managers

## 🔑 Sample Users

**Employee**: john.doe@company.com / password123  
**Manager**: mike.johnson@company.com / password123

## 🧪 Testing & Documentation

### Backend Tests
```bash
cd Server
npm run test
```

### Generate API Documentation
```bash
cd Server
npm run start:docs
```

## 🌐 Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:4001
- API Docs: http://localhost:4001/api/docs
