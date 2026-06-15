import { Badge, Card } from "flowbite-react";
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
          <Badge color="warning" className="w-fit">
            Coming Soon
          </Badge>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-950 dark:text-white">
            {tool.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {tool.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
