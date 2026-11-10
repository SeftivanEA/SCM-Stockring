import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Field } from '../components/Field';
import { PageHeader } from '../components/PageHeader';
import { UNITS, WAREHOUSE_CATEGORIES } from '../constants';
import { usePermissions } from '../hooks';
import { stokApi } from '../services/stokApi';
import { ui } from '../ui';
import { flattenErrors } from '../utils';

const CAPACITY_UNITS = UNITS.filter((unit) => unit !== 'pcs').concat('pcs');

export default function WarehouseFormPage() {
    const navigate = useNavigate();
    const { canManageWarehouse } = usePermissions();
    const [form, setForm] = useState({
        name: '',
        category: WAREHOUSE_CATEGORIES[0],
        capacity: '',
        unit: 'kg',
        note: '',
    });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);

    const set = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    async function handleSubmit(event) {
        event.preventDefault();
        const found = {};
        if (!form.name.trim()) found.name = 'Nama gudang wajib diisi.';
        if (form.capacity === '' || Number(form.capacity) <= 0) found.capacity = 'Kapasitas wajib diisi dan lebih dari 0.';
        setErrors(found);
        setFormError(null);
        if (Object.keys(found).length > 0) return;

        setSaving(true);
        try {
            await stokApi.createWarehouse({
                name: form.name.trim(),
                category: form.category,
                capacity: Number(form.capacity),
                unit: form.unit,
                note: form.note.trim(),
            });
            navigate('/gudang');
        } catch (err) {
            if (err.errors && Object.keys(err.errors).length) setErrors(flattenErrors(err.errors));
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    }

    // Peran yang hanya boleh melihat tidak boleh membuka form lewat URL langsung.
    if (!canManageWarehouse) return <Navigate to="/gudang" replace />;

    return (
        <div className={ui.page}>
            <PageHeader
                title="Tambah Gudang"
                subtitle="Daftarkan lokasi penyimpanan barang mentah"
                breadcrumb={[{ label: 'Gudang', to: '/gudang' }, { label: 'Tambah Gudang' }]}
            />

            <form onSubmit={handleSubmit} noValidate className={`${ui.card} max-w-2xl space-y-4 p-5`}>
                <Field label="Nama Gudang" required error={errors.name}>
                    {(props) => <input {...props} type="text" placeholder="cth: Gudang D" value={form.name} onChange={set('name')} />}
                </Field>

                <Field label="Kategori Gudang" hint="Pengelompokan berdasarkan jenis barang." error={errors.category}>
                    {(props) => (
                        <select {...props} value={form.category} onChange={set('category')}>
                            {WAREHOUSE_CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    )}
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Kapasitas" required error={errors.capacity}>
                        {(props) => (
                            <input {...props} type="number" min="0" step="any" inputMode="decimal" placeholder="cth: 1000" value={form.capacity} onChange={set('capacity')} />
                        )}
                    </Field>
                    <Field label="Satuan Kapasitas" error={errors.unit}>
                        {(props) => (
                            <select {...props} value={form.unit} onChange={set('unit')}>
                                {CAPACITY_UNITS.map((unit) => (
                                    <option key={unit} value={unit}>
                                        {unit}
                                    </option>
                                ))}
                            </select>
                        )}
                    </Field>
                </div>

                <Field label="Catatan Lokasi" error={errors.note}>
                    {(props) => <textarea {...props} rows={3} placeholder="cth: Lantai 2, belakang dapur" value={form.note} onChange={set('note')} />}
                </Field>

                {formError && (
                    <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                        {formError}
                    </p>
                )}

                <div className="flex items-center justify-between border-t border-[#F9E6A8] pt-4">
                    <Link to="/gudang" className="text-sm font-medium text-[#4D2A00]/70 hover:underline">
                        Batal
                    </Link>
                    <button type="submit" className={ui.btnPrimary} disabled={saving}>
                        {saving ? 'Menyimpan...' : 'Simpan Gudang'}
                    </button>
                </div>
            </form>
        </div>
    );
}