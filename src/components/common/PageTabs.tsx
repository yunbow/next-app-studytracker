import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab = { label: string; value: string };

type Props = {
  tabs: Tab[];
  basePath: string;
  activeTab: string;
};

export function PageTabs({ tabs, basePath, activeTab }: Props) {
  return (
    <div className="flex border-b mb-4">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={tab.value === tabs[0].value ? basePath : `${basePath}?tab=${tab.value}`}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeTab === tab.value
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
