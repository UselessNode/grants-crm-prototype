// Скрипт для генерации хеша пароля
// Запуск: node scripts/generate-password-hash.js

const bcrypt = require('bcrypt');

const password = 'password123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds).then(hash => {
  console.log(`\nХеш для пароля "${password}":\n`);
  console.log(hash);
  console.log('\nВставьте это значение в seed_data.sql вместо password_hash\n');
}).catch(err => {
  console.error('Ошибка:', err);
});
