import { Layout } from 'react-grid-layout'
import { TextBlock } from '../components/ui/text-block'
import { PieChart, LineChartComponent, BarChartComponent } from '../components/ui/charts'
import { DataTable } from '../components/ui/data-table'
import { Type, PieChart as PieChartIcon, LineChart as LineChartIcon, BarChart as BarChartIcon, Table as TableIcon } from 'lucide-react'

export interface BlockLayout extends Layout {
  type: string;
  title?: string;
  data?: string;
  minH?: number;
  minW?: number;
  maxW?: number;
}

export const BLOCK_TYPES = [
  { id: 'text', icon: Type, label: 'Text Block', component: TextBlock },
  { id: 'pie-chart', icon: PieChartIcon, label: 'Pie Chart', component: PieChart },
  { id: 'line-chart', icon: LineChartIcon, label: 'Line Chart', component: LineChartComponent },
  { id: 'bar-chart', icon: BarChartIcon, label: 'Bar Chart', component: BarChartComponent },
  { id: 'data-table', icon: TableIcon, label: 'Data Table', component: DataTable },
]

export const defaultTableData = [
  { date: '2024-01-01', temperature: 20, pressure: 1013 },
  { date: '2024-01-02', temperature: 22, pressure: 1012 },
  { date: '2024-01-03', temperature: 19, pressure: 1014 },
  { date: '2024-01-04', temperature: 21, pressure: 1015 },
  { date: '2024-01-05', temperature: 23, pressure: 1011 },
]; 