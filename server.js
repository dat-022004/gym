const express = require('express');
const fs = require('fs').promises;
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.')); // Phục vụ các file tĩnh (html, js, css, json)

// Endpoint để tải file data.json về máy
app.get('/download-data', async (req, res) => {
  try {
    const fileExists = await fs.access('data.json').then(() => true).catch(() => false);
    if (!fileExists) {
      return res.status(404).json({ error: 'File data.json không tồn tại' });
    }
    res.download('data.json');
  } catch (error) {
    console.error('Lỗi khi tải file dữ liệu:', error);
    res.status(500).json({ error: 'Lỗi khi tải file dữ liệu' });
  }
});

app.post('/save-data', async (req, res) => {
  try {
    // Đọc dữ liệu hiện tại từ data.json
    let data = {};
    try {
      const fileContent = await fs.readFile('data.json', 'utf8');
      data = JSON.parse(fileContent);
    } catch (readError) {
      console.warn('Không tìm thấy data.json, tạo mới:', readError);
    }

    // Gộp dữ liệu mới với dữ liệu cũ
    data.users = req.body.users || data.users || [];
    data.pts = req.body.pts || data.pts || [];
    data.memberships = req.body.memberships || data.memberships || [];
    data.ptRegistrations = req.body.ptRegistrations || data.ptRegistrations || [];
    data.ptRatings = req.body.ptRatings || data.ptRatings || [];
    data.gymRatings = req.body.gymRatings || data.gymRatings || [];

    // Ghi dữ liệu vào data.json
    await fs.writeFile('data.json', JSON.stringify(data, null, 2));
    res.json({ message: 'Dữ liệu đã được lưu thành công' });
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu:', error);
    res.status(500).json({ error: 'Lỗi khi lưu dữ liệu' });
  }
});

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});