// validation.ts

export function validateDate(date: string): boolean {
    // Проверяем формат YYYY-MM-DD и существование такой даты
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(date)) return false;
  
    const [year, month, day] = date.split('-').map(Number);
    const dt = new Date(date);
  
    // Проверяем, что дата реально существует и соответствует введённым значениям
    return (
      dt.getFullYear() === year &&
      dt.getMonth() + 1 === month &&
      dt.getDate() === day
    );
  }
  