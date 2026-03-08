"use client"

import { useState, useEffect } from "react"
import { TopNavigation } from "@/components/top-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  FileSpreadsheet,
  Search,
  Plus,
  Calendar,
  Clock,
  User,
  Star,
  Download,
  Share,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FloatingElements } from "@/components/floating-elements"

// Sample RPS data for demonstration
const sampleRpsResults = [
  {
    id: "rps-001",
    title: "Algoritma dan Pemrograman",
    code: "IF2012",
    semester: 2,
    credits: 3,
    lastUpdated: "2023-11-15T10:30:00",
    createdAt: "2023-11-10T14:20:00",
    instructor: "Dr. Jane Doe",
    status: "published",
    favorite: true,
    department: "Computer Science",
  },
  {
    id: "rps-002",
    title: "Basis Data",
    code: "IF3042",
    semester: 3,
    credits: 4,
    lastUpdated: "2023-11-12T09:15:00",
    createdAt: "2023-11-05T11:45:00",
    instructor: "Prof. John Smith",
    status: "draft",
    favorite: false,
    department: "Computer Science",
  },
  {
    id: "rps-003",
    title: "Jaringan Komputer",
    code: "IF3052",
    semester: 3,
    credits: 3,
    lastUpdated: "2023-11-08T16:20:00",
    createdAt: "2023-10-28T13:10:00",
    instructor: "Dr. Jane Doe",
    status: "published",
    favorite: true,
    department: "Computer Science",
  },
  {
    id: "rps-004",
    title: "Kecerdasan Buatan",
    code: "IF4062",
    semester: 4,
    credits: 3,
    lastUpdated: "2023-11-05T14:30:00",
    createdAt: "2023-10-20T10:00:00",
    instructor: "Dr. Alex Johnson",
    status: "published",
    favorite: false,
    department: "Computer Science",
  },
  {
    id: "rps-005",
    title: "Pemrograman Web",
    code: "IF3032",
    semester: 3,
    credits: 3,
    lastUpdated: "2023-11-01T11:45:00",
    createdAt: "2023-10-15T09:30:00",
    instructor: "Prof. Sarah Williams",
    status: "draft",
    favorite: false,
    department: "Computer Science",
  },
]

export default function RpsResultsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("lastUpdated")
  const [favorites, setFavorites] = useState<string[]>(
    sampleRpsResults.filter((item) => item.favorite).map((item) => item.id),
  )

  const [filteredResults, setFilteredResults] = useState(sampleRpsResults)

  // Apply filters and search
  useEffect(() => {
    let results = [...sampleRpsResults]

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.code.toLowerCase().includes(query) ||
          item.instructor.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (filterStatus !== "all") {
      results = results.filter((item) => item.status === filterStatus)
    }

    // Apply sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "code":
          return a.code.localeCompare(b.code)
        case "createdAt":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "lastUpdated":
        default:
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      }
    })

    setFilteredResults(results)
  }, [searchQuery, filterStatus, sortBy, favorites])

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((item) => item !== id))
    } else {
      setFavorites([...favorites, id])
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="p-6 relative">
      <FloatingElements />
      <TopNavigation />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-[#5fa2db] to-[#7ab8e6] text-white p-2 rounded-2xl"
            >
              <FileSpreadsheet className="h-6 w-6" />
            </motion.div>
            <h1 className="text-3xl font-bold">RPS Results</h1>
            <Badge className="bg-[#e6f1fa] text-[#5fa2db] dark:bg-[#2c4c6b] dark:text-[#a8d1f0]">
              {filteredResults.length} Documents
            </Badge>
          </div>
          <p className="text-muted-foreground ml-14">
            View, edit, and manage your generated Rencana Pembelajaran Semester (RPS)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/rps-generator">
            <Button className="rounded-full bg-gradient-to-r from-[#5fa2db] to-[#7ab8e6] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create New RPS
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Filters and search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, code, or instructor..."
            className="pl-10 rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] rounded-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] rounded-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastUpdated">Last Updated</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="code">Course Code</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <Tabs defaultValue="grid" className="mb-6">
        <div className="flex justify-end mb-4">
          <TabsList className="rounded-full">
            <TabsTrigger value="grid" className="rounded-full">
              <div className="grid grid-cols-3 gap-0.5 h-4 w-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-current rounded-sm" />
                ))}
              </div>
            </TabsTrigger>
            <TabsTrigger value="list" className="rounded-full">
              <div className="flex flex-col gap-0.5 h-4 w-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-current h-[2px] w-full rounded-sm" />
                ))}
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((rps) => (
              <motion.div
                key={rps.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="overflow-hidden border-2 hover:border-[#5fa2db] transition-all duration-300 h-full flex flex-col">
                  <CardHeader className="bg-[#f8fafc] dark:bg-gray-800 p-4 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge
                          className={`mb-2 ${
                            rps.status === "published"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                          }`}
                        >
                          {rps.status === "published" ? "Published" : "Draft"}
                        </Badge>
                        <CardTitle className="text-lg font-bold line-clamp-1">{rps.title}</CardTitle>
                      </div>
                      <div className="flex items-center">
                        <button
                          className="text-gray-400 hover:text-yellow-500 transition-colors"
                          onClick={() => toggleFavorite(rps.id)}
                        >
                          {favorites.includes(rps.id) ? (
                            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                          ) : (
                            <Star className="h-5 w-5" />
                          )}
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 hover:text-red-700 focus:text-red-700">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-3 flex-1">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Badge variant="outline" className="mr-2 font-mono">
                          {rps.code}
                        </Badge>
                        <span className="text-muted-foreground">
                          {rps.credits} SKS • Semester {rps.semester}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-2 text-[#5fa2db]" />
                        {rps.instructor}
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2 text-[#5fa2db]" />
                        Last updated: {formatDate(rps.lastUpdated)}
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2 text-[#5fa2db]" />
                        {formatTime(rps.lastUpdated)}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between border-t border-gray-100 dark:border-gray-800 mt-auto">
                    <Link href={`/rps-results/${rps.id}`} className="w-full">
                      <Button variant="outline" className="w-full rounded-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <div className="space-y-4">
            {filteredResults.map((rps) => (
              <motion.div
                key={rps.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ x: 5 }}
              >
                <Card className="overflow-hidden border hover:border-[#5fa2db] transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center p-4 gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{rps.title}</h3>
                          <Badge
                            className={`${
                              rps.status === "published"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                            }`}
                          >
                            {rps.status === "published" ? "Published" : "Draft"}
                          </Badge>
                          {favorites.includes(rps.id) && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-1 font-mono">
                              {rps.code}
                            </Badge>
                          </div>

                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1 text-[#5fa2db]" />
                            {rps.instructor}
                          </div>

                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-[#5fa2db]" />
                            {formatDate(rps.lastUpdated)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <Link href={`/rps-results/${rps.id}`}>
                          <Button variant="outline" size="sm" className="rounded-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>

                        <Button variant="outline" size="sm" className="rounded-full">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleFavorite(rps.id)}>
                              {favorites.includes(rps.id) ? (
                                <>
                                  <Star className="h-4 w-4 mr-2 fill-yellow-500 text-yellow-500" />
                                  Remove from Favorites
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4 mr-2" />
                                  Add to Favorites
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 hover:text-red-700 focus:text-red-700">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredResults.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <FileSpreadsheet className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No RPS documents found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? `No results match your search "${searchQuery}"`
              : "You haven't created any RPS documents yet"}
          </p>
          <Link href="/rps-generator">
            <Button className="rounded-full bg-gradient-to-r from-[#5fa2db] to-[#7ab8e6] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create New RPS
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
