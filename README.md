# 🏢 HRM System - سیستم جامع مدیریت منابع انسانی

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.11.1-green)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-cyan)
![Node](https://img.shields.io/badge/Node-18+-green)

سیستم مدیریت منابع انسانی کامل با قابلیت‌های حضور و غیاب، مدیریت حقوق و دستمزد، ارزیابی عملکرد، آموزش و استخدام.

## ✨ ویژگی‌های اصلی

- 📊 **داشبورد مدیریتی** - نمایش KPI و آمار لحظه‌ای با Recharts
- 👥 **مدیریت کارکنان** - اطلاعات کامل پرسنلی و مدارک
- 📅 **حضور و غیاب** - ثبت تردد، مرخصی، مأموریت
- 💰 **حقوق و دستمزد** - محاسبه خودکار حقوق، بیمه، مالیات
- 🎯 **ارزیابی عملکرد** - تعیین KPI و ارزیابی دوره‌ای
- 📚 **آموزش** - مدیریت دوره‌های آموزشی
- 🎓 **استخدام** - فرآیند جذب و استخدام
- 📱 **پاسخگو** - طراحی ریسپانسیو برای موبایل و دسکتاپ
- 🔐 **احراز هویت** - سیستم ورود با Next-Auth و سطح دسترسی نقش‌محور
- 🎨 **UI زیبا** - کامپوننت‌های shadcn/ui + Framer Motion

## 🛠️ تکنولوژی‌ها

| فناوری | نسخه | توضیح |
|--------|------|-------|
| **Next.js** | 16.1.1 | فریمورک React با App Router |
| **React** | 19.0.0 | کتابخانه前端 |
| **TypeScript** | 5.0 | زبان برنامه‌نویسی |
| **Prisma** | 6.11.1 | ORM برای دیتابیس |
| **Tailwind CSS** | 4.0 | فریمورک CSS |
| **Next-Auth** | 4.24.11 | احراز هویت |
| **Recharts** | 2.15.4 | نمودارهای تحلیلی |
| **Framer Motion** | 12.23.2 | انیمیشن‌های پیشرفته |
| **TanStack Query** | 5.100.14 | مدیریت state سمت سرور |
| **Zod** | 4.0.2 | اعتبارسنجی داده‌ها |
| **Zustand** | 5.0.13 | مدیریت state |

## 📦 نصب و راه‌اندازی

```bash
# clone کردن پروژه
git clone https://github.com/HosseinShams9877/HRM-System.git
cd HRM-System

# نصب وابستگی‌ها
npm install

# کپی کردن فایل محیطی
cp .env.example .env

# تنظیم دیتابیس
npm run db:generate
npm run db:push

# اجرای در حالت توسعه (پورت 4000)
npm run dev