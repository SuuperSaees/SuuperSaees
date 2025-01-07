'use client';

import React, { useState } from 'react';

import { Copy, Eye, EyeOff } from 'lucide-react';
import { CopyDomain } from 'node_modules/@kit/accounts/src/components/personal-account-settings/copy-domain';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { toast } from 'sonner';

function TreliContentStatic() {
  const [showPassword, setShowPassword] = useState(false);

  const handleCopy = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('¡Éxito!', {
        description: 'Texto copiado al portapapeles.',
      });
    } catch (err) {
      toast.error('Error', {
        description: 'No se pudo copiar el texto al portapapeles.',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-6 grid grid-cols-3 items-center gap-4">
        <label className="col-span-1 text-sm font-medium text-gray-700">
          Usuario *
        </label>
        <div className="relative col-span-2">
          <ThemedInput
            className="w-full"
            value="devsanta"
            placeholder="Ingresa tu usuario"
            readOnly
          />
          <button
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            type="button"
            onClick={() => handleCopy('devsanta')}
          >
            <Copy className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <label className="col-span-1 text-sm font-medium text-gray-700">
          Contraseña *
        </label>
        <div className="relative col-span-2">
          <ThemedInput
            className="w-full"
            type={showPassword ? 'text' : 'password'}
            value="********"
            placeholder="Ingresa tu contraseña"
            readOnly
          />
          <button
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Webhook Section */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-800">
          Conecta el webhook de Treli a Suuper
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Conéctate a múltiples pasarelas de pago en LATAM y vende tus servicios
          como suscripción.
        </p>
        <div className="mt-4 grid grid-cols-3 items-center gap-4">
          <label className="col-span-1 text-sm font-medium text-gray-700">
            URL de acceso *
          </label>
          <div className="relative col-span-2">
            <CopyDomain
              value="https://www.untitledui.com"
              className="w-full"
              label="Copiar URL"
            />
            <button
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              type="button"
              onClick={() => handleCopy('https://www.untitledui.com')}
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TreliContentStatic;
