import { OutputFormat, type Job } from '@/types';
import {
  BookOutlined,
  CodeOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileWordOutlined,
} from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';
import type { ComponentType } from 'react';

type OutputFormatMeta = {
  label: string;
  tooltip: string;
  Icon: ComponentType;
};

const OUTPUT_FORMAT_META: Record<OutputFormat, OutputFormatMeta> = {
  [OutputFormat.json]: {
    label: 'JSON',
    tooltip: 'Structured data export for tools and automation',
    Icon: CodeOutlined,
  },
  [OutputFormat.epub]: {
    label: 'EPUB',
    tooltip: 'EPUB e-book for most e-readers and reading apps',
    Icon: BookOutlined,
  },
  [OutputFormat.text]: {
    label: 'TXT',
    tooltip: 'Plain text without formatting',
    Icon: FileTextOutlined,
  },
  [OutputFormat.pdf]: {
    label: 'PDF',
    tooltip: 'PDF document for printing or fixed-layout viewing',
    Icon: FilePdfOutlined,
  },
  [OutputFormat.mobi]: {
    label: 'MOBI',
    tooltip: 'Mobipocket / legacy Kindle format',
    Icon: BookOutlined,
  },
  [OutputFormat.fb2]: {
    label: 'FB2',
    tooltip: 'FictionBook 2 XML e-book format',
    Icon: BookOutlined,
  },
  [OutputFormat.rtf]: {
    label: 'RTF',
    tooltip: 'Rich Text Format for word processors',
    Icon: FileWordOutlined,
  },
  [OutputFormat.docx]: {
    label: 'DOCX',
    tooltip: 'Microsoft Word document',
    Icon: FileWordOutlined,
  },
  [OutputFormat.azw3]: {
    label: 'AZW3',
    tooltip: 'Amazon Kindle KF8 e-book',
    Icon: BookOutlined,
  },
  [OutputFormat.lit]: {
    label: 'LIT',
    tooltip: 'Microsoft Reader e-book',
    Icon: BookOutlined,
  },
  [OutputFormat.lrf]: {
    label: 'LRF',
    tooltip: 'Sony BroadBand eBook format',
    Icon: FileOutlined,
  },
  [OutputFormat.pdb]: {
    label: 'PDB',
    tooltip: 'Palm Digital Media / eReader format',
    Icon: FileOutlined,
  },
  [OutputFormat.rb]: {
    label: 'RB',
    tooltip: 'Rocket eBook format',
    Icon: FileOutlined,
  },
  [OutputFormat.tcr]: {
    label: 'TCR',
    tooltip: 'Psion Series 3 e-book format',
    Icon: FileOutlined,
  },
};

/** Ordered formats from job extra (batch jobs use `formats`, single-artifact jobs use `format`). */
export function getJobOutputFormats(extra: Job['extra']): OutputFormat[] {
  if (extra.formats?.length) {
    return extra.formats;
  }
  if (extra.format) {
    return [extra.format];
  }
  return [];
}

/** Plain-text line for bug reports / logs (e.g. `Format: EPUB, PDF`). */
export function formatSummaryLine(extra: Job['extra']): string | undefined {
  const list = getJobOutputFormats(extra);
  if (!list.length) {
    return undefined;
  }
  const labels = list.map((f) => OUTPUT_FORMAT_META[f]?.label ?? f);
  return `Format: ${labels.join(', ')}`;
}

export const OutputFormatTag: React.FC<{ value: OutputFormat }> = ({
  value,
}) => {
  const meta = OUTPUT_FORMAT_META[value];
  if (!meta) {
    return null;
  }
  const { Icon, label, tooltip } = meta;
  return (
    <Tooltip title={tooltip}>
      <Tag icon={<Icon />}>{label}</Tag>
    </Tooltip>
  );
};
