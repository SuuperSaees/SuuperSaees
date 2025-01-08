import React, { useEffect, useState } from 'react';

import { Copy, Eye, EyeOff } from 'lucide-react';
import { Info } from 'lucide-react';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { toast } from 'sonner';

import Tooltip from '~/components/ui/tooltip';

import { getAccountPluginByIdAction } from '../../../../../packages/plugins/src/server/actions/account-plugins/get-account-plugin-by-Id';
import { updateAccountPluginAction } from '../../../../../packages/plugins/src/server/actions/account-plugins/update-account-plugin';

function TreliContentStatic({ pluginId }: { pluginId: string }) {
  const [credentials, setCredentials] = useState<{
    treli_user: string;
    treli_password: string;
    webhook_url: string;
  }>({
    treli_user: '',
    treli_password: '',
    webhook_url: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!pluginId) return;

    const fetchPluginData = async () => {
      try {
        setIsLoading(true);
        const response = await getAccountPluginByIdAction(pluginId);

        if (response?.success) {
          const fetchedCredentials = response.success.data
            ?.credentials as Record<string, unknown>;

          setCredentials({
            treli_user: (fetchedCredentials?.treli_user as string) || '',
            treli_password:
              (fetchedCredentials?.treli_password as string) || '',
            webhook_url: (fetchedCredentials?.webhook_url as string) || '',
          });
        } else {
          throw new Error(
            response?.error?.message ?? 'Failed to fetch plugin data',
          );
        }
      } catch (error) {
        console.error('Error fetching Treli credentials:', error);
        toast.error('Error al cargar las credenciales de Treli.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPluginData();
  }, [pluginId]);

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('All set!', {
        description: 'Content copied to clipboard',
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy content to clipboard.');
    }
  };

  const handleUpdate = async (field: string, value: string) => {
    try {
      const updatedCredentials = { ...credentials, [field]: value };

      await updateAccountPluginAction(pluginId, {
        credentials: updatedCredentials,
      });

      setCredentials(updatedCredentials);
      toast.success('¡Actualización exitosa!', {
        description: `El campo ${field} se actualizó correctamente.`,
      });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error('Error al actualizar las credenciales.');
    }
  };

  const handleChange = (field: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="flex justify-center">
          <span>Cargando...</span>
        </div>
      ) : (
        <>
          {/* Usuario Treli */}
          <div className="mb-6 grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 text-sm font-medium text-gray-700">
              Usuario *
            </label>
            <div className="relative col-span-2">
              <ThemedInput
                className="w-full"
                value={credentials.treli_user}
                placeholder="Ingresa tu usuario"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange('treli_user', e.target.value)
                }
                onBlur={() =>
                  handleUpdate('treli_user', credentials.treli_user)
                }
              />
              <button
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                type="button"
                onClick={() => handleCopyToClipboard(credentials.treli_user)}
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Contraseña Treli */}
          <div className="grid grid-cols-3 items-center gap-4">
            <label className="col-span-1 text-sm font-medium text-gray-700">
              Contraseña *
            </label>
            <div className="relative col-span-2">
              <ThemedInput
                className="w-full"
                type={showPassword ? 'text' : 'password'}
                value={credentials.treli_password}
                placeholder="Ingresa tu contraseña"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange('treli_password', e.target.value)
                }
                onBlur={() =>
                  handleUpdate('treli_password', credentials.treli_password)
                }
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
            <p className="mt-1 flex items-center text-sm text-gray-500">
              Conéctate a múltiples pasarelas de pago en LATAM y vende tus
              servicios como suscripción.
              <Tooltip
                content={
                  <div className="max-w-xs text-xs">
                    Configura el webhook en Treli para recibir notificaciones de
                    eventos como la creación de suscripciones. <br />
                    <span className="font-semibold">Pasos:</span>
                    <ol className="ml-4 mt-1 list-decimal">
                      <li>Ir a Configuraciones - API Keys y Webhooks</li>
                      <li>Ingresar a Webhooks - Agregar Webhook</li>
                      <li>Completar el formulario (utiliza la url que se genero)</li>
                      <li>Seleccionar el evento Suscripción creada en eventos a enviar</li>
                    </ol>
                  </div>
                }
                delayDuration={300}
              >
                <button
                  type="button"
                  className="ml-2 text-gray-500 hover:text-gray-700"
                  aria-label="Más información sobre cómo configurar el webhook"
                >
                  <Info className="h-4 w-4" />
                </button>
              </Tooltip>
            </p>
            <div className="mt-4 grid grid-cols-3 items-center gap-4">
              <label className="col-span-1 text-sm font-medium text-gray-700">
                URL de acceso *
              </label>
              <div className="relative col-span-2">
                <ThemedInput
                  value={credentials.webhook_url}
                  placeholder="Ingresa la URL del webhook"
                  className="w-full"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange('webhook_url', e.target.value)
                  }
                  onBlur={() =>
                    handleUpdate('webhook_url', credentials.webhook_url)
                  }
                />
                <button
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  type="button"
                  onClick={() => handleCopyToClipboard(credentials.webhook_url)}
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TreliContentStatic;
