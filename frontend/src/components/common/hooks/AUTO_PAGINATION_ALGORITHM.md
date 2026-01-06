# 📊 Auto Items Per Page Algorithm

## **Thuật toán tính toán tự động**

### **Nguyên lý hoạt động:**

```javascript
availableHeight = containerHeight - headerHeight - paginationHeight - buffer
itemsPerPage = Math.floor(availableHeight / rowHeight)
finalItems = Math.max(minItems, Math.min(maxItems, itemsPerPage))
```

### **Ví dụ thực tế:**

#### Màn hình lớn (1080p - 1920x1080):
```
Container height: 800px
- Header: 80px
- Pagination: 60px
- Buffer: 40px
= Available: 620px

620px ÷ 45px/row = 13.7 rows → 13 items/page
```

#### Màn hình trung bình (Laptop - 1366x768):
```
Container height: 600px
- Header: 80px
- Pagination: 60px
- Buffer: 40px
= Available: 420px

420px ÷ 45px/row = 9.3 rows → 9 items/page
```

#### Màn hình nhỏ (Tablet):
```
Container height: 400px
- Header: 80px
- Pagination: 60px
- Buffer: 40px
= Available: 220px

220px ÷ 45px/row = 4.8 rows → 5 items/page (min limit)
```

---

## **Tham số cấu hình:**

| Tham số | Default | DocumentsList | WeeklyReport |
|---------|---------|---------------|--------------|
| `minItems` | 5 | 5 | 5 |
| `maxItems` | 20 | 15 | 15 |
| `rowHeight` | 45px | 45px | 45px |
| `headerHeight` | 150px | 0px | 80px |
| `paginationHeight` | 60px | 60px | 60px |

---

## **Ưu điểm:**

✅ **Responsive tự động** - Không cần media queries
✅ **Tối ưu không gian** - Sử dụng tối đa chiều cao khả dụng
✅ **UX tốt hơn** - Ít phải scroll, ít phải chuyển trang
✅ **Performance** - Chỉ render đúng số items cần thiết
✅ **Flexible** - Dễ điều chỉnh min/max theo từng component

---

## **Công nghệ sử dụng:**

- **ResizeObserver API** - Theo dõi thay đổi kích thước container
- **useRef hook** - Tham chiếu đến DOM element
- **useEffect hook** - Tính toán lại khi kích thước thay đổi
- **Dynamic state** - itemsPerPage thay đổi theo thời gian thực

---

## **Log console:**

```
📊 Auto-calculated items per page: 13 (available height: 620px)
📊 Auto-calculated items per page: 9 (available height: 420px)
📊 Auto-calculated items per page: 5 (available height: 220px)
```
