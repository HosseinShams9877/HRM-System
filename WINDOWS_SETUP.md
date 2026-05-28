# راهنمای نصب و اجرا در ویندوز

## پیش‌نیازها
- Node.js نسخه 18 یا بالاتر
- npm نسخه 9 یا بالاتر

## مراحل نصب

### 1. نصب وابستگی‌ها
```cmd
npm install
```

### 2. اجرای مایگریشن دیتابیس
```cmd
npx prisma migrate deploy
```

### 3. بیلد پروژه
```cmd
npm run build
```
این دستور به صورت خودکار:
- Prisma Client را تولید می‌کند
- پروژه Next.js را بیلد می‌کند
- فایل‌های استاتیک (CSS/JS) را در مسیر standalone کپی می‌کند
- پوشه public، prisma و فایل .env را کپی می‌کند

### 4. اجرای سرور
```cmd
npm start
```
سرور روی پورت 3000 اجرا می‌شود: http://localhost:3000

### 5. ایجاد کاربر ادمین (فقط بار اول)
```cmd
curl -X POST http://localhost:3000/api/auth/seed
```
یا در مرورگر باز کنید: http://localhost:3000/api/auth/seed

## اطلاعات ورود آزمایشی

| نقش | ایمیل | رمز عبور |
|------|-------|----------|
| مدیر سیستم | admin@company.ir | 123456 |
| مدیر منابع انسانی | hr@company.ir | 123456 |

## اجرا در حالت توسعه (Development)
```cmd
npm run dev
```

## دستورات مفید
- `npm run db:generate` — تولید Prisma Client
- `npm run db:migrate` — ایجاد مایگریشن جدید
- `npm run db:migrate:deploy` — اجرای مایگریشن‌ها
- `npm run db:push` — اعمال تغییرات اسکیما بدون مایگریشن
- `npm start` — اجرای سرور پروداکشن
- `npm run start:dev` — اجرای سرور توسعه Next.js

## حل مشکلات رایج

### مشکل: صفحه بدون استایل نمایش داده می‌شود
مطمئن شوید که دستور `npm run build` را اجرا کرده‌اید و خطایی دریافت نکرده‌اید.

### مشکل: خطای Prisma Client
دستور زیر را اجرا کنید:
```cmd
npx prisma generate
```

### مشکل: پورت 3000 اشغال است
سرور قبلی را متوقف کنید یا پورت دیگری استفاده کنید:
```cmd
npx cross-env PORT=3001 node .next/standalone/server.js
```
