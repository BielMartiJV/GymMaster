import { createBrowserRouter, Navigate } from "react-router";
import type { ReactNode } from "react";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { Classes } from "./components/Classes";
import { Pricing } from "./components/Pricing";
import { Trainers } from "./components/Trainers";
import { Contact } from "./components/Contact";
import { NotFound } from "./components/NotFound";
import { RouteError } from "./components/RouteError";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { MyAccount } from "./components/MyAccount";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";
import { Unauthorized } from "./components/Unauthorized";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminClasses } from "./components/admin/AdminClasses";
import { AdminReserves } from "./components/admin/AdminReserves";
import { AdminTrainers } from "./components/AdminTrainers";
import { AdminSocis } from "./components/AdminSocis";

function MyAccountProtected() {
  return (
    <ProtectedRoute>
      <MyAccount />
    </ProtectedRoute>
  );
}

function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="py-20 text-center text-gray-500 font-semibold">Carregant...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: "/admin" }} />;
  }

  if (!isAdmin) {
    return <Unauthorized />;
  }

  return children;
}

function AdminLayoutProtected() {
  return (
    <AdminProtectedRoute>
      <AdminLayout />
    </AdminProtectedRoute>
  );
}

function AdminDashboardProtected() {
  return (
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  );
}

function AdminSocisProtected() {
  return (
    <AdminProtectedRoute>
      <AdminSocis />
    </AdminProtectedRoute>
  );
}

function AdminTrainersProtected() {
  return (
    <AdminProtectedRoute>
      <AdminTrainers />
    </AdminProtectedRoute>
  );
}

function AdminClassesProtected() {
  return (
    <AdminProtectedRoute>
      <AdminClasses />
    </AdminProtectedRoute>
  );
}

function AdminReservesProtected() {
  return (
    <AdminProtectedRoute>
      <AdminReserves />
    </AdminProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    errorElement: <RouteError />,
    children: [
      { index: true, Component: Home },
      { path: "classes", Component: Classes },
      { path: "pricing", Component: Pricing },
      { path: "trainers", Component: Trainers },
      { path: "contact", Component: Contact },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "el-meu-compte", Component: MyAccountProtected },
      {
        path: "admin",
        Component: AdminLayoutProtected,
        children: [
          { index: true, Component: AdminDashboardProtected },
          { path: "socis", Component: AdminSocisProtected },
          { path: "entrenadors", Component: AdminTrainersProtected },
          { path: "classes", Component: AdminClassesProtected },
          { path: "reserves", Component: AdminReservesProtected },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
