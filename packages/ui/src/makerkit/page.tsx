import { cn } from '../utils';

export function Page(
  props: React.PropsWithChildren<{
    sidebar?: React.ReactNode;
    contentContainerClassName?: string;
    className?: string;
  }>,
) {
  return (
    <div className={cn('flex', props.className)}>
      <div className={'hidden lg:block'}>{props.sidebar}</div>

      <div
        className={
          props.contentContainerClassName ??
          'mx-auto flex h-screen w-full flex-col space-y-4 overflow-y-auto'
        }
      >
        {props.children}
      </div>
    </div>
  );
}

export function PageBody(
  props: React.PropsWithChildren<{
    className?: string;
  }>,
) {
  const className = cn('w-full px-4 flex flex-col flex-1', props.className);

  return <div className={className}>{props.children}</div>;
}

export function PageHeader({
  children,
  title,
  description,
  mobileNavigation,
}: React.PropsWithChildren<{
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  mobileNavigation?: React.ReactNode;
}>) {
  return (
    <div className={'flex min-h-[4.5rem] items-center justify-between px-4'}>
      {title ? (
        <div
          className={
            'flex items-center space-x-4 lg:flex-col lg:items-start lg:space-x-0 lg:space-y-0.5'
          }
        >
          <div className={'flex items-center lg:hidden'}>
            {mobileNavigation}
          </div>

          <h1
            className={
              'font-heading text-xl font-semibold leading-none dark:text-white'
            }
          >
            {title}
          </h1>

          <h2 className={'hidden lg:block'}>
            <span
              className={
                'text-base font-medium leading-none text-muted-foreground'
              }
            >
              {description}
            </span>
          </h2>
        </div>
      ) : null}

      {children}
    </div>
  );
}
