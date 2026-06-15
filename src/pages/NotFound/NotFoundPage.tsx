import { Link } from "react-router-dom";
import { Button } from "flowbite-react";
import { PageShell } from "../../components/common/PageShell";
import { usePageTitle } from "../../hooks/usePageTitle";
import { routePaths } from "../../utils/routes";

export function NotFoundPage() {
  usePageTitle("Page Not Found");

  return (
    <PageShell
      eyebrow="404"
      title="Page not found"
      description="The page you are looking for does not exist in Senadim Toolbox."
    >
      <div>
        <Button as={Link} to={routePaths.home} color="blue">
          Return home
        </Button>
      </div>
    </PageShell>
  );
}
