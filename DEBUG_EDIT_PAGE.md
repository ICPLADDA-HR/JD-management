# Debug Edit Job Description Page

## 🔍 ขั้นตอนการ Debug

### 1. เปิด Browser Console
- กด F12 หรือ Right Click → Inspect
- ไปที่ Tab "Console"

### 2. ตรวจสอบ Console Logs

เมื่อเปิดหน้า Edit JD ควรเห็น logs เหล่านี้:

```javascript
// ✅ ควรเห็น:
Loaded JD data: { id: "...", position: "HR Officer", ... }
Set basic info - Position: HR Officer Job Band: JB 1
Loading responsibilities: 5
Loading risks: 2
Competencies in data: 3
```

### 3. ตรวจสอบ Errors

#### Error 1: API Error
```javascript
// ❌ ถ้าเห็น:
Error loading JD: ...
Failed to load job description
```
**สาเหตุ**: API ไม่สามารถดึงข้อมูลได้
**แก้ไข**: ตรวจสอบ Supabase connection และ RLS policies

#### Error 2: Network Error
```javascript
// ❌ ถ้าเห็น:
Failed to fetch
Network request failed
```
**สาเหตุ**: ไม่สามารถเชื่อมต่อ Supabase ได้
**แก้ไข**: ตรวจสอบ .env file และ internet connection

#### Error 3: No Data
```javascript
// ❌ ถ้าเห็น:
Loaded JD data: null
```
**สาเหตุ**: ไม่มีข้อมูล JD ใน database
**แก้ไข**: ตรวจสอบว่า JD ID ถูกต้อง

### 4. ตรวจสอบ Network Tab

1. ไปที่ Tab "Network"
2. Refresh หน้า Edit JD
3. ดู requests ที่ส่งไปยัง Supabase

#### ✅ ควรเห็น requests เหล่านี้:
- `GET /rest/v1/job_descriptions?id=eq.xxx`
- `GET /rest/v1/jd_responsibilities?jd_id=eq.xxx`
- `GET /rest/v1/jd_risks?jd_id=eq.xxx`
- `GET /rest/v1/jd_competencies?jd_id=eq.xxx`

#### ❌ ถ้า response เป็น error:
- **401 Unauthorized**: ปัญหา authentication
- **403 Forbidden**: ปัญหา RLS policies
- **404 Not Found**: ไม่มีข้อมูล
- **500 Server Error**: ปัญหา database

## 🧪 การทดสอบ Manual

### Test 1: ตรวจสอบว่า JD มีข้อมูลใน Database

เปิด Supabase Dashboard → Table Editor → job_descriptions

ตรวจสอบว่ามี record ที่ต้องการแก้ไข

### Test 2: ตรวจสอบ Related Data

```sql
-- ตรวจสอบ responsibilities
SELECT * FROM jd_responsibilities WHERE jd_id = 'YOUR_JD_ID';

-- ตรวจสอบ risks
SELECT * FROM jd_risks WHERE jd_id = 'YOUR_JD_ID';

-- ตรวจสอบ competencies
SELECT * FROM jd_competencies WHERE jd_id = 'YOUR_JD_ID';
```

### Test 3: ตรวจสอบ RLS Policies

```sql
-- ตรวจสอบว่า user สามารถ SELECT ได้หรือไม่
SELECT * FROM job_descriptions WHERE id = 'YOUR_JD_ID';
```

ถ้าไม่สามารถ SELECT ได้ → ปัญหา RLS policies

## 🔧 แก้ไขปัญหาที่พบบ่อย

### ปัญหา 1: ฟอร์มว่างเปล่า แต่ไม่มี error

**สาเหตุ**: Field names ไม่ตรงกัน

**วิธีแก้**:
1. เปิด Console
2. พิมพ์: `console.log(data)` ใน loadJobDescription
3. ดูว่า field names เป็น snake_case หรือ camelCase

### ปัญหา 2: Competencies ไม่แสดง

**สาเหตุ**: Race condition - competencies list ยังไม่โหลดเสร็จ

**วิธีแก้**:
1. ตรวจสอบว่า useEffect ทำงานหรือไม่
2. เพิ่ม console.log ใน useEffect

```typescript
useEffect(() => {
  console.log('Competencies loaded:', competencies.length);
  console.log('Loaded JD:', loadedJD);
  console.log('Current scores:', competencyScores.length);
  
  if (loadedJD && loadedJD.competencies && competencies.length > 0) {
    console.log('Populating competency scores...');
    // ...
  }
}, [loadedJD, competencies.length]);
```

### ปัญหา 3: Dropdown ไม่แสดงค่าที่เลือก

**สาเหตุ**: Value ไม่ตรงกับ options

**วิธีแก้**:
1. ตรวจสอบว่า locationId, departmentId, teamId มีค่า
2. ตรวจสอบว่า locations, departments, teams lists โหลดเสร็จแล้ว

```typescript
console.log('Location ID:', locationId);
console.log('Locations:', locations);
console.log('Match:', locations.find(l => l.id === locationId));
```

## 📝 Checklist การ Debug

- [ ] เปิด Browser Console
- [ ] ตรวจสอบ console logs
- [ ] ตรวจสอบ errors
- [ ] ตรวจสอบ Network tab
- [ ] ตรวจสอบข้อมูลใน Database
- [ ] ตรวจสอบ RLS policies
- [ ] ตรวจสอบ field names
- [ ] ตรวจสอบ useEffect dependencies

## 🆘 ถ้ายังแก้ไม่ได้

ส่งข้อมูลเหล่านี้มาให้:

1. **Console Logs** (ทั้งหมด)
2. **Network Tab** (requests และ responses)
3. **JD ID** ที่พยายามแก้ไข
4. **Database Data** (ข้อมูลจริงใน Supabase)

## 🎯 Expected Behavior

เมื่อเปิดหน้า Edit JD ควรเห็น:

1. ✅ Loading spinner (ชั่วคราว)
2. ✅ ข้อมูลพื้นฐานแสดงในฟอร์ม
3. ✅ Dropdowns แสดงค่าที่เลือกไว้
4. ✅ Responsibilities แสดงในแต่ละ category
5. ✅ Risks แสดงทั้ง external และ internal
6. ✅ Competency sliders แสดงคะแนนที่เคยให้ไว้
7. ✅ ไม่มี error ใน console

## 📞 ติดต่อ

หากต้องการความช่วยเหลือเพิ่มเติม กรุณาส่ง:
- Screenshot ของ Console
- Screenshot ของ Network Tab
- JD ID ที่มีปัญหา
