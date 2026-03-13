import { AppRoutes } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <AppRoutes />
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;

