export function formatPrice(amount: number): string {
  return amount.toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm"
}
