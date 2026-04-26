"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BackLink } from "@/components/common/BackLink";
import { deleteAccountAction } from "@/features/user/server/account-actions";
import { toast } from "sonner";
import { Mail, AlertTriangle } from "lucide-react";

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const email = session?.user?.email || "";
  const confirmText = "アカウントを削除";

  const handleDelete = async () => {
    if (deleteInput !== confirmText) return;
    setIsDeleting(true);
    const result = await deleteAccountAction();
    if (result.success) { toast.success("アカウントを削除しました"); await signOut({ callbackUrl: "/" }); }
    else { toast.error(result.error); setIsDeleting(false); }
  };

  return (
    <div className="w-full max-w-2xl pb-8">
      <BackLink href="/settings" label="設定に戻る" />
      <h1 className="text-2xl font-bold mb-6">アカウント設定</h1>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Mail className="h-5 w-5" />メールアドレス</CardTitle>
            <CardDescription>登録されているメールアドレス</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-md"><span className="text-sm font-medium">{email}</span></div>
          </CardContent>
        </Card>
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />アカウント削除</CardTitle>
            <CardDescription>アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。</CardDescription>
          </CardHeader>
          <CardContent>
            {!showDeleteConfirm ? (
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>アカウントを削除する</Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md">
                  <p className="text-sm font-medium text-destructive mb-2">本当にアカウントを削除しますか？</p>
                  <p className="text-sm text-muted-foreground">確認のため、「<span className="font-semibold text-foreground">{confirmText}</span>」と入力してください。</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deleteConfirm">確認入力</Label>
                  <Input id="deleteConfirm" type="text" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} placeholder={confirmText} />
                </div>
                <div className="flex gap-3">
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteInput !== confirmText || isDeleting}>{isDeleting ? "削除中..." : "完全に削除する"}</Button>
                  <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}>キャンセル</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
