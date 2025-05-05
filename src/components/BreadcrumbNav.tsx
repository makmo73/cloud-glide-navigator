
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbItem } from "@/types/s3";

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
}

const BreadcrumbNav = ({ items, onNavigate }: BreadcrumbNavProps) => {
  return (
    <div className="flex items-center gap-1 p-2 overflow-x-auto scrollbar-hide">
      {items.map((item, index) => (
        <div key={item.path} className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(item.path)}
            className="h-8 px-2 text-sm hover:bg-secondary"
          >
            {item.name}
          </Button>
          {index < items.length - 1 && (
            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
};

export default BreadcrumbNav;
