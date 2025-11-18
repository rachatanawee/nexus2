#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// โหลด environment variables
dotenv.config({ path: '.env.local' });

// ตรวจสอบว่า .env ถูกโหลดหรือยัง
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_URL หรือ SUPABASE_SERVICE_ROLE_KEY ไม่ได้ถูกตั้งค่า');
  console.log('โปรดตรวจสอบไฟล์ .env.local ว่ามีครบหรือไม่');
  process.exit(1); // หยุดการทำงาน
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

interface UserAppMetadata {
  [key: string]: unknown;
  roles?: string[];
}

async function setupAdmin(): Promise<void> {
  const USER_EMAIL: string = 'admin@test.com';
  console.log(`กำลังค้นหา User: ${USER_EMAIL}...`);

  // 1. ค้นหา User
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError.message);
    return;
  }

  const user = users.find(u => u.email === USER_EMAIL);

  if (!user) {
    console.error(`Error: ไม่พบ User ${USER_EMAIL}`);
    return;
  }

  console.log(`พบ User ID: ${user.id}`);

  // --- นี่คือส่วนที่แก้ไข ---

  // 2. ดึงข้อมูล app_metadata "ของเดิม" มาก่อน
  const currentAppData: UserAppMetadata = user.app_metadata || {};
  console.log('Current app_metadata (เดิม):', currentAppData);

  // 3. สร้างข้อมูลใหม่โดยการ "รวม" ของเก่าและของใหม่
  const newAppData: UserAppMetadata = {
    ...currentAppData, // ...เอาของเก่ามาทั้งหมด (เช่น provider)
    roles: ['admin']   // ...และเพิ่ม/ทับด้วย roles ที่เราต้องการ
  };

  console.log('New app_metadata (ใหม่ที่จะอัปเดต):', newAppData);

  // 4. อัปเดตด้วยข้อมูลที่ "รวม" แล้ว
  const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { app_metadata: newAppData } // ใช้อันใหม่ที่รวมแล้ว
  );

  if (updateError) {
    console.error('Error: อัปเดต User ไม่สำเร็จ:', updateError.message);
  } else {
    console.log('✅✅✅ สำเร็จ! Successfully MERGED roles for admin@test.com');
    console.log('Final app_metadata in DB:', updatedUser.user.app_metadata);
  }
}

setupAdmin().catch((error: Error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});
