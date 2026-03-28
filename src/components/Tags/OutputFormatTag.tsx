import { OutputFormat } from '@/types';
import {
  AlignLeftOutlined,
  BookOutlined,
  CalculatorOutlined,
  CloudOutlined,
  CodeOutlined,
  ContainerOutlined,
  DatabaseOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  RocketOutlined,
  SnippetsOutlined,
  TabletOutlined,
  VideoCameraOutlined,
  WindowsOutlined,
} from '@ant-design/icons';
import { Tag, Tooltip, type TagProps } from 'antd';

type OutputFormatMeta = {
  label: string;
  tooltip: string;
  icon: React.ReactNode;
  color?: TagProps['color'];
};

const OUTPUT_FORMAT_META: Record<OutputFormat, OutputFormatMeta> = {
  [OutputFormat.json]: {
    label: 'json',
    tooltip: 'Structured data export for tools and automation',
    icon: <CodeOutlined />,
    color: 'yellow',
  },
  [OutputFormat.epub]: {
    label: 'epub',
    tooltip: 'EPUB e-book for most e-readers and reading apps',
    icon: <BookOutlined />,
    color: 'cyan',
  },
  [OutputFormat.text]: {
    label: 'txt',
    tooltip: 'Plain text without formatting',
    icon: <AlignLeftOutlined />,
    color: 'lime',
  },
  [OutputFormat.pdf]: {
    label: 'pdf',
    tooltip: 'PDF document for printing or fixed-layout viewing',
    icon: <FilePdfOutlined />,
    color: 'volcano',
  },
  [OutputFormat.mobi]: {
    label: 'mobi',
    tooltip: 'Mobipocket / legacy Kindle format',
    icon: <TabletOutlined />,
    color: 'orange',
  },
  [OutputFormat.fb2]: {
    label: 'fb2',
    tooltip: 'FictionBook 2 XML e-book format',
    icon: <ContainerOutlined />,
    color: 'pink',
  },
  [OutputFormat.rtf]: {
    label: 'rtf',
    tooltip: 'Rich Text Format for word processors',
    icon: <SnippetsOutlined />,
    color: 'success',
  },
  [OutputFormat.docx]: {
    label: 'docx',
    tooltip: 'Microsoft Word document',
    icon: <FileWordOutlined />,
    color: 'blue',
  },
  [OutputFormat.azw3]: {
    label: 'azw3',
    tooltip: 'Amazon Kindle KF8 e-book',
    icon: <CloudOutlined />,
    color: 'warning',
  },
  [OutputFormat.lit]: {
    label: 'lit',
    tooltip: 'Microsoft Reader e-book',
    icon: <WindowsOutlined />,
  },
  [OutputFormat.lrf]: {
    label: 'lrf',
    tooltip: 'Sony BroadBand eBook format',
    icon: <VideoCameraOutlined />,
    color: 'magenta',
  },
  [OutputFormat.pdb]: {
    label: 'pdb',
    tooltip: 'Palm Digital Media / eReader format',
    icon: <DatabaseOutlined />,
    color: 'red',
  },
  [OutputFormat.rb]: {
    label: 'rb',
    tooltip: 'Rocket eBook format',
    icon: <RocketOutlined />,
    color: 'gold',
  },
  [OutputFormat.tcr]: {
    label: 'tcr',
    tooltip: 'Psion Series 3 e-book format',
    icon: <CalculatorOutlined />,
    color: 'geekblue',
  },
};

export const OutputFormatTag: React.FC<
  {
    value: OutputFormat;
    noTooltip?: boolean;
  } & TagProps
> = ({ value, noTooltip, ...props }) => {
  const meta = OUTPUT_FORMAT_META[value];
  if (!meta) {
    return null;
  }
  const { icon, label, tooltip, color } = meta;
  return (
    <Tooltip title={noTooltip ? undefined : tooltip}>
      <Tag color={color} icon={icon} {...props}>
        {label}
      </Tag>
    </Tooltip>
  );
};
