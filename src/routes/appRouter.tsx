import { lazy, type ComponentType } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { AboutPage } from "../pages/About/AboutPage";
import { HomePage } from "../pages/Home/HomePage";
import { NotFoundPage } from "../pages/NotFound/NotFoundPage";
import { routePaths } from "../utils/routes";
import { LazyRoute } from "./LazyRoute";

function lazyPage(loader: () => Promise<ComponentType>) {
  return lazy(async () => ({ default: await loader() }));
}

const AdrGeneratorPage = lazyPage(() =>
  import("../pages/ArchitectureDesign/AdrGenerator/AdrGeneratorPage").then(
    (module) => module.AdrGeneratorPage,
  ),
);
const ArchitectureNotesToolPage = lazyPage(() =>
  import("../pages/ArchitectureDesign/ArchitectureNotes/ArchitectureNotesToolPage").then(
    (module) => module.ArchitectureNotesToolPage,
  ),
);
const ArchitectureDesignPage = lazyPage(() =>
  import("../pages/ArchitectureDesign/ArchitectureDesignPage").then(
    (module) => module.ArchitectureDesignPage,
  ),
);
const PlantUmlViewerPage = lazyPage(() =>
  import("../pages/ArchitectureDesign/PlantUmlViewer/PlantUmlViewerPage").then(
    (module) => module.PlantUmlViewerPage,
  ),
);
const MermaidViewerPage = lazyPage(() =>
  import("../pages/ArchitectureDesign/MermaidViewer/MermaidViewerPage").then(
    (module) => module.MermaidViewerPage,
  ),
);
const ThreatModelingHelperPage = lazyPage(() =>
  import("../pages/ArchitectureDesign/ThreatModelingHelper/ThreatModelingHelperPage").then(
    (module) => module.ThreatModelingHelperPage,
  ),
);
const ArchitectureNotesPage = lazyPage(() =>
  import("../pages/ArchitectureNotes/ArchitectureNotesPage").then(
    (module) => module.ArchitectureNotesPage,
  ),
);
const DpopNotePage = lazyPage(() =>
  import("../pages/ArchitectureNotes/DpopNotePage").then(
    (module) => module.DpopNotePage,
  ),
);
const Base64ToolPage = lazyPage(() =>
  import("../pages/DeveloperTools/Base64/Base64ToolPage").then(
    (module) => module.Base64ToolPage,
  ),
);
const ConfigurationConverterPage = lazyPage(() =>
  import("../pages/DeveloperTools/ConfigurationConverter/ConfigurationConverterPage").then(
    (module) => module.ConfigurationConverterPage,
  ),
);
const DataCompareToolPage = lazyPage(() =>
  import("../pages/DeveloperTools/DataCompare/DataCompareToolPage").then(
    (module) => module.DataCompareToolPage,
  ),
);
const DeveloperToolsPage = lazyPage(() =>
  import("../pages/DeveloperTools/DeveloperToolsPage").then(
    (module) => module.DeveloperToolsPage,
  ),
);
const FormatterToolPage = lazyPage(() =>
  import("../pages/DeveloperTools/Formatter/FormatterToolPage").then(
    (module) => module.FormatterToolPage,
  ),
);
const HashGeneratorToolPage = lazyPage(() =>
  import("../pages/DeveloperTools/HashGenerator/HashGeneratorToolPage").then(
    (module) => module.HashGeneratorToolPage,
  ),
);
const JwtDecoderToolPage = lazyPage(() =>
  import("../pages/DeveloperTools/JwtDecoder/JwtDecoderToolPage").then(
    (module) => module.JwtDecoderToolPage,
  ),
);
const PkceGeneratorToolPage = lazyPage(() =>
  import("../pages/DeveloperTools/PkceGenerator/PkceGeneratorToolPage").then(
    (module) => module.PkceGeneratorToolPage,
  ),
);
const RegexTesterToolPage = lazyPage(() =>
  import("../pages/DeveloperTools/RegexTester/RegexTesterToolPage").then(
    (module) => module.RegexTesterToolPage,
  ),
);
const TimestampToolPage = lazyPage(() =>
  import("../pages/DeveloperTools/Timestamp/TimestampToolPage").then(
    (module) => module.TimestampToolPage,
  ),
);
const UrlEncoderDecoderToolPage = lazyPage(() =>
  import("../pages/DeveloperTools/UrlEncoderDecoder/UrlEncoderDecoderToolPage").then(
    (module) => module.UrlEncoderDecoderToolPage,
  ),
);
const UuidToolPage = lazyPage(() =>
  import("../pages/DeveloperTools/Uuid/UuidToolPage").then(
    (module) => module.UuidToolPage,
  ),
);
const ContainerPlatformCalculatorPage = lazyPage(() =>
  import("../pages/PlatformEngineering/ContainerPlatformCalculator/ContainerPlatformCalculatorPage").then(
    (module) => module.ContainerPlatformCalculatorPage,
  ),
);
const JvmMemoryCalculatorPage = lazyPage(() =>
  import("../pages/PlatformEngineering/JvmMemoryCalculator/JvmMemoryCalculatorPage").then(
    (module) => module.JvmMemoryCalculatorPage,
  ),
);
const PlatformEngineeringPage = lazyPage(() =>
  import("../pages/PlatformEngineering/PlatformEngineeringPage").then(
    (module) => module.PlatformEngineeringPage,
  ),
);

