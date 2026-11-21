<?php

namespace App\Http\Requests\Tugas;

use Illuminate\Foundation\Http\FormRequest;

class StoreTugasRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'jenis' => ['required', 'string', 'in:Pengiriman,Penataan'],
            'judul' => ['required', 'string', 'max:255'],
            'detail' => ['required', 'string'],
            'user_id' => ['nullable', 'exists:users,id'],
            'status' => ['nullable', 'string', 'in:Baru,Diproses,Selesai'],
        ];
    }
}
