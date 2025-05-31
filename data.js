// Khởi tạo biến dữ liệu
let users = [];
let pts = [];
let memberships = [];
let ptRegistrations = [];
let ptRatings = [];
let gymRatings = [];
let currentUser = null;

// Tải dữ liệu từ data.json
async function loadData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error('Không thể tải file data.json');
    }
    const data = await response.json();
    users = data.users || [];
    pts = data.pts || [];
    memberships = data.memberships || [];
    ptRegistrations = data.ptRegistrations || [];
    ptRatings = data.ptRatings || [];
    gymRatings = data.gymRatings || [];
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu:', error);
  }
}

// Gọi hàm loadData khi trang được tải
document.addEventListener('DOMContentLoaded', loadData);