import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { Dashboard } from "./views/Dashboard";
import { ExposureFeed } from "./views/ExposureFeed";
import { Insights } from "./views/Insights";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/exposure" element={<ExposureFeed />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
