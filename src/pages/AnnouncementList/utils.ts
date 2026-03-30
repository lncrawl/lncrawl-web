import type { Announcement } from '@/types';
import type { TagProps } from 'antd';

export const AnnouncementTypeLabels: Record<
  Announcement['type'],
  string
> = {
  info: 'Info',
  warning: 'Warning',
  error: 'Error',
  success: 'Success',
};

export function getAnnouncementTypeLabel(type: string): string {
  return AnnouncementTypeLabels[type as Announcement['type']] ?? type;
}

export function getAnnouncementTagColor(
  type: string
): TagProps['color'] {
  switch (type) {
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'success':
      return 'success';
    case 'info':
    default:
      return 'processing';
  }
}
