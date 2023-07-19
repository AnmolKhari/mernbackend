const mongoose=require("mongoose");
const bcrypt =require("bcryptjs");
const jwt=require("jsonwebtoken");
// Now we will defining Schema
const employeeSchema=new mongoose.Schema({
    
name:{
    type: String,
    required: true
},
email:{
    type: String,
    required: true,
    unique: true
},
password: {
    type: String,
    required: true,
    unique: true
},
tokens:[{
    token:{ //<--In previous, token is an Object
        type: String,
        required: true
    }
}]
})
// In above Schema is defined
employeeSchema.methods.generateAuthToken=async function(){
    try {
        const token=jwt.sign({_id:this._id.toString()}, "iwillbegoodandroiddeveloperunitmy3rdyear");
        this.tokens=this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (error) {
        res.send("the error part"+error);
        console.log("the error part"+error);
    }
}

//Below block of code is used as a kind of MiddleWare & Converting password into Hash
employeeSchema.pre("save", async function(next){
    if(this.isModified("password")){
    this.password= await bcrypt.hash(this.password, 10);
    }
    next();
})

// Now with the help of above Schema we have to create a Collection

const Register=new mongoose.model("Register", employeeSchema);

module.exports=Register;