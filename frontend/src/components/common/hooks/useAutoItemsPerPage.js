import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook để tự động tính toán số items per page
 * dựa trên chiều cao khả dụng của container
 * 
 * @param {number} minItems - Số items tối thiểu (default: 5)
 * @param {number} maxItems - Số items tối đa (default: 20)
 * @param {number} rowHeight - Chiều cao ước tính của mỗi row (default: 45px)
 * @param {number} headerHeight - Chiều cao header + các controls (default: 150px)
 * @param {number} paginationHeight - Chiều cao pagination (default: 60px)
 * @returns {Object} { itemsPerPage, containerRef }
 */
const useAutoItemsPerPage = ({
    minItems = 5,
    maxItems = 20,
    rowHeight = 45,
    headerHeight = 150,
    paginationHeight = 60,
    tableHeaderHeight = 47,
    tableBorder = 2
} = {}) => {
    const [itemsPerPage, setItemsPerPage] = useState(9); // Default fallback
    const [calculatedTableHeight, setCalculatedTableHeight] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const calculateItemsPerPage = () => {
            if (!containerRef.current) return;

            // Lấy chiều cao container
            const containerHeight = containerRef.current.offsetHeight;

            // Tính chiều cao khả dụng cho bảng (data rows only)
            const availableHeight = containerHeight - headerHeight - paginationHeight - tableHeaderHeight - tableBorder;

            // Tính số rows có thể hiển thị (làm tròn xuống để không tràn)
            const calculatedItems = Math.floor(availableHeight / rowHeight);

            // Giới hạn trong khoảng min-max
            const finalItems = Math.max(minItems, Math.min(maxItems, calculatedItems));

            // Tính chiều cao chính xác của bảng để vừa khít
            const exactTableHeight = (finalItems * rowHeight) + tableHeaderHeight + tableBorder;

            // Chỉ update nếu có thay đổi
            if (finalItems !== itemsPerPage) {
                setItemsPerPage(finalItems);
                setCalculatedTableHeight(exactTableHeight);
                console.log(`📊 Items per page: ${finalItems}`);
                console.log(`📐 Table height: ${exactTableHeight}px = (${finalItems} × ${rowHeight}px) + ${tableHeaderHeight}px header + ${tableBorder}px border`);
            }
        };

        // Tính toán lần đầu
        calculateItemsPerPage();

        // Theo dõi thay đổi kích thước window
        const resizeObserver = new ResizeObserver(() => {
            calculateItemsPerPage();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Cleanup
        return () => {
            resizeObserver.disconnect();
        };
    }, [itemsPerPage, minItems, maxItems, rowHeight, headerHeight, paginationHeight, tableHeaderHeight, tableBorder]);

    return { itemsPerPage, containerRef, calculatedTableHeight };
};

export default useAutoItemsPerPage;

