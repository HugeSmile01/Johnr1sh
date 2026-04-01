'use client';

import { Avatar } from '@johnr1sh/ui';
import type { User } from '@supabase/supabase-js';

interface UserAvatarProps {
  user: User;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
}

export function UserAvatar({ user, size = 'md', showName = false }: UserAvatarProps) {
  const name = (user.user_metadata?.['full_name'] as string | undefined) ?? user.email ?? '';
  const avatarUrl = user.user_metadata?.['avatar_url'] as string | undefined;

  if (showName) {
    return (
      <div className="flex items-center gap-2">
        <Avatar src={avatarUrl} name={name} size={size} />
        <span className="text-sm font-medium text-gray-700">{name || user.email}</span>
      </div>
    );
  }

  return <Avatar src={avatarUrl} name={name} size={size} />;
}
