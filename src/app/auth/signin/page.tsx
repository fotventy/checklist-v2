import { SignInForm } from '@/components/Auth/SignInForm';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function SignIn() {
  const session = await getServerSession();

  if (session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Вход в систему
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Введите свои учетные данные
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
} 