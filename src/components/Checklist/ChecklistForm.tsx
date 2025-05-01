'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Clock } from '@/components/Clock';

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
      status: z.enum(['OK', 'Error', '']),
      comment: z.string().optional(),
    })),
  })),
});

type ChecklistFormData = z.infer<typeof checklistSchema>;

export function ChecklistForm() {
  const [activeService, setActiveService] = useState(services[0].id);
  const { register, handleSubmit, watch, setValue, reset } = useForm<ChecklistFormData>({
    resolver: zodResolver(checklistSchema),
    defaultValues: {
      items: services.map(service => ({
        service: service.id,
        checks: checkTypes.map(type => ({
          type: type.id,
          status: '',
          comment: '',
        })),
      })),
    },
  });

  const resetForm = () => {
    reset({
      items: services.map(service => ({
        service: service.id,
        checks: checkTypes.map(type => ({
          type: type.id,
          status: '',
          comment: '',
        })),
      })),
    });
  };

  const markAllOk = () => {
    const serviceIndex = services.findIndex(s => s.id === activeService);
    checkTypes.forEach((_, index) => {
      setValue(
        `items.${serviceIndex}.checks.${index}.status`,
        'OK'
      );
    });
    toast.success('Все проверки отмечены как OK');
  };

  const onSubmit = async (data: ChecklistFormData) => {
    try {
      // Проверяем, что все сервисы имеют все заполненные проверки
      const hasAllChecksCompleted = data.items.every(item => 
        item.checks.every(check => check.status === 'OK' || check.status === 'Error')
      );

      if (!hasAllChecksCompleted) {
        toast.error('Необходимо выполнить все проверки для всех тенантов перед отправкой');
        return;
      }

      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to submit checklist');
      }

      const result = await response.json();

      // Показываем основное сообщение об успехе
      toast.success('Чек-лист успешно сохранен');

      // Если была проблема с отправкой email, показываем дополнительное уведомление
      if (!result.emailStatus.success) {
        toast.error(`Чек-лист сохранен, но возникла проблема с отправкой email: ${result.emailStatus.error}`);
      } else {
        toast.success('Email уведомление отправлено');
      }

      // Сбрасываем форму после успешной отправки
      resetForm();

    } catch (err) {
      console.error('Error submitting checklist:', err);
      toast.error(err instanceof Error ? err.message : 'Ошибка при отправке чек-листа');
    }
  };

  // Функция для проверки статуса всех проверок сервиса
  const getServiceStatus = (serviceId: string) => {
    const serviceIndex = services.findIndex(s => s.id === serviceId);
    const checks = watch(`items.${serviceIndex}.checks`);
    
    if (!checks || checks.length === 0) return '';
    
    const hasError = checks.some(check => check.status === 'Error');
    if (hasError) return 'Error';
    
    const allOk = checks.every(check => check.status === 'OK');
    if (allOk) return 'OK';
    
    return '';
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex justify-between items-center mb-2 bg-white p-3 rounded-lg shadow-sm">
        <Clock />
        <div className="flex-1 flex justify-center">
          <div className="space-x-2">
            <a
              href={services.find(s => s.id === activeService)?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Перейти на сайт
            </a>
            <button
              type="button"
              onClick={markAllOk}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            >
              Все ОК
            </button>
          </div>
        </div>
        <div className="w-[88px]"></div>
      </div>

      <div className="flex space-x-4">
        <div className="w-48 space-y-1">
          {services.map((service) => {
            const status = getServiceStatus(service.id);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => setActiveService(service.id)}
                className={`w-full text-left px-2 py-1 text-sm rounded ${
                  activeService === service.id
                    ? 'bg-blue-500 text-white'
                    : status === 'OK'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : status === 'Error'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {service.name}
              </button>
            );
          })}
        </div>

        <div className="flex-1 space-y-2">
          {checkTypes.map((type, index) => (
            <div key={type.id} className="flex items-start space-x-2 p-2 bg-white rounded shadow-sm">
              <div className="flex-1">
                <h3 className="text-sm font-medium">{type.name}</h3>
                <div className="mt-1 space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        `items.${services.findIndex(s => s.id === activeService)}.checks.${index}.status`,
                        'OK'
                      )
                    }
                    className={`px-2 py-1 text-sm rounded ${
                      watch(`items.${services.findIndex(s => s.id === activeService)}.checks.${index}.status`) === 'OK'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        `items.${services.findIndex(s => s.id === activeService)}.checks.${index}.status`,
                        'Error'
                      )
                    }
                    className={`px-2 py-1 text-sm rounded ${
                      watch(`items.${services.findIndex(s => s.id === activeService)}.checks.${index}.status`) === 'Error'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Ошибка
                  </button>
                </div>
              </div>
              {watch(`items.${services.findIndex(s => s.id === activeService)}.checks.${index}.status`) === 'Error' && (
                <div className="flex-1">
                  <textarea
                    {...register(
                      `items.${services.findIndex(s => s.id === activeService)}.checks.${index}.comment`
                    )}
                    placeholder="Комментарий к ошибке..."
                    className="w-full p-2 text-sm border rounded"
                    rows={1}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          Отправить чек-лист
        </button>
      </div>
    </form>
  );
} 