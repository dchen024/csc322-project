# BidBay - Online Auction Platform
CSC 33200 Software Engineering Project - Fall 2023  
City College of New York

[LOGO PLACEHOLDER]

## Overview
BidBay is a modern online auction platform where users can list items for sale and participate in real-time bidding. Built with Next.js and Supabase, it provides a seamless experience for buyers and sellers.

## Features

### User Authentication
- Secure sign-up and login
- Profile management with ratings

<img src = "public/Screenshot 2024-12-06 at 9.26.49 PM.png
" alt = "image of login page">

### Auction Management
- Create and manage auction listings
- Upload multiple images
- Set starting bids and auction duration
- Real-time bid updates

<img src = "public/Screenshot 2024-12-06 at 9.28.54 PM.png" alt= "image of posting page>

### Bidding System
- Real-time bidding
- Automatic bid validation
- Outbid notifications
- Auction countdown timer

<img src = "public/Screenshot 2024-12-06 at 9.29.58 PM.png" alt = "image of bid entry">

### Search & Filters
- Search by keyword
- Filter by price range
- Filter by auction status
- Sort by various criteria

<img src = "public/Screenshot 2024-12-06 at 9.31.36 PM.png" alt = "picture of filtering and searching">

### Payment Integration
- Secure checkout process
- Multiple payment methods
- Order confirmation
- Transaction history

<img src = "public/Screenshot 2024-12-06 at 9.39.01 PM.png" alt = "picture of checkout">

## Tech Stack
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Backend: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- Storage: Supabase Storage Buckets
- Deployment: Vercel

## Installation

1. Clone the repository
```bash
git clone https://github.com/dchen024/csc322-project
```
2. Install dependencies
```bash
npm install
```
3. Set up environment variables (fill them in!)
```txt
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```
4. Start the development server
```bash
npm run dev
```

Team Members
Evan Haque - Frontend Developer

License
This project is part of the CSC 33200 Software Engineering course and is for educational purposes only. ```

