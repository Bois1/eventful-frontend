# Eventful Frontend

A modern, responsive event management and ticketing platform built with React, TypeScript, and Vite. This application allows users to discover events, purchase tickets, and manage their event attendance with QR code-based verification.

## Features

### For Event Attendees (Eventees)

- **Browse Events**: Discover upcoming events with detailed information
- **Ticket Purchasing**: Secure payment processing via Paystack integration
- **Digital Tickets**: QR code-based tickets for easy event check-in
- **Ticket Management**: View, download, and manage purchased tickets
- **Payment Verification**: Real-time payment status tracking and verification
- **Payment Callbacks**: Automatic redirect and status updates after payment

### For Event Creators

- **Event Creation**: Create and publish events with detailed information
- **Event Management**: Edit, cancel, or complete events
- **Dashboard Analytics**: Track ticket sales, revenue, and attendance
- **Ticket Scanning**: QR code verification for event check-ins

### General Features

- **Authentication**: Secure user registration and login with role-based access
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Automatic ticket status synchronization
- **Error Handling**: Comprehensive error messages and user feedback

## Tech Stack

- **Framework**: React 18.2
- **Language**: TypeScript 5.2
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.4
- **State Management**: Redux Toolkit 2.0 & Zustand 4.4
- **Routing**: React Router DOM 6.21
- **HTTP Client**: Axios 1.6
- **Icons**: React Icons 4.12
- **QR Codes**: qrcode.react 3.2
- **Date Handling**: date-fns 3.0
- **Code Quality**: ESLint, Prettier

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A running backend API server
- Paystack account (for payment processing)

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd eventful-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   VITE_API_URL=your_api_url
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
   ```

   Replace the values with your actual configuration:
   - `VITE_API_URL`: Your backend API endpoint
   - `VITE_PAYSTACK_PUBLIC_KEY`: Your Paystack public key

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
eventful-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Common components (Header, Footer, etc.)
│   │   ├── events/         # Event-related components
│   │   └── tickets/        # Ticket-related components
│   ├── pages/              # Page components
│   │   ├── Home.tsx
│   │   ├── Events.tsx
│   │   ├── EventDetailPage.tsx
│   │   ├── CreateEvent.tsx
│   │   ├── Dashboard.tsx
│   │   ├── MyTickets.tsx
│   │   ├── PaymentCallback.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── services/           # API service layer
│   │   ├── api.ts          # Axios instance configuration
│   │   ├── authService.ts
│   │   ├── eventService.ts
│   │   ├── ticketService.ts
│   │   └── paymentService.ts
│   ├── store/              # Redux store configuration
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main app component
│   ├── routes.tsx          # Route definitions
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── .env                    # Environment variables
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Key Features Explained

### Payment Flow

1. User selects an event and clicks "Purchase Ticket"
2. A pending ticket is created in the system
3. Payment is initialized with Paystack
4. User is redirected to Paystack payment page
5. After payment, user is redirected to `/payment/callback`
6. The callback page verifies payment with Paystack
7. Ticket status is updated to "PAID" and QR code is generated
8. User is redirected to "My Tickets" page

### Ticket States

- **PENDING**: Ticket created, awaiting payment
- **PAID**: Payment confirmed, QR code available
- **SCANNED**: Ticket scanned at event entrance
- **CANCELLED**: Ticket cancelled by user

### Payment Verification

The application includes a robust payment verification system:

- Automatic webhook processing on the backend
- Manual "Verify Payment" button for users
- Polling mechanism to check ticket status updates
- Detailed error messages and status feedback

## UI/UX Features

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Loading States**: Skeleton loaders and spinners for better UX
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Visual confirmation for successful actions
- **Status Badges**: Color-coded badges for ticket and event statuses
- **QR Code Display**: Modal view with download functionality

## Authentication

The application uses JWT-based authentication:

- Tokens are stored in localStorage
- Automatic token refresh mechanism
- Protected routes for authenticated users
- Role-based access control (CREATOR vs EVENTEE)

## API Integration

All API calls are centralized in the `services/` directory:

- **authService**: Login, register, logout
- **eventService**: CRUD operations for events
- **ticketService**: Ticket purchase, retrieval, cancellation
- **paymentService**: Payment initialization and verification

## Development Tips

1. **Hot Module Replacement**: Vite provides instant HMR for fast development
2. **TypeScript**: Strict type checking helps catch errors early
3. **ESLint**: Run `npm run lint` before committing
4. **Prettier**: Format code with `npm run format`

## Production Build

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Preview the build**

   ```bash
   npm run preview
   ```

3. **Deploy**

   The `dist/` folder contains the production-ready files. Deploy to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

## Troubleshooting

### Payment not updating after successful payment

- Click "Verify Payment" button on the My Tickets page
- Wait 10-15 seconds for webhook processing
- Check browser console for errors
- Verify backend webhook endpoint is accessible

### QR Code not displaying

- Ensure payment status is "PAID"
- Refresh the tickets page
- Check if `qrCode` field exists in ticket data

### Build errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check TypeScript errors: `npm run build`

## Environment Variables

| Variable                   | Description          | Example                        |
| -------------------------- | -------------------- | ------------------------------ |
| `VITE_API_URL`             | Backend API base URL | `http://your_backend_url/api/v1` |
| `VITE_PAYSTACK_PUBLIC_KEY` | Paystack public key  | `pk_test_xxxxx`                |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions:

- Check existing issues in the repository
- Create a new issue with detailed information
- Contact the development team

## Future Enhancements

- [ ] Email notifications for ticket purchases
- [ ] Event reminders
- [ ] Social sharing features
- [ ] Advanced search and filtering
- [ ] Event categories and tags
- [ ] User profiles and preferences
- [ ] Multi-language support
- [ ] Dark mode toggle

---

Built with ❤️ using React and TypeScript
