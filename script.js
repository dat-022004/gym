// Biến tạm để lưu thông tin đăng ký trước khi chọn phương thức thanh toán
let tempMembership = null;

// Giá tiền từng loại thẻ (VND/tháng)
const membershipPrices = {
  "Thường": 500000,
  "Cao cấp": 800000,
  "VIP": 1200000
};

// Hiển thị/ẩn section
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');

  // Điền sẵn thông tin cá nhân và ngày đăng ký khi mở form đăng ký hội viên
  if (sectionId === 'register-membership' && currentUser && currentUser.loai_tk === 'member') {
    document.getElementById('ho-ten').value = currentUser.ho_ten || '';
    document.getElementById('sdt').value = currentUser.sdt || '';
    document.getElementById('ngay-sinh').value = currentUser.ngay_sinh || '';
    document.getElementById('gioi-tinh').value = currentUser.gioi_tinh || '';
    document.getElementById('dia-chi').value = currentUser.dia_chi || '';
    document.getElementById('ngay-dk').value = new Date().toISOString().split('T')[0];
  }
}

// Toggle sidebar for mobile
function toggleSidebar() {
  const sidebar = document.getElementById('navbar');
  sidebar.classList.toggle('active');
}

// Đăng ký tài khoản
function registerAccount() {
  const hoTen = document.getElementById('register-ho-ten').value.trim();
  const sdt = document.getElementById('register-sdt').value.trim();
  const ngaySinh = document.getElementById('register-ngay-sinh').value;
  const gioiTinh = document.getElementById('register-gioi-tinh').value;
  const diaChi = document.getElementById('register-dia-chi').value.trim();
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value.trim();

  const error = document.getElementById('register-account-error');
  const message = document.getElementById('register-account-message');

  // Kiểm tra đầy đủ thông tin
  if (!hoTen || !sdt || !ngaySinh || !gioiTinh || !diaChi || !username || !password) {
    error.textContent = "⚠️ Vui lòng điền đầy đủ thông tin.";
    message.textContent = '';
    return;
  }

  // Kiểm tra tên đăng nhập đã tồn tại
  if (users.find(u => u.username === username)) {
    error.textContent = "⚠️ Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.";
    message.textContent = '';
    return;
  }

  // Tạo mã hội viên mới
  const maHV = 'HV' + (users.filter(u => u.loai_tk === 'member').length + 1).toString().padStart(3, '0');

  // Tạo tài khoản mới
  const newUser = {
    username: username,
    password: password,
    loai_tk: 'member',
    ma_hv: maHV,
    ho_ten: hoTen,
    sdt: sdt,
    ngay_sinh: ngaySinh,
    gioi_tinh: gioiTinh,
    dia_chi: diaChi
  };

  // Thêm vào danh sách users
  users.push(newUser);
  saveData();

  // Thông báo thành công và chuyển về đăng nhập
  message.textContent = `✅ Đăng ký tài khoản thành công! Tên đăng nhập: ${username}. Vui lòng đăng nhập để tiếp tục.`;
  error.textContent = '';
  setTimeout(() => {
    showSection('login');
    document.getElementById('register-account-message').textContent = '';
    document.getElementById('register-ho-ten').value = '';
    document.getElementById('register-sdt').value = '';
    document.getElementById('register-ngay-sinh').value = '';
    document.getElementById('register-gioi-tinh').value = '';
    document.getElementById('register-dia-chi').value = '';
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';
  }, 2000);
}

// Tính số tháng và tổng tiền
function calculateTotal() {
  const ngayBd = document.getElementById('ngay-bd').value;
  const ngayKt = document.getElementById('ngay-kt').value;
  const loaiThe = document.getElementById('loai-the').value;
  const totalCostElement = document.getElementById('total-cost');

  if (!ngayBd || !ngayKt || !loaiThe) {
    totalCostElement.value = '0 VND';
    return;
  }

  // Tính số tháng
  const startDate = new Date(ngayBd);
  const endDate = new Date(ngayKt);
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;

  // Tính tổng tiền
  if (months > 0 && membershipPrices[loaiThe]) {
    const totalCost = months * membershipPrices[loaiThe];
    totalCostElement.value = totalCost.toLocaleString('vi-VN') + ' VND';
  } else {
    totalCostElement.value = '0 VND';
  }
}

