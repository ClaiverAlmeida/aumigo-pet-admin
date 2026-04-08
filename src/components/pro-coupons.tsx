import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react';
import { couponsService, type Coupon, type CouponDiscountType } from '../services/coupons.service';
import { serviceProvidersService, type ServiceProvider } from '../services/service-providers.service';
// @ts-ignore
import './pro-coupons.css';

export function ProCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [form, setForm] = useState({
    code: '',
    title: '',
    discountType: 'PERCENTAGE' as CouponDiscountType,
    discountValue: '',
    startsAt: '',
    endsAt: '',
    usageLimit: '',
    providerId: '',
  });
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [actionLoadingCouponId, setActionLoadingCouponId] = useState<string | null>(null);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'expired' | 'inactive'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const providerOptions = useMemo(() => providers.map((provider) => ({ id: provider.id, name: provider.name })), [providers]);
  const now = new Date();
  const activeCoupons = useMemo(
    () => coupons.filter((coupon) => coupon.active && new Date(coupon.endsAt) >= now),
    [coupons, now],
  );
  const expiredCoupons = useMemo(
    () => coupons.filter((coupon) => coupon.active && new Date(coupon.endsAt) < now),
    [coupons, now],
  );
  const inactiveCoupons = useMemo(
    () => coupons.filter((coupon) => !coupon.active),
    [coupons],
  );
  const couponsByTab = useMemo(() => {
    if (activeTab === 'active') return activeCoupons;
    if (activeTab === 'expired') return expiredCoupons;
    return inactiveCoupons;
  }, [activeTab, activeCoupons, expiredCoupons, inactiveCoupons]);
  const filteredCoupons = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return couponsByTab;
    return couponsByTab.filter((coupon) => {
      const usageText = `${coupon.usedCount ?? 0}/${coupon.usageLimit ?? '∞'}`.toLowerCase();
      const discountText =
        coupon.discountType === 'PERCENTAGE'
          ? `${coupon.discountValue}%`
          : `r$ ${coupon.discountValue}`;
      const startDate = new Date(coupon.startsAt).toLocaleDateString('pt-BR');
      const endDate = new Date(coupon.endsAt).toLocaleDateString('pt-BR');
      const searchableText = [
        coupon.code,
        coupon.title,
        coupon.providerId,
        discountText,
        usageText,
        startDate,
        endDate,
      ]
        .join(' ')
        .toLowerCase();
      return searchableText.includes(normalizedTerm);
    });
  }, [couponsByTab, searchTerm]);
  const load = async () => {
    const [couponRes, providersRes] = await Promise.all([couponsService.list(), serviceProvidersService.list()]);
    if (couponRes.success && couponRes.data) setCoupons(couponRes.data);
    if (providersRes.success && providersRes.data) {
      const raw = providersRes.data as any;
      const data = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      setProviders(data);
      if (!form.providerId && data[0]?.id) {
        setForm((prev) => ({ ...prev, providerId: data[0].id }));
      }
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const resetForm = () => {
    setForm((prev) => ({
      ...prev,
      code: '',
      title: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      startsAt: '',
      endsAt: '',
      usageLimit: '',
    }));
  };
  const toDateTimeLocalValue = (isoDate: string) => {
    const date = new Date(isoDate);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  };
  const saveCoupon = async () => {
    if (!form.code || !form.title || !form.providerId || !form.startsAt || !form.endsAt) return;
    setLoading(true);
    const payload = {
      code: form.code,
      title: form.title,
      providerId: form.providerId,
      discountType: form.discountType,
      discountValue: Number(form.discountValue || 0),
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
    };
    if (editingCouponId) {
      await couponsService.update(editingCouponId, payload);
    } else {
      await couponsService.create(payload);
    }
    resetForm();
    await load();
    setShowCreateForm(false);
    setEditingCouponId(null);
    setLoading(false);
  };
  const startEdit = (coupon: Coupon) => {
    setEditingCouponId(coupon.id);
    setForm({
      code: coupon.code,
      title: coupon.title,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue ?? ''),
      startsAt: toDateTimeLocalValue(coupon.startsAt),
      endsAt: toDateTimeLocalValue(coupon.endsAt),
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
      providerId: coupon.providerId,
    });
    setShowCreateForm(true);
  };
  const cancelEdit = () => {
    setEditingCouponId(null);
    resetForm();
  };
  const toggleActive = async (coupon: Coupon) => {
    setActionLoadingCouponId(coupon.id);
    await couponsService.update(coupon.id, { active: !coupon.active });
    await load();
    setActionLoadingCouponId(null);
  };
  const deleteCoupon = async (coupon: Coupon) => {
    const confirmed = window.confirm(`Deseja excluir o cupom "${coupon.code}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;
    setActionLoadingCouponId(coupon.id);
    await couponsService.delete(coupon.id);
    await load();
    setActionLoadingCouponId(null);
  };
  return (
    <div className="p-4 space-y-4 pro-coupons-page">
      <Card>
        <CardHeader>
          <CardTitle>Cupons e Promoções</CardTitle>
          <CardDescription>Crie e gerencie cupons para seus serviços.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3 pro-coupons-form-header">
            <p className="text-sm text-muted-foreground">Formulário de criação</p>
            <Button
              type="button"
              variant={showCreateForm ? 'outline' : 'default'}
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="gap-2"
            >
              {showCreateForm ? <ChevronDown className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showCreateForm ? 'Ocultar formulário' : 'Novo cupom'}
            </Button>
          </div>
          {showCreateForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Código</Label>
                <Input value={form.code} onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))} />
              </div>
              <div>
                <Label>Título</Label>
                <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
              </div>
              <div>
                <Label>Serviço</Label>
                <Select value={form.providerId} onValueChange={(value: string) => setForm((prev) => ({ ...prev, providerId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {providerOptions.map((provider) => <SelectItem key={provider.id} value={provider.id}>{provider.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.discountType} onValueChange={(value: string) => setForm((prev) => ({ ...prev, discountType: value as CouponDiscountType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentual</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Valor fixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor do desconto</Label>
                <Input type="number" value={form.discountValue} onChange={(event) => setForm((prev) => ({ ...prev, discountValue: event.target.value }))} />
              </div>
              <div>
                <Label>Limite de uso (opcional)</Label>
                <Input type="number" value={form.usageLimit} onChange={(event) => setForm((prev) => ({ ...prev, usageLimit: event.target.value }))} />
              </div>
              <div>
                <Label>Início</Label>
                <Input type="datetime-local" value={form.startsAt} onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value }))} />
              </div>
              <div>
                <Label>Fim</Label>
                <Input type="datetime-local" value={form.endsAt} onChange={(event) => setForm((prev) => ({ ...prev, endsAt: event.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <div className="flex flex-col md:flex-row gap-2">
                  <Button onClick={saveCoupon} disabled={loading} className="w-full md:w-auto">
                    {loading ? 'Salvando...' : editingCouponId ? 'Salvar alterações' : 'Criar cupom'}
                  </Button>
                  {editingCouponId && (
                    <Button type="button" variant="outline" onClick={cancelEdit} className="w-full md:w-auto">
                      Cancelar edição
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cupons cadastrados</CardTitle>
          <CardDescription>Ativos em vigência, expirados e inativos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value: string) => setActiveTab(value as 'active' | 'expired' | 'inactive')}
            className="pro-coupons-tabs"
          >
            <TabsList className="pro-coupons-tabs-list">
              <TabsTrigger value="active">Ativos ({activeCoupons.length})</TabsTrigger>
              <TabsTrigger value="expired">Expirados ({expiredCoupons.length})</TabsTrigger>
              <TabsTrigger value="inactive">Inativos ({inactiveCoupons.length})</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-3">
              <div className="mb-3">
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por código, título, valor, uso..."
                />
              </div>
              {filteredCoupons.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum cupom nesta aba.
                </p>
              )}
          <div className="space-y-3 pro-coupons-mobile-list">
            {filteredCoupons.map((coupon) => (
              <div key={coupon.id} className="rounded-lg border p-3 space-y-2 pro-coupons-mobile-card">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{coupon.code}</p>
                  <Switch checked={coupon.active} onCheckedChange={() => toggleActive(coupon)} disabled={actionLoadingCouponId === coupon.id} />
                </div>
                <p className="text-sm text-muted-foreground">{coupon.title}</p>
                <p className="text-sm">
                  {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `R$ ${coupon.discountValue}`}
                </p>
                <p className="text-xs">
                  Uso: {(coupon.usedCount ?? 0)}/{coupon.usageLimit ?? '∞'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(coupon.startsAt).toLocaleDateString('pt-BR')} - {new Date(coupon.endsAt).toLocaleDateString('pt-BR')}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => startEdit(coupon)}
                  disabled={actionLoadingCouponId === coupon.id}
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => deleteCoupon(coupon)}
                  disabled={actionLoadingCouponId === coupon.id}
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </div>
            ))}
          </div>
          <div className="pro-coupons-desktop-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Uso</TableHead>
                  <TableHead>Vigência</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>{coupon.code}</TableCell>
                    <TableCell>{coupon.title}</TableCell>
                    <TableCell>{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `R$ ${coupon.discountValue}`}</TableCell>
                    <TableCell>{(coupon.usedCount ?? 0)}/{coupon.usageLimit ?? '∞'}</TableCell>
                    <TableCell>{new Date(coupon.startsAt).toLocaleDateString('pt-BR')} - {new Date(coupon.endsAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell><Switch checked={coupon.active} onCheckedChange={() => toggleActive(coupon)} disabled={actionLoadingCouponId === coupon.id} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => startEdit(coupon)}
                          disabled={actionLoadingCouponId === coupon.id}
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          onClick={() => deleteCoupon(coupon)}
                          disabled={actionLoadingCouponId === coupon.id}
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
