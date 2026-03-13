import { AppRoutes } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;

