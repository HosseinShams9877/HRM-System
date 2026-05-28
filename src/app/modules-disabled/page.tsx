// app/modules-disabled/page.tsx
export default function ModulesDisabledPage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            دسترسی غیرفعال
          </h1>
          <p className="text-gray-600 mb-6">
            این ماژول در حال حاضر غیرفعال شده است.
          </p>
          <a 
            href="/dashboard" 
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            بازگشت به داشبورد
          </a>
        </div>
      </div>
    )
  }