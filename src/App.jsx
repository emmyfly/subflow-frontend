import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Tenants from "./pages/Tenants";
import Plans from "./pages/Plans";
import Subscribers from "./pages/Subscribers";
import Dunning from "./pages/Dunning";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/subscribers" element={<Subscribers />} />
          <Route path="/dunning" element={<Dunning />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
