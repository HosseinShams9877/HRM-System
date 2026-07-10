// src/modules/employees/hooks/index.ts
export {
    useDocuments,
    useUploadDocument,
    useDeleteDocument,
    useUpdateDocument,
    type Document,
  } from './useDocuments'

  export {
    useWorkHistory,
    useSingleWorkHistory,
    useCurrentWorkHistory,
    useCreateWorkHistory,
    useUpdateWorkHistory,
    useDeleteWorkHistory,
    useBulkWorkHistory,
    workHistoryKeys,
    type WorkHistory,
    type WorkHistoryFormData,
    type WorkHistoryFilters,
  } from './use-work-history'