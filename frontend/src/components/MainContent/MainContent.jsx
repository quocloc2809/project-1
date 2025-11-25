import React, { useState, useEffect } from 'react'
import './MainContent.css'
import DocumentsList from '../DocumentsList/DocumentsList'
import StatisticsTable from '../StatisticsTable/StatisticsTable'
import SearchBar from '../SearchBar/SearchBar'

const MainContent = () => {
    const [activeTab, setActiveTab] = useState('documents')
    const [searchTerm, setSearchTerm] = useState('')
    const [appliedSearchTerm, setAppliedSearchTerm] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState('')
    const [selectedYear, setSelectedYear] = useState('')
    const [statsFilter, setStatsFilter] = useState('')
    const [departments, setDepartments] = useState([])

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
    }

    const handleSearchSubmit = () => {
        setAppliedSearchTerm(searchTerm)
    }

    const handleClearSearch = () => {
        setSearchTerm('')
        setAppliedSearchTerm('')
    }

    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value)
    }

    // Fetch departments list
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/departments')
                if (response.ok) {
                    const data = await response.json()
                    if (data.success) {
                        setDepartments(data.data)
                    }
                }
            } catch (error) {
                console.error('Error fetching departments:', error)
            }
        }

        fetchDepartments()
    }, [])

    const resetAllFilters = () => {
        setSearchTerm('')
        setAppliedSearchTerm('')
        setSelectedDepartment('')
        setSelectedYear('')
        setStatsFilter('')
    }

    return (
        <div className="flex-1 p-6">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full backdrop-blur-sm bg-opacity-95">
                <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-6 py-4 border-b border-purple-100">
                    <div className="flex flex-wrap items-center gap-4 justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-[450px]">
                            <div className="inline-flex rounded-xl bg-white p-1.5 shadow-md border border-purple-200">
                                <button
                                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'documents'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                                        }`}
                                    onClick={() => setActiveTab('documents')}
                                >
                                    📄 Danh sách công văn
                                </button>
                                <button
                                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'statistics'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                                        }`}
                                    onClick={() => setActiveTab('statistics')}
                                >
                                    📊 Thống kê trạng thái
                                </button>
                            </div>
                            {activeTab === 'documents' && (
                                <SearchBar
                                    searchTerm={searchTerm}
                                    onSearchChange={handleSearchChange}
                                    onSearchSubmit={handleSearchSubmit}
                                    onClearSearch={handleClearSearch}
                                    placeholder="Tìm kiếm theo số hiệu hoặc trích yếu..."
                                />
                            )}
                        </div>
                        {activeTab === 'documents' && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <select
                                    value={selectedDepartment}
                                    onChange={handleDepartmentChange}
                                    className="px-4 py-2 text-sm border-2 border-purple-200 rounded-lg bg-white hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
                                >
                                    <option value="">🏢 Tất cả đơn vị</option>
                                    {departments.map(dept => (
                                        <option key={dept.GroupID} value={dept.GroupID}>
                                            {dept.GroupName}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="px-4 py-2 text-sm border-2 border-purple-200 rounded-lg bg-white hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-w-[120px] shadow-sm hover:shadow-md"
                                >
                                    <option value="">📅 Tất cả năm</option>
                                    {[2025, 2024, 2023, 2022, 2021].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>

                                <select
                                    value={statsFilter}
                                    onChange={(e) => setStatsFilter(e.target.value)}
                                    className="px-4 py-2 text-sm border-2 border-purple-200 rounded-lg bg-white hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-w-[200px] shadow-sm hover:shadow-md"
                                >
                                    <option value="">🔍 Không lọc</option>
                                    <option value="leader_done">✅ Văn bản đã bút phê</option>
                                    <option value="leader_undone">⏳ Văn bản chưa bút phê</option>
                                    <option value="office_processed">✔️ Văn bản đã xử lí</option>
                                    <option value="office_unprocessed">⚠️ Văn bản chưa xử lí</option>
                                </select>

                                {(searchTerm || appliedSearchTerm || selectedDepartment || selectedYear || statsFilter) && (
                                    <button
                                        onClick={resetAllFilters}
                                        className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-lg hover:from-pink-600 hover:via-rose-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:scale-105"
                                        title="Làm mới tất cả bộ lọc"
                                    >
                                        🔄 Làm mới
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {activeTab === 'documents' && <DocumentsList searchTerm={appliedSearchTerm} selectedDepartment={selectedDepartment} selectedYear={selectedYear} statsFilter={statsFilter} clearStatsFilter={() => setStatsFilter('')} />}
                {activeTab === 'statistics' && <StatisticsTable onFilterSelect={(filterKey) => { setStatsFilter(filterKey); setActiveTab('documents'); }} />}
            </div>
        </div>
    )
}

export default MainContent