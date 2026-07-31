// src/modules/payroll/components/settings/settings-tab.tsx

'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { SettingsForm } from './components/settings-form'
import { PayrollItemsTable } from './components/payroll-items-table'
import { TaxBracketsTable } from './components/tax-brackets-table'
import { PayrollItemFormDialog } from './components/payroll-item-form-dialog'
import { useSettings } from './hooks/use-settings'
import { usePayrollItems } from './hooks/use-payroll-items'
import { useTaxBrackets } from './hooks/use-tax-brackets'

export function SettingsTab({ year }: { year: number }) {
  const [itemDialog, setItemDialog] = useState<{ open: boolean; item: any | null }>({ 
    open: false, 
    item: null 
  })

  const settings = useSettings(year)
  const items = usePayrollItems(year)
  const brackets = useTaxBrackets(year)

  useEffect(() => {
    settings.fetchSettings()
    items.fetchItems()
    brackets.fetchBrackets()
  }, [])

  if (settings.loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsForm
        year={year}
        setting={settings.setting}
        form={settings.form}
        setForm={settings.setForm}
        editing={settings.editing}
        setEditing={settings.setEditing}
        saving={settings.saving}
        onSave={settings.saveSettings}
        onRefresh={settings.fetchSettings}
      />

      <PayrollItemsTable
        items={items.items}
        loading={items.loading}
        togglingId={items.togglingId}
        year={year}
        onToggleActive={items.toggleActive}
        onDelete={items.deleteItem}
        onEdit={(item) => setItemDialog({ open: true, item })}
        onAdd={() => setItemDialog({ open: true, item: null })}
        onRefresh={items.fetchItems}
      />

      <TaxBracketsTable
        brackets={brackets.brackets}
        loading={brackets.loading}
        year={year}
        onAdd={brackets.addBracket}
        onUpdate={brackets.updateBracket}
        onDelete={brackets.deleteBracket}
        onRefresh={brackets.fetchBrackets}
      />

      <PayrollItemFormDialog
        open={itemDialog.open}
        onClose={() => setItemDialog({ open: false, item: null })}
        onSave={async (data) => {
          const success = await items.saveItem(data, itemDialog.item?.id)
          if (success) {
            setItemDialog({ open: false, item: null })
          }
        }}
        initialData={itemDialog.item}
        year={year}
      />
    </div>
  )
}