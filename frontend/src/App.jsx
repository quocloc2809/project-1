import { useState } from 'react'
import './App.css'
import DocumentsList from './components/DocumentsList/DocumentsList'
import StatisticsTable from './components/StatisticsTable/StatisticsTable'

function App() {
  const [activeTab, setActiveTab] = useState('documents')

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>VĂN PHÒNG ĐIỆN TỬ</h1>
        </div>
        <div className="header-right">
          <span>Trang chủ</span>
          <span>Nguyễn Quốc Lộc</span>
          <span>Đăng xuất</span>
        </div>
      </header>

      <div className="main-content">
        {/* Main Content Area */}
        <div className="content-area-full">
          <div className="content-header">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                Danh sách công văn
              </button>
              <button
                className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
                onClick={() => setActiveTab('statistics')}
              >
                Thống kê trạng thái
              </button>
            </div>
            <button className="add-btn">+ Thêm văn bản</button>
          </div>

          {activeTab === 'documents' && <DocumentsList />}
          {activeTab === 'statistics' && <StatisticsTable />}
        </div>
      </div>
    </div>
  )
}

export default App