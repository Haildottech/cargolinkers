const { 
  SE_Job, SE_Equipments, Container_Info,  
  Stamps, Job_notes, Loading_Program, Bl,
  Delivery_Order, Item_Details, Dimensions,
} = require("../../functions/Associations/jobAssociations/seaExport");
const { Charge_Head } = require("../../functions/Associations/incoiceAssociations");
const { Employees } = require("../../functions/Associations/employeeAssociations");
const { Vendors } = require("../../functions/Associations/vendorAssociations");
const { Clients } = require("../../functions/Associations/clientAssociation");
const { Voyage } = require("../../functions/Associations/vesselAssociations");
const { Commodity, Vessel, Charges } = require("../../models");
const routes = require('express').Router();
const Sequelize = require('sequelize');
const moment = require("moment");
const Op = Sequelize.Op;

const getJob = (id) => {
  const finalResult = SE_Job.findOne({
    where:{id:id},
    include:[
      { model:SE_Equipments },
      { model:Clients, attributes:['name'] }
    ]
  })
  return finalResult 
};

routes.get("/getValues", async(req, res) => {
  
  let makeResult = (result, resultTwo) => {
    let finalResult = {shipper:[], consignee:[], notify:[], client:[]};
    result.forEach((x) => {
      if(x.types.includes('Shipper')){
        finalResult.shipper.push({name:`${x.name} (${x.code})`, id:x.id, types:x.types})
      }
      if(x.types.includes('Consignee')){
        finalResult.consignee.push({name:`${x.name} (${x.code})`, id:x.id, types:x.types})
      }
      if(x.types.includes('Notify')){
        finalResult.notify.push({name:`${x.name} (${x.code})`, id:x.id, types:x.types})
      }
    })
    let tempClient = [];
    resultTwo.forEach((x)=>{
      if(x.nongl!='1'){
        tempClient.push({name:`${x.name} (${x.code})`, id:x.id, types:x.types})
      }
    })
    finalResult.client = tempClient;
    // finalResult.client = resultTwo.map((x)=>{
    //     return {name:`${x.name} (${x.code})`, id:x.id, types:x.types}
    // });
    return finalResult
  };
  let makeResultTwo = (result) => {
    let finalResult = { transporter:[], forwarder:[], overseasAgent:[], localVendor:[], chaChb:[], sLine:[], airLine:[] };
    result.forEach((x) => {
      if(x.types.includes('Air Line')){
        finalResult.airLine.push({name:`${x.name} (${x.code})`, id:x.id, types:x.types})
      }
      if(x.types.includes('Transporter')){
        finalResult.transporter.push({name:`${x.name} (${x.code})`, id:x.id, types:x.types})
      }
      if(x.types.includes('Forwarder/Coloader')){
        finalResult.forwarder.push({name:`${x.name} (${x.code})`, id:x.id, types:x.types})
      }
      if(x.types.includes('Overseas Agent')){
        finalResult.overseasAgent.push({name:`${x.name} (${x.code})`, id:x.id, types:x.types})
      }
      if(x.types.includes('CHA/CHB')){
        finalResult.chaChb.push({name:`${x.name} (${x.code})`, id:x.id, types:x.types})
      }
      if(x.types.includes('Local Vendor')){
        finalResult.localVendor.push({name:`${x.name} (${x.code})`, id:x.id, types:x.types})
      }
      if(x.types.includes('Shipping Line')){
        finalResult.sLine.push({name:`${x.name} (${x.code})`, id:x.id, types:x.types})
      }
    })
    return finalResult
  };
  try {
    const resultOne = await Clients.findAll({ 
      attributes:['id','name', 'types', 'code', 'nongl'],
      order: [['createdAt', 'DESC']]
    })
    const result = await Clients.findAll({ 
      where: {
        types: {
          [Op.or]:[
            { [Op.substring]: 'Shipper' },
            { [Op.substring]: 'Consignee' },
            { [Op.substring]: 'Notify' }]
      }},
      attributes:['id','name', 'types', 'code'],
      order: [['createdAt', 'DESC']]
    })
    const resultThree = await Vendors.findAll({ 
      where: {
        types: {
          [Op.or]:[
            { [Op.substring]: 'Transporter' },
            { [Op.substring]: 'Forwarder/Coloader' },
            { [Op.substring]: 'Local Vendor' },
            { [Op.substring]: 'CHA/CHB' },
            { [Op.substring]: 'Overseas Agent' },
            { [Op.substring]: 'Air Line' },
            { [Op.substring]: 'Shipping Line' }
          ]
      }},
      attributes:['id','name', 'types', 'code'],
      order: [['createdAt', 'DESC']]
    })
    let tempCommodity = [];
    const resultTwo = await Commodity.findAll({
      order: [['createdAt', 'DESC']],
      attributes:['id','name', 'hs']
    });
    await resultTwo.forEach((x)=>{
      if(x.hs){
        tempCommodity.push({...x.dataValues, name:`(${x.dataValues.hs}) ${x.dataValues.name}`})
      } else {
        tempCommodity.push(x.dataValues)
      }
    })
    const resultFour = await Vessel.findAll({
      order: [['createdAt', 'DESC']],
      attributes:['id', 'name', 'code', 'carrier'],
      include:[{
          model:Voyage
      }]
    });
    const Sr = await Employees.findAll({where:{represent: {[Op.substring]: 'sr'} }, attributes:['id', 'name']});
    let tempChargeList = [];
    const charges = await Charges.findAll({});
    await charges.forEach((x) => {
      tempChargeList.push({...x.dataValues, label:`(${x.dataValues.code}) ${x.dataValues.short}`, value:x.dataValues.code});
    });
    res.json({
      status:'success',
      result:{
        party:makeResult(result, resultOne),
        vendor:makeResultTwo(resultThree),
        commodity:tempCommodity,
        vessel:resultFour,
        sr:Sr,
        chargeList:tempChargeList
      }
    });
  }
  catch (error) {
    res.json({status:'error', result:error});
  }
});

