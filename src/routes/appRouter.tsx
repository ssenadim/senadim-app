import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { AboutPage } from "../pages/About/AboutPage";
import { ArchitectureNotesPage } from "../pages/ArchitectureNotes/ArchitectureNotesPage";
import { Base64ToolPage } from "../pages/DeveloperTools/Base64/Base64ToolPage";
import { DataCompareToolPage } from "../pages/DeveloperTools/DataCompare/DataCompareToolPage";
import { DeveloperToolsPage } from "../pages/DeveloperTools/DeveloperToolsPage";
import { FormatterToolPage } from "../pages/DeveloperTools/Formatter/FormatterToolPage";
import { HashGeneratorToolPage } from "../pages/DeveloperTools/HashGenerator/HashGeneratorToolPage";
import { JwtDecoderToolPage } from "../pages/DeveloperTools/JwtDecoder/JwtDecoderToolPage";
import { PkceGeneratorToolPage } from "../pages/DeveloperTools/PkceGenerator/PkceGeneratorToolPage";
import { RegexTesterToolPage } from "../pages/DeveloperTools/RegexTester/RegexTesterToolPage";
import { TimestampToolPage } from "../pages/DeveloperTools/Timestamp/TimestampToolPage";
import { UrlEncoderDecoderToolPage } from "../pages/DeveloperTools/UrlEncoderDecoder/UrlEncoderDecoderToolPage";
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
        { path: routePaths.formatterTool, element: <FormatterToolPage /> },
        { path: routePaths.dataCompareTool, element: <DataCompareToolPage /> },
        { path: routePaths.timestampTool, element: <TimestampToolPage /> },
        { path: routePaths.jwtDecoderTool, element: <JwtDecoderToolPage /> },
        { path: routePaths.hashGeneratorTool, element: <HashGeneratorToolPage /> },
        { path: routePaths.regexTesterTool, element: <RegexTesterToolPage /> },
        {
          path: routePaths.urlEncoderDecoderTool,
          element: <UrlEncoderDecoderToolPage />,
        },
        { path: routePaths.pkceGeneratorTool, element: <PkceGeneratorToolPage /> },
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