// Cập nhật thanh menu theo loại người dùng
function updateNavbar() {
  const navbar = document.getElementById('navbar');
  navbar.innerHTML = '';

  if (!currentUser) {
    navbar.innerHTML = `
      <a href="#" onclick="showSection('login')">Đăng Nhập</a>
      <a href="#" onclick="showSection('register-account')">Đăng Ký Tài Khoản</a>
    `;
  } else if (currentUser.loai_tk === 'member') {
    navbar.innerHTML = `
      <a href="#" onclick="showSection('register-membership')">Đăng Ký Thẻ Thành Viên</a>
      <a href="#" onclick="showSection('hire-pt')">Thuê Huấn Luyện Viên</a>
      <a href="#" onclick="showSection('rate-pt')">Đánh Giá PT</a>
      <a href="#" onclick="showSection('rate-gym')">Đánh Giá Gym</a>
      <a href="#" onclick="showSection('member-info'); showMemberInfo();">Thông Tin Cá Nhân</a>
      <a href="#" onclick="logout()">Đăng Xuất</a>
    `;
    populatePTList();
  } else if (currentUser.loai_tk === 'staff') {
    navbar.innerHTML = `
      <a href="#" onclick="showSection('view-salary'); showStaffInfo();">Xem Lương</a>
      <a href="#" onclick="logout()">Đăng Xuất</a>
    `;
    showSection('view-salary');
    showStaffInfo();
  } else if (currentUser.loai_tk === 'admin') {
    navbar.innerHTML = `
      <a href="#" onclick="showSection('admin-view'); showAdminView();">Quản Lý Hệ Thống</a>
      <a href="#" onclick="logout()">Đăng Xuất</a>
    `;
    showSection('admin-view');
    showAdminView();
  }
}

// Đăng nhập
function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    currentUser = user;
    document.getElementById('login-message').textContent = 'Đăng nhập thành công!';
    document.getElementById('login-error').textContent = '';
    updateNavbar();
  } else {
    document.getElementById('login-error').textContent = 'Tên đăng nhập hoặc mật khẩu không đúng.';
    document.getElementById('login-message').textContent = '';
  }
}

// Đăng xuất
function logout() {
  currentUser = null;
  tempMembership = null;
  updateNavbar();
  showSection('login');
}

// Lấy danh sách PT
function populatePTList() {
  const ptList = document.getElementById('pt-list');
  const ptRateList = document.getElementById('pt-rate-list');

  if (ptList) {
    ptList.innerHTML = '<option value="">-- Chọn huấn luyện viên --</option>';
  }

  if (ptRateList) {
    ptRateList.innerHTML = '<option value="">-- Chọn huấn luyện viên --</option>';
  }

  pts.forEach(pt => {
    const optionText = `${pt.ho_ten} | ${pt.gioi_tinh} | ${pt.chuyen_mon} | ${pt.gia_thue.toLocaleString()} VND`;

    if (ptList) {
      ptList.innerHTML += `<option value="${pt.ma_pt}">${optionText}</option>`;
    }

    if (ptRateList) {
      ptRateList.innerHTML += `<option value="${pt.ma_pt}">${pt.ho_ten}</option>`;
    }
  });
}

// Thuê PT
function hirePT() {
  const ptId = document.getElementById('pt-list').value;
  const message = document.getElementById('hire-message');
  const error = document.getElementById('hire-error');

  if (!ptId) {
    error.textContent = '⚠️ Vui lòng chọn huấn luyện viên.';
    message.textContent = '';
    return;
  }

  ptRegistrations.push({
    ma_dk_pt: 'THUE' + (ptRegistrations.length + 1).toString().padStart(3, '0'),
    ma_pt: ptId,
    ma_hv: currentUser?.ma_hv || 'UNKNOWN',
    ngay_thue: new Date().toISOString().split('T')[0]
  });

  saveData();

  error.textContent = '';
  message.textContent = '✅ Thuê huấn luyện viên thành công!';
}

