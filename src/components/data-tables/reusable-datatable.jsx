"use client";

import * as React from "react";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import * as XLSX from "xlsx";
import {
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    FileSpreadsheet,
    Printer,
    Loader2,
} from "lucide-react";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa6";

export function DataTable({ columns, data: initialData, loading = false }) {
    const [data, setData] = React.useState(initialData);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
    const [excelLoading, setExcelLoading] = React.useState(false);
    const [pdfLoading, setPdfLoading] = React.useState(false);

    React.useEffect(() => {
        setData(initialData);
    }, [initialData]);

    const filteredData = React.useMemo(() => {
        if (!searchQuery) return data;
        return data.filter((row) =>
            Object.values(row).some((value) =>
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [data, searchQuery]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { pagination },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const handleExportToExcel = () => {
        try {
            setExcelLoading(true);
            setTimeout(() => {
                const worksheet = XLSX.utils.json_to_sheet(data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
                XLSX.writeFile(workbook, "report.xlsx");
            }, 2000);
        } catch (error) {
            alert("Error exporting to Excel:", error);
        } finally {
            setExcelLoading(false);
        }
    };

    const handleExportToPDF = () => {
        try {
            setPdfLoading(true);
            setTimeout(() => {
                const doc = new jsPDF();
                const tableColumnHeaders = columns.map((col) => col.header);
                const tableRows = filteredData.map((row) =>
                    columns.map((col) => row[col.accessorKey] || "")
                );

                doc.text("Data Table Report", 14, 10);
                autoTable(doc, {
                    head: [tableColumnHeaders],
                    body: tableRows,
                    startY: 20,
                });

                doc.save("report.pdf");
            }, 2000);
        } catch (error) {
            alert("Error exporting to PDF:", error);
        } finally {
            setPdfLoading(false);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        const tableColumnHeaders = columns.map((col) => col.header).join("</th><th>");
        const tableRows = filteredData
            .map(
                (row) =>
                    `<tr>${columns
                        .map((col) => `<td>${row[col.accessorKey] || ""}</td>`)
                        .join("")}</tr>`
            )
            .join("");

        const htmlContent = `
            <html>
            <head>
                <title>Print Table</title>
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f4f4f4;
                    }
                </style>
            </head>
            <body>
                <h1>Report</h1>
                <table>
                    <thead>
                        <tr><th>${tableColumnHeaders}</th></tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const renderSkeletonRows = (rowCount = 10, colCount = columns.length + 1) => {
        return Array.from({ length: rowCount }).map((_, rowIndex) => (
            <TableRow key={`skeleton-row-${rowIndex}`}>
                {Array.from({ length: colCount }).map((_, colIndex) => (
                    <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
                        <div className="h-4 bg-slate-200 rounded animate-pulse w-full" />
                    </TableCell>
                ))}
            </TableRow>
        ));
    };

    return (
        <div className="overflow-hidden mx-0">
            <div className="py-4 px-0 flex justify-between items-center">
                <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-1/3"
                />
                <div className="flex gap-4">
                    <Button className="cursor-pointer" variant="outline" onClick={handleExportToExcel} disabled={excelLoading}>
                        {excelLoading ? (
                            <div className="flex justify-center gap-1 items-center"><Loader2 className="animate-spin" />Exporting...</div>
                        ) : (
                            <><FileSpreadsheet className="text-green-700" />Export Excel</>
                        )}
                    </Button>
                    <Button className="cursor-pointer" variant="outline" onClick={handleExportToPDF} disabled={pdfLoading}>
                        {pdfLoading ? (
                            <div className="flex justify-center gap-1 items-center"><Loader2 className="animate-spin" />Exporting...</div>
                        ) : (
                            <><FaFilePdf className="text-red-600" />Export PDF</>
                        )}
                    </Button>
                    <Button className="cursor-pointer" variant="outline" onClick={handlePrint}>
                        <Printer className="text-slate-500" /> Print
                    </Button>
                </div>
            </div>
            <Card className="border py-0 rounded-xl">
                <Table className="rounded-xl overflow-hidden">
                    <TableHeader className="rounded-t-xl bg-slate-100">
                        {table?.getHeaderGroups()?.map((headerGroup, index) => (
                            <TableRow key={index} className="pl-10">
                                {index === 0 && <TableHead className="flex justify-center items-center">Sl. No.</TableHead>}
                                {headerGroup.headers.map((header, i) => (
                                    <TableHead key={i}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            renderSkeletonRows()
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row, rowIndex) => (
                                <TableRow key={row.id}>
                                    <TableCell className="text-center font-semibold">
                                        {(pagination?.pageIndex) * pagination?.pageSize + rowIndex + 1}
                                    </TableCell>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="text-center">No results.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <div className="flex items-center flex-col justify-between p-4">
                    <div className="flex justify-between gap-2 w-full">
                        <div className="flex items-center gap-2">
                            <Label className="text-sm text-slate-700">Rows per page</Label>
                            <Select value={`${pagination.pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))}>
                                <SelectTrigger className="w-20">
                                    <SelectValue placeholder={pagination.pageSize} />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 20, 30, 40, 50].map((size) => (
                                        <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-muted-foreground">Page <b className="text-slate-600">{pagination.pageIndex + 1}</b> of {table.getPageCount()} (Total Records {initialData?.length || 0})</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex justify-center gap-2 items-center">
                            <Button variant="outline" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                                <ChevronsLeft />
                            </Button>
                            <Button variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                <ChevronLeft />
                            </Button>
                            <div className="flex gap-1">
                                {Array.from({ length: table.getPageCount() }, (_, i) => (
                                    <Button key={i} variant={pagination.pageIndex === i ? "default" : "outline"} onClick={() => table.setPageIndex(i)}>
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>
                            <Button variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                <ChevronRight />
                            </Button>
                            <Button variant="outline" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                                <ChevronsRight />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
