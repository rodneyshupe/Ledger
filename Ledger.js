/**
 * Function adds a transaction the the named sheet.
 * 
 * Example:
 * 
 *  addTransaction({ description: "Cell Phone", credit: 44.69, frequency: { unit: 'month', threshold: 1 } });
 *
 * @param {object} transaction Transaction object.
 * @param {string} sheetName Optional parameter for the sheet name this defaults to "Ledger"
 */
const addTransaction =  (transaction, sheetName = 'Ledger') => {

  // Returns the last occurance date of a transaction given a description
  const lastOccurance = (description, sheetName) => {
    let lastDate;

    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (sheet) {
      let dateValues = sheet.getRange('A:A').getValues();
      let descriptionValues = sheet.getRange('B:B').getValues();

      let i = 0;
      descriptionValues.forEach(value => {
        if(value == description) {
          lastDate = dateValues[i][0];
        }
        i++;
      });
    } else {
      Logger.log('Sheet "%s" not found.', sheetName);
    }

    return lastDate; 
  };


  // Returns the time since the last occurance date of a transaction
  const sinceLast = (transaction, sheetName) => {
    // Returns days since last occurance of the description
    const daysSince = (description, sheetName) => {
      return Math.ceil(Math.abs((new Date()) - (new Date(lastOccurance(description, sheetName)))) / (1000 * 60 * 60 * 24));
    };

    // Returns months since last occurance of the description
    const monthsSince = (description, sheetName) => {
      var dateLastOccurance = new Date(lastOccurance(description, sheetName));
      var dateToday = new Date();

      var months;
      months = (dateToday.getFullYear() - dateLastOccurance.getFullYear()) * 12;
      months -= dateLastOccurance.getMonth();
      months += dateToday.getMonth();

      if (months == 1) {
        if (dateLastOccurance.getDate() > dateToday.getDate()) {
          months -= 1;
        }
      }

      return months <= 0 ? 0 : months;
    };

    if (transaction.frequency && transaction.frequency.unit) {
      switch(transaction.frequency.unit) {
        case "day": {
            return daysSince(transaction.description, sheetName);
        }
        case "month": {
            return monthsSince(transaction.description, sheetName);
        }
      }
    }
  };

  // Adds a row based on the supplied transaction
  const addRow = (transaction, sheetName) => {
    // Firgure out the next transaction date
    const nextTransactionDate = (transaction, sheetName) => {
      let date = new Date();

      if (transaction.frequency && transaction.frequency.unit && transaction.frequency.threshold) {
        date = new Date(lastOccurance(transaction.description, sheetName));
        switch(transaction.frequency.unit) {
          case "day": {
            date.setDate(date.getDate() + transaction.frequency.threshold);
            break;
          }
          case "month": {
            date.setMonth(date.getMonth() + 1);
            break;
          }
          default: {
            date = null;
            break;
          }
        }
      }
      return date;
    };

    let debit = '';
    if (transaction.debit) {
      debit = transaction.debit;
    }
    let credit = '';
    if (transaction.credit) {
      credit = transaction.credit;
    }

    let date = nextTransactionDate(transaction, sheetName);
    if (date) {
      let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
      if (sheet != null){
        sheet.appendRow([date, transaction.description, debit, credit]);

        const lastRow = sheet.getLastRow(); 
        const previousRow = lastRow - 1;
        let cell = sheet.getRange(lastRow, 5);

        //cell.setFormula('=IF(ISNUMBER(E' + previousRow + '),E' + previousRow + ',0)+C' + lastRow + '-D' + lastRow);
        cell.setFormula('=SUM(OFFSET($A$1,1,2,ROW()-1,1))-SUM(OFFSET($A$1,1,3,ROW()-1,1))');
      } else {
        Logger.log('Sheet "%s" not found.', sheetName);
      }
    }
  };

  let since = sinceLast(transaction, sheetName);
  while(since >= transaction.frequency.threshold) {
    addRow(transaction, sheetName);
    since = sinceLast(transaction, sheetName);
  }
};

const trasaction_schema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/product.schema.json",
  "title": "Transaction",
  "description": "A transaction to add to the ledger",
  "type": "object",
  "properties": {
    "description": {
      "description": "The description of the transaction.",
      "type": "string"
    },
    "debit": {
      "description": "Amount to debit on the ledger (optional)",
      "type": "number",
      "exclusiveMinimum": 0
    },
    "credit": {
      "description": "Amount to credit on the ledger (optional)",
      "type": "number",
      "exclusiveMinimum": 0
    },
    "frequency": {
      "type": "object",
      "properties": {
        "unit": {
          "type": "string",
          "enum": ["day", "month"]
        },
        "threshold": {
          "type": "number",
          "exclusiveMinimum": 0
        },
      },
      "required": [ "unit", "threshold" ]
    }
  },
  "required": [ "description" ],
  "oneOf": [
    {
        "required": [ "debit" ]
    },
    {
        "required": [ "credit" ]
    },
  ]
};
