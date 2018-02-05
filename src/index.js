import { makeCrud } from './service'

export function configure ({
  baseUrl = '',
  crudRequest,
  makeCrudService
}) {
  return {
    makeCrud: (args) => makeCrud({
      baseUrl,
      crudRequest,
      makeCrudService,
      ...args
    })
  }
}
