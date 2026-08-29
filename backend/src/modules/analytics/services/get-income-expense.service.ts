import { getSummaryService } from './get-summary.service';
import { DateRangeQueryDTO, IncomeExpenseDTO } from '../dto';

export const getIncomeExpenseService = async (
  userId: string,
  query: DateRangeQueryDTO,
): Promise<IncomeExpenseDTO> => {
  const summary = await getSummaryService(userId, query);
  
  return {
    income: summary.totalIncome,
    expense: summary.totalExpense,
    savings: summary.netSavings,
  };
};
