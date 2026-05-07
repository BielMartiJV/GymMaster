
import { createRoot } from "react-dom/client";
import App from "./app/App";
import { AuthProvider } from "./app/auth/AuthContext";
import { NotificationProvider } from "./app/notifications/NotificationContext";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </AuthProvider>
);
  
