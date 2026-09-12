export const parsePaginationQuery = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  return { page, limit };
};

export const buildPaginationMetadata = ({ page, limit, total }) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
  };
};

export const buildPrismaPagination = ({ page, limit }) => {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
};