routes.post("/getNotes", async(req, res) => {
  try {
    console.log(req.body)
    const result = await Job_notes.findAll({
      where:{type: req.body.type, recordId:req.body.id},
      order:[["createdAt", "DESC"]],
    });
    res.json({status:'success', result:result});
  }
  catch (error) {
    res.json({status:'error', result:error});
  }
});

routes.get("/getAllNotes", async(req, res) => {
  try {
    const result = await Job_notes.findAll({
      // where:{type:"SE", recordId:req.body.id},
      order:[["createdAt", "DESC"]],
    });
    res.json({status:'success', result:result});
  }
  catch (error) {
    res.json({status:'error', result:error});
  }
});

routes.post('/updateNotes', async(req, res) => {
  try {
    const result =  await Job_notes.update({opened : req.body.data.opened}, 
    {where : {recordId : req.body.data.recordId}})
    res.json({ status: "success", result:result})
  }
  catch (err) {
    res.json({ status: "error", result:err.message})
  }
});

routes.post('/editNotes', async(req, res) => {
  try {
    req.body.notes.forEach((x)=>{
      Job_notes.upsert(x)
    })
    res.json({ status: "success"})
  }
  catch (err) {
    res.json({ status: "error", result:err.message})
  }
});

routes.post("/addNote", async(req, res) => {
  try {
      const result = await Job_notes.create(req.body);
      res.json({status:'success', result:result});
  }
  catch (error) {
    res.json({status:'error', result:error});
  }
});