// Đăng ký thẻ hội viên
function registerMembership() {
  const hoTen = document.getElementById('ho-ten').value.trim();
  const sdt = document.getElementById('sdt').value.trim();
  const ngaySinh = document.getElementById('ngay-sinh').value;
  const gioiTinh = document.getElementById('gioi-tinh').value;
  const diaChi = document.getElementById('dia-chi').value.trim();
  const ngayDk = document.getElementById('ngay-dk').value;
  const ngayBd = document.getElementById('ngay-bd').value;
  const ngayKt = document.getElementById('ngay-kt').value;
  const loaiThe = document.getElementById('loai-the').value;
  const tgTap = document.getElementById('thoi-gian-tap').value.trim();
  const ghiChu = document.getElementById('ghi-chu').value.trim();
  const totalCost = parseInt(document.getElementById('total-cost').value.replace(/[^0-9]/g, '')) || 0;

  const error = document.getElementById('register-error');
  const message = document.getElementById('register-message');

  if (!hoTen || !sdt || !ngaySinh || !gioiTinh || !diaChi || !ngayDk || !ngayBd || !ngayKt || !loaiThe || !tgTap) {
    error.textContent = "⚠️ Vui lòng điền đầy đủ thông tin.";
    message.textContent = '';
    return;
  }

  // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
  if (new Date(ngayKt) <= new Date(ngayBd)) {
    error.textContent = "⚠️ Ngày kết thúc phải sau ngày bắt đầu.";
    message.textContent = '';
    return;
  }

  // Kiểm tra xem hội viên có thẻ còn hiệu lực không
  const activeMembership = memberships.find(m => m.ma_hv === currentUser?.ma_hv && new Date(m.ngay_kt) >= new Date());
  if (activeMembership) {
    error.textContent = `⚠️ Bạn đã có thẻ hội viên còn hiệu lực đến ${activeMembership.ngay_kt}. Vui lòng chờ hết hạn để đăng ký lại.`;
    message.textContent = '';
    return;
  }

  // Tạo mã thẻ và mã hội viên
  const maThe = 'THE' + (memberships.length + 1).toString().padStart(3, '0');
  const maHV = currentUser?.ma_hv || ('HV' + (memberships.length + 1).toString().padStart(3, '0'));

  // Lưu tạm thông tin đăng ký, bao gồm tổng tiền
  tempMembership = {
    ma_the: maThe,
    ma_hv: maHV,
    ngay_dk: ngayDk,
    loai_the: loaiThe,
    ngay_bd: ngayBd,
    ngay_kt: ngayKt,
    thoi_gian_tap: tgTap,
    ghi_chu: ghiChu,
    tong_tien: totalCost
  };

  // Chuyển sang chọn phương thức thanh toán
  showSection('payment-method');
  error.textContent = '';
  message.textContent = '';
}

// Chọn phương thức thanh toán
function selectPaymentMethod() {
  const phuongThucTT = document.getElementById('phuong-thuc-tt').value;
  const error = document.getElementById('payment-error');
  const message = document.getElementById('payment-message');

  if (!phuongThucTT) {
    error.textContent = '⚠️ Vui lòng chọn phương thức thanh toán.';
    message.textContent = '';
    return;
  }

  if (phuongThucTT === 'Tiền mặt') {
    // Lưu thông tin với trạng thái "Đợi nộp tiền"
    memberships.push({
      ...tempMembership,
      phuong_thuc_tt: 'Tiền mặt',
      trang_thai_tt: 'Đợi nộp tiền'
    });
    saveData();
    tempMembership = null;
    showSection('register-membership');
    document.getElementById('register-message').textContent = `✅ Đăng ký thành công! Mã hội viên: ${memberships[memberships.length - 1].ma_hv} | Loại thẻ: ${memberships[memberships.length - 1].loai_the} | Tổng tiền: ${memberships[memberships.length - 1].tong_tien.toLocaleString('vi-VN')} VND | Vui lòng nộp tiền mặt.`;
    document.getElementById('register-error').textContent = '';
  } else if (phuongThucTT === 'Chuyển khoản') {
    // Chuyển sang trang QR
    showSection('qr-payment');
    error.textContent = '';
    message.textContent = '';
  }
}

