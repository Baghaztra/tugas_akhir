import type { WorkerTask } from '#shared/types/worker'

export const useEmployeeTasks = (id: number) => {
  const { apiBase } = useRuntimeConfig().public
  const { data, status, error } = useFetch<WorkerTask[]>(
    `${apiBase}/workers/${id}/tasks?limit=20`,
    {
      credentials: 'include',
      default: () => [],
    },
  )
  return { tasks: data, status, error }
}