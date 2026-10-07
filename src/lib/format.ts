/** 金額一律是新台幣 */
export function formatMoney(amount: number) {
  return `$${amount.toLocaleString("zh-TW", { maximumFractionDigits: 2 })}`;
}