export const appRouter = createBrowserRouter(
  [
    {
      element: <AppLayout />,
      children: [
        { path: routePaths.home, element: <HomePage /> },
        { path: routePaths.about, element: <AboutPage /> },
        {
          path: routePaths.architectureDesign,
          element: <LazyRoute page={ArchitectureDesignPage} />,
        },
        {
          path: routePaths.adrGenerator,
          element: <LazyRoute page={AdrGeneratorPage} />,
        },
        {
          path: routePaths.architectureNotesTool,
          element: <LazyRoute page={ArchitectureNotesToolPage} />,
        },
        {
          path: routePaths.developerTools,
          element: <LazyRoute page={DeveloperToolsPage} />,
        },
        {
          path: routePaths.threatModelingHelper,
          element: <LazyRoute page={ThreatModelingHelperPage} />,
        },
        {
          path: routePaths.base64Tool,
          element: <LazyRoute page={Base64ToolPage} />,
        },
        {
          path: routePaths.uuidTool,
          element: <LazyRoute page={UuidToolPage} />,
        },
        {
          path: routePaths.formatterTool,
          element: <LazyRoute page={FormatterToolPage} />,
        },
        {
          path: routePaths.configurationConverter,
          element: <LazyRoute page={ConfigurationConverterPage} />,
        },
        {
          path: routePaths.dataCompareTool,
          element: <LazyRoute page={DataCompareToolPage} />,
        },
        {
          path: routePaths.timestampTool,
          element: <LazyRoute page={TimestampToolPage} />,
        },
        {
          path: routePaths.jwtDecoderTool,
          element: <LazyRoute page={JwtDecoderToolPage} />,
        },
        {
          path: routePaths.hashGeneratorTool,
          element: <LazyRoute page={HashGeneratorToolPage} />,
        },
        {
          path: routePaths.regexTesterTool,
          element: <LazyRoute page={RegexTesterToolPage} />,
        },
        {
          path: routePaths.urlEncoderDecoderTool,
          element: <LazyRoute page={UrlEncoderDecoderToolPage} />,
        },
        {
          path: routePaths.pkceGeneratorTool,
          element: <LazyRoute page={PkceGeneratorToolPage} />,
        },
        {
          path: routePaths.architectureNotes,
          element: <LazyRoute page={ArchitectureNotesPage} />,
        },
        {
          path: routePaths.dpopArchitectureNote,
          element: <LazyRoute page={DpopNotePage} />,
        },
        {
          path: routePaths.platformEngineering,
          element: <LazyRoute page={PlatformEngineeringPage} />,
        },
        {
          path: routePaths.containerPlatformCalculator,
          element: <LazyRoute page={ContainerPlatformCalculatorPage} />,
        },
        {
          path: routePaths.jvmMemoryCalculator,
          element: <LazyRoute page={JvmMemoryCalculatorPage} />,
        },
        {
          path: routePaths.plantUmlViewer,
          element: <LazyRoute page={PlantUmlViewerPage} />,
        },
        {
          path: routePaths.mermaidViewer,
          element: <LazyRoute page={MermaidViewerPage} />,
        },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);
