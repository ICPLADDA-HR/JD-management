# วิธีเพิ่ม Company Assets ในฐานข้อมูล

## ⚠️ สำคัญมาก!

ก่อนที่จะใช้งานฟีเจอร์ Company Assets ต้องเพิ่ม column ในฐานข้อมูลก่อน

## ขั้นตอนการทำ (ง่ายมาก!)

### 1. เข้า Supabase Dashboard
- ไปที่ https://supabase.com
- เข้าสู่ระบบ
- เลือก Project ของคุณ

### 2. เปิด SQL Editor
- คลิกที่เมนู **SQL Editor** ทางซ้ายมือ
- คลิก **New query**

### 3. Copy SQL นี้แล้ว Paste

```sql
ALTER TABLE job_descriptions
ADD COLUMN IF NOT EXISTS company_assets TEXT[];

COMMENT ON COLUMN job_descriptions.company_assets IS 'Array of company asset IDs (predefined) and names (custom)';
```

### 4. กด Run
- คลิกปุ่ม **Run** หรือกด `Ctrl + Enter`
- รอสักครู่จนเห็นข้อความ "Success"

### 5. เสร็จแล้ว! ✅

ตอนนี้สามารถใช้งาน Company Assets ได้แล้ว:
- ✅ สร้าง JD ใหม่พร้อมเลือกทรัพย์สิน
- ✅ แก้ไข JD และเปลี่ยนทรัพย์สิน
- ✅ ดู JD จะเห็นทรัพย์สินที่เลือก
- ✅ พิมพ์ JD จะมีทรัพย์สินในเอกสาร

## ตรวจสอบว่าสำเร็จหรือไม่

รัน SQL นี้:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'job_descriptions' 
AND column_name = 'company_assets';
```

ถ้าเห็นผลลัพธ์แสดงว่าสำเร็จแล้ว:
```
company_assets | ARRAY
```

## หากมีปัญหา

1. ตรวจสอบว่าเชื่อมต่อ Supabase ได้
2. ตรวจสอบว่ามีสิทธิ์ในการแก้ไขฐานข้อมูล
3. ลอง Refresh หน้าเว็บแล้วลองใหม่

## ไฟล์ที่เกี่ยวข้อง

- `add-company-assets-column.sql` - SQL script ฉบับเต็ม
- `COMPANY_ASSETS_MIGRATION_GUIDE.md` - คู่มือเต็มภาษาอังกฤษ
