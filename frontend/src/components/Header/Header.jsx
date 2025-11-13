import React from 'react'
import './Header.css'

const Header = ({ user, onLogout }) => {
    return (
        <header className="header">
            <div className="header-left">
                <h1>VĂN PHÒNG ĐIỆN TỬ</h1>
            </div>
            <div className="header-right">
                <span>Trang chủ</span>
                {user ? (
                    <>
                        <span>{user.name || user.username}</span>
                        <span onClick={onLogout}>Đăng xuất</span>
                    </>
                ) : (
                    <span>Đăng nhập</span>
                )}
            </div>
        </header>
    )
}

export default Header