'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavigationBar = ({ orderId }: { orderId: string }) => {
  const pathname = usePathname();
  const navigationOptions = ['activity', 'details', 'files'];

  return (
    <nav>
      <ul className="flex w-full rounded-lg border border-gray-200 bg-gray-50">
        {navigationOptions.map((item) => {
          const href = `/orders/${orderId}/${item}`;
          const isActive = pathname === href;

          return (
            <Link
              key={item}
              href={href}
              className={`p-2 font-semibold ${isActive ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Link>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavigationBar;
