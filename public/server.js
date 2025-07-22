const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'registrations.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./')); // เสิร์ฟไฟล์ HTML, CSS, JS

// ฟังก์ชันอ่านข้อมูลจาก JSON
async function readRegistrations() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // ถ้าไฟล์ไม่มี สร้างใหม่
        const initialData = { registrations: [] };
        await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
}

// ฟังก์ชันเขียนข้อมูลลง JSON
async function writeRegistrations(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Route: หน้าแรก
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route: บันทึกข้อมูลการสมัคร
app.post('/submit-registration', async (req, res) => {
    try {
        console.log('📝 ได้รับข้อมูลการสมัคร:', req.body);
        
        // อ่านข้อมูลเก่า
        const data = await readRegistrations();
        
        // สร้างข้อมูลใหม่
        const newRegistration = {
            id: 'KMUTNB' + Date.now().toString().slice(-6),
            timestamp: new Date().toISOString(),
            personalInfo: req.body,
            status: 'pending'
        };
        
        // เพิ่มข้อมูลใหม่
        data.registrations.push(newRegistration);
        
        // บันทึกลงไฟล์
        await writeRegistrations(data);
        
        console.log('✅ บันทึกข้อมูลสำเร็จ ID:', newRegistration.id);
        
        // ส่งผลลัพธ์กลับ
        res.json({
            success: true,
            message: 'บันทึกข้อมูลเรียบร้อยแล้ว!',
            registrationId: newRegistration.id,
            timestamp: newRegistration.timestamp
        });
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
            error: error.message
        });
    }
});

// Route: ดูข้อมูลที่สมัครทั้งหมด (สำหรับ Admin)
app.get('/admin/registrations', async (req, res) => {
    try {
        const data = await readRegistrations();
        res.json({
            success: true,
            total: data.registrations.length,
            registrations: data.registrations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'ไม่สามารถดึงข้อมูลได้',
            error: error.message
        });
    }
});

// Route: ค้นหาข้อมูลด้วย ID
app.get('/admin/registration/:id', async (req, res) => {
    try {
        const data = await readRegistrations();
        const registration = data.registrations.find(r => r.id === req.params.id);
        
        if (registration) {
            res.json({
                success: true,
                registration: registration
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลการสมัครนี้'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการค้นหา',
            error: error.message
        });
    }
});

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`🚀 เซิร์ฟเวอร์เริ่มต้นแล้ว!`);
    console.log(`🌐 เปิดเบราว์เซอร์ไปที่: http://localhost:${PORT}`);
    console.log(`👨‍💼 หน้า Admin: http://localhost:${PORT}/admin/registrations`);
    console.log(`💾 ข้อมูลจะถูกบันทึกใน: ${DATA_FILE}`);
});