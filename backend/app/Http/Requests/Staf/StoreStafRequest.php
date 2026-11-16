<?php

namespace App\Http\Requests\Staf;

use Illuminate\Foundation\Http\FormRequest;

class StoreStafRequest extends FormRequest
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
            'nama' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'password' => ['required', 'string', 'min:6'],
            'divisi_id' => ['nullable', 'exists:divisis,id'],
            'role' => ['nullable', 'string', 'in:pemilik,pendataan,penataan,pengiriman,audit,staf'],
        ];
    }
}