// Xác nhận chuyển khoản
function confirmTransfer() {
  // Lưu thông tin với trạng thái "Chuyển khoản thành công"
  memberships.push({
    ...tempMembership,
    phuong_thuc_tt: 'Chuyển khoản',
    trang_thai_tt: 'Chuyển khoản thành công'
  });
  saveData();
  const maHV = tempMembership.ma_hv;
  const loaiThe = tempMembership.loai_the;
  const tongTien = tempMembership.tong_tien;
  tempMembership = null;
  showSection('register-membership');
  document.getElementById('register-message').textContent = `✅ Chuyển khoản thành công! Mã hội viên: ${maHV} | Loại thẻ: ${loaiThe} | Tổng tiền: ${tongTien.toLocaleString('vi-VN')} VND`;
  document.getElementById('register-error').textContent = '';
}

// Đánh giá PT
function ratePT() {
  const ptId = document.getElementById('pt-rate-list').value;
  const danhGia = document.getElementById('pt-rating').value.trim();
  const message = document.getElementById('rate-pt-message');
  const error = document.getElementById('rate-pt-error');

  if (!ptId || !danhGia) {
    error.textContent = '⚠️ Vui lòng chọn huấn luyện viên và nhập đánh giá.';
    message.textContent = '';
    return;
  }

  ptRatings.push({
    ma_dg_pt: 'DGPT' + (ptRatings.length + 1).toString().padStart(3, '0'),
    ma_pt: ptId,
    danh_gia: danhGia
  });

  saveData();
  error.textContent = '';
  message.textContent = '✅ Đánh giá đã được gửi!';
}

// Đánh giá Gym
function rateGym() {
  const danhGia = document.getElementById('gym-rating').value.trim();
  const message = document.getElementById('rate-gym-message');
  const error = document.getElementById('rate-gym-error');

  if (!danhGia) {
    error.textContent = '⚠️ Vui lòng nhập nội dung đánh giá.';
    message.textContent = '';
    return;
  }

  gymRatings.push({
    ma_dg: 'DGGYM' + (gymRatings.length + 1).toString().padStart(3, '0'),
    ma_hv: currentUser?.ma_hv || 'UNKNOWN',
    noi_dung: danhGia,
    ngay_danh_gia: new Date().toISOString().split('T')[0]
  });

  saveData();

  error.textContent = '';
  message.textContent = '✅ Cảm ơn bạn đã đánh giá!';
  document.getElementById('gym-rating').value = '';
}

// Hiển thị thông tin nhân viên
function showStaffInfo() {
  if (!currentUser || currentUser.loai_tk !== 'staff') {
    document.getElementById('view-salary').innerHTML = '<p>Không tìm thấy thông tin nhân viên.</p>';
    return;
  }

  const today = new Date();
  const thang = today.toLocaleString('vi-VN', { month: 'long' });
  const nam = today.getFullYear();

  const hoTen = currentUser.ho_ten || 'Chưa cập nhật';
  const gioiTinh = currentUser.gioi_tinh || 'Chưa cập nhật';
  const ngaySinh = currentUser.ngay_sinh || 'Chưa cập nhật';
  const sdt = currentUser.sdt || 'Chưa cập nhật';
  const email = currentUser.email || 'Chưa có email';
  const diaChi = currentUser.dia_chi || 'Chưa cập nhật';
  const chucVu = currentUser.bo_phan || 'Chưa cập nhật';

  const luongCB = currentUser.luong_cb || 0;
  const phuCap = currentUser.phu_cap || 0;
  const thuong = currentUser.thuong || 0;
  const tongLuong = currentUser.luong || (luongCB + phuCap + thuong);

  document.getElementById('staff-ho-ten').textContent = hoTen;
  document.getElementById('staff-gioi-tinh').textContent = gioiTinh;
  document.getElementById('staff-ngay-sinh').textContent = ngaySinh;
  document.getElementById('staff-sdt').textContent = sdt;
  document.getElementById('staff-email').textContent = email;
  document.getElementById('staff-dia-chi').textContent = diaChi;
  document.getElementById('staff-chuc-vu').textContent = chucVu;

  document.getElementById('salary-title').textContent = `Lương tháng ${thang} ${nam}:`;
  document.getElementById('staff-luong-cb').textContent = luongCB.toLocaleString();
  document.getElementById('staff-phu-cap').textContent = phuCap.toLocaleString();
  document.getElementById('staff-thuong').textContent = thuong.toLocaleString();
  document.getElementById('staff-tong-luong').textContent = tongLuong.toLocaleString();
}

