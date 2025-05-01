import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authOptions } from '../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_USERS = ['skoptilin', 'svasyuk'];

// Схема для создания пользователя
const createUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(5),
});

// Схема для изменения пароля
const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(5),
});

// POST /api/users - создание нового пользователя
export async function POST(request: Request) {
  try {
    // Проверяем, что запрос делает администратор
    const session = await getServerSession(authOptions);
    if (!session?.user?.username || !ADMIN_USERS.includes(session.user.username)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await request.json();
    const { username, password } = createUserSchema.parse(json);

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return new NextResponse('User already exists', { status: 400 });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name: username,
      },
    });

    return NextResponse.json({ 
      id: user.id, 
      username: user.username 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
}

// PATCH /api/users - изменение пароля
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await request.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(json);

    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { username: session.user.username },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Проверяем текущий пароль
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return new NextResponse('Invalid current password', { status: 400 });
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль
    await prisma.user.update({
      where: { username: session.user.username },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
}

// DELETE /api/users - удаление пользователя
export async function DELETE(request: Request) {
  try {
    // Проверяем, что запрос делает администратор
    const session = await getServerSession(authOptions);
    if (!session?.user?.username || !ADMIN_USERS.includes(session.user.username)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return new NextResponse('Username is required', { status: 400 });
    }

    // Проверяем, что пользователь не пытается удалить администратора
    if (ADMIN_USERS.includes(username)) {
      return new NextResponse('Cannot delete admin user', { status: 403 });
    }

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Удаляем пользователя
    await prisma.user.delete({
      where: { username },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
}

// GET /api/users - получение списка пользователей
export async function GET(request: Request) {
  try {
    // Проверяем, что запрос делает администратор
    const session = await getServerSession(authOptions);
    if (!session?.user?.username || !ADMIN_USERS.includes(session.user.username)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
      },
      orderBy: {
        username: 'asc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 