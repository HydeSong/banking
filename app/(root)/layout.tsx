import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Image from 'next/image';
import { getLoggedInUser } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    const loggedIn = await getLoggedInUser();
<<<<<<< HEAD
    if(!loggedIn) redirect('/sign-in')
=======
    if (!loggedIn) redirect('/sign-in');
>>>>>>> 2e159bc61a604ddf36ce64686cba2c62324f0d16

    return (
      <main className="flex h-screen w-full font-inter">
        <Sidebar user={loggedIn} />

        <div className='flex size-full flex-col'>
          <div className='root-layout'>
            <Image
              src="/icons/logo.svg"
              width={30}
              height={30}
              alt='logo'
            />
            <div>
              <MobileNav user={loggedIn} />
            </div>
          </div>
          {children}
        </div>
      </main>
    );
  } catch (error) {
    console.error("Failed to get logged in user", error);
    redirect('/sign-in');
    return null;
  }
}
