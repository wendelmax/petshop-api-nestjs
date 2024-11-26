export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}

export interface AppointmentReportFilters extends DateRangeFilter {
  status?: string;
  serviceId?: string;
}

export interface ProductReportFilters extends DateRangeFilter {
  lowStock?: boolean;
}

export interface RevenueReportFilters extends DateRangeFilter {
  serviceId?: string;
}
