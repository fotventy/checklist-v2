import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Конфигурация транспорта для отправки почты
const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: 'zabbix@totalvideo.ru',
    pass: 'Totalvideo1zabbix',
  },
});

// Список получателей
const recipients = [
  // Закомментированные адреса
  // 'user1@example.com',
  // 'user2@example.com',
  'koptilins@gmail.com',
];

// Конфигурация сервисов для сопоставления ID с названиями
const services = [
  { id: 'totalvideo', name: 'Тоталвидео', url: 'https://cdn.totalvideo.prod.totalvideo.ru/' },
  { id: 'aksioma', name: 'Аксиома', url: 'https://aksioma.example.com' },
  { id: 'pakt', name: 'ПАКТ', url: 'https://pakt.example.com' },
  { id: 'iks', name: 'ИКС', url: 'https://iks.example.com' },
  { id: 'jupiter', name: 'Юпитер', url: 'https://jupiter.example.com' },
  { id: 'sibseti', name: 'Сиб Сети', url: 'https://sibseti.example.com' },
  { id: 'tmpk', name: 'ТМПК', url: 'https://tmpk.example.com' },
  { id: 'zhanr', name: 'Жанр', url: 'https://zhanr.example.com' },
];

// Конфигурация типов проверок
const checkTypes = [
  { id: 'epg', name: 'Проверка наличия EPG на всех каналах' },
  { id: 'ott', name: 'Проверка вещания ОТТ' },
  { id: 'sync', name: 'Проверка расхождения видео со звуком' },
  { id: 'rec', name: 'Проверка наличия записей на каналах' },
  { id: 'req', name: 'Проверка наличия рекомендаций' },
  { id: 'lib', name: 'Проверка наличия библиотек VOD' },
  { id: 'vod', name: 'Проверка доступности VOD' },
];

const checklistSchema = z.object({
  items: z.array(z.object({
    service: z.string(),
    checks: z.array(z.object({
      type: z.string(),
      status: z.enum(['OK', 'Error', '']).transform(val => val === '' ? null : val),
      comment: z.string().optional(),
    })),
  })),
});

// Функция для получения названия сервиса по ID
function getServiceName(serviceId: string): string {
  const service = services.find(s => s.id === serviceId);
  return service ? service.name : serviceId;
}

// Функция для получения описания проверки по ID
function getCheckName(checkId: string): string {
  const check = checkTypes.find(c => c.id === checkId);
  return check ? check.name : checkId;
}

// Функция для форматирования чек-листа в HTML
function formatChecklistHtml(data: z.infer<typeof checklistSchema>, username: string) {
  const date = new Date().toLocaleString('ru-RU');
  let html = `
    <h2>Чек-лист от ${username}</h2>
    <p>Дата: ${date}</p>
    <hr>
  `;

  data.items.forEach(item => {
    // Проверяем, есть ли заполненные проверки для этого сервиса
    const hasChecks = item.checks.some(check => check.status !== null);
    if (hasChecks) {
      html += `<h3>Тенант: ${getServiceName(item.service)}</h3><ul>`;
      item.checks
        .filter(check => check.status !== null)
        .forEach(check => {
          const status = check.status === 'OK' ? '✅' : '❌';
          html += `<li>${status} ${getCheckName(check.type)}`;
          if (check.comment) {
            html += `<br>Комментарий: ${check.comment}`;
          }
          html += '</li>';
        });
      html += '</ul><hr>';
    }
  });

  return html;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.username) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await request.json();
    const data = checklistSchema.parse(json);

    // Определяем общий статус чек-листа
    const hasErrors = data.items.some(item => 
      item.checks.some(check => check.status === 'Error')
    );

    // Создаем чек-лист в базе данных
    const checklist = await prisma.checklist.create({
      data: {
        status: hasErrors ? 'error' : 'completed',
        user: {
          connect: {
            username: session.user.username,
          },
        },
        items: {
          create: data.items.flatMap(item =>
            item.checks
              .filter(check => check.status !== null)
              .map(check => ({
                service: item.service,
                checkType: check.type,
                status: check.status,
                comment: check.comment,
              }))
          ),
        },
      },
      include: {
        items: true,
      },
    });

    // Отправляем email
    let emailStatus = { success: true, error: null };
    try {
      const emailHtml = formatChecklistHtml(data, session.user.username);
      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'zabbix@totalvideo.ru',
        to: recipients.join(', '),
        subject: `Чек-лист от ${session.user.username} - ${hasErrors ? 'Есть ошибки' : 'Все ОК'}`,
        html: emailHtml,
      });
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      emailStatus = {
        success: false,
        error: emailError instanceof Error ? emailError.message : 'Unknown email error'
      };
    }

    return NextResponse.json({
      checklist,
      emailStatus
    });
  } catch (error) {
    console.error('Error creating checklist:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error', 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.username) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const checklists = await prisma.checklist.findMany({
      where: {
        user: {
          username: session.user.username,
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(checklists);
  } catch (error) {
    console.error('Error fetching checklists:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 