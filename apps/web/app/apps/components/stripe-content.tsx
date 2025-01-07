'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

function StripeContent() {
  const router = useRouter();

  const handleConnect = () => {
    router.push('/stripe');
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center space-x-4">
        <Image
          src="/images/plugins/stripe.png"
          alt="Stripe Logo"
          width={32}
          height={32}
          className="rounded-full"
        />
        <span className="text-sm font-medium text-gray-800">Stripe</span>
      </div>

      <button
        onClick={handleConnect}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        Conectar
      </button>
    </div>
  );
}

export default StripeContent;
