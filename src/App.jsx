import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Tenants from "./pages/Tenants";
import Plans from "./pages/Plans";
import Subscribers from "./pages/Subscribers";
import Dunning from "./pages/Dunning";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";

function AdminLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/subscribers" element={<Subscribers />} />
          <Route path="/dunning" element={<Dunning />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