// Hiển thị thông tin hội viên
function showMemberInfo() {
  if (!currentUser || currentUser.loai_tk !== 'member') {
    document.getElementById('member-details').innerHTML = '<p>Không tìm thấy thông tin hội viên.</p>';
    document.getElementById('membership-list').innerHTML = '';
    document.getElementById('pt-registration-table').innerHTML = '';
    return;
  }

  // Hiển thị thông tin cá nhân
  document.getElementById('member-details').innerHTML = `
    <p><strong>Họ tên:</strong> ${currentUser.ho_ten}</p>
    <p><strong>Mã hội viên:</strong> ${currentUser.ma_hv}</p>
    <p><strong>Giới tính:</strong> ${currentUser.gioi_tinh}</p>
    <p><strong>Ngày sinh:</strong> ${currentUser.ngay_sinh}</p>
    <p><strong>Số điện thoại:</strong> ${currentUser.sdt}</p>
    <p><strong>Địa chỉ:</strong> ${currentUser.dia_chi}</p>
  `;

  // Hiển thị danh sách thẻ hội viên
  const membershipList = document.getElementById('membership-table').querySelector('tbody') || document.getElementById('membership-table');
  membershipList.innerHTML = '';
  const memberMemberships = memberships.filter(m => m.ma_hv === currentUser.ma_hv);
  
  if (memberMemberships.length === 0) {
    membershipList.innerHTML = '<tr><td colspan="10">Chưa có thẻ hội viên nào.</td></tr>';
  } else {
    memberMemberships.forEach(m => {
      membershipList.innerHTML += `
        <tr>
          <td>${m.ma_the}</td>
          <td>${m.loai_the}</td>
          <td>${m.ngay_dk}</td>
          <td>${m.ngay_bd}</td>
          <td>${m.ngay_kt}</td>
          <td>${m.thoi_gian_tap}</td>
          <td>${m.ghi_chu || 'Không có'}</td>
          <td>${m.phuong_thuc_tt}</td>
          <td>${m.trang_thai_tt}</td>
          <td>${m.tong_tien ? m.tong_tien.toLocaleString('vi-VN') + ' VND' : 'N/A'}</td>
        </tr>
      `;
    });
  }

  // Hiển thị danh sách PT đã thuê
  const ptRegistrationList = document.getElementById('pt-registration-table').querySelector('tbody') || document.getElementById('pt-registration-table');
  ptRegistrationList.innerHTML = '';
  const memberPTRegistrations = ptRegistrations.filter(pt => pt.ma_hv === currentUser.ma_hv);

  if (memberPTRegistrations.length === 0) {
    ptRegistrationList.innerHTML = '<tr><td colspan="7">Chưa thuê huấn luyện viên nào.</td></tr>';
  } else {
    memberPTRegistrations.forEach(ptReg => {
      const pt = pts.find(p => p.ma_pt === ptReg.ma_pt);
      ptRegistrationList.innerHTML += `
        <tr>
          <td>${ptReg.ma_dk_pt}</td>
          <td>${ptReg.ma_pt}</td>
          <td>${pt ? pt.ho_ten : 'Không tìm thấy'}</td>
          <td>${pt ? pt.gioi_tinh : 'N/A'}</td>
          <td>${pt ? pt.chuyen_mon : 'N/A'}</td>
          <td>${ptReg.ngay_thue}</td>
          <td>${pt ? pt.gia_thue.toLocaleString('vi-VN') + ' VND' : 'N/A'}</td>
        </tr>
      `;
    });
  }
}

