import fetch from 'node-fetch';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createUser() {
  console.log('Для создания пользователя необходимо войти как администратор (skoptilin)');
  console.log('1. Откройте браузер и войдите на http://localhost:3000 как skoptilin');
  console.log('2. Откройте DevTools (F12) -> Application -> Cookies -> next-auth.session-token');
  console.log('3. Скопируйте значение токена сессии\n');
  
  const sessionToken = await new Promise(resolve => {
    rl.question('Введите токен сессии: ', resolve);
  });
  
  const username = await new Promise(resolve => {
    rl.question('Введите имя нового пользователя (минимум 3 символа): ', resolve);
  });

  const password = await new Promise(resolve => {
    rl.question('Введите пароль (минимум 5 символов): ', resolve);
  });

  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `next-auth.session-token=${sessionToken}`,
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Пользователь успешно создан:', data);
    } else {
      const error = await response.text();
      console.error('Ошибка при создании пользователя:', error);
    }
  } catch (error) {
    console.error('Ошибка:', error.message);
  }

  rl.close();
}

createUser(); 