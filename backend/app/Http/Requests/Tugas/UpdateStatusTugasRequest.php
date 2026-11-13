<?php

namespace App\Http\Requests\Tugas;

use App\Models\Tugas;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateStatusTugasRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $tugas = $this->route('tugas');

        if (! $user) {
            return false;
        }

        if ($user->role === 'pemilik') {
            return true;
        }

        if (! $tugas instanceof Tugas) {
            $tugas = Tugas::find($tugas);
        }

        if (! $tugas) {
            return true;
        }

        return match ($user->role) {
            'penataan' => $tugas->jenis === 'Penataan',
            'pengiriman' => $tugas->jenis === 'Pengiriman',
            default => false,
        };
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization(): void
    {
        abort(403, 'Akses ditolak untuk jenis tugas ini.');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:Baru,Diproses,Selesai'],
            'penerima' => ['nullable', 'string', 'max:255'],
            'catatan' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $tugas = $this->route('tugas');
            if (! $tugas instanceof Tugas) {
                $tugas = Tugas::find($tugas);
            }

            if (! $tugas) {
                return;
            }

            $newStatus = $this->input('status');

            if ($tugas->status === 'Selesai') {
                $validator->errors()->add('status', 'Tugas yang sudah selesai tidak dapat diubah statusnya.');

                return;
            }

            $allowedTransitions = [
                'Baru' => ['Diproses', 'Selesai'],
                'Diproses' => ['Baru', 'Selesai'],
            ];

            $allowed = $allowedTransitions[$tugas->status] ?? [];
            if (! in_array($newStatus, $allowed, true)) {
                $validator->errors()->add('status', "Perpindahan status dari {$tugas->status} ke {$newStatus} tidak diizinkan.");
            }

            if ($tugas->jenis === 'Pengiriman' && $newStatus === 'Selesai') {
                if (blank($this->input('penerima'))) {
                    $validator->errors()->add('penerima', 'Nama penerima wajib diisi untuk tugas pengiriman yang selesai.');
                }
            }
        });
    }
}
