# Rentify Backend 

## Introduction
  A comprehensive platform that bridges the gap between property owners and tenants, making it easier for owners to list properties and tenants to find the right home based on key preferences.

## Backend Features Breakdown

### Authentication System:
- Implemented a robust and secure Login & Signup flow using JWT tokens and password encryption. 
- The system handles user registration, login, logout, account updates, profile picture uploads via Cloudinary, and secure password management, ensuring users’ data remains safe.

### Seller Flow: Designed a powerful seller module where property owners can:
- Create, update, and delete property ads.
- View their active and inactive listings based on the property’s status.
- Manage properties by type (Rent or Sell), providing flexibility and control over their listings.

### Buyer Flow: Built an intuitive buyer module where users can:
- Browse all properties for Rent or Sale.
- Apply detailed filters such as type (Rent/Sell), rent price, sale price, sort by oldest/newest posts, and more.
- Implemented pagination to optimize the browsing experience for users, making it easier to navigate through a large number of listings.

### Extra Features:
- Buyers can "like" properties and view a curated list of their favorite listings.
- Property images and user profile pictures are seamlessly handled through Cloudinary for efficient media management.

## Architecture:
- Implemented MVC (Model-View-Controller) to ensure a clean separation of concerns, making the codebase modular, maintainable, and scalable.

- Optimized pagination on buyer-side property filters for enhanced performance and smoother user navigation.

## Technologies Used:
- Node.js – for creating an efficient, non-blocking backend.
- Express.js – managing routes and API functionality.
- MongoDB – a NoSQL database ensuring flexibility and fast retrieval of property listings.
- Cloudinary – for handling image uploads and storage.
- MVC Architecture – for maintainable, scalable code structure.
