const { DataTypes } = require('sequelize');
const { Employees, SE_Jobs, Employee_Payables, Child_Account } = require("../../../models");

Employee_Payables.belongsTo(Employees, {
  foreignKey: 'employeeid',
  as: 'employee'
});

// Employee_Payables.belongsTo(SE_Jobs, {
//   foreignKey: 'jobid',
//   as: 'job'
// });

// Employee_Payables.belongsTo(Child_Account, {
//   foreignKey: 'accountid',
//   as: 'account'
// });

module.exports = { SE_Jobs, Employees, Employee_Payables, Child_Account };
