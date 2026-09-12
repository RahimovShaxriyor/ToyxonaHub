import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hallsApi } from '../../api/halls.api';
import HallCard from '../../components/common/HallCard';
import { HallCardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { TASHKENT_DISTRICTS, SORT_OPTIONS } from '../../constants/districts';
import { Filter, SlidersHorizontal, X, RotateCcw, Building2 } from 'lucide-react';

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [minCapacity, setMinCapacity] = useState(searchParams.get('minCapacity') || '');
  const [maxCapacity, setMaxCapacity] = useState(searchParams.get('maxCapacity') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt:desc');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state when URL params change externally (e.g. from Home search or Quick Categories)
  useEffect(() => {
    setDistrict(searchParams.get('district') || '');
    setMinCapacity(searchParams.get('minCapacity') || '');
    setMaxCapacity(searchParams.get('maxCapacity') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSearch(searchParams.get('search') || '');
    setSort(searchParams.get('sort') || 'createdAt:desc');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  // Query parameters for API
  const queryParams = {
    search: search || undefined,
    district: district || undefined,
    minCapacity: minCapacity ? Number(minCapacity) : undefined,
    maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort,
    page,
    limit: 9,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['catalog-halls', queryParams],
    queryFn: () => hallsApi.getHalls(queryParams),
  });

  const halls = data?.data?.items || data?.data || [];
  const pagination = data?.data?.pagination || { page: 1, totalPages: 1, total: halls.length };

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    const newParams = new URLSearchParams();
    if (search) newParams.set('search', search);
    if (district) newParams.set('district', district);
    if (minCapacity) newParams.set('minCapacity', minCapacity);
    if (maxCapacity) newParams.set('maxCapacity', maxCapacity);
    if (minPrice) newParams.set('minPrice', minPrice);
    if (maxPrice) newParams.set('maxPrice', maxPrice);
    if (sort) newParams.set('sort', sort);
    newParams.set('page', '1');
    setSearchParams(newParams);
    setMobileFiltersOpen(false);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDistrict('');
    setMinCapacity('');
    setMaxCapacity('');
    setMinPrice('');
    setMaxPrice('');
    setSort('createdAt:desc');
    setPage(1);
    setSearchParams({});
    setMobileFiltersOpen(false);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    searchParams.set('page', String(newPage));
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
            Toshkent to'yxonalari
          </h1>
          <p className="text-sm text-muted mt-1">
            Qidiruv natijasida {pagination.total || halls.length} ta to'yxona topildi
          </p>
        </div>

        {/* Mobile Filter Toggle & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            className="lg:hidden flex-1"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <Filter className="w-4 h-4 text-bronze" />
            Filtrlar
          </Button>

          <div className="w-48 sm:w-56">
            <Select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                searchParams.set('sort', e.target.value);
                setSearchParams(searchParams);
              }}
              options={SORT_OPTIONS}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1">
          <form
            onSubmit={handleApplyFilters}
            className="bg-white rounded-2xl border border-border p-5 shadow-card space-y-5 sticky top-28"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2 font-bold text-sm text-ink">
                <SlidersHorizontal className="w-4 h-4 text-bronze" />
                Filtrlar
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-muted hover:text-bronze flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Tozalash
              </button>
            </div>

            {/* Keyword Search */}
            <Input
              label="Qidiruv"
              placeholder="To'yxona nomi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* District */}
            <Select
              label="Tuman"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Barcha tumanlar"
              options={TASHKENT_DISTRICTS.map((d) => ({ value: d, label: `${d} tumani` }))}
            />

            {/* Capacity Range */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                Sig'im (kishi)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minCapacity}
                  onChange={(e) => setMinCapacity(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm bg-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm bg-white"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                O'rindiq narxi (so'm)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min narx"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm bg-white"
                />
                <input
                  type="number"
                  placeholder="Max narx"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm bg-white"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full justify-center">
              Filtrlarni qo'llash
            </Button>
          </form>
        </aside>

        {/* Mobile Filters Drawer Modal */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/50 backdrop-blur-xs">
            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-border p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                <h3 className="font-bold text-base text-ink">Filtrlar</h3>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-muted hover:text-ink"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApplyFilters} className="space-y-4">
                <Input
                  label="Qidiruv"
                  placeholder="To'yxona nomi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <Select
                  label="Tuman"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Barcha tumanlar"
                  options={TASHKENT_DISTRICTS.map((d) => ({ value: d, label: `${d} tumani` }))}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Min sig'im"
                    type="number"
                    placeholder="100"
                    value={minCapacity}
                    onChange={(e) => setMinCapacity(e.target.value)}
                  />
                  <Input
                    label="Max sig'im"
                    type="number"
                    placeholder="1000"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Min narx"
                    type="number"
                    placeholder="100000"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <Input
                    label="Max narx"
                    type="number"
                    placeholder="500000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="flex-1"
                    onClick={handleResetFilters}
                  >
                    Tozalash
                  </Button>
                  <Button type="submit" variant="primary" size="md" className="flex-1">
                    Ko'rish
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Catalog Hall Grid */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <HallCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="bg-white rounded-2xl border border-border p-8 text-center">
              <p className="text-sm text-rose-600 mb-4">To'yxonalar ro'yxatini yuklashda xatolik yuz berdi.</p>
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Qayta yuklash
              </Button>
            </div>
          ) : halls.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-12">
              <EmptyState
                icon={Building2}
                title="Hech qanday to'yxona topilmadi"
                description="Kiritilgan parametrlar bo'yicha hech qanday to'yxona mos kelmadi. Filtrlarni tozalab ko'ring."
                actionLabel="Filtrlarni tozalash"
                onAction={handleResetFilters}
              />
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {halls.map((hall) => (
                  <HallCard key={hall.id} hall={hall} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-border">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Oldingi
                  </Button>

                  <span className="text-xs text-muted font-medium px-3">
                    Sahifa {page} / {pagination.totalPages}
                  </span>

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Keyingi
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CatalogPage;
