"use client";

import React from "react";

import {
  CalendarIcon,
  CheckIcon,
  Cross2Icon,
  FileTextIcon,
  MixerHorizontalIcon,
  TextAlignLeftIcon,
} from "@radix-ui/react-icons";

import { Button } from "@kit/ui/button";
import { Checkbox } from "@kit/ui/checkbox";
import { Input } from "@kit/ui/input";
import { Label } from "@kit/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kit/ui/select";

import { SettingsTabProps } from "./types";

/**
 * Settings tab component for the export CSV dialog
 */
const SettingsTab: React.FC<SettingsTabProps> = ({
  t,
  filename,
  setFilename,
  delimiter,
  setDelimiter,
  usePagination,
  setUsePagination,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
  availableColumns,
  columnHeaders,
  selectedColumns,
  handleColumnToggle,
  handleSelectAllColumns,
  handleClearAllColumns,
  dataLength,
}) => {
  return (
    <div className="w-full space-y-6 py-4">
      {/* Filename */}
      <div className="space-y-2 rounded-lg bg-white p-4 dark:bg-gray-800">
        <Label
          htmlFor="filename"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <FileTextIcon className="h-4 w-4 text-blue-500" />
          {t("export.filename")}
        </Label>
        <Input
          id="filename"
          value={filename}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFilename(e.target.value)
          }
          className="focus-visible:ring-blue-500"
        />
      </div>
      {/* Column selection */}
      <div className="space-y-2 rounded-lg bg-white p-4 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <MixerHorizontalIcon className="h-4 w-4 text-green-500" />
            {t("export.selectColumns")}
          </Label>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAllColumns}
              className="flex h-7 items-center gap-1 rounded-md px-2 text-xs font-normal hover:border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950/30 dark:hover:text-green-300"
            >
              <CheckIcon className="h-3 w-3" />
              {t("export.selectAll")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllColumns}
              className="flex h-7 items-center gap-1 rounded-md px-2 text-xs font-normal hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
            >
              <Cross2Icon className="h-3 w-3" />
              {t("export.clearAll")}
            </Button>
          </div>
        </div>

        <div className="mt-3 max-h-[200px] overflow-y-auto rounded-md border bg-gray-50 p-2 dark:bg-gray-900/50">
          <div className="grid grid-cols-2 gap-1">
            {availableColumns.map((column) => (
              <div
                key={column}
                className="flex items-center space-x-2 rounded-md p-1.5 transition-colors hover:bg-white dark:hover:bg-gray-800"
              >
                <Checkbox
                  id={`column-${column}`}
                  checked={selectedColumns.includes(column)}
                  onCheckedChange={() => handleColumnToggle(column)}
                  className="h-3.5 w-3.5 rounded-sm text-green-500 focus-visible:ring-green-500 focus-visible:ring-offset-0"
                />
                <Label
                  htmlFor={`column-${column}`}
                  className="cursor-pointer text-xs font-normal text-gray-700 dark:text-gray-300"
                >
                  {columnHeaders[column] ?? column}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination options */}
      <div className="space-y-2 rounded-lg bg-white p-4 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="use-pagination"
            checked={usePagination}
            onCheckedChange={(checked) => setUsePagination(!!checked)}
            className="text-amber-500 focus-visible:ring-amber-500"
          />
          <Label
            htmlFor="use-pagination"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <CalendarIcon className="h-4 w-4 text-amber-500" />
            {t("export.usePagination")}
          </Label>
        </div>

        {usePagination && (
          <div className="mt-3 grid grid-cols-2 gap-4 rounded-md bg-amber-50 p-3 dark:bg-amber-950/30">
            <div className="space-y-1">
              <Label
                htmlFor="page-size"
                className="text-xs text-gray-600 dark:text-gray-400"
              >
                {t("export.pageSize")}
              </Label>
              <Input
                id="page-size"
                type="number"
                min={1}
                max={dataLength}
                value={pageSize}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = Number(e.target.value);
                  const clampedValue = Math.min(Math.max(1, value), dataLength);
                  setPageSize(clampedValue);
                }}
                className="focus-visible:ring-amber-500"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="current-page"
                className="text-xs text-gray-600 dark:text-gray-400"
              >
                {t("export.currentPage")}
              </Label>
              <Input
                id="current-page"
                type="number"
                min={1}
                value={currentPage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentPage(Number(e.target.value))
                }
                className="focus-visible:ring-amber-500"
              />
            </div>
          </div>
        )}
        <p className="text-xs italic text-gray-500">
          {t("export.usePaginationNotAvailable", { pageSize: pageSize })}
        </p>
      </div>
      {/* Delimiter */}
      <div className="space-y-2 rounded-lg bg-white p-4 dark:bg-gray-800">
        <Label
          htmlFor="delimiter"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <TextAlignLeftIcon className="h-4 w-4 text-purple-500" />
          {t("export.delimiter")}
        </Label>
        <Select
          value={delimiter}
          onValueChange={(value: string) => setDelimiter(value)}
        >
          <SelectTrigger
            id="delimiter"
            className="w-full focus-visible:ring-purple-500"
          >
            <SelectValue placeholder={t("export.selectDelimiter")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=",">{t("export.comma")} (,)</SelectItem>
            <SelectItem value=";">{t("export.semicolon")} (;)</SelectItem>
            <SelectItem value="\t">{t("export.tab")}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs italic text-gray-500">
          {t("export.delimiterHelp")}
        </p>
      </div>
    </div>
  );
};

export default SettingsTab;
