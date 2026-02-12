import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./ui/AppLayout";
import { DashboardPage } from "./ui/pages/DashboardPage";
import { UsersPage } from "./ui/pages/UsersPage";
import { QuestionsPage } from "./ui/pages/QuestionsPage";

import { CategoriesPage } from "./ui/pages/CategoriesPage";
import { QuestionEditorPage } from "./ui/pages/QuestionEditorPage";
import { GreetingConfigPage } from "./ui/pages/GreetingConfigPage";
import { LoginPage } from "./ui/pages/LoginPage";
import { RequireAuth } from "./ui/components/RequireAuth";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "users", element: <UsersPage /> },
          { path: "questions", element: <QuestionsPage /> },
          { path: "questions/categories", element: <CategoriesPage /> },
          { path: "questions/create", element: <QuestionEditorPage /> },
          { path: "questions/edit/:id", element: <QuestionEditorPage /> },
          { path: "system/greeting", element: <GreetingConfigPage /> },
        ],
      },
    ],
  },
]);

