
const addAllowance = () => {
  addTransaction({
    description: "Allowance",
    debit: 25.00,
    frequency: {
      unit: 'day',
      threshold: 7,
    }
  });
}

const addCellPhone = () => {
  const cell_phone = {
    description: "Cell Phone",
    credit: 15.49,
    frequency: {
      unit: 'month',
      threshold: 1,
    }
  }

  addTransaction(cell_phone);
}

/**
 * Creates two time-driven triggers.
 */
const createTimeDrivenTriggers = () => {
  // Trigger every month on the 25th at 04:00.
  ScriptApp.newTrigger('addCellPhone')
      .timeBased()
      .onMonthDay(25)
      .atHour(4)
      .create();

  // Trigger every Sunday at 03:00.
  ScriptApp.newTrigger('addAllowance')
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.SUNDAY)
      .atHour(3)
      .create();
}
