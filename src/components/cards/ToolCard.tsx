import { Badge, Card } from "flowbite-react";
import { Link } from "react-router-dom";
import type { CatalogTool, DeveloperTool } from "../../types/tool";
import { FavoriteToggle } from "../common/FavoriteToggle";

interface ToolCardProps {
  tool: DeveloperTool | CatalogTool;
  variant?: "default" | "compact";
  contextLabel?: "Favorite" | "Recent";
}

export function ToolCard({
  tool,
  variant = "default",
  contextLabel,
}: ToolCardProps) {
  const canFavorite = "id" in tool && Boolean(tool.path);
  const compact = variant === "compact";

  return (
    <Card
      className={[
        "relative h-full border-gray-200 bg-white shadow-sm transition dark:border-gray-700 dark:bg-gray-800",
        compact ? "[&>div]:p-4" : "",
        tool.path
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg dark:hover:border-cyan-700"
          : "",
      ].join(" ")}
    >
      {tool.path ? (
        <Link
          to={tool.path}
          className="absolute inset-0 z-0 rounded-lg outline-cyan-600 focus-visible:outline-2 focus-visible:outline-offset-2 dark:outline-cyan-400"
          aria-label={`Open ${tool.title}`}
        />
      ) : null}
      <div
        className={`pointer-events-none relative z-10 flex h-full flex-col ${compact ? "gap-3" : "gap-4"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Badge color="info" className="w-fit">
              {tool.category}
            </Badge>
            {contextLabel ? (
              <Badge
                color={contextLabel === "Favorite" ? "warning" : "gray"}
                className="w-fit"
              >
                {contextLabel}
              </Badge>
            ) : null}
          </div>
          {canFavorite ? (
            <FavoriteToggle toolId={tool.id} toolName={tool.title} />
          ) : tool.status === "coming-soon" ? (
            <Badge color="warning" className="w-fit">
              Coming Soon
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col">
          <h3
            className={`${compact ? "text-base" : "text-lg"} font-semibold break-words text-gray-950 dark:text-white`}
          >
            {tool.title}
          </h3>
          <p
            className={`${compact ? "mt-2 line-clamp-2" : "mt-3"} text-sm leading-6 break-words text-gray-600 dark:text-gray-300`}
          >
            {tool.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
