"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BackLink } from "@/components/common/BackLink";
import { ChangePasswordSchema, type ChangePasswordInput } from "@/features/user/schema/password-schema";
import { changePasswordAction } from "@/features/user/server/password-actions";
import { toast } from "sonner";

export default function PasswordChangePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordInput>({ resolver: zodResolver(ChangePasswordSchema) });

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("currentPassword", data.currentPassword);
    formData.append("newPassword", data.newPassword);
    formData.append("confirmPassword", data.confirmPassword);
    const result = await changePasswordAction(formData);
    if (result.success) { toast.success("パスワードを変更しました"); reset(); }
    else { toast.error(result.error); }
    setIsLoading(false);
  };

  return (
    <div className="container max-w-2xl py-6">
      <BackLink href="/settings" label="設定に戻る" />
      <h1 className="text-2xl font-bold mb-6">パスワード変更</h1>
      <Card>
        <CardHeader><CardTitle>パスワードを変更</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">現在のパスワード</Label>
              <Input id="currentPassword" type="password" aria-invalid={!!errors.currentPassword} {...register("currentPassword")} />
              {errors.currentPassword && <p role="alert" className="text-sm text-destructive">{errors.currentPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">新しいパスワード</Label>
              <Input id="newPassword" type="password" placeholder="8文字以上、英字と数字を含む" aria-invalid={!!errors.newPassword} {...register("newPassword")} />
              {errors.newPassword && <p role="alert" className="text-sm text-destructive">{errors.newPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
              <Input id="confirmPassword" type="password" placeholder="パスワードを再入力" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
              {errors.confirmPassword && <p role="alert" className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" disabled={isLoading}>{isLoading ? "変更中..." : "パスワードを変更"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
