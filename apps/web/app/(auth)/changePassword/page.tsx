import ChangePasswordForm from "../../../src/features/auth/components/ChangePasswordForm";
import { ProtectedRoute } from "../../../src/features/auth";

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <ChangePasswordForm />
    </ProtectedRoute>
  );
}