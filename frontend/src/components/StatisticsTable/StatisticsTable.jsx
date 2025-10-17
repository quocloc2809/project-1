import React from 'react'
import './StatisticsTable.css'

const StatisticsTable = () => {
    // Dữ liệu cho thống kê trạng thái
    const statisticsData = [
        { status: 'Văn bản đã xử lí', count: 2 },
        { status: 'Văn bản chưa xử lí', count: 2 },
        { status: 'Văn bản đã bút phê', count: 3 },
        { status: 'Văn bản chưa bút phê', count: 2 },
        { status: 'Văn bản đang chờ phê duyệt', count: 1 },
        { status: 'Văn bản đã hoàn thành', count: 3 },
        { status: 'Văn bản quá hạn', count: 0 },
        { status: 'Văn bản đã hủy', count: 0 }
    ]

    return (
        <div className="statistics-container">
            <div className="statistics-table">
                <table>
                    <thead>
                        <tr>
                            <th>Trạng thái</th>
                            <th>Số lượng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {statisticsData.map((item, index) => (
                            <tr key={index}>
                                <td className="status-cell">{item.status}</td>
                                <td className="count-cell">{item.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default StatisticsTable