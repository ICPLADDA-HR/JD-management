# แก้ไขปัญหา "Failed to update job description"

## สาเหตุ
ระบบพยายามบันทึก Company Assets แต่ฐานข้อมูลยังไม่มี column `company_assets`

## การแก้ไข (เลือก 1 ใน 2 วิธี)

### วิธีที่ 1: แก้ไขชั่วคราว (ใช้งานได้ทันที แต่ไม่บันทึก Company Assets)

✅ **ทำแล้ว!** - Code ได้ถูกแก้ไขให้ทำงานได้แม้ไม่มี column

**ผลลัพธ์**:
- ✅ Update JD ได้ปกติ
- ✅ ไม่มี error อีกต่อไป
- ❌ Company Assets จะไม่ถูกบันทึก (แต่ไม่ error)

### วิธีที่ 2: แก้ไขถาวร (แนะนำ - บันทึก Company Assets ได้)

#### ขั้นตอนที่ 1: ตรวจสอบว่ามี column หรือยัง

1. เข้า Supabase Dashboard → SQL Editor
2. รัน SQL นี้:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'job_descriptions' 
AND column_name = 'company_assets';
```

**ถ้าไม่มีผลลัพธ์** = ยังไม่มี column → ไปขั้นตอนที่ 2

**ถ้ามีผลลัพธ์** = มี column แล้ว → เสร็จแล้ว!

#### ขั้นตอนที่ 2: เพิ่ม Column

รัน SQL นี้:

```sql
ALTER TABLE job_descriptions
ADD COLUMN IF NOT EXISTS company_assets TEXT[];

COMMENT ON COLUMN job_descriptions.company_assets IS 'Array of company asset IDs and names';
```

#### ขั้นตอนที่ 3: ทดสอบ

1. Refresh หน้าเว็บ (F5)
2. Edit JD และเพิ่ม Company Assets
3. กด Update Job Description
4. ตรวจสอบว่าบันทึกสำเร็จ
5. ดูหน้า View JD ว่าแสดงทรัพย์สิน

## สรุป

### ตอนนี้ (หลังแก้ไข Code)
- ✅ Update JD ได้แล้ว ไม่ error
- ⚠️ Company Assets ยังไม่ถูกบันทึก

### หลังรัน SQL Migration
- ✅ Update JD ได้
- ✅ Company Assets ถูกบันทึก
- ✅ แสดงในหน้า View และ Print

## ไฟล์ที่เกี่ยวข้อง

1. `check-company-assets-column.sql` - ตรวจสอบว่ามี column หรือยัง
2. `add-company-assets-column.sql` - เพิ่ม column
3. `วิธีเพิ่ม_Company_Assets_ในฐานข้อมูล.md` - คู่มือเต็ม

## คำถามที่พบบ่อย

### Q: ทำไมไม่เพิ่ม column ให้อัตโนมัติ?
A: เพราะต้องมีสิทธิ์ admin ในฐานข้อมูล และควรทำผ่าน migration script เพื่อความปลอดภัย

### Q: ถ้าไม่รัน migration จะเป็นอย่างไร?
A: ระบบใช้งานได้ปกติ แต่ Company Assets จะไม่ถูกบันทึก

### Q: ต้องรัน migration ทุกครั้งหรือไม่?
A: ไม่ รันแค่ครั้งเดียว column จะอยู่ตลอด

### Q: ข้อมูล JD เดิมจะหายไหม?
A: ไม่หาย การเพิ่ม column ไม่กระทบข้อมูลเดิม
