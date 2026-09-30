import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import CreateProduct from "../features/products/pages/CreateProduct";
import Dashboard from "../features/products/pages/Dashboard";
import Protected from "../features/auth/components/Protected";
import Home from "../features/products/pages/Home";
import ProductDetail from "../features/products/pages/ProductDetail";
import SellerProductDetails from "../features/products/pages/SellerProductDetails";
import AppLayout from "./AppLayout";
import OrderSuccess from "../features/cart/pages/OrderReceipt";
import Account from "../features/auth/pages/Account";
import Wishlist from "../features/wishlist/pages/Wishlist";
import Orders from "../features/orders/pages/Orders";
import CartRoute from "../features/cart/pages/CartRoute";
import Checkout from "../features/checkout/pages/Checkout";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";
import SellerOrders from "../features/seller/pages/SellerOrders";
import SellerAnalytics from "../features/seller/pages/SellerAnalytics";
import SellerCoupons from "../features/seller/pages/SellerCoupons";
import NotFound from "../features/Shared/Components/NotFound";

export const routes = createBrowserRouter([

    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        element: <AppLayout />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/product/:productId",
                element: <ProductDetail />
            },
            {
                path: "/cart",
                element: <CartRoute />
            },
            {
                path: "/checkout",
                element: <Protected><Checkout /></Protected>
            },
            {
                path: "/forgot-password",
                element: <ForgotPassword />
            },
            {
                path: "/reset-password",
                element: <ResetPassword />
            },
            {
                path: "/account",
                element: <Protected><Account /></Protected>
            },
            {
                path: "/wishlist",
                element: <Protected><Wishlist /></Protected>
            },
            {
                path: "/orders",
                element: <Protected><Orders /></Protected>
            },
            {
                path: "/order-success",
                element: <Protected><OrderSuccess /></Protected>
            },
            {
                path: "/seller",
                children: [
                    {
                        path: "/seller/create-product",

                        element: <Protected role="seller" >
                            <CreateProduct />
                        </Protected>
                    },
                    {
                        path: "/seller/orders",
                        element: <Protected role="seller"><SellerOrders /></Protected>
                    },
                    {
                        path: "/seller/analytics",
                        element: <Protected role="seller"><SellerAnalytics /></Protected>
                    },
                    {
                        path: "/seller/coupons",
                        element: <Protected role="seller"><SellerCoupons /></Protected>
                    },
                    {
                        path: "/seller/dashboard",
                        element: <Protected role="seller" >
                            <Dashboard />
                        </Protected>
                    },
                    {
                        path: "/seller/product/:productId",
                        element: <Protected role="seller" >
                            <SellerProductDetails />
                        </Protected>
                    }
                ]
            },
            {
                path: "*",
                element: <NotFound />
            }
        ]
    }


])