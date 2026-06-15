import { Badge, Button, Card } from "flowbite-react";
import { Link } from "react-router-dom";
import type { DeveloperTool } from "../../types/tool";

interface ToolCardProps {
  tool: DeveloperTool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card className="h-full border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <Badge color="info" className="w-fit">
            {tool.category}
          </Badge>
          {tool.status === "coming-soon" ? (
            <Badge color="warning" className="w-fit">
              Coming Soon
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col">
          <h3 className="text-lg font-semibold text-gray-950 dark:text-white">
            {tool.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {tool.description}
          </p>
          {tool.path ? (
            <div className="mt-5">
              <Button as={Link} to={tool.path} color="light" size="sm">
                Open Tool
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
