# Company Assets Migration Guide

## ปัญหา
เมื่อ edit JD และเพิ่ม Company Assets แล้วกด update ข้อมูลไม่แสดงในหน้า View เพราะฐานข้อมูลยังไม่มี column `company_assets`

## การแก้ไข

### 1. เพิ่ม Column ในฐานข้อมูล

ต้องรัน SQL migration script เพื่อเพิ่ม column `company_assets` ในตาราง `job_descriptions`

**ไฟล์**: `add-company-assets-column.sql`

```sql
ALTER TABLE job_descriptions
ADD COLUMN IF NOT EXISTS company_assets TEXT[];
```

### 2. วิธีการรัน Migration

#### ผ่าน Supabase Dashboard:
1. เข้า Supabase Dashboard
2. ไปที่ SQL Editor
3. Copy เนื้อหาจากไฟล์ `add-company-assets-column.sql`
4. Paste และกด Run

#### ผ่าน Supabase CLI:
```bash
supabase db push
```

### 3. ตรวจสอบว่า Migration สำเร็จ

รัน SQL query นี้เพื่อตรวจสอบ:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'job_descriptions' 
AND column_name = 'company_assets';
```

ควรได้ผลลัพธ์:
```
column_name      | data_type
-----------------|-----------
company_assets   | ARRAY
```

### 4. ทดสอบการทำงาน

หลังจากรัน migration แล้ว:

1. **Create JD ใหม่**:
   - เลือก Company Assets
   - เพิ่มทรัพย์สินเอง
   - กด Create
   - ตรวจสอบว่าแสดงในหน้า View

2. **Edit JD ที่มีอยู่**:
   - เปิด JD ที่มีอยู่
   - กด Edit
   - เพิ่ม/แก้ไข Company Assets
   - กด Save Changes
   - ตรวจสอบว่าแสดงในหน้า View

3. **Print JD**:
   - เปิด JD ที่มี Company Assets
   - กด Print
   - ตรวจสอบว่าทรัพย์สินแสดงในเอกสารที่พิมพ์

## โครงสร้างข้อมูล

### Column Type
- **Type**: `TEXT[]` (Array of text)
- **Nullable**: Yes
- **Default**: NULL

### ตัวอย่างข้อมูล

```json
{
  "company_assets": [
    "1",              // Predefined asset ID (Laptop)
    "2",              // Predefined asset ID (Mobile Phone)
    "Company Car",    // Custom asset name
    "Parking Space"   // Custom asset name
  ]
}
```

### การแยกประเภททรัพย์สิน

ระบบจะแยกทรัพย์สินออกเป็น 2 ประเภทโดยอัตโนมัติ:

1. **Predefined Assets**: ถ้า value ตรงกับ asset ID ในตาราง company_assets (localStorage)
2. **Custom Assets**: ถ้า value ไม่ตรงกับ asset ID ใดๆ จะถือว่าเป็นชื่อทรัพย์สินที่เพิ่มเอง

## การเปลี่ยนแปลงในโค้ด

### 1. API (src/lib/api.ts)

#### Create Function
```typescript
const insertData = {
  // ... other fields
  company_assets: data.company_assets || null,
  // ... other fields
};
```

#### Update Function
```typescript
const updateData = {
  // ... other fields
  company_assets: data.company_assets || null,
  // ... other fields
};
```

### 2. EditJDPage (src/pages/jd/EditJDPage.tsx)

#### Load Assets
```typescript
if (data.company_assets && data.company_assets.length > 0) {
  const predefinedAssetIds = assets.map(a => a.id);
  const predefined: string[] = [];
  const custom: string[] = [];
  
  data.company_assets.forEach((assetId: string) => {
    if (predefinedAssetIds.includes(assetId)) {
      predefined.push(assetId);
    } else {
      custom.push(assetId);
    }
  });
  
  setSelectedAssets(predefined);
  setCustomAssets(custom);
}
```

#### Save Assets
```typescript
const allAssets = [...selectedAssets, ...customAssets];
const jdData = {
  // ... other fields
  company_assets: allAssets.length > 0 ? allAssets : undefined,
  // ... other fields
};
```

### 3. ViewJDPage (src/pages/jd/ViewJDPage.tsx)

#### Display Assets
```typescript
const getAssetName = (assetId: string) => {
  const asset = assets.find(a => a.id === assetId);
  if (asset) {
    return asset.name;
  }
  return assetId; // Custom asset
};
```

## Troubleshooting

### ปัญหา: ข้อมูลไม่บันทึก
- ตรวจสอบว่ารัน migration script แล้ว
- ตรวจสอบ console log ว่ามี error หรือไม่
- ตรวจสอบว่า Supabase connection ทำงานปกติ

### ปัญหา: ข้อมูลไม่แสดง
- Refresh หน้าเว็บ
- ตรวจสอบว่า JD มีข้อมูล company_assets ในฐานข้อมูล
- ตรวจสอบ console log

### ปัญหา: Custom assets ไม่แสดงชื่อถูกต้อง
- ตรวจสอบว่า getAssetName() ทำงานถูกต้อง
- ตรวจสอบว่า assets hook โหลดข้อมูลสำเร็จ

## สรุป

หลังจากรัน migration script แล้ว:
- ✅ Create JD พร้อม Company Assets ได้
- ✅ Edit JD และเปลี่ยน Company Assets ได้
- ✅ View JD แสดง Company Assets ถูกต้อง
- ✅ Print JD แสดง Company Assets ในเอกสาร
- ✅ รองรับทั้ง predefined และ custom assets

## ไฟล์ที่เกี่ยวข้อง

1. `add-company-assets-column.sql` - Migration script
2. `src/lib/api.ts` - API functions
3. `src/pages/jd/CreateJDPage.tsx` - Create page
4. `src/pages/jd/EditJDPage.tsx` - Edit page
5. `src/pages/jd/ViewJDPage.tsx` - View page
6. `src/hooks/useCompanyAssets.ts` - Assets hook
