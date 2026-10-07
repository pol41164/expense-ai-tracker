import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { EXPENSE_CATEGORIES, EXPENSE_TYPES } from "@/lib/expenseConstants";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";

const AnalysisSchema = z.object({
  items: z.array(
    z.object({
      type: z.enum(EXPENSE_TYPES),
      amount: z.number(),
      category: z.enum(EXPENSE_CATEGORIES),
      description: z.string().describe("簡短的品項描述"),
      date: z.string().describe("YYYY-MM-DD 格式"),
    }),
  ),
});

export type ExpenseAnalysis = z.infer<typeof AnalysisSchema>;

function todayInTaipei() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(new Date());
}

export async function analyzeExpenseText(text: string): Promise<ExpenseAnalysis> {
  const response = await openai.responses.parse({
    model: MODEL,
    instructions: [
      "你是記帳助理，負責把使用者的自然語言描述拆解成一筆或多筆收支紀錄。",
      `今天是 ${todayInTaipei()}（台北時間），「昨天」「上週五」等相對日期請以此換算；未提及日期就用今天。`,
      "金額一律為正數，用 type 區分支出（expense）或收入（income）。",
      "所有金額一律視為新台幣，照文字中的數字記錄，不做匯率換算。",
      "如果文字裡沒有任何收支資訊，回傳空的 items 陣列。",
    ].join("\n"),
    input: text,
    text: { format: zodTextFormat(AnalysisSchema, "expense_analysis") },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI 沒有回傳可解析的結果");
  }
  return response.output_parsed;
}
