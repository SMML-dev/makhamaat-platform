export class UpdateObjectiveDto {
  product?: string;
  name?: string;
  targetQuantity?: number;
  targetPrice?: number;
  targetRevenue?: number;
  deadline?: string;
  type?: 'sales' | 'export' | 'stock' | 'production';
  notes?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}
