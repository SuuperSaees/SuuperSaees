import {
    SkeletonBox,
    SkeletonLineText
  } from '../../../../../apps/web/components/ui/skeleton';

export const SkeletonPasswordSignInForm = ({className, classNameLineText}: {className?: string, classNameBox?: string, classNameLineText?: string}) => {
    const classNameBoxRender = 'h-10 w-[295px]';
    const renderSkeletonLineTextAndSkeletonBox = (count: number, typeRender: 'all' | 'line-text' | 'box', classNameBoxRender?: string, classNameLineTextRender?: string) => (
       <>
        {Array.from({ length: count }).map((_, index) => (
                <>
                    {typeRender === 'all' || typeRender === 'line-text' ? <SkeletonLineText className={`w-[100px] mb-2 ${classNameLineTextRender}`} key={index} /> : null}
                    {typeRender === 'all' || typeRender === 'box' ? <SkeletonBox className={`rounded-lg mb-2 ${classNameBoxRender}`} key={index} /> : null}
                </>
       ))}
       </>
    );

    return (
      <div className={`relative flex h-fit max-h-96 w-fit max-w-xs flex-col gap-2 ${className}`}>
        <div className='mb-2'>
            {renderSkeletonLineTextAndSkeletonBox(1, 'box', 'h-[30px] w-[295px]', classNameLineText)}
        </div>
        <div className='flex justify-center mb-2'>
            {renderSkeletonLineTextAndSkeletonBox(1, 'line-text', classNameLineText, 'self-center')}
        </div>
        <div className='mb-2'>
            {renderSkeletonLineTextAndSkeletonBox(2, 'all', classNameBoxRender, classNameLineText)}
        </div>
        <div className='flex gap-1 justify-between'>
            {renderSkeletonLineTextAndSkeletonBox(2, 'line-text', 'h-[30px] w-[100px]', 'self-center')}
        </div>
        <div className='mb-2'>
            {renderSkeletonLineTextAndSkeletonBox(1, 'box', classNameBoxRender, classNameLineText)}
        </div>
      </div>
    );
};