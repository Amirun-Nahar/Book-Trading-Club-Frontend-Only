import HomePageLayout from '@/components/layout/HomePageLayout';
import AddNewBook from '@/pages/Add Book/AddNewBook';
import About from '@/pages/About/About';
import BookDetails from '@/pages/Book Details/BookDetails';
import Browse from '@/pages/Browse/Browse';
import Contact from '@/pages/Contact/Contact';
import ForgotPassword from '@/pages/Forgot Password/ForgotPassword';
import Home from '@/pages/Home/Home';
import HowItWorks from '@/pages/How It Works/HowItWorks';
import Login from '@/pages/Login/Login';
import Register from '@/pages/Register/Register';

import FavouriteBooks from '@/pages/Wishlist/Wishlist';
import AroundMe from '@/pages/Map/AroundMe';
import { createBrowserRouter } from 'react-router';
import ErrorPage from '@/pages/ErrorPage/ErrorPage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Preorder from '@/pages/Preorder/Preorder';
import MyPreorders from '@/pages/Preorder/MyPreorders';

import Users from '@/pages/Dashboards/Admin/Users';
import AdminDashboard from '@/pages/Dashboards/Admin/AdminDashboard';
import UserProfile from '@/pages/Dashboards/Shared/UserProfile';
import DashboardHomePage from '@/pages/Dashboards/User/DashboardHomePage';
import MyBooks from '@/pages/Dashboards/Shared/MyBooks';
import MyCart from '@/pages/Dashboards/Shared/MyCart';
import MyOrders from '@/pages/Dashboards/Shared/MyOrders';
import PaymentSuccess from '@/pages/Dashboards/Shared/PaymentSuccess';
import PaymentFailure from '@/pages/Dashboards/Shared/PymentFailure';
import RequestedTrades from '@/pages/Dashboards/Shared/RequestedTrades';
import TradeRequests from '@/pages/Dashboards/Shared/TradeRequests';
import AcceptedTrades from '@/pages/Dashboards/Shared/AcceptedTrades';
import RejectedTrades from '@/pages/Dashboards/Shared/RejectedTrades';
import ChatUsersSidebar from '@/pages/Dashboards/Shared/ChatUsersSidebar';
import Chat from '@/pages/Dashboards/Shared/Chat';
import NoChatSelected from '@/pages/Dashboards/Shared/NoChatSelected';

const router = createBrowserRouter([
  {
    path: '/',
    Component: HomePageLayout,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: '/book/:id',
        Component: BookDetails,
      },
      {
        path: '/browse',
        Component: Browse,
      },
      {
        path: '/how-it-works',
        Component: HowItWorks,
      },
      {
        path: '/register',
        Component: Register,
      },
      {
        path: '/login',
        Component: Login,
      },
      {
        path: '/forget',
        Component: ForgotPassword,
      },
      {
        path: '/wishlist',
        Component: FavouriteBooks,
        // element: <h1>Favoourite</h1>,
      },
      {
        path: '/about',
        Component: About,
      },
      {
        path: '/add-book',
        Component: AddNewBook,
      },
      {
        path: '/contact',
        Component: Contact,
      },
      {
        path: '/around-me',
        Component: AroundMe,
      },
      {
        path: '/preorder',
        Component: Preorder,
      },
      {
        path: '/preorder/:id',
        Component: Preorder,
      },
      {
        path: '/preorders',
        Component: MyPreorders,
      },
    ],
  },
  {
    path: '/dashboard',
    Component: () => <DashboardLayout />,
    children: [
      {
        index: true,
        Component: DashboardHomePage,
      },
      {
        path: 'users',
        Component: Users,
      },
      {
        path: 'admin-dashboard',
        Component: AdminDashboard,
      },
      {
        path: 'chat',
        Component: ChatUsersSidebar,
        children: [
          { index: true, Component: NoChatSelected },
          { path: 'user-chats/:id', Component: Chat },
        ],
      },
      {
        path: 'myprofile',
        Component: UserProfile,
      },
      {
        path: 'mybooks',
        Component: MyBooks,
      },
      {
        path: 'my-cart',
        Component: MyCart,
      },
      {
        path: 'my-orders',
        Component: MyOrders,
      },
      {
        path: 'requested-trades',
        Component: RequestedTrades,
      },
      {
        path: 'trade-requests',
        Component: TradeRequests,
      },
      {
        path: 'accepted-trades',
        Component: AcceptedTrades,
      },
      {
        path: 'rejected-trades',
        Component: RejectedTrades,
      },
      {
        path: 'payment-success',
        Component: PaymentSuccess,
      },
      {
        path: 'payment-failure',
        Component: PaymentFailure,
      },
    ],
  },
]);

export default router;
