"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DataPaginationProps {
  currentPage: number
  totalPages: number
  totalItems?: number
  itemsPerPage?: number
  onPageChange: (page: number) => void
  className?: string
  /** Show page-number buttons (with ellipses) in the middle. Defaults to true. */
  showPageNumbers?: boolean
}

/**
 * Button-based pagination control. Use this instead of shadcn `Pagination`
 * (anchor-based) when the action is purely client-side (no URL change).
 *
 * Renders: [info] [Prev] [1] ... [n] [Next]
 */
export function DataPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
  showPageNumbers = true,
}: DataPaginationProps) {
  if (totalPages <= 1) return null

  const pages = React.useMemo(() => {
    if (!showPageNumbers) return [] as number[]
    return Array.from({ length: totalPages }, (_, i) => i + 1).filter(
      (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
    )
  }, [currentPage, totalPages, showPageNumbers])

  const startItem =
    itemsPerPage && totalItems !== undefined
      ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)
      : null
  const endItem =
    itemsPerPage && totalItems !== undefined
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : null

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-between gap-3", className)}
    >
      {startItem !== null && endItem !== null && totalItems !== undefined ? (
        <p className="text-sm text-muted-foreground">
          Menampilkan {startItem}-{endItem} dari {totalItems}
        </p>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {showPageNumbers &&
          pages.map((page, i) => {
            const prev = pages[i - 1]
            const showEllipsis = prev !== undefined && page - prev > 1
            return (
              <React.Fragment key={page}>
                {showEllipsis && (
                  <span
                    className="flex size-9 items-center justify-center text-muted-foreground"
                    aria-hidden
                  >
                    ...
                  </span>
                )}
                <Button
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  aria-current={page === currentPage ? "page" : undefined}
                  aria-label={`Halaman ${page}`}
                  className="min-w-9"
                >
                  {page}
                </Button>
              </React.Fragment>
            )
          })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  )
}