routes.post("/create", async(req, res) => {

  const createEquip = (list, id) => {
    let result = [];
    list.forEach((x) => {
      if(x){
        delete x.id
        result.push({...x, SEJobId:id})
      }
    })
    return result;
  }
  try {
    let data = req.body.data
    delete data.id
    data.customCheck = data.customCheck.toString();
    data.transportCheck = data.transportCheck.toString();
    if(data.operation=="AE"|| data.operation=="CAE"|| data.operation=="AI" || data.operation=="CAI"){
      data.vesselId = null
    } else {
      data.airLineId=null
    }
    data.airLineId?
      null:
      data.airLineId = null
    data.vesselId?
      null:
      data.vesselId = null

      result = await SE_Job.findOne({
        where: {
                  customerRef:req.body.data.customerRef
                      }
    })
    if(result){
      res.json({status:'exists'});
    }else{
    const check = await SE_Job.findOne({
      order:[['jobId','DESC']], attributes:["jobId"],
      where:{operation:data.operation, companyId:data.companyId}
    });

    const result = await SE_Job.create({
      ...data,
      jobId:check==null?1:parseInt(check.jobId)+1,
      jobNo:`CL-${data.operation.slice(1)}-${moment().format("YY")}/${moment().format("M")}/${check==null?1:parseInt(check.jobId)+1}`
    }).catch((x)=>console.log(x))
    await SE_Equipments.bulkCreate(createEquip(data.equipments,  result.id)).catch((x)=>console.log(x))
    res.json({status:'success', result:await getJob(result.id)});
  }
}
  catch (error) {
    res.json({status:'error', result:error});
  }
});

routes.post("/edit", async(req, res) => {

  const createEquip = (list, id) => {
    let result = [];

    list.forEach((x)=>{
      if(x){
        delete x.id
        result.push({...x, SEJobId:id})
      }
    })
    return result;
  }
  try {
    let data = req.body.data;
    data.customCheck = data.customCheck.toString();
    data.transportCheck = data.transportCheck.toString();
    data.approved = data.approved.toString();
    const existingJob  = await SE_Job.findOne({
      where: {
        [Op.and]: [
          { customerRef: data.customerRef },
          { id: data.id }
                 ]
    }
  });
   // Check if customerRef has changed
   if (existingJob === null) {
    result = await SE_Job.findOne({
      where: {
                customerRef:data.customerRef
   }
  })
  if(result){
    res.json({status:'exists'});
  }  }else{
    const sejob = await SE_Job.update(data,{where:{id:data.id}}).catch((x)=>console.log(1));
    await SE_Equipments.destroy({where:{SEJobId:data.id}}).catch((x)=>console.log(2))
    const bulk = await SE_Equipments.bulkCreate(createEquip(data.equipments,data.id)).catch((x)=>console.log(x))
    res.json({status:'success', result:await getJob(data.id)});
  }
}
  catch (error) {
    console.log(error)
    res.json({status:'error', result:error.message});
  }
});

routes.get("/get", async(req, res) => {
  try {
    const result = await SE_Job.findAll({
      where:{
        companyId:req.headers.companyid,
        operation:req.headers.operation
      },
      include:[
        {
          model:Employees, 
          as:'created_by', 
          attributes:['name'] 
        },
        {
          model:SE_Equipments,
          attributes:['container']
        },
        {
          model:Clients,
          attributes:['name']
        }
      ],
      attributes:['id','operation', 'jobNo', 'gd', 'pol', 'pod', 'fd', 'weight', 'pcs', 'pkgUnit', 'transportCheck', 'customerRef', 'approved', 'operation','subType'],
      order:[["createdAt", "DESC"]],
    }).catch((x)=>console.log(x))
    res.json({status:'success', result:result});
  }
  catch (error) {
    res.json({status:'error', result:error});
  }
});

routes.get("/getJobById", async(req, res) => {
    try {
        const result = await SE_Job.findOne({
          where:{id:req.headers.id},
          include:[
            {model:SE_Equipments},
              {
                model:Clients,
                attributes:['name']
              }
          ],
          order:[["createdAt", "DESC"]],
        });
        res.json({status:'success', result:result});
    }
    catch (error) {
      res.json({status:'error', result:error});
    }
});

routes.get("/getSEJobIds", async(req, res) => {
    try {
      const result = await SE_Job.findAll({
        attributes:['id']
      });
      res.json({status:'success', result:result});
    }
    catch (error) {
      res.json({status:'error', result:error});
    }
});

