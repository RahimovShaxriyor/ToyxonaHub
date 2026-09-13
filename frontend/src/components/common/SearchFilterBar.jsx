import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DISTRICT_OPTIONS } from '../../constants/districts';
import { MapPin, Calendar, Users, DollarSign, Search } from 'lucide-react';
import Button from '../ui/Button';

export function SearchFilterBar({
  initialValues = {},
  variant = 'hero', // 'hero' or 'compact'
  onSearch,
}) {
  const navigate = useNavigate();
  const [district, setDistrict] = useState(initialValues.district || '');
  const [date, setDate] = useState(initialValues.date || '');
  const [guests, setGuests] = useState(initialValues.guests || '');
  const [budget, setBudget] = useState(initialValues.budget || '');

  // Minimum selectable date is today
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent' }).format(new Date());

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (district) params.set('district', district);
    if (date) params.set('date', date);
    if (guests) params.set('minCapacity', guests);
    if (budget) params.set('maxPrice', budget);

    if (onSearch) {
      onSearch({ district, date, minCapacity: guests, maxPrice: budget });
    } else {
      navigate(`/catalog?${params.toString()}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-2xl border border-border shadow-dropdown p-3 sm:p-4 transition-all ${
        variant === 'hero' ? 'max-w-4xl mx-auto' : 'w-full'
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-2">
        {/* 1. District */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border/80 hover:border-border-dark bg-canvas/30 focus-within:border-bronze focus-within:ring-2 focus-within:ring-bronze/20 transition-all">
          <MapPin className="w-5 h-5 text-bronze shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider">
              Tuman
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-ink focus:outline-none cursor-pointer truncate"
            >
              <option value="">Barcha tumanlar</option>
              {DISTRICT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Wedding Date */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border/80 hover:border-border-dark bg-canvas/30 focus-within:border-bronze focus-within:ring-2 focus-within:ring-bronze/20 transition-all">
          <Calendar className="w-5 h-5 text-bronze shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider">
              To'y sanasi
            </label>
            <input
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-ink focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* 3. Guests */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border/80 hover:border-border-dark bg-canvas/30 focus-within:border-bronze focus-within:ring-2 focus-within:ring-bronze/20 transition-all">
          <Users className="w-5 h-5 text-bronze shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider">
              Mehmonlar
            </label>
            <input
              type="number"
              min="50"
              step="50"
              placeholder="Masalan, 300"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-ink placeholder:text-muted/60 focus:outline-none"
            />
          </div>
        </div>

        {/* 4. Budget & Search Button */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border/80 hover:border-border-dark bg-canvas/30 focus-within:border-bronze focus-within:ring-2 focus-within:ring-bronze/20 transition-all">
            <DollarSign className="w-5 h-5 text-bronze shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider">
                Maksimal narx
              </label>
              <input
                type="number"
                min="50000"
                step="50000"
                placeholder="so'm / kishi"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-ink placeholder:text-muted/60 focus:outline-none"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="shrink-0 px-5 shadow-sm">
            <Search className="w-5 h-5" />
            <span className="hidden sm:inline">Qidirish</span>
          </Button>
        </div>
      </div>
    </form>
  );
}

export default SearchFilterBar;
