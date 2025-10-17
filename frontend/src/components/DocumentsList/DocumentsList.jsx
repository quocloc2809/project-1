import React from 'react'
import './DocumentsList.css'

const DocumentsList = () => {
    // Dữ liệu mẫu cho danh sách công văn
    const documents = [
        {
            id: 1587,
            code: '5006/BIXH-KT-MT',
            title: 'Thông tu hướng dẫn về thủ tục tình gộp thử HS-HB...',
            department: 'Ban QLDA về các công các việc phối Bộc',
            receiveDate: '20/08/2025',
            status: 'Chưa',
            category: 'Ban Thêm sinh',
            processingDeadline: 'Đã xử lí chính',
            assignDate: '30/08/2025',
            completionDate: '5/10/2025',
            currentStatus: 'Chưa hoàn thành',
            finalStatus: 'Chưa xử lí'
        },
        {
            id: 1588,
            code: '1234/TCKT-VP',
            title: 'Báo cáo tình hình thực hiện kế hoạch quý III/2025',
            department: 'Phòng Tài chính Kế toán',
            receiveDate: '22/08/2025',
            status: 'Đã duyệt',
            category: 'Ban Giám đốc',
            processingDeadline: 'Hoàn thành',
            assignDate: '25/08/2025',
            completionDate: '15/09/2025',
            currentStatus: 'Đã hoàn thành',
            finalStatus: 'Đã xử lí'
        },
        {
            id: 1589,
            code: '2468/NS-HC',
            title: 'Quyết định bổ nhiệm cán bộ quản lý',
            department: 'Phòng Nhân sự',
            receiveDate: '25/08/2025',
            status: 'Đang xử lí',
            category: 'Ban Tổ chức',
            processingDeadline: 'Đang thực hiện',
            assignDate: '28/08/2025',
            completionDate: '20/10/2025',
            currentStatus: 'Đang thực hiện',
            finalStatus: 'Đang xử lí'
        },
        {
            id: 1590,
            code: '9876/KT-DT',
            title: 'Kế hoạch đầu tư thiết bị văn phòng năm 2026',
            department: 'Phòng Kế hoạch Đầu tư',
            receiveDate: '30/08/2025',
            status: 'Chờ duyệt',
            category: 'Ban Lãnh đạo',
            processingDeadline: 'Chờ phê duyệt',
            assignDate: '02/09/2025',
            completionDate: '25/10/2025',
            currentStatus: 'Chờ duyệt',
            finalStatus: 'Chưa xử lí'
        },
        {
            id: 1591,
            code: '5555/HCQT-MT',
            title: 'Hướng dẫn thực hiện quy trình mới về quản lý tài liệu',
            department: 'Phòng Hành chính Quản trị',
            receiveDate: '05/09/2025',
            status: 'Đã duyệt',
            category: 'Các phòng ban',
            processingDeadline: 'Triển khai',
            assignDate: '08/09/2025',
            completionDate: '30/09/2025',
            currentStatus: 'Đã hoàn thành',
            finalStatus: 'Đã xử lí'
        }
    ]

    return (
        <div className="documents-list">
            <div className="documents-table">
                <table>
                    <thead>
                        <tr>
                            <th>Số hiệu</th>
                            <th>Trích yếu</th>
                            <th>Ban hành</th>
                            <th>Ngày ban hành</th>
                            <th>Lãnh đạo bút phê</th>
                            <th>Đơn vị lý chính</th>
                            <th>Xử lý chính</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày kết thúc</th>
                            <th>Trạng thái</th>
                            <th>Kết quả xử lý</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map(doc => (
                            <tr key={doc.id}>
                                <td>{doc.code}</td>
                                <td>{doc.title}</td>
                                <td>{doc.department}</td>
                                <td>{doc.receiveDate}</td>
                                <td>{doc.status}</td>
                                <td>{doc.category}</td>
                                <td>{doc.processingDeadline}</td>
                                <td>{doc.assignDate}</td>
                                <td>{doc.completionDate}</td>
                                <td>
                                    <span className={`status-badge ${doc.currentStatus.includes('hoàn thành') ? 'status-completed' :
                                            doc.currentStatus.includes('thực hiện') ? 'status-processing' :
                                                'status-pending'
                                        }`}>
                                        {doc.currentStatus}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${doc.finalStatus.includes('Đã xử lí') ? 'status-completed' :
                                            doc.finalStatus.includes('Đang xử lí') ? 'status-processing' :
                                                'status-pending'
                                        }`}>
                                        {doc.finalStatus}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default DocumentsList