routes.get("/getSEJobById", async(req, res) => {
    try {
      const result = await SE_Job.findOne({
        where:{id:req.headers.id},
        include:[
          {model:Bl, attributes:['id', 'hbl', 'hblDate', 'mbl', 'mblDate']},
          {model:Voyage},
          {model:SE_Equipments},
          {
            model:Clients,
            attributes:['name']
          }
        ],
        order:[["createdAt", "DESC"]],
      });
      res.json({status:'success', result:result});
    }
    catch (error) {
      res.json({status:'error', result:error});
    }
});

routes.get("/getJobsWithoutBl", async(req, res) => {

  const attr = [
    'name', 'address1', 'address1', 'person1', 'mobile1',
    'person2', 'mobile2', 'telephone1', 'telephone2', 'infoMail'
  ];

  try {
  const result = await SE_Job.findAll({
    where:{id:req.headers.id},
    attributes:[
      'id', 'jobNo', 'pol',
      'pod', 'fd', 'jobDate',
      'shipDate', 'cutOffDate',
      'delivery', 'freightType',
      'operation', 'flightNo','VoyageId',
      'cwtLine', 'cwtClient', 'weight', 'pcs'
    ],
    order:[["createdAt", "DESC"]],
    include:[
      {
        model:Bl,
        required: false,
      },
      { model:SE_Equipments, attributes:['qty', 'size'] },
      { model:Clients,  attributes:attr },
      { model:Clients, as:'consignee', attributes:attr },
      { model:Clients, as:'shipper', attributes:attr },
      { model:Vendors, as:'overseas_agent', attributes:attr },
      { model:Commodity, as:'commodity' },
      { model:Vessel, as:'vessel', attributes:['name'] },
      { model:Vendors, as:'air_line', attributes:['name'] },
      { model:Vendors, as:'shipping_line', attributes:['name'] },
      { model:Voyage, attributes:['voyage'] },
    ],
  });
  res.json({status:'success', result:result});
  }
  catch (error) {
    res.json({status:'error', result:error});
  }
});

routes.post("/findJobByNo", async(req, res) => {
  try {
    const attr = [
      'name', 'address1', 'address1', 'person1', 'mobile1',
      'person2', 'mobile2', 'telephone1', 'telephone2', 'infoMail'
    ];
    const result = await SE_Job.findAll({
      where:{jobNo:req.body.no},
      attributes:[
        'jobNo', 'pol',
        'flightNo','id', 
        'pod', 'fd', 'jobDate',
        'shipDate', 'cutOffDate',
        'delivery', 'freightType',
        'freightPaybleAt','VoyageId',
      ],
      order:[["createdAt", "DESC"]],
      include:[
        { model:SE_Equipments, attributes:['qty', 'size'] },
        { model:Clients,  attributes:attr },
        { model:Clients, as:'consignee', attributes:attr },
        { model:Clients, as:'shipper', attributes:attr },
        { model:Vendors, as:'overseas_agent', attributes:attr },
        { model:Commodity, as:'commodity' },
        { model:Vessel,  as:'vessel', attributes:['name'] },
        { model:Vendors, as:'air_line', attributes:['name'] },
        { model:Vendors, as:'shipping_line', attributes:['name'] },
        { model:Voyage, attributes:['voyage'] },
      ]
    });
    res.json({status:'success', result:result});
  }
  catch (error) {
    res.json({status:'error', result:error});
  }
});

routes.post("/deleteJob", async(req, res) => {
  try {
    const result = await SE_Job.destroy({
      where:{id:req.body.id},
    });
    res.json({status:'success', result:result});
  }
  catch (error) {
    res.json({status:'error', result:error});
  }
}); 

routes.get("/getLoadingProgram", async(req, res) => {
  try {
    const result = await Loading_Program.findOne({
      where:{SEJobId:req.headers.id},
    });
    res.json({status:'success', result:result});
  }
  catch (error) {
    res.json({status:'error', result:error});
  }
}); 

