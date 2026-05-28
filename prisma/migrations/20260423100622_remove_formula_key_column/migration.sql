/*
  Warnings:

  - You are about to drop the column `family` on the `PaySlip` table. All the data in the column will be lost.
  - You are about to drop the column `food` on the `PaySlip` table. All the data in the column will be lost.
  - You are about to drop the column `housing` on the `PaySlip` table. All the data in the column will be lost.
  - You are about to drop the column `insurance` on the `PaySlip` table. All the data in the column will be lost.
  - You are about to drop the column `loanDeduction` on the `PaySlip` table. All the data in the column will be lost.
  - You are about to drop the column `otherAdds` on the `PaySlip` table. All the data in the column will be lost.
  - You are about to drop the column `otherDeductions` on the `PaySlip` table. All the data in the column will be lost.
  - You are about to drop the column `overtime` on the `PaySlip` table. All the data in the column will be lost.
  - You are about to drop the column `performance` on the `PaySlip` table. All the data in the column will be lost.
  - You are about to drop the column `tax` on the `PaySlip` table. All the data in the column will be lost.
  - You are about to drop the column `totalAdds` on the `PaySlip` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "PayrollItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "calculationType" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "formulaId" TEXT,
    "isInsurable" BOOLEAN NOT NULL DEFAULT true,
    "isTaxable" BOOLEAN NOT NULL DEFAULT true,
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "year" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PayrollItem_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "SalaryFormula" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaxBracket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "orderNum" INTEGER NOT NULL,
    "minAmount" REAL NOT NULL,
    "maxAmount" REAL NOT NULL,
    "rate" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PayrollSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "minDailyWage" REAL NOT NULL,
    "minMonthlyWage" REAL NOT NULL DEFAULT 0,
    "baseSalaryDefault" REAL NOT NULL DEFAULT 0,
    "workHoursPerDay" REAL NOT NULL DEFAULT 8,
    "workDaysPerMonth" REAL NOT NULL DEFAULT 30,
    "insuranceRate" REAL NOT NULL DEFAULT 7,
    "employerInsRate" REAL NOT NULL DEFAULT 23,
    "unemploymentInsRate" REAL NOT NULL DEFAULT 1,
    "insuranceCeilingMultiplier" REAL NOT NULL DEFAULT 7,
    "overtimeMultiplier" REAL NOT NULL DEFAULT 1.4,
    "nightShiftMultiplier" REAL NOT NULL DEFAULT 1.15,
    "mixedNightMultiplier" REAL NOT NULL DEFAULT 1.35,
    "fridayWorkMultiplier" REAL NOT NULL DEFAULT 1.4,
    "holidayWorkMultiplier" REAL NOT NULL DEFAULT 1.4,
    "eidiMinDays" INTEGER NOT NULL DEFAULT 60,
    "eidiMaxDays" INTEGER NOT NULL DEFAULT 90,
    "sanavatRate" REAL NOT NULL DEFAULT 0,
    "sanavatMaxYears" REAL NOT NULL DEFAULT 30,
    "taxExemptAmount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PaySlipItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paySlipId" TEXT NOT NULL,
    "payrollItemId" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaySlipItem_paySlipId_fkey" FOREIGN KEY ("paySlipId") REFERENCES "PaySlip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PaySlipItem_payrollItemId_fkey" FOREIGN KEY ("payrollItemId") REFERENCES "PayrollItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalaryFormula" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "expression" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SalaryFormulaVariable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formulaId" TEXT NOT NULL,
    "varName" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "label" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalaryFormulaVariable_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "SalaryFormula" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PaySlip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "baseSalary" REAL NOT NULL,
    "totalAllowances" REAL NOT NULL DEFAULT 0,
    "totalDeductions" REAL NOT NULL DEFAULT 0,
    "grossSalary" REAL NOT NULL DEFAULT 0,
    "netSalary" REAL NOT NULL DEFAULT 0,
    "workDays" REAL NOT NULL DEFAULT 30,
    "overtimeHours" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaySlip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PaySlip" ("baseSalary", "createdAt", "employeeId", "id", "month", "netSalary", "status", "totalDeductions", "updatedAt", "year") SELECT "baseSalary", "createdAt", "employeeId", "id", "month", "netSalary", "status", "totalDeductions", "updatedAt", "year" FROM "PaySlip";
DROP TABLE "PaySlip";
ALTER TABLE "new_PaySlip" RENAME TO "PaySlip";
CREATE UNIQUE INDEX "PaySlip_employeeId_year_month_key" ON "PaySlip"("employeeId", "year", "month");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PayrollItem_code_key" ON "PayrollItem"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TaxBracket_year_orderNum_key" ON "TaxBracket"("year", "orderNum");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollSetting_year_key" ON "PayrollSetting"("year");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryFormula_code_key" ON "SalaryFormula"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryFormulaVariable_formulaId_varName_key" ON "SalaryFormulaVariable"("formulaId", "varName");