// Hiển thị giao diện Admin
function showAdminView() {
  if (!currentUser || currentUser.loai_tk !== 'admin') {
    document.getElementById('admin-view').innerHTML = '<p>Không có quyền truy cập.</p>';
    return;
  }

  // Gọi hàm lọc ban đầu
  filterMembershipsByMonth();
  filterStaffByMonth();
}

// Lọc danh sách hội viên theo tháng/năm
function filterMembershipsByMonth() {
  const month = document.getElementById('membership-month').value;
  const year = document.getElementById('membership-year').value;
  const membershipList = document.getElementById('admin-membership-table').querySelector('tbody') || document.getElementById('admin-membership-table');

  let filteredMemberships = memberships;

  if (month && year) {
    filteredMemberships = memberships.filter(m => {
      const membershipDate = new Date(m.ngay_dk);
      return membershipDate.getMonth() + 1 === parseInt(month) && membershipDate.getFullYear() === parseInt(year);
    });
  }

  membershipList.innerHTML = '';
  if (filteredMemberships.length === 0) {
    membershipList.innerHTML = '<tr><td colspan="8">Không có hội viên nào trong khoảng thời gian này.</td></tr>';
    return;
  }

  filteredMemberships.forEach(m => {
    const member = users.find(u => u.ma_hv === m.ma_hv && u.loai_tk === 'member');
    membershipList.innerHTML += `
      <tr>
        <td>${m.ma_hv}</td>
        <td>${member ? member.ho_ten : 'Không tìm thấy'}</td>
        <td>${m.ma_the}</td>
        <td>${m.loai_the}</td>
        <td>${m.ngay_dk}</td>
        <td>${m.phuong_thuc_tt}</td>
        <td>${m.trang_thai_tt}</td>
        <td>${m.tong_tien ? m.tong_tien.toLocaleString('vi-VN') + ' VND' : 'N/A'}</td>
      </tr>
    `;
  });
}

// Lọc danh sách nhân viên theo tháng/năm
function filterStaffByMonth() {
  const month = document.getElementById('staff-month').value;
  const year = document.getElementById('staff-year').value;
  const staffList = document.getElementById('admin-staff-table').querySelector('tbody') || document.getElementById('admin-staff-table');

  let filteredStaff = users.filter(u => u.loai_tk === 'staff');

  // Hiện tại không có dữ liệu lương theo tháng, hiển thị tất cả nhân viên
  if (month && year) {
    filteredStaff = filteredStaff; // Cần logic lọc lương theo tháng nếu có dữ liệu
  }

  staffList.innerHTML = '';
  if (filteredStaff.length === 0) {
    staffList.innerHTML = '<tr><td colspan="7">Không có nhân viên nào trong khoảng thời gian này.</td></tr>';
    return;
  }

  filteredStaff.forEach(staff => {
    const totalSalary = staff.luong || (staff.luong_cb + staff.phu_cap + staff.thuong);
    staffList.innerHTML += `
      <tr>
        <td>${staff.ma_nv}</td>
        <td>${staff.ho_ten}</td>
        <td>${staff.gioi_tinh}</td>
        <td>${staff.sdt}</td>
        <td>${staff.email || 'Không có'}</td>
        <td>${staff.bo_phan}</td>
        <td>${totalSalary.toLocaleString()}</td>
      </tr>
    `;
  });
}

// Lưu dữ liệu lên server
function saveData() {
  fetch('/save-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ users, pts, memberships, ptRegistrations, ptRatings, gymRatings })
  })
  .then(response => response.json())
  .then(data => console.log('Dữ liệu đã được lưu:', data))
  .catch(error => console.error('Lỗi khi lưu dữ liệu:', error));
}

// Gọi khi trang load
document.addEventListener('DOMContentLoaded', () => {
  loadData().then(() => {
    updateNavbar();
  });
});