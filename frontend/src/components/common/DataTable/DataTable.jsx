import React, { useState, useEffect } from 'react';
import './DataTable.css';
import Pagination from '../Pagination/Pagination';
import { useAutoItemsPerPage } from '../hooks';

const DataTable = ({
    columns,
    data,
    loading = false,
    error = null,
    emptyMessage = "Không có dữ liệu",
    searchTerm = '',
    enablePagination = true,
    minItems = 5,
    maxItems = 15,
    rowHeight = 45,
    headerHeight = 0
}) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Auto-calculate items per page
    const { itemsPerPage, containerRef, calculatedTableHeight } = useAutoItemsPerPage({
        minItems,
        maxItems,
        rowHeight,
        headerHeight,
        paginationHeight: enablePagination ? 60 : 0,
        tableHeaderHeight: 47,
        tableBorder: 2
    });

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = enablePagination ? data.slice(startIndex, endIndex) : data;

    // Reset to page 1 if current page exceeds total pages
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    // Reset to page 1 when data changes (e.g., after search)
    useEffect(() => {
        setCurrentPage(1);
    }, [data.length]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="data-table-container" ref={containerRef}>
            <div
                className="data-table"
                style={calculatedTableHeight ? { height: `${calculatedTableHeight}px`, flex: 'none' } : {}}
            >
                <table>
                    <thead>
                        <tr>
                            {columns.map(column => (
                                <th key={column.key} style={{ width: column.width }}>
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="loading-row">
                                    <div className="loading-content">
                                        <div className="loading-spinner"></div>
                                        <span>Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={columns.length} className="error-row">
                                    <div className="error-content">
                                        ❌ Lỗi: {error}
                                    </div>
                                </td>
                            </tr>
                        ) : currentData.length > 0 ? (
                            currentData.map((row, index) => (
                                <tr key={row.DocumentID || row.id || index}>
                                    {columns.map(column => (
                                        <td key={column.key}>
                                            {column.render
                                                ? column.render(row[column.key], row)
                                                : (row[column.key] || 'N/A')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="no-data">
                                    📋 {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {enablePagination && !loading && data.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={data.length}
                    startIndex={startIndex}
                    endIndex={Math.min(endIndex, data.length)}
                    onPageChange={handlePageChange}
                    searchTerm={searchTerm}
                />
            )}
        </div>
    );
};

export default DataTable;
