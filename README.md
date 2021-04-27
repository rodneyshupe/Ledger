Google Apps Script Ledger Example
----

This repository contains example of code to add transactions to a Legder sheet in Google Sheet.

 * Code.gs : Example functions for calling Add Transaction functions and example of setting up triggers..
 * Ledger.gs : Functions required to execute adding of Transactions..

The method in Ledger.gs contains the method addTransaction()

Example:

```javascript
  addTransaction({
    description: "Cell Phone",
    credit: 15.49,
    frequency: {
      unit: 'month',
      threshold: 1,
    }
  });
```

----

Note these files are listed as `.js` and will be translated to `.gs` by [clasp](https://github.com/google/clasp).
