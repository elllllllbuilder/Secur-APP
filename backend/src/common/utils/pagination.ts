export function getPagination(page = 1, limit = 10) {
  const take = Math.min(limit, 100);
  const skip = (page - 1) * take;
  return { skip, take };
}

export function getPagingData<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  const totalPages = Math.ceil(total / limit);
  return { data, total, page, totalPages };
}
