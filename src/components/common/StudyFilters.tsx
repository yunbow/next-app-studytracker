"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";

interface StudyFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  subject?: string;
  onSubjectChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  subjects?: Array<{ id: string; name: string }>;
}

export function StudyFilters({
  search,
  onSearchChange,
  subject,
  onSubjectChange,
  sortBy,
  onSortChange,
  subjects = [],
}: StudyFiltersProps) {
  const { t } = useTranslations();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t.common.search}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {subjects.length > 0 && (
        <Select value={subject || "all"} onValueChange={onSubjectChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t.common.allCategories} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.common.allCategories}</SelectItem>
            {subjects.map((subj) => (
              <SelectItem key={subj.id} value={subj.id}>
                {subj.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder={t.common.sortBy} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">{t.common.latest}</SelectItem>
          <SelectItem value="oldest">{t.common.oldest}</SelectItem>
          <SelectItem value="progress">{t.study.progress}</SelectItem>
          <SelectItem value="deadline">{t.study.deadline}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
