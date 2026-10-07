import { Schema, deleteModel, model, models, type InferSchemaType, type Model } from "mongoose";

export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    // bcrypt 雜湊後的密碼；select: false 讓一般查詢不會帶出，登入時再用 .select("+passwordHash") 取得
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    // 新註冊一律是一般使用者，admin 只能直接改資料庫
    role: { type: String, enum: USER_ROLES, default: "user", required: true },
    // 所屬的共享帳本：用同一個驗證碼註冊的人共用一本帳，看得到彼此的紀錄
    ledger: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;

// 開發模式下 HMR 會保留舊的 model，先移除才能套用修改後的 schema
if (process.env.NODE_ENV === "development" && models.User) deleteModel("User");

export const UserModel: Model<User> = (models.User as Model<User>) ?? model<User>("User", userSchema);
