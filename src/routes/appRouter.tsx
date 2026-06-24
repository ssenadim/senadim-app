import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { AboutPage } from "../pages/About/AboutPage";
import { AdrGeneratorPage } from "../pages/ArchitectureDesign/AdrGenerator/AdrGeneratorPage";
import { ArchitectureDesignPage } from "../pages/ArchitectureDesign/ArchitectureDesignPage";
import { PlantUmlViewerPage } from "../pages/ArchitectureDesign/PlantUmlViewer/PlantUmlViewerPage";
import { ArchitectureNotesPage } from "../pages/ArchitectureNotes/ArchitectureNotesPage";
import { DpopNotePage } from "../pages/ArchitectureNotes/DpopNotePage";
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
import { JvmMemoryCalculatorPage } from "../pages/PlatformEngineering/JvmMemoryCalculator/JvmMemoryCalculatorPage";
import { OpenShiftCalculatorPage } from "../pages/PlatformEngineering/OpenShiftCalculator/OpenShiftCalculatorPage";
import { PlatformEngineeringPage } from "../pages/PlatformEngineering/PlatformEngineeringPage";
import { routePaths } from "../utils/routes";

export const appRouter = createBrowserRouter(
  [
    {
      element: <AppLayout />,
      children: [
        { path: routePaths.home, element: <HomePage /> },
        { path: routePaths.about, element: <AboutPage /> },
        {
          path: routePaths.architectureDesign,
          element: <ArchitectureDesignPage />,
        },
        {
          path: routePaths.adrGenerator,
          element: <AdrGeneratorPage />,
        },
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
        {
          path: routePaths.dpopArchitectureNote,
          element: <DpopNotePage />,
        },
        {
          path: routePaths.platformEngineering,
          element: <PlatformEngineeringPage />,
        },
        {
          path: routePaths.openShiftCalculator,
          element: <OpenShiftCalculatorPage />,
        },
        {
          path: routePaths.jvmMemoryCalculator,
          element: <JvmMemoryCalculatorPage />,
        },
        {
          path: routePaths.plantUmlViewer,
          element: <PlantUmlViewerPage />,
        },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);
