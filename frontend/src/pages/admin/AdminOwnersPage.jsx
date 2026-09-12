import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownersApi } from '../../api/owners.api';
import { hallsApi } from '../../api/halls.api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { Users, UserPlus, Building2, Phone, Mail, Link as LinkIcon } from 'lucide-react';

export function AdminOwnersPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedHallId, setSelectedHallId] = useState('');

  // Create Owner Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Fetch owners
  const { data: ownersData, isLoading } = useQuery({
    queryKey: ['admin-owners-list'],
    queryFn: () => ownersApi.getOwners({ limit: 100 }),
  });

  // Fetch halls for assignment
  const { data: hallsData } = useQuery({
    queryKey: ['admin-halls-for-assignment'],
    queryFn: () => hallsApi.getHalls({ limit: 100 }),
  });

  const owners = ownersData?.data?.items || ownersData?.data || [];
  const halls = hallsData?.data?.items || hallsData?.data || [];

  // Create owner mutation
  const createMutation = useMutation({
    mutationFn: (payload) => ownersApi.createOwner(payload),
    onSuccess: () => {
      toast.success("Yangi mulkdor muvaffaqiyatli yaratildi!");
      setIsCreateModalOpen(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-owners-list'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Mulkdor yaratishda xatolik yuz berdi.');
    },
  });

  // Assign hall mutation
  const assignMutation = useMutation({
    mutationFn: ({ ownerId, weddingHallId }) =>
      ownersApi.assignHall(ownerId, { weddingHallId }),
    onSuccess: () => {
      toast.success("To'yxona mulkdorga biriktirildi!");
      setIsAssignModalOpen(false);
      setSelectedOwner(null);
      setSelectedHallId('');
      queryClient.invalidateQueries({ queryKey: ['admin-owners-list'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Biriktirishda xatolik yuz berdi.');
    },
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!selectedHallId || !selectedOwner) {
      toast.error("Iltimos, to'yxonani tanlang.");
      return;
    }
    assignMutation.mutate({ ownerId: selectedOwner.id, weddingHallId: selectedHallId });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
            Mulkdorlar boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            To'yxona egalari akkauntlari va to'yxonalarni biriktirish
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
          className="shadow-sm self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Yangi mulkdor qo'shish
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : owners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12">
          <EmptyState
            icon={Users}
            title="Mulkdorlar mavjud emas"
            description="Tizimda hali bitta ham mulkdor qo'shilmagan."
            actionLabel="Yangi mulkdor yaratish"
            onAction={() => setIsCreateModalOpen(true)}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {owners.map((owner) => (
            <div
              key={owner.id}
              className="bg-white rounded-2xl border border-border p-5 shadow-card hover:border-border-dark transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-ink">
                    {owner.firstName} {owner.lastName}
                  </h3>
                  <span className="text-xs text-muted">(@{owner.username})</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-bronze" />
                    {owner.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-bronze" />
                    {owner.phone}
                  </span>
                </div>

                {owner.weddingHalls && owner.weddingHalls.length > 0 && (
                  <div className="pt-1 flex items-center gap-1.5 text-xs text-ink">
                    <Building2 className="w-3.5 h-3.5 text-bronze" />
                    <span className="font-medium">
                      Biriktirilgan to'yxonalar:{' '}
                      {owner.weddingHalls.map((h) => h.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-stretch md:self-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border/80">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedOwner(owner);
                    setIsAssignModalOpen(true);
                  }}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  To'yxona biriktirish
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Owner */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Yangi to'yxona mulkdorini yaratish"
        description="Mulkdor shaxsiy ma'lumotlarini to'ldiring. Ular tizimga kirish uchun foydalaniladi."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3.5 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ism"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Familiya"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <Input
            label="Foydalanuvchi nomi"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />

          <Input
            label="Elektron pochta"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Telefon raqami"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+998 90 123 45 67"
            required
          />

          <Input
            label="Boshlang'ich parol"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={createMutation.isPending}
            >
              Mulkdorni yaratish
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Hall */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedOwner(null);
        }}
        title="To'yxonani mulkdorga biriktirish"
        description={`${selectedOwner?.firstName} ${selectedOwner?.lastName} hisobiga to'yxonani biriktiring.`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 mt-4">
          <Select
            label="To'yxonani tanlang"
            value={selectedHallId}
            onChange={(e) => setSelectedHallId(e.target.value)}
            placeholder="To'yxonani tanlang..."
            options={halls.map((h) => ({ value: h.id, label: `${h.name} (${h.district})` }))}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => {
                setIsAssignModalOpen(false);
                setSelectedOwner(null);
              }}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={assignMutation.isPending}
            >
              Biriktirish
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminOwnersPage;
