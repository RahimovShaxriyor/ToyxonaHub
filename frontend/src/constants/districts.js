export const DISTRICT_OPTIONS = [
  { value: 'BEKTEMIR', label: 'Bektemir tumani', shortLabel: 'Bektemir' },
  { value: 'CHILONZOR', label: 'Chilonzor tumani', shortLabel: 'Chilonzor' },
  { value: 'YASHNOBOD', label: 'Yashnobod tumani', shortLabel: 'Yashnobod' },
  { value: 'MIROBOD', label: 'Mirobod tumani', shortLabel: 'Mirobod' },
  { value: 'MIRZO_ULUGBEK', label: "Mirzo Ulug'bek tumani", shortLabel: "Mirzo Ulug'bek" },
  { value: 'SERGELI', label: 'Sergeli tumani', shortLabel: 'Sergeli' },
  { value: 'SHAYXONTOHUR', label: 'Shayxontohur tumani', shortLabel: 'Shayxontohur' },
  { value: 'OLMAZOR', label: 'Olmazor tumani', shortLabel: 'Olmazor' },
  { value: 'UCHTEPA', label: 'Uchtepa tumani', shortLabel: 'Uchtepa' },
  { value: 'YAKKASAROY', label: 'Yakkasaroy tumani', shortLabel: 'Yakkasaroy' },
  { value: 'YUNUSOBOD', label: 'Yunusobod tumani', shortLabel: 'Yunusobod' },
  { value: 'YANGIHAYOT', label: 'Yangihayot tumani', shortLabel: 'Yangihayot' },
];

export const TASHKENT_DISTRICTS = DISTRICT_OPTIONS.map((d) => d.value);

export const DISTRICT_MAP = Object.fromEntries(
  DISTRICT_OPTIONS.map((d) => [d.value, d.shortLabel])
);

export const getDistrictLabel = (district) => {
  if (!district) return '';
  return DISTRICT_MAP[district] || district;
};

export const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Eng yangilar' },
  { value: 'pricePerSeat:asc', label: 'Narx: arzonroqdan' },
  { value: 'pricePerSeat:desc', label: 'Narx: qimmatroqdan' },
  { value: 'capacity:desc', label: "Sig'im: kattaroqdan" },
  { value: 'capacity:asc', label: "Sig'im: kichikroqdan" },
];
