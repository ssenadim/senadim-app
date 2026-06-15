import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { AboutPage } from "../pages/About/AboutPage";
import { ArchitectureNotesPage } from "../pages/ArchitectureNotes/ArchitectureNotesPage";
import { Base64ToolPage } from "../pages/DeveloperTools/Base64/Base64ToolPage";
import { DeveloperToolsPage } from "../pages/DeveloperTools/DeveloperToolsPage";
import { UuidToolPage } from "../pages/DeveloperTools/Uuid/UuidToolPage";
import { HomePage } from "../pages/Home/HomePage";
import { NotFoundPage } from "../pages/NotFound/NotFoundPage";
import { routePaths } from "../utils/routes";

export const appRouter = createBrowserRouter(
  [
    {
      element: <AppLayout />,
      children: [
        { path: routePaths.home, element: <HomePage /> },
        { path: routePaths.about, element: <AboutPage /> },
        { path: routePaths.developerTools, element: <DeveloperToolsPage /> },
        { path: routePaths.base64Tool, element: <Base64ToolPage /> },
        { path: routePaths.uuidTool, element: <UuidToolPage /> },
        {
          path: routePaths.architectureNotes,
          element: <ArchitectureNotesPage />,
        },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);
