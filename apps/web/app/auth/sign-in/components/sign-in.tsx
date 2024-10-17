'use client'
import { useAuthDetails } from '../../../../../../packages/features/auth/src/hooks/use-auth-details';
import { SignInLogo } from '@kit/auth/sign-in';
import { SignInMethodsContainer } from '@kit/auth/sign-in';
import authConfig from '~/config/auth.config';
import { getTextColorBasedOnBackground } from '~/utils/generate-colors';

const SignIn = ({ inviteToken, paths }: {
    inviteToken: string | undefined, paths: {
        callback: string;
        home: string;
        joinTeam: string;
    }

    
}) => {
    let host = 'localhost:3000';
    if (typeof window !== 'undefined') {
      host = window.location.host;
    }
    const authDetails = useAuthDetails(host);
    const textcolor = getTextColorBasedOnBackground(authDetails?.background_color ?? '#ffffff')
    return (<>
<div
    className={`relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-r from-gray-150 to-gray-250`}
    style={{ background: `linear-gradient(to right, ${authDetails?.background_color}, ${authDetails?.background_color})` }}
>
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-full bg-gradient-to-r from-gray-100 to-gray-250 opacity-30 animate-pulse" />
    </div>

    <div className="hidden md:block absolute md:w-[142px] md:h-auto md:left-8 md:top-8 md:object-contain"></div>
    
    <div
        className={`align-center relative w-[90%] max-w-[360px] md:px-[32px] md:py-[48px] backdrop-blur-[95%] rounded-lg shadow-lg z-10 ${authDetails?.background_color}`}
        style={{
            backgroundColor: authDetails?.background_color || 'white',
            color: textcolor,
            padding: '32px', // Additional padding for the form
        }}
    >
        <div className="flex justify-center items-start pb-[32px] w-full">
            <SignInLogo className="h-auto max-h-[100px] flex justify-center" />
        </div>
        <div className='h-auto text-black' style={{color: textcolor}}>
            <SignInMethodsContainer
                providers={authConfig.providers}
                inviteToken={inviteToken}
                paths={paths}    
            />
        </div>
    </div>
</div>
    </>
    )
}

export default SignIn;