"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye, Download, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AdminPayments() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const payments = [
    {
      id: "PAY-001",
      student: "Alex Johnson",
      email: "alex.johnson@example.com",
      amount: 49.99,
      date: "Apr 10, 2025",
      method: "Credit Card",
      status: "completed",
    },
    {
      id: "PAY-002",
      student: "Emma Williams",
      email: "emma.williams@example.com",
      amount: 49.99,
      date: "Apr 8, 2025",
      method: "Bank Transfer",
      status: "completed",
    },
    {
      id: "PAY-003",
      student: "Michael Brown",
      email: "michael.brown@example.com",
      amount: 49.99,
      date: "Apr 5, 2025",
      method: "Credit Card",
      status: "pending",
    },
    {
      id: "PAY-004",
      student: "Sophia Davis",
      email: "sophia.davis@example.com",
      amount: 49.99,
      date: "Apr 3, 2025",
      method: "Direct Debit",
      status: "completed",
    },
    {
      id: "PAY-005",
      student: "James Wilson",
      email: "james.wilson@example.com",
      amount: 49.99,
      date: "Apr 1, 2025",
      method: "Credit Card",
      status: "failed",
    },
  ]

  const filteredPayments = payments.filter(
    (payment) =>
      (statusFilter === "all" || payment.status === statusFilter) &&
      (payment.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Payment Transactions</CardTitle>
            <CardDescription>Monitor and manage payment transactions</CardDescription>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{payment.student}</div>
                    <div className="text-sm text-muted-foreground">{payment.email}</div>
                  </TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell className="hidden md:table-cell">{payment.date}</TableCell>
                  <TableCell className="hidden md:table-cell">{payment.method}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "completed"
                          ? "default"
                          : payment.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          <span>Download Receipt</span>
                        </DropdownMenuItem>
                        {payment.status !== "completed" && (
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            <span>Process Again</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

