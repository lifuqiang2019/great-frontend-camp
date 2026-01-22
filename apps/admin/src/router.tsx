import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./ui/AppLayout";
import { DashboardPage } from "./ui/pages/DashboardPage";
import { UsersPage } from "./ui/pages/UsersPage";
import { QuestionsPage } from "./ui/pages/QuestionsPage";

import { CategoriesPage } from "./ui/pages/CategoriesPage";
import { QuestionEditorPage } from "./ui/pages/QuestionEditorPage";
import { HotQuestionsConfigPage } from "./ui/pages/HotQuestionsConfigPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "questions", element: <QuestionsPage /> },
      { path: "questions/categories", element: <CategoriesPage /> },
      { path: "questions/hot-config", element: <HotQuestionsConfigPage /> },
      { path: "questions/create", element: <QuestionEditorPage /> },
      { path: "questions/edit/:id", element: <QuestionEditorPage /> },
    ],
  },
]);

