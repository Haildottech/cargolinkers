const { DataTypes } = require('sequelize');
const { Employees, SE_Jobs, Employee_Payables, Child_Account } = require("../../../models");

Employee_Payables.belongsTo(Employees, {
  foreignKey: 'EmployeeId',
  as: 'employee'
});

Employee_Payables.belongsTo(SE_Jobs, {
  foreignKey: 'JobId',
  as: 'job'
});

Employee_Payables.belongsTo(Child_Account, {
  foreignKey: 'AccountId',
  as: 'account'
});

module.exports = { SE_Jobs, Employees, Employee_Payables, Child_Account };
