"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Check,
  Clock,
  Eye,
  ShoppingCart,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { TeklifimTeamMember, TeklifimOrgRole } from "@/types/teklifimGelsin";
import InviteTeamModal from "./InviteTeamModal";

interface TeamManagementTableProps {
  members: TeklifimTeamMember[];
  currentUserRole: TeklifimOrgRole;
  currentUserId: string;
  onRefresh: () => void;
}

export default function TeamManagementTable({
  members,
  currentUserRole,
  currentUserId,
  onRefresh,
}: TeamManagementTableProps) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  const handleRoleChange = async (memberId: string, newRole: TeklifimOrgRole) => {
    setUpdatingId(memberId);
    try {
      const res = await fetch(`/api/teklifim-gelsin/team/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error("Role update failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveMember = async (memberId: string, name: string) => {
    if (!confirm(`${name} isimli uyeyi ekipten cikarmak istediginize emin misiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/teklifim-gelsin/team/${memberId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error("Remove member failed:", err);
    }
  };

  const getRoleIcon = (role: TeklifimOrgRole) => {
    switch (role) {
      case "owner":
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />;
      case "admin":
        return <Shield className="w-3.5 h-3.5 text-indigo-500" />;
      case "approver":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "buyer":
        return <ShoppingCart className="w-3.5 h-3.5 text-blue-500" />;
      case "viewer":
        return <Eye className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Sirket Ekip Yonetimi
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Satin alma yetkileri, onay mekanizmalari ve kurumsal calisanlar
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setInviteModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Ekip Arkadasi Davet Et</span>
          </button>
        )}
      </div>

      {/* ROLE GUIDE PILLS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span><strong>Owner:</strong> Tam yetki</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Shield className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
          <span><strong>Admin:</strong> Ekip & Onay</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span><strong>Approver:</strong> Alim Onaylar</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <ShoppingCart className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <span><strong>Buyer:</strong> Talep Yapar</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Eye className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span><strong>Viewer:</strong> Sadece Izler</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="pb-3 font-semibold">Uye / E-Posta</th>
              <th className="pb-3 font-semibold">Gorev & Rol</th>
              <th className="pb-3 font-semibold">Katilim Tarihi</th>
              <th className="pb-3 font-semibold">Durum</th>
              {canManage && <th className="pb-3 font-semibold text-right">Islem</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {members.map((member) => {
              const isSelf = member.userId === currentUserId;
              const isOwner = member.role === "owner";

              return (
                <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {member.name} {isSelf && "(Sen)"}
                    </div>
                    <div className="text-[11px] text-slate-400">{member.email}</div>
                  </td>

                  <td className="py-3">
                    {canManage && !isOwner && !isSelf ? (
                      <select
                        value={member.role}
                        disabled={updatingId === member.id}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as TeklifimOrgRole)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                      >
                        <option value="admin">Admin</option>
                        <option value="approver">Approver</option>
                        <option value="buyer">Buyer</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold capitalize">
                        {getRoleIcon(member.role)}
                        <span>{member.role}</span>
                      </div>
                    )}
                  </td>

                  <td className="py-3 text-slate-500 dark:text-slate-400">
                    {new Date(member.joinedAt).toLocaleDateString("tr-TR")}
                  </td>

                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      <Check className="w-3 h-3" />
                      Aktif
                    </span>
                  </td>

                  {canManage && (
                    <td className="py-3 text-right">
                      {!isOwner && !isSelf && (
                        <button
                          onClick={() => handleRemoveMember(member.id, member.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Ekipten Cikar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <InviteTeamModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => {
          onRefresh();
          setInviteModalOpen(false);
        }}
      />
    </div>
  );
}
