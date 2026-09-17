import { RouterProvider } from "react-router-dom";
import { FavoritesProvider } from "./contexts/FavoritesProvider";
import { RecentToolsProvider } from "./contexts/RecentToolsProvider";
import { appRouter } from "./routes/appRouter";

export default function App() {
  return (
    <FavoritesProvider>
      <RecentToolsProvider>
        <RouterProvider router={appRouter} />
      </RecentToolsProvider>
    </FavoritesProvider>
  );
}
