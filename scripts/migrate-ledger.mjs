// 一次性轉換：把舊帳本 love 的使用者移到新帳本 coding（驗證碼改名後讓大家留在同一本帳）
// 用法：node scripts/migrate-ledger.mjs          先預覽，不會改資料
//       node scripts/migrate-ledger.mjs --apply  實際更新
import { readFileSync } from "node:fs";
import mongoose from "mongoose";

const FROM = "love";
const TO = "coding";
const apply = process.argv.includes("--apply");

// 從 .env.local 讀 MONGODB_URI（允許等號兩側有空白）
const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const uri = env.match(/^\s*MONGODB_URI\s*=\s*(.+?)\s*$/m)?.[1]?.replace(/^["']|["']$/g, "");
if (!uri) throw new Error(".env.local 裡找不到 MONGODB_URI");

await mongoose.connect(uri);
const users = mongoose.connection.db.collection("users");

try {
  const count = await users.countDocuments({ ledger: FROM });
  console.log(`帳本 ${FROM} 共有 ${count} 位使用者`);

  if (!apply) {
    console.log("預覽模式，沒有修改資料。確認無誤後加上 --apply 執行");
  } else {
    const result = await users.updateMany({ ledger: FROM }, { $set: { ledger: TO } });
    console.log(`已將 ${result.modifiedCount} 位使用者移到帳本 ${TO}`);
  }
} finally {
  await mongoose.disconnect();
}
