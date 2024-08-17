module.exports = ( sequelize, DataTypes ) => {
    const Employee_Payables = sequelize.define("Employee_Payables", {
        requestedby:  { type:DataTypes.STRING}, //not null
        amount:       { type:DataTypes.STRING}, //not null
        preparedby:   { type:DataTypes.STRING}, //not null
        approved:     { type:DataTypes.BOOLEAN, defaultValue:"false"},
        paid:         { type:DataTypes.BOOLEAN, defaultValue:"false"},
        accountid:    { type:DataTypes.INTEGER},   //not null
        employeeid:   { type:DataTypes.STRING},   //not null
        jobid:        { type:DataTypes.INTEGER},   //not null
    });
    return Employee_Payables
}