routes.post("/upsertLoadingProgram", async(req, res) => {
  try {
    const result = await Loading_Program.upsert(req.body)
    .catch((x)=>console.log(x))
    res.json({status:'success', result:result});
  }
  catch (error) {
    res.json({status:'error', result:error});
  }
}); 

routes.get("/getJobByValues", async (req, res) => {
    let value = req.headers;
    let obj = {
      createdAt: {
        [Op.gte]: moment(value.from).toDate(),
        [Op.lte]: moment(value.to).add(1, 'days').toDate(),
      }
    };
    let newObj = {};
    if (value.client) {
      obj.ClientId = value.client;
    }
    if (value.final_destination) {
      obj.fd = value.final_destination;
    }
    if (value.shipping_air_line) {
      obj.shippingLineId = value.shipping_air_line;
    }
    if (value.consignee) {
      obj.consigneeId = value.consignee;
    }
    if (value.oversease_agent) {
      obj.overseasAgentId = value.oversease_agent;
    }
    if (value.vessel) {
      obj.vesselId = value.vessel;
    }
    if (value.clearing_agent) {
      obj.customAgentId = value.clearing_agent;
    }
    if (value.vendor) {
      obj.localVendorId = value.vendor;
    }
     if(value.air_line) {
      obj.airLineId = value.air_line;
    }
    if(value.hbl) {
      newObj.hbl = value.hbl;
    }
    if(value.mbl) {
      newObj.mbl = value.mbl;
    }
    try {
      const jobs = await SE_Job.findAll({
        where: obj,
        include:[
          { model:Bl, where: newObj, 
          include:[{model:Container_Info , attributes:["gross", 'net', "tare", "no"]},
          {model:Item_Details , attributes:["grossWt", 'chargableWt', "rate_charge"]} 
          ]},
          { model: Clients, attributes:     ["name"] },
          { model: Charge_Head, attributes: ["type", "amount"]},
          { model: Vendors, attributes:     ["name"], as : "local_vendor"},
          { model: Vendors, attributes:     ["name"], as : "shipping_line"},
          { model: Vendors, attributes:     ["name"], as :"air_line"},
          { model: Vessel , attributes:     ["name"], as :"vessel" },
          { model: Commodity, attributes:   ["name"], as :"commodity" },
          { model: Employees, attributes:   ["name"], as :"sales_representator" },
          { model: Clients, attributes:     ["name"], as :"shipper" },
          { model: Clients, attributes:     ["name"], as :"consignee" },
      ]});
      res.status(200).json({ result: jobs });
    } catch (err) {
      res.status(200).json({ result: err.message });
    }
});

