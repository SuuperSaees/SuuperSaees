"use client"

import Image from "next/image"
import Link from "next/link"
import {
  File,
  Home,
  LineChart,
  ListFilter,
  MoreHorizontal,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@kit/ui/avatar"

import { Button } from "@kit/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@kit/ui/card"
import { CalendarIcon, CircleIcon, ChevronDownIcon } from "@radix-ui/react-icons"
import { format, setDate } from "date-fns"
import { Calendar } from "@kit/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@kit/ui/popover"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@kit/ui/dropdown-menu"
import { Input } from "@kit/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@kit/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kit/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@kit/ui/tabs"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "../../../../../packages/ui/src/shadcn/pagination"

  import { PaginationDefaultOptions } from "@tanstack/react-table"
import { cn } from "@kit/ui/utils"
import { date } from "zod"
import React from "react"

export function OrderList() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">    
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="open">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="open">Abiertos</TabsTrigger>
                <TabsTrigger value="completed">Completados</TabsTrigger>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filtrar
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Active
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Archived
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
              <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
              </div>
            </div>
            <TabsContent value="open">
              <Card x-chunk="dashboard-06-chunk-0">
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titulo</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Estado
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Asignado a
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Prioridad
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Última actualización
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Fecha de vencimiento
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="">
                        <span className="font-medium block">Pedido 29 - Diseño volantes QR</span>
                        <span className="text-sm block">Diseño para Redes Sociales</span>
                        </TableCell>
                        <TableCell>
                        <span className="text-sm block">#1988</span>
                        </TableCell>
                        <TableCell>
                        <span className="font-medium block">Marcela Baquero</span>
                        <span className="text-sm block">Estudio Ocho</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <DropdownMenu>
                          <DropdownMenuTrigger className="bg-warning-100 text-warning-700 p-2 m-2 rounded-lg flex items-center inline-flex"><span  className="pl-2 pr-2">En revisión</span><ChevronDownIcon className="flex items-center"></ChevronDownIcon></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="bg-warning-100 text-warning-700 p-2 m-2 rounded-lg">En revisión</DropdownMenuItem>
                              <DropdownMenuItem className="bg-brand-100 text-brand-700 p-2 m-2 rounded-lg">En progreso</DropdownMenuItem>
                              <DropdownMenuItem className="bg-yellow-100 text-yellow-700 p-2 m-2 rounded-lg">Esperando respuesta</DropdownMenuItem>
                              <DropdownMenuItem className="bg-success-100 text-success-700 p-2 m-2 rounded-lg">Completado</DropdownMenuItem>
                              <DropdownMenuItem className="bg-error-100 text-error-700 p-2 m-2 rounded-lg">En pausa</DropdownMenuItem>
                              <DropdownMenuItem className="bg-gray-100 text-gray-700 p-2 m-2 rounded-lg">En cola</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                        <div className="flex -space-x-1">
                            <Avatar className="w-6 h-6 border-2 border-white max-w-6 max-h-6">
                            <AvatarImage src="https://github.com/shadcn.png" className="w-6 h-6 max-w-6 max-h-6" />
                            <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <Avatar className="w-6 h-6 border-2 border-white">
                            <AvatarImage src="https://github.com/shadcn.png" className="w-full h-full" />
                            <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <Avatar className="w-6 h-6 border-2 border-white">
                            <AvatarFallback>+5</AvatarFallback>
                            </Avatar>
                        </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="bg-gray-100 text-gray-700 p-2 m-2 rounded-lg flex items-center inline-flex"><CircleIcon className="pl-2 w-2 h-2 bg-gray-700 rounded-full"></CircleIcon> <span className="pl-2 pr-2">Ninguna</span><ChevronDownIcon className="flex items-center"></ChevronDownIcon></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="bg-error-100 text-error-700 p-2 m-2 rounded-lg flex items-center"> <CircleIcon className="pl-2 w-2 h-2 bg-error-700 rounded-full"></CircleIcon> <span className="pl-2">Alta</span></DropdownMenuItem>
                              <DropdownMenuItem className="bg-warning-100 text-warning-700 p-2 m-2 rounded-lg flex items-center"><CircleIcon className="pl-2 w-2 h-2 bg-warning-700 rounded-full"></CircleIcon> <span className="pl-2">Media</span></DropdownMenuItem>
                              <DropdownMenuItem className="bg-success-100 text-success-700 p-2 m-2 rounded-lg flex items-center"><CircleIcon className="pl-2 w-2 h-2 bg-success-700 rounded-full"></CircleIcon> <span className="pl-2">Baja</span></DropdownMenuItem>
                              <DropdownMenuItem className="bg-gray-100 text-gray-700 p-2 m-2 rounded-lg flex items-center"><CircleIcon className="pl-2 w-2 h-2 bg-gray-700 rounded-full"></CircleIcon> <span className="pl-2">Ninguna</span></DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          2023-07-12 10:42 AM
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                            <DatePickerDemo></DatePickerDemo>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                <Pagination>
        <PaginationContent>
        <div className="space-between flex flex-row justify-between w-full">
  <div>
    <PaginationItem>
      <PaginationPrevious href="#" />
      <PaginationNext href="#" />
    </PaginationItem>
  </div>
  <div className="flex flex-row gap-1">
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>
        2
      </PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
  </div>
</div>

        </PaginationContent>
      </Pagination>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}



  
export function DatePickerDemo() {
    const [date, setDate] = React.useState<Date>()
   
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Selecciona una fecha</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    )
  }