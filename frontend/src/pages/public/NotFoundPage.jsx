import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-5">
        <div className="font-serif text-7xl font-extrabold text-bronze/30">404</div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
          Sahifa topilmadi
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga ko'chirilgan bo'lishi mumkin.
        </p>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Button variant="secondary" size="md" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate('/')}>
            <Home className="w-4 h-4" />
            Bosh sahifa
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
