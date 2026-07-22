import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import PublicLayout from "@/pages/PublicLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Team from "@/pages/Team";
import Properties from "@/pages/Properties";
import PropertyDetail from "@/pages/PropertyDetail";
import Contact from "@/pages/Contact";
import Sell from "@/pages/Sell";
import Reviews from "@/pages/Reviews";
import Legal from "@/pages/Legal";
import Login from "@/admin/Login";
import Dashboard from "@/admin/Dashboard";
import ProtectedRoute from "@/admin/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/o-nas" element={<About />} />
            <Route path="/tym" element={<Team />} />
            <Route path="/nemovitosti" element={<Properties />} />
            <Route path="/nemovitosti/:id" element={<PropertyDetail />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/prodej" element={<Sell />} />
            <Route path="/recenze" element={<Reviews />} />
            <Route path="/pravni-informace" element={<Legal />} />
          </Route>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
