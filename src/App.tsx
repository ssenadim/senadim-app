import { RouterProvider } from "react-router-dom";
import { FavoritesProvider } from "./contexts/FavoritesProvider";
import { appRouter } from "./routes/appRouter";

export default function App() {
  return (
    <FavoritesProvider>
      <RouterProvider router={appRouter} />
    </FavoritesProvider>
  );
}
