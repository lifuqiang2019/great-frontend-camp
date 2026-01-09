import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./ui/AppLayout";
import { DashboardPage } from "./ui/pages/DashboardPage";
import { UsersPage } from "./ui/pages/UsersPage";
import { QuestionsPage } from "./ui/pages/QuestionsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "questions", element: <QuestionsPage /> },
    ],
  },
]);

