import React from 'react'

const Header = ({ user, onLogout }) => {
    return (
        <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white px-6 py-4 flex justify-between items-center shadow-xl">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold tracking-wide">VĂN PHÒNG ĐIỆN TỬ</h1>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium">
                <button className="hover:text-yellow-200 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/20 hover:shadow-lg transform hover:scale-105">
                    🏠 Trang chủ
                </button>
                {user ? (
                    <>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center text-xs font-bold">
                                {(user.fullName || user.name || user.username)?.charAt(0).toUpperCase()}
                            </div>
                            <span className="hidden sm:inline">{user.fullName || user.name || user.username}</span>
                        </div>
                        <button
                            onClick={onLogout}
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition-all duration-300 px-5 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            🚪 Đăng xuất
                        </button>
                    </>
                ) : (
                    <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg">
                        Đăng nhập
                    </button>
                )}
            </div>
        </header>
    )
}

export default Header