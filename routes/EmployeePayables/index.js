const routes = require("express").Router();
const Sequelize = require("sequelize");
const moment = require("moment");
const { Accounts } = require('../../models/');
const Op = Sequelize.Op;
const { SE_Jobs, Employees, Employee_Payables, Child_Account } = require("../../functions/Associations/employeePayablesAssociations");


routes.post("/EmployeePayableUpsert", async (req, res) => {
    console.log(req.body)
    const body = req.body
    try {
      const result = await Employee_Payables.create(body);
      console.log(result)
      res.json({ status: "success", result: result });
    } catch (error) {
      res.json({ status: "error", result: error });
    }
});

routes.get("/deleteEmployeePayable", async (req, res)=>{
    try{
      let id = req.headers.id
      const result = await Employee_Payables.destroy({
        where: { id:id }
      })
      res.json({status: "Success", result: result})
    }catch{
      res.json({status: "Error"})
    }
    
  })
  
  routes.get("/getEmployeePayablebyJob", async (req, res) => {
    try {
      const result = await Employee_Payables.findAll({
        where:{jobid: req.headers.jobno},
      });
      console.log(result)
      res.json({ status: "success", result: result });
    } catch (error) {
      res.json({ status: "error", result: error });
    }
  });


  module.exports = routes;