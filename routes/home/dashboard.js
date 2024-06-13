const { Vouchers } = require("../../functions/Associations/voucherAssociations");
const { SE_Job, SE_Equipments } = require("../../functions/Associations/jobAssociations/seaExport");
const { Invoice, Invoice_Transactions } = require("../../functions/Associations/incoiceAssociations");
const routes = require('express').Router();
const Sequelize = require('sequelize');
const moment = require("moment");
const Op = Sequelize.Op;

routes.get("/getCashFlow", async(req, res) => {
  try {
    const cashflow = await Vouchers.findAll({
      raw:true,
      where:{type:'Job Reciept'},
      attributes:['id', 'createdAt'],
      include:[{
        model:Invoice_Transactions,
        attributes:['amount']
      }]
    });
    const cashexpenditure = await Vouchers.findAll({
      raw:true,
      where:{type:'Job Payment'},
      attributes:['id', 'createdAt'],
      include:[{
        model:Invoice_Transactions,
        attributes:['amount']
      }]
    });
    res.json({ status:'success', result:{
      cashflow,
      cashexpenditure
    } });
  }
  catch (error) {
    res.json({status: 'error', result: error});
  }
});

routes.get("/getCashFlowTwo", async(req, res) => {
  try {
    const values = await Vouchers.findAll({
      raw:true,
      where:{
        [Op.or]:[
          { type:'Job Reciept' },
          { type:'Job Payment' },
        ]
      },
      attributes:['id', 'createdAt', 'type'],
      include:[{
        model:Invoice_Transactions,
        attributes:['amount']
      }]
    });
    res.json({ status:'success', result:values });
  }
  catch (error) {
    res.json({status: 'error', result: error});
  }
});

module.exports = routes;