routes.get("/getValuesJobList", async (req, res) => {

  let makeResult = (result, resultTwo) => {
    let finalResult = { consignee: [], client: [] };
    result.forEach((x) => {
      if (x.types.includes("Consignee")) {
        finalResult.consignee.push({
          name: `${x.name} (${x.code})`,
          id: x.id,
          types: x.types,
        });
      }
    });
    finalResult.client = resultTwo.map((x) => {
      return { name: `${x.name} (${x.code})`, id: x.id, types: x.types };
    });
    return finalResult;
  };

  let makeResultTwo = (result) => {
    let finalResult = {
      overseasAgent: [],
      chaChb: [],
      sLine: [],
      airLine: []
    };
    result.forEach((x) => {
      if (x.types.includes("Overseas Agent")) {
        finalResult.overseasAgent.push({
          name: `${x.name} (${x.code})`,
          id: x.id,
          types: x.types,
        });
      }
      if (x.types.includes("CHA/CHB")) {
        finalResult.chaChb.push({
          name: `${x.name} (${x.code})`,
          id: x.id,
          types: x.types,
        });
      }

      if (x.types.includes("Shipping Line")) {
        finalResult.sLine.push({
          name: `${x.name} (${x.code})`,
          id: x.id,
          types: x.types,
        });
      }
      if (x.types.includes("Air Line")) {
        finalResult.airLine.push({
          name: `${x.name} (${x.code})`,
          id: x.id,
          types: x.types,
        });
      } 
    });
    return finalResult;
  };

  try {
    const resultOne = await Clients.findAll({
      attributes: ["id", "name", "types", "code"],
      order: [["createdAt", "DESC"]],
    });
    const result = await Clients.findAll({
      where: {
        types: {
          [Op.or]: [{ [Op.substring]: "Consignee" }],
        },
      },
      attributes: ["id", "name", "types", "code"],
      order: [["createdAt", "DESC"]],
    });
    const resultThree = await Vendors.findAll({
      where: {
        types: {
          [Op.or]: [
            { [Op.substring]: "CHA/CHB" },
            { [Op.substring]: "Overseas Agent" },
            { [Op.substring]: "Shipping Line" },
          ],
        },
      },
      attributes: ["id", "name", "types", "code"],
      order: [["createdAt", "DESC"]],
    });

    const vendor = await Vendors.findAll({
      attributes: ["id", "name", "types", "code"],
      order: [["createdAt", "DESC"]],
    });
    const resultTwo = await Commodity.findAll({
      order: [["createdAt", "DESC"]],
      attributes: ["id", "name", "hs"],
    });

    const resultFour = await Vessel.findAll({
      order: [["createdAt", "DESC"]],
      attributes: ["id", "name", "code", "carrier"],
      include: [
        {
          model: Voyage,
        },
      ],
    });
    const Sr = await Employees.findAll({
      where: { represent: { [Op.substring]: "sr" } },
      attributes: ["id", "name"],
    });
    res.json({
      status: "success",
      result: {
        vendor: vendor,
        party: makeResult(result, resultOne),
        vendor_details: makeResultTwo(resultThree),
        commodity: resultTwo,
        vessel: resultFour,
        sr: Sr,
      },
    });
  } catch (error) {
    res.json({ status: "error", result: error });
  }
});

routes.get("/getDeliveryOrder", async(req, res) => {
  try {
    const result = await Delivery_Order.findOne({
        where:{SEJobId:req.headers.id},
    }).catch((x)=>console.log(x))
    res.json({status:'success', result:result});
  }
  catch (error) {
    res.json({status:'error', result:error});
  }
}); 

routes.post("/upsertDeliveryOrder", async(req, res) => {

  let result
  try {
    if(!req.body.doNo){
      const check = await Delivery_Order.findOne({order: [ [ 'no', 'DESC' ]], attributes:["no"], where:{operation:req.body.operation, companyId:req.body.companyId}})
      .catch((e) => console.log(e));
      result = await Delivery_Order.upsert({
        ...req.body, 
        no:check==null?1:parseInt(check.no)+1, 
        doNo:`${req.body.companyId==1?'IFA':'CLS'}-DO${check==null?1:parseInt(check.no)+1}-${moment().format("YY")}`
      }).catch((x)=>console.log(x))
    } else {
    let check;
    !req.body.id?
      check = await Delivery_Order.findOne({order: [ [ 'no', 'DESC' ]], attributes:["no"], where:{operation:req.body.operation, companyId:req.body.companyId}}):
      null
    result = await Delivery_Order.upsert({
      ...req.body, 
      no:!req.body.id? check==null?1:parseInt(check.no)+1 : req.body.no, 
      doNo:req.body.doNo
    }).catch((x)=>console.log(x))
  }
  res.json({status:'success', result: result});
  }
  catch (error) {
    console.log(error.message)
    res.json({status:'error', result:error.message});
  }
});

routes.get("/getawb", async(req, res) => {
  try {
    const result = await SE_Job.findAll({
      where: {[Op.or]: [
        { operation: "AE" },
        { operation: "AI" }
      ]},
      attributes:["jobNo", "operation", "id"],
      include:[{
        model:Bl,
        attributes:["mbl"]
      }]
    })
    res.status(200).json({ result: result });
  } catch (err) {
    res.status(200).json({ result: err.message });
  }
});

module.exports = routes;