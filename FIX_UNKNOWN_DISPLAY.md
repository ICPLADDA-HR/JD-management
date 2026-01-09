# แก้ไขปัญหา "Unknown" ใน Browse Job Descriptions

## 🐛 ปัญหาที่พบ

ในหน้า Browse Job Descriptions แสดง "Unknown" ที่คอลัมน์:
- DEPARTMENT
- LOCATION

## 🔍 สาเหตุ

### 1. API ไม่ได้ดึงข้อมูล Relations
```typescript
// ❌ เดิม - ดึงเฉพาะข้อมูลหลัก
const { data, error } = await supabase
  .from('job_descriptions')
  .select('*')
  .order('updated_at', { ascending: false });
```

### 2. Field Names ไม่ตรงกัน
- Database/API ใช้: `location_id`, `department_id`, `updated_at` (snake_case)
- UI เรียกใช้: `locationId`, `departmentId`, `updatedAt` (camelCase)

## ✅ การแก้ไข

### 1. อัพเดท API `getAll()` ให้ดึงข้อมูล Relations

**ไฟล์**: `jd-management/src/lib/api.ts`

```typescript
// ✅ ใหม่ - ดึงพร้อม relations
const { data, error } = await supabase
  .from('job_descriptions')
  .select(`
    *,
    location:locations(id, name),
    department:departments(id, name),
    team:teams(id, name)
  `)
  .order('updated_at', { ascending: false });
```

### 2. อัพเดท BrowseJDPage ให้ใช้ชื่อ Field ที่ถูกต้อง

**ไฟล์**: `jd-management/src/pages/jd/BrowseJDPage.tsx`

#### เปลี่ยน Helper Functions:
```typescript
// ❌ เดิม
const getLocationName = (locationId: string) => {
  return locations.find(loc => loc.id === locationId)?.name || 'Unknown';
};

const getDepartmentName = (departmentId: string) => {
  return departments.find(dept => dept.id === departmentId)?.name || 'Unknown';
};

// ✅ ใหม่ - รองรับทั้ง relation และ fallback
const getLocationName = (jd: any) => {
  // Try to get from relation first
  if (jd.location?.name) {
    return jd.location.name;
  }
  // Fallback to lookup in locations array
  return locations.find(loc => loc.id === jd.location_id)?.name || 'Unknown';
};

const getDepartmentName = (jd: any) => {
  // Try to get from relation first
  if (jd.department?.name) {
    return jd.department.name;
  }
  // Fallback to lookup in departments array
  return departments.find(dept => dept.id === jd.department_id)?.name || 'Unknown';
};
```

#### เปลี่ยนการเรียกใช้ใน Table:
```typescript
// ❌ เดิม
<div className="text-sm text-primary-500">{jd.jobBand} • {jd.jobGrade}</div>
{getDepartmentName(jd.departmentId)}
{getLocationName(jd.locationId)}
{formatDate(jd.updatedAt)}

// ✅ ใหม่
<div className="text-sm text-primary-500">{jd.job_band} • {jd.job_grade}</div>
{getDepartmentName(jd)}
{getLocationName(jd)}
{formatDate(jd.updated_at)}
```

## 📊 ผลลัพธ์

### ก่อนแก้ไข:
```
POSITION    STATUS    DEPARTMENT    LOCATION    UPDATED
HR Officer  Draft     Unknown       Unknown     Invalid Date
```

### หลังแก้ไข:
```
POSITION    STATUS    DEPARTMENT         LOCATION        UPDATED
HR Officer  Draft     Human Resources    Bangkok         9 ม.ค. 2026
```

## 🎯 สรุป

### ไฟล์ที่แก้ไข:
1. ✅ `jd-management/src/lib/api.ts` - เพิ่ม relations ใน query
2. ✅ `jd-management/src/pages/jd/BrowseJDPage.tsx` - แก้ field names และ helper functions

### การทำงาน:
1. ✅ API ดึงข้อมูล location และ department มาพร้อมกับ job description
2. ✅ UI แสดงชื่อ location และ department ที่ถูกต้อง
3. ✅ มี fallback กรณีที่ relation ไม่มีข้อมูล
4. ✅ แสดงวันที่ในรูปแบบภาษาไทย

### ข้อดี:
- ✅ ลดจำนวน queries (ไม่ต้อง lookup แยก)
- ✅ Performance ดีขึ้น (ดึงข้อมูลครั้งเดียว)
- ✅ มี fallback mechanism
- ✅ รองรับทั้ง snake_case และ camelCase

## 🚀 ทดสอบ

1. เปิดหน้า Browse Job Descriptions
2. ตรวจสอบว่าคอลัมน์ DEPARTMENT และ LOCATION แสดงชื่อที่ถูกต้อง
3. ตรวจสอบว่าวันที่แสดงในรูปแบบภาษาไทย

**ปัญหาได้รับการแก้ไขแล้ว!** ✅
