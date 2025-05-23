export const generateBatchCode = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  const letter1 = letters[Math.floor(Math.random() * letters.length)];
  const letter2 = letters[Math.floor(Math.random() * letters.length)];
  
  const number1 = numbers[Math.floor(Math.random() * numbers.length)];
  const number2 = numbers[Math.floor(Math.random() * numbers.length)];
  
  return `${letter1}${letter2}${number1}${number2}`;
}; 