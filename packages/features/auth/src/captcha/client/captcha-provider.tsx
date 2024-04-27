'use client';

import { createContext, useState } from 'react';

import { TurnstileInstance } from '@marsidev/react-turnstile';

export const Captcha = createContext<{
  token: string;
  setToken: (token: string) => void;
  instance: TurnstileInstance | null;
  setInstance: (ref: TurnstileInstance) => void;
}>({
  token: '',
  instance: null,
  setToken: (_: string) => {
    // do nothing
    return '';
  },
  setInstance: () => {
    // do nothing
  },
});

export function CaptchaProvider(props: { children: React.ReactNode }) {
  const [token, setToken] = useState<string>('');
  const [instance, setInstance] = useState<TurnstileInstance | null>(null);

  return (
    <Captcha.Provider value={{ token, setToken, instance, setInstance }}>
      {props.children}
    </Captcha.Provider>
  );
}
