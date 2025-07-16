import 'react-toastify/dist/ReactToastify.css';
import { Route, BrowserRouter, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import TORManagement from "@/components/pages/TORManagement";
import OvertimeManagement from "@/components/pages/OvertimeManagement";
import TimeOffManagement from "@/components/pages/TimeOffManagement";
import React from "react";
import Layout from "@/components/Layout";
import Timesheets from "@/components/pages/Timesheets";
import Agencies from "@/components/pages/Agencies";
import Dashboard from "@/components/pages/Dashboard";
import Contractors from "@/components/pages/Contractors";
import Requisitions from "@/components/pages/Requisitions";
import RequisitionDetails from "@/components/pages/RequisitionDetails";
import Reports from "@/components/pages/Reports";
import Settings from "@/components/pages/Settings";
import TicketCreate from "@/components/pages/TicketCreate";
import AgencyPortal from "@/components/pages/AgencyPortal";
import ContractorDetails from "@/components/pages/ContractorDetails";
import OffboardingProcess from "@/components/pages/OffboardingProcess";
function App() {
return (
    <BrowserRouter>
      <Layout>
        <Routes>
<Route path="/" element={<Dashboard />} />
<Route path="/contractors" element={<Contractors />} />
          <Route path="/contractors/:id" element={<ContractorDetails />} />
<Route path="/requisitions" element={<Requisitions />} />
          <Route path="/requisitions/:id" element={<RequisitionDetails />} />
<Route path="/tors" element={<TORManagement />} />
<Route path="/timesheets" element={<Timesheets />} />
          <Route path="/timesheets/workplans" element={<Timesheets />} />
          <Route path="/overtime" element={<OvertimeManagement />} />
          <Route path="/time-off" element={<TimeOffManagement />} />
<Route path="/reports" element={<Reports />} />
          <Route path="/agencies" element={<Agencies />} />
          <Route path="/tickets/create" element={<TicketCreate />} />
          <Route path="/offboarding" element={<OffboardingProcess />} />
          <Route path="/offboarding/create/:contractorId" element={<OffboardingProcess />} />
          <Route path="/offboarding/:id" element={<OffboardingProcess />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/agency-portal" element={<AgencyPortal />} />
        </Routes>
      </Layout>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="toast-container"
        style={{ zIndex: 9999 }}
/>
    </BrowserRouter>
  );
}

export default App;