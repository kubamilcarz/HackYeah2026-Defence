"use client";

import { useId, useMemo, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { SearchField } from "@/components/ui/FormControls";

export type DataTableRow = Record<string, string | number>;

export type DataTableColumn<Row extends DataTableRow> = {
  key: keyof Row & string;
  label: string;
  sortable?: boolean;
};

type DataTableProps<Row extends DataTableRow> = {
  caption?: string;
  className?: string;
  columns: DataTableColumn<Row>[];
  emptyMessage?: string;
  heading: string;
  rowKey: keyof Row & string;
  rows: Row[];
  searchLabel?: string;
};

type SortDirection = "ascending" | "descending";

function compareValues(left: string | number, right: string | number) {
  if (typeof left === "number" && typeof right === "number") return left - right;

  return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" });
}

function SortIndicator({ direction }: { direction?: SortDirection }) {
  if (direction === "ascending") return <span aria-hidden="true" className="data-table__sort-indicator">↑</span>;
  if (direction === "descending") return <span aria-hidden="true" className="data-table__sort-indicator">↓</span>;

  return <span aria-hidden="true" className="data-table__sort-indicator">↕</span>;
}

export function DataTable<Row extends DataTableRow>({
  caption,
  className,
  columns,
  emptyMessage = "No matching records.",
  heading,
  rowKey,
  rows,
  searchLabel = "Search table",
}: DataTableProps<Row>) {
  const generatedId = useId();
  const tableId = `data-table-${generatedId}`;
  const headingId = `${tableId}-heading`;
  const searchId = `${tableId}-search`;
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sort, setSort] = useState<{ key: keyof Row & string; direction: SortDirection }>();

  const displayedRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filteredRows = normalizedQuery
      ? rows.filter((row) => columns.some((column) => String(row[column.key]).toLocaleLowerCase().includes(normalizedQuery)))
      : rows;

    if (!sort) return filteredRows;

    return [...filteredRows].sort((left, right) => {
      const result = compareValues(left[sort.key], right[sort.key]);
      return sort.direction === "ascending" ? result : -result;
    });
  }, [columns, query, rows, sort]);

  function toggleSort(key: keyof Row & string) {
    setSort((current) => ({
      key,
      direction: current?.key === key && current.direction === "ascending" ? "descending" : "ascending",
    }));
  }

  return (
    <div className={`data-table${className ? ` ${className}` : ""}`}>
      <div className="data-table__header">
        <h4 className="type-h3" id={headingId}>{heading}</h4>
        <button aria-controls={searchId} aria-expanded={isSearchOpen} className="data-table__search-toggle" onClick={() => setIsSearchOpen((open) => !open)} type="button">
          <MagnifyingGlass aria-hidden="true" size={20} weight="bold" />
          Search
        </button>
        <div className={`data-table__search${isSearchOpen ? " data-table__search--open" : ""}`} id={searchId}>
          <SearchField aria-controls={tableId} hideLabel label={searchLabel} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" value={query} />
        </div>
      </div>
      <div className="data-table__scroll">
        <table aria-labelledby={headingId} id={tableId}>
          {caption && <caption>{caption}</caption>}
          <thead>
            <tr>
              {columns.map((column) => {
                const direction = sort?.key === column.key ? sort.direction : undefined;

                return (
                  <th aria-sort={direction} key={column.key} scope="col">
                    {column.sortable ? (
                      <button aria-label={`Sort by ${column.label}${direction ? `, currently ${direction}` : ""}`} className="data-table__sort-button" onClick={() => toggleSort(column.key)} type="button">
                        <span>{column.label}</span>
                        <SortIndicator direction={direction} />
                      </button>
                    ) : column.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayedRows.map((row) => (
              <tr key={String(row[rowKey])}>
                {columns.map((column) => <td key={column.key}>{row[column.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {displayedRows.length === 0 && <p className="data-table__empty" role="status">{emptyMessage}</p>}
      </div>
    </div>
  );
}
