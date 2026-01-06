import { useState, useRef, useEffect } from 'react';
import './Tooltip.css';

const Tooltip = ({ children, text, className = '' }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const cellRef = useRef(null);
    const tooltipRef = useRef(null);

    const handleMouseEnter = () => {
        if (!cellRef.current || !text) return;

        const element = cellRef.current;
        const isOverflowing = element.scrollWidth > element.clientWidth ||
            element.scrollHeight > element.clientHeight;

        if (isOverflowing) {
            setShowTooltip(true);
            setTooltipVisible(false); // Ẩn tooltip khi bắt đầu
        }
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
        setTooltipVisible(false);
    };

    useEffect(() => {
        if (showTooltip && tooltipRef.current && cellRef.current) {
            // Đợi tooltip render xong và đo chính xác
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const tooltip = tooltipRef.current;
                    const element = cellRef.current;

                    if (!tooltip || !element) return;

                    const rect = element.getBoundingClientRect();
                    const tooltipWidth = tooltip.offsetWidth;
                    const tooltipHeight = tooltip.offsetHeight;

                    // Canh giữa theo chiều ngang
                    let left = rect.left + (rect.width - tooltipWidth) / 2;
                    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
                    left = Math.max(8, Math.min(left, windowWidth - tooltipWidth - 8));

                    // Tính vị trí từ giữa element để tooltip chính xác hơn
                    // Lấy vị trí giữa của cell trừ đi nửa chiều cao tooltip
                    const elementCenter = rect.top + (rect.height / 2);
                    let top = elementCenter - tooltipHeight - 10;
                    let isBelow = false;

                    // Nếu không đủ chỗ phía trên, đặt phía dưới
                    if (top < 8) {
                        top = elementCenter + 10;
                        isBelow = true;
                    }

                    // Thêm/xóa class 'below' cho arrow
                    if (isBelow) {
                        tooltip.classList.add('below');
                    } else {
                        tooltip.classList.remove('below');
                    }

                    setTooltipPosition({ top, left });
                    // Hiển thị tooltip sau khi đã set vị trí
                    setTooltipVisible(true);
                });
            });
        }
    }, [showTooltip]);

    return (
        <div
            ref={cellRef}
            className={`tooltip-container ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {showTooltip && text && (
                <div
                    ref={tooltipRef}
                    className="tooltip-popup"
                    style={{
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`,
                        opacity: tooltipVisible ? 1 : 0
                    }}
                >
                    {text}
                </div>
            )}
        </div>
    );
};

export default Tooltip;
