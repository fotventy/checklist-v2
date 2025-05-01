'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Dialog as HeadlessDialog } from '@headlessui/react';
import { ChangePasswordForm } from './ChangePasswordForm';
import { CreateUserForm } from './CreateUserForm';
import { UsersList } from './UsersList';

interface HeaderProps {
  username: string | null;
}

const ADMIN_USERS = ['skoptilin', 'svasyuk'];

export function Header({ username }: HeaderProps) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const isAdmin = username && ADMIN_USERS.includes(username);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Чек-лист проверки тенантов</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {username}
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsCreateUserOpen(true)}
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              Управление пользователями
            </button>
          )}
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
          >
            Сменить пароль
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
          >
            Выйти
          </button>
        </div>
      </div>

      <HeadlessDialog
        open={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <HeadlessDialog.Panel className="mx-auto max-w-md rounded bg-white p-6">
            <HeadlessDialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Изменение пароля
            </HeadlessDialog.Title>
            <ChangePasswordForm />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => setIsChangePasswordOpen(false)}
              >
                Закрыть
              </button>
            </div>
          </HeadlessDialog.Panel>
        </div>
      </HeadlessDialog>

      <HeadlessDialog
        open={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <HeadlessDialog.Panel className="mx-auto max-w-4xl rounded bg-white p-6">
            <HeadlessDialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Управление пользователями
            </HeadlessDialog.Title>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Создание пользователя</h3>
                <CreateUserForm />
              </div>
              <div>
                <UsersList />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => setIsCreateUserOpen(false)}
              >
                Закрыть
              </button>
            </div>
          </HeadlessDialog.Panel>
        </div>
      </HeadlessDialog>
    </>
  );
} 