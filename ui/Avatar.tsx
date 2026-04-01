import React from 'react';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: Size;
  className?: string;
}

const sizeClasses: Record<Size, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-2xl',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ src, alt, name, size = 'md', className = '' }: AvatarProps) {
  const base = ['inline-flex shrink-0 items-center justify-center rounded-full', sizeClasses[size], className].join(
    ' ',
  );

  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? name ?? 'Avatar'}
        className={`${base} object-cover`}
      />
    );
  }

  return (
    <span className={`${base} bg-indigo-100 font-semibold text-indigo-600`} aria-label={name}>
      {name ? getInitials(name) : '?'}
    </span>
  );
